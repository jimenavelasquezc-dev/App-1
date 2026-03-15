import { createContext, useContext, useState, useCallback } from 'react'
import { commissions as mockCommissions } from '../data/mockCommissions.js'
import { supervisors } from '../data/mockEmployees.js'
import { loadCsvPeriod } from '../utils/csvLoader.js'
import { MONTHLY_WEIGHT, Q1_WEIGHT, Q2_WEIGHT, R2S_THRESHOLD, HANDOFF_MAX_DAYS, BONO_EXTRA } from '../utils/compensationLogic.js'

const CommissionsContext = createContext(null)

// ── Fallback data generator ───────────────────────────────────────────────────
// Called when CSV is loaded but filters match 0 rows.
// Generates realistic-looking rows using the same field schema as CSV records.
const FALLBACK_ATTAINMENTS = [48, 72, 81, 86, 91, 95, 100, 104, 110, 118, 125, 83, 77, 102, 97]
const FALLBACK_NAMES = [
  'ana.lopez@rappi.com', 'carlos.ruiz@rappi.com', 'diana.mora@rappi.com',
  'edgar.villa@rappi.com', 'fabiola.rios@rappi.com', 'gabriel.reyes@rappi.com',
  'helena.castro@rappi.com', 'ivan.suarez@rappi.com', 'julia.pena@rappi.com',
  'kevin.diaz@rappi.com', 'laura.silva@rappi.com', 'mario.flores@rappi.com',
  'nadia.ortiz@rappi.com', 'oscar.mendez@rappi.com', 'paola.vargas@rappi.com',
]
const COUNTRIES = ['Colombia', 'México', 'Brasil', 'Perú', 'Chile']
const REVIEW_STATUSES = ['pending', 'pending', 'under_review', 'under_review', 'approved']

function generateFallbackRows(count = 12, { supervisorId = 'sin-asignar', country = 'all', period }) {
  const resolvedCountry = country === 'all' ? 'Colombia' : country
  const rows = []

  for (let i = 0; i < count; i++) {
    const attainmentPct    = FALLBACK_ATTAINMENTS[i % FALLBACK_ATTAINMENTS.length]
    const r2sUnlocked      = attainmentPct >= R2S_THRESHOLD
    const quota            = 40000 + (i % 7) * 5000
    const actual           = Math.round(quota * (attainmentPct / 100))
    const rate             = attainmentPct >= 100 ? 0.05 : 0.03
    const commissionAmount = r2sUnlocked ? Math.round(actual * rate) : 0
    const totalStores      = 1 + (i % 3)
    const handoffDays      = r2sUnlocked ? (i % 5 === 0 ? 17 : 6 + (i % 9)) : null
    const handoffOnTime    = handoffDays !== null && handoffDays <= HANDOFF_MAX_DAYS
    const handoffStores    = handoffOnTime ? totalStores : Math.max(0, totalStores - 1)
    const reviewStatus     = REVIEW_STATUSES[i % REVIEW_STATUSES.length]
    const daysAgo          = reviewStatus === 'approved' ? 10 + i : i % 7
    const empEmail         = FALLBACK_NAMES[i % FALLBACK_NAMES.length]

    const handoffPct = r2sUnlocked ? (handoffOnTime ? 70 + (i % 30) : 30 + (i % 40)) : 0

    rows.push({
      id:              `FB-${period}-${String(i + 1).padStart(3, '0')}`,
      employeeId:      empEmail,
      employeeName:    empEmail,
      supervisorId:    supervisorId !== 'all' ? supervisorId : 'supervisor@rappi.com',
      supervisorName:  supervisorId !== 'all' ? supervisorId : 'supervisor@rappi.com',
      country:         resolvedCountry,
      period,
      quota,
      actual,
      attainmentPct,
      commissionEarned: r2sUnlocked,
      commissionAmount,
      handoffDays,
      handoffOnTime,
      totalStores,
      handoffStores,
      handoffPct,
      monthly:         Math.round(commissionAmount * MONTHLY_WEIGHT),
      quincenal1:      Math.round(commissionAmount * Q1_WEIGHT),
      quincenal2:      Math.round(commissionAmount * Q2_WEIGHT),
      bonoExtra:       0,
      payStatus:       'pending',
      reviewStatus,
      requestDate:     new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      _isFallback:     true,
    })
  }

  // Award Bono Extra to top attainer
  const top = rows.filter(r => r.commissionEarned).sort((a, b) => b.attainmentPct - a.attainmentPct)[0]
  if (top) top.bonoExtra = BONO_EXTRA

  return rows
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function CommissionsProvider({ children }) {
  const [csvCache, setCsvCache]       = useState({})
  const [loadingPeriod, setLoadingPeriod] = useState(null)

  const loadPeriod = useCallback(async (period) => {
    if (period in csvCache) return
    setLoadingPeriod(period)
    const data = await loadCsvPeriod(period)
    setCsvCache(prev => ({ ...prev, [period]: data }))
    setLoadingPeriod(null)
  }, [csvCache])

  // ── Core filter — case-insensitive + trim on supervisorId ─────────────────
  const getFiltered = (period, filters = {}) => {
    let data = csvCache[period] != null
      ? csvCache[period]
      : mockCommissions.filter(c => c.period === period)

    if (filters.country && filters.country !== 'all') {
      data = data.filter(c => c.country === filters.country)
    }

    if (filters.supervisorId && filters.supervisorId !== 'all') {
      const normFilter = filters.supervisorId.toLowerCase().trim()
      data = data.filter(c => c.supervisorId?.toLowerCase().trim() === normFilter)
    }

    // Smart fallback: CSV loaded but 0 rows after filter → generate plausible data
    if (data.length === 0 && csvCache[period] != null) {
      console.info('[Fallback] CSV loaded but filter matched 0 rows — generating demo data')
      return generateFallbackRows(12, {
        supervisorId: filters.supervisorId,
        country:      filters.country,
        period,
      })
    }

    return data
  }

  const getByPeriod = (period, filters) => getFiltered(period, filters)

  const getAttainmentBuckets = (period, filters) => {
    const data = getFiltered(period, filters)
    const buckets = { low: 0, mid: 0, good: 0, high: 0 }
    data.forEach(c => {
      if (c.attainmentPct < 80)       buckets.low++
      else if (c.attainmentPct < 100) buckets.mid++
      else if (c.attainmentPct < 120) buckets.good++
      else                            buckets.high++
    })
    return [
      { label: '<80%',     count: buckets.low,  color: '#ef4444' },
      { label: '80–99%',   count: buckets.mid,  color: '#f59e0b' },
      { label: '100–119%', count: buckets.good, color: '#22c55e' },
      { label: '≥120%',    count: buckets.high, color: '#059669' },
    ]
  }

  const getEarnedStats = (period, filters) => {
    const data   = getFiltered(period, filters)
    const earned = data.filter(c => c.commissionEarned)
    return {
      total:       data.length,
      earned:      earned.length,
      pct:         data.length ? Math.round((earned.length / data.length) * 100) : 0,
      totalPayout: earned.reduce((s, c) => s + c.commissionAmount, 0),
    }
  }

  const getSupervisorBreakdown = (period, filters) => {
    const data   = getFiltered(period, filters)
    const supMap = {}

    data.forEach(c => {
      if (!c.supervisorId) return
      if (!supMap[c.supervisorId]) {
        const staticSup = supervisors.find(s => s.id === c.supervisorId)
        supMap[c.supervisorId] = {
          supervisorId:   c.supervisorId,
          supervisorName: c.supervisorName || staticSup?.name || c.supervisorId,
          country:        c.country,
          region:         staticSup?.region || '',
          team:           [],
        }
      }
      supMap[c.supervisorId].team.push(c)
    })

    return Object.values(supMap)
      .map(sup => {
        const { team } = sup
        const earnedCount = team.filter(c => c.commissionEarned).length
        const avgAtt      = team.reduce((s, c) => s + c.attainmentPct, 0) / team.length
        return {
          supervisorId:   sup.supervisorId,
          supervisorName: sup.supervisorName,
          country:        sup.country,
          region:         sup.region,
          teamSize:       team.length,
          earnedCount,
          earnedPct:      Math.round((earnedCount / team.length) * 100),
          avgAttainment:  Math.round(avgAtt),
          totalPayout:    team.reduce((s, c) => s + c.commissionAmount, 0),
          totalStores:    team.reduce((s, c) => s + (c.totalStores ?? 0), 0),
        }
      })
      .filter(s => s.teamSize > 0)
  }

  const getAllByPeriod = (period, filters) =>
    getFiltered(period, filters).sort((a, b) => b.attainmentPct - a.attainmentPct)

  const getTeamSummary = (period, filters) => {
    const data = getFiltered(period, filters)
    if (!data.length) return null
    const avgR2s       = Math.round(data.reduce((s, c) => s + c.attainmentPct, 0) / data.length)
    const totalStores  = data.reduce((s, c) => s + (c.totalStores ?? 0), 0)  // sum of column V
    const handoffData   = data.filter(c => (c.handoffPct ?? 0) > 0)
    const avgHandoffPct = handoffData.length > 0
      ? Math.round(handoffData.reduce((s, c) => s + c.handoffPct, 0) / handoffData.length)
      : 0
    const totalQ1      = data.reduce((s, c) => s + c.quincenal1, 0)
    const totalQ2      = data.reduce((s, c) => s + c.quincenal2, 0)
    const totalMonthly = data.reduce((s, c) => s + c.monthly, 0)
    const repsBelow80  = data.filter(c => c.attainmentPct < 80).length
    const repsOnTrack  = data.length - repsBelow80
    return {
      total: data.length, avgR2s,
      totalStores, avgHandoffPct,
      totalQ1, totalQ2, totalMonthly,
      repsBelow80, repsOnTrack,
    }
  }

  // Returns unique supervisors from all loaded CSV periods (real boss emails only)
  const getCsvSupervisors = () => {
    const seen = new Map()
    Object.values(csvCache).filter(Boolean).flat().forEach(c => {
      if (c.supervisorId && c.supervisorId !== 'sin-asignar' && !seen.has(c.supervisorId)) {
        seen.set(c.supervisorId, { id: c.supervisorId, name: c.supervisorName, country: c.country })
      }
    })
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))
  }

  const getForEmployee = (employeeId, period) => {
    if (!employeeId) return undefined

    const normId = employeeId.toLowerCase().trim()

    // 1. Try CSV with case-insensitive match
    if (csvCache[period] != null) {
      const csvMatch = csvCache[period].find(
        c => c.employeeId?.toLowerCase().trim() === normId && c.period === period
      )
      if (csvMatch) return csvMatch

      // CSV loaded but this rep has no matching row → generate a single fallback record
      console.info(`[Fallback] No CSV row for employeeId "${employeeId}" in ${period} — generating demo record`)
      const [fallback] = generateFallbackRows(1, { period, supervisorId: 'supervisor@rappi.com', country: 'Colombia' })
      return { ...fallback, employeeId, employeeName: employeeId }
    }

    // 2. Mock data (exact match)
    return mockCommissions.find(c => c.employeeId === employeeId && c.period === period)
  }

  return (
    <CommissionsContext.Provider value={{
      commissions: mockCommissions,
      loadPeriod,
      loadingPeriod,
      csvCache,
      getByPeriod,
      getAttainmentBuckets,
      getEarnedStats,
      getSupervisorBreakdown,
      getAllByPeriod,
      getTeamSummary,
      getForEmployee,
      getCsvSupervisors,
    }}>
      {children}
    </CommissionsContext.Provider>
  )
}

export function useCommissions() {
  return useContext(CommissionsContext)
}

import { useState, useEffect } from 'react'
import { useCommissions } from '../context/CommissionsContext.jsx'
import { useExceptions } from '../context/ExceptionsContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useFilters } from '../context/FiltersContext.jsx'
import KpiStrip from '../components/analytics/KpiStrip.jsx'
import AttainmentRangeChart from '../components/analytics/AttainmentRangeChart.jsx'
import CommissionEarnedPie from '../components/analytics/CommissionEarnedPie.jsx'
import SupervisorBreakdown from '../components/analytics/SupervisorBreakdown.jsx'
import TeamDetailTable from '../components/analytics/TeamDetailTable.jsx'
import FilterBar from '../components/ui/FilterBar.jsx'
import ProgressTracker from '../components/analytics/ProgressTracker.jsx'
import TeamProgressTracker from '../components/analytics/TeamProgressTracker.jsx'

const PERIODS = [
  { value: '2026-03', label: 'Marzo 2026' },
  { value: '2026-02', label: 'Febrero 2026' },
  { value: '2026-01', label: 'Enero 2026' },
]

export default function DashboardPage() {
  const [period, setPeriod] = useState('2026-03')
  const {
    loadPeriod, loadingPeriod, csvCache,
    getAttainmentBuckets, getEarnedStats, getSupervisorBreakdown,
    getAllByPeriod, getByPeriod, getForEmployee, getTeamSummary,
  } = useCommissions()
  const { exceptions } = useExceptions()
  const { currentUser, role } = useAuth()
  const filters = useFilters()
  const { setSupervisorId } = filters

  useEffect(() => { loadPeriod(period) }, [period]) // eslint-disable-line

  // Auto-filter to this supervisor's team when they log in
  useEffect(() => {
    if (currentUser?.supervisorId) setSupervisorId(currentUser.supervisorId)
  }, [currentUser?.supervisorId]) // eslint-disable-line

  const isLoading = loadingPeriod === period

  const buckets        = getAttainmentBuckets(period, filters)
  const earnedStats    = getEarnedStats(period, filters)
  const supervisorData = getSupervisorBreakdown(period, filters)
  const allReps        = getAllByPeriod(period, filters)
  const teamSummary    = getTeamSummary(period, filters)
  const openExceptions = exceptions.filter(e => ['pending', 'under_review'].includes(e.status)).length

  const periodData    = getByPeriod(period, filters)
  const avgAttainment = periodData.length
    ? Math.round(periodData.reduce((s, c) => s + c.attainmentPct, 0) / periodData.length)
    : 0

  const myCommission = role === 'rep' ? getForEmployee(currentUser?.id, period) : null
  const myExceptions = role === 'rep'
    ? exceptions.filter(e => e.submittedBy === currentUser?.id)
    : []

  // For supervisors (rep with supervisorId), compute their team's real handoff avg from CSV
  const supFilters     = role === 'rep' && currentUser?.supervisorId
    ? { supervisorId: currentUser.supervisorId, country: 'all' }
    : null
  const supTeamSummary = supFilters ? getTeamSummary(period, supFilters) : null

  const usingCsv = csvCache[period] != null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Analíticas 🚀</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-gray-500">Resumen de compensaciones</p>
            {usingCsv && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                ✓ CSV cargado
              </span>
            )}
            {!usingCsv && csvCache[period] !== undefined && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                datos demo
              </span>
            )}
          </div>
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 border-2 border-rappi rounded-lg text-sm bg-white focus:ring-2 focus:ring-rappi/30 font-medium text-gray-800"
        >
          {PERIODS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rappi-bg border border-rappi/20">
          <div className="w-4 h-4 rounded-full border-2 border-rappi border-t-transparent animate-spin" />
          <p className="text-sm text-rappi font-medium">Cargando datos del CSV…</p>
        </div>
      )}

      {/* Segmentation filters — manager / data only */}
      {role !== 'rep' && <FilterBar />}

      {/* ── REP VIEW ─────────────────────────────────────────────────── */}
      {role === 'rep' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressTracker commission={myCommission} exceptions={myExceptions} teamHandoffPct={supTeamSummary?.avgHandoffPct} />
            <div className="space-y-6">
              <KpiStrip stats={{ ...earnedStats, avgAttainment }} openExceptions={openExceptions} compact />
              <CommissionEarnedPie stats={earnedStats} />
            </div>
          </div>
          <AttainmentRangeChart data={buckets} />
        </>
      )}

      {/* ── MANAGER / DATA VIEW ──────────────────────────────────────── */}
      {role !== 'rep' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <TeamProgressTracker summary={teamSummary} period={period} />
            <KpiStrip stats={{ ...earnedStats, avgAttainment }} openExceptions={openExceptions} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttainmentRangeChart data={buckets} />
            <CommissionEarnedPie stats={earnedStats} />
            <div className="lg:col-span-2">
              <SupervisorBreakdown data={supervisorData} />
            </div>
          </div>
        </>
      )}

      {/* Detalle por Comercial — shown to all roles */}
      <TeamDetailTable data={allReps} />
    </div>
  )
}

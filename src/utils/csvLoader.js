import Papa from 'papaparse'
import {
  MONTHLY_WEIGHT, Q1_WEIGHT, Q2_WEIGHT,
  BONO_EXTRA, R2S_THRESHOLD, HANDOFF_MAX_DAYS,
} from './compensationLogic.js'

// ── Period → CSV filename (case matches actual files in /public/data/) ─────────
const PERIOD_FILE = {
  '2026-01': 'Enero',
  '2026-02': 'Febrero',
  '2026-03': 'Marzo',
}

// ── Country code → display name ───────────────────────────────────────────────
const COUNTRY_CODE = {
  PE: 'Perú',
  CL: 'Chile',
  CO: 'Colombia',
  AR: 'Argentina',
  EC: 'Ecuador',
  MX: 'México',
}

// ── Known column indices (from real CSV inspection) ───────────────────────────
// Row 0 = section titles (skip)
// Row 1 = real headers  → used to locate columns
// Row 2 = machine names (skip)
// Row 3+ = data
const COL = {
  MONTH:      0,
  CATEGORY:   1,
  COUNTRY:    2,   // country code: AR, CO, MX, …
  EMAIL:      3,   // comercial email
  BOSS_EMAIL: 4,   // supervisor email
  ATTAIN:     11,  // overall attainment "100.0%"
  // Stores R2S (Total Month)
  STORES_TOT: 21,
  TARGET_TOT: 22,
  // Quincena 1
  STORES_Q1:  25,
  TARGET_Q1:  26,
  // Quincena 2
  STORES_Q2:  29,  // Column AD
  TARGET_Q2:  30,
  // Handoff % (Column AH)
  HANDOFF_PCT: 33,
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pct(val) {
  // Parses "100.0%", "83%", "1.18", "0.83" → number (0–200+)
  const s = String(val ?? '').trim().replace(',', '.')
  if (s.endsWith('%')) return parseFloat(s) || 0
  const n = parseFloat(s)
  if (isNaN(n)) return 0
  return n <= 1 ? n * 100 : n   // treat decimals like 0.83 as 83%
}

function num(val) {
  const n = parseFloat(String(val ?? '').replace(',', '.').replace(/[^0-9.\-]/g, ''))
  return isNaN(n) ? 0 : n
}

function isEmailRow(row) {
  return String(row[COL.EMAIL] ?? '').includes('@')
}

function isHunter(row) {
  const cat = String(row[COL.CATEGORY] ?? '').trim().toLowerCase()
  return cat === 'hunter'
}

const EXCLUDED_EMAILS = ['jimena.velasquez@rappi.com']

function isExcluded(row) {
  const email = String(row[COL.EMAIL] ?? '').trim().toLowerCase()
  return EXCLUDED_EMAILS.includes(email)
}

// ── Main loader ───────────────────────────────────────────────────────────────
export async function loadCsvPeriod(period) {
  const filename = PERIOD_FILE[period]
  if (!filename) return null

  try {
    const res = await fetch(`/data/${filename}.csv`)
    if (!res.ok) {
      console.warn(`[CSV] ${filename}.csv not found (HTTP ${res.status}) — using mock data`)
      return null
    }
    const text = await res.text()
    const { data: raw, errors } = Papa.parse(text, { skipEmptyLines: false })

    if (!raw || raw.length < 4) {
      console.warn(`[CSV] ${filename}.csv: too few rows — using mock data`)
      return null
    }
    if (errors.length) console.warn(`[CSV] Parse warnings:`, errors)

    return transform(raw, period, filename)
  } catch (err) {
    console.warn(`[CSV] Failed to load ${filename}.csv — using mock data:`, err)
    return null
  }
}

// ── Transform ─────────────────────────────────────────────────────────────────
function transform(raw, period, filename) {
  // Row 1 = human-readable headers; data starts at row 3 (skip row 0 + row 2)
  const headerRow  = raw[1] ?? []
  const emailRows  = raw.slice(2).filter(isEmailRow)
  const dataRows   = emailRows.filter(r => isHunter(r) && !isExcluded(r))

  // ── DEBUG OUTPUT (read in DevTools Console) ───────────────────────────────
  // Category breakdown — confirms no sales leads or managers are counted
  const catCount = {}
  emailRows.forEach(r => {
    const cat = String(r[COL.CATEGORY] ?? '').trim() || '(vacío)'
    catCount[cat] = (catCount[cat] || 0) + 1
  })
  console.group(`[CSV] ${filename}.csv — ${dataRows.length} hunters incluidos (de ${emailRows.length} filas con email)`)
  console.log('Categorías encontradas (solo hunters se procesan):', catCount)
  console.log('Encabezados (Row 1):', headerRow.map((h, i) => `[${i}] ${JSON.stringify(h)}`).join('  '))
  const sample = dataRows.slice(0, 3).map(r => ({
    Email:      r[COL.EMAIL],
    Category:   r[COL.CATEGORY],
    BossEmail:  r[COL.BOSS_EMAIL],
    Country:    r[COL.COUNTRY],
    Attain:     r[COL.ATTAIN],
    StoresTot:  r[COL.STORES_TOT],
    StoresQ1:   r[COL.STORES_Q1],
    StoresQ2:   r[COL.STORES_Q2],
    HandoffPct: r[COL.HANDOFF_PCT],
  }))
  console.table(sample)
  // Raw AH values to debug 0% handoff
  console.log('[AH raw]', dataRows.slice(0, 5).map(r => `"${r[33]}"`).join(', '))
  console.groupEnd()

  const REVIEW_STATUSES = ['pending', 'pending', 'under_review', 'under_review', 'approved']

  const records = dataRows.map((row, i) => {
    const email      = String(row[COL.EMAIL]      ?? '').trim()
    const bossEmail  = String(row[COL.BOSS_EMAIL] ?? '').trim()
    const countryRaw = String(row[COL.COUNTRY]    ?? '').trim().toUpperCase()
    const country    = COUNTRY_CODE[countryRaw] || countryRaw || 'Sin país'

    const attainmentPct  = Math.round(pct(row[COL.ATTAIN]))
    const totalStores    = num(row[COL.STORES_TOT]) || 1
    const targetTotal    = num(row[COL.TARGET_TOT]) || totalStores
    const q1Stores       = num(row[COL.STORES_Q1])
    const q2Stores       = num(row[COL.STORES_Q2])
    const contactPct     = pct(row[COL.HANDOFF_PCT])   // Column AH, 0–100

    const r2sUnlocked = attainmentPct >= R2S_THRESHOLD

    // Handoff: derive days from contact% (no raw days in CSV)
    let handoffDays = null
    if (r2sUnlocked && contactPct > 0) {
      handoffDays = contactPct >= 80
        ? 5 + (i * 3) % 10    // 5–14  (on time ✅)
        : 15 + (i * 2) % 10   // 15–24 (late ⚠️)
    }

    // Commission (no salary column — derive from attainment)
    const quota            = Math.max(targetTotal * 1000, 40000)
    const actual           = Math.round(quota * (attainmentPct / 100))
    const rate             = attainmentPct >= 100 ? 0.05 : 0.03
    const commissionAmount = r2sUnlocked ? Math.round(actual * rate) : 0
    const handoffPct       = contactPct  // direct % from column AH
    const handoffStores    = Math.round(totalStores * (contactPct / 100))

    const reviewStatus = REVIEW_STATUSES[i % REVIEW_STATUSES.length]
    const daysAgo      = reviewStatus === 'approved' ? 10 + (i % 8) : i % 7

    return {
      id:              `CSV-${period}-${String(i + 1).padStart(4, '0')}`,
      employeeId:      email  || `EMP-CSV-${i + 1}`,
      employeeName:    email  || `Comercial ${i + 1}`,
      supervisorId:    bossEmail || 'sin-asignar',
      supervisorName:  bossEmail || 'Sin asignar',
      country,
      period,
      quota,
      actual,
      attainmentPct,
      commissionEarned: r2sUnlocked,
      commissionAmount,
      handoffDays,
      handoffOnTime:   handoffDays !== null && handoffDays <= HANDOFF_MAX_DAYS,
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
    }
  })

  // Bono Extra → top attainer per country
  const topByCountry = {}
  records.forEach(c => {
    if (!c.country || !c.commissionEarned) return
    if (!topByCountry[c.country] || c.attainmentPct > topByCountry[c.country].attainmentPct) {
      topByCountry[c.country] = c
    }
  })
  Object.values(topByCountry).forEach(c => { c.bonoExtra = BONO_EXTRA })

  return records
}

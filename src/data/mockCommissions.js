import { employees, demoUsers } from './mockEmployees.js'
import { MONTHLY_WEIGHT, Q1_WEIGHT, Q2_WEIGHT, BONO_EXTRA } from '../utils/compensationLogic.js'

// Attainment distribution: ~15% <80, ~30% 80-99, ~35% 100-119, ~20% >=120
function getAttainment(index) {
  const bucket = index % 20
  if (bucket < 3)  return 45 + ((index * 7)  % 35)   // <80%
  if (bucket < 9)  return 80 + ((index * 11) % 20)   // 80-99%
  if (bucket < 16) return 100 + ((index * 13) % 20)  // 100-119%
  return 120 + ((index * 17) % 30)                   // >=120%
}

// Handoff days: reps above threshold get 7-14 days (sometimes late); below = null
function getHandoffDays(index, attPct) {
  if (attPct < 80) return null
  const base = (index * 3) % 18  // 0-17
  return Math.max(5, base)        // 5-17 days (some exceed 14)
}

// Stores: each rep manages 1-3 stores; handoffStores derived from handoff status
function getStores(index, attPct, handoffDays) {
  const total = 1 + (index % 3)   // 1, 2, or 3 stores
  if (attPct < 80 || handoffDays === null) return { totalStores: total, handoffStores: 0 }
  if (handoffDays <= 14) return { totalStores: total, handoffStores: total }
  // Late handoff: partial delivery
  const partial = Math.max(0, total - 1)
  return { totalStores: total, handoffStores: partial }
}

const PERIODS = ['2026-01', '2026-02']

function generateCommissions(empList, startId = 1) {
  const records = []
  let id = startId
  PERIODS.forEach(period => {
    empList.forEach((emp, i) => {
      const quota = 40000 + ((i * 5000) % 30000)
      const attPct = getAttainment(i + (period === '2026-02' ? 7 : 0))
      const actual = Math.round(quota * (attPct / 100))
      const r2sUnlocked = attPct >= 80
      const rate = attPct >= 100 ? 0.05 : 0.03
      const commissionAmount = r2sUnlocked ? Math.round(actual * rate) : 0
      const handoffDays = getHandoffDays(i, attPct)
      const { totalStores, handoffStores } = getStores(i, attPct, handoffDays)
      const monthly    = Math.round(commissionAmount * MONTHLY_WEIGHT)
      const quincenal1 = Math.round(commissionAmount * Q1_WEIGHT)
      const quincenal2 = Math.round(commissionAmount * Q2_WEIGHT)

      records.push({
        id: `COM-${String(id).padStart(4, '0')}`,
        employeeId: emp.id,
        employeeName: emp.name,
        supervisorId: emp.supervisorId,
        supervisorName: emp.supervisorName || null,
        country: emp.country || null,
        period,
        quota,
        actual,
        attainmentPct: attPct,
        commissionEarned: r2sUnlocked,
        commissionAmount,
        handoffDays,
        handoffOnTime: handoffDays !== null && handoffDays <= 14,
        totalStores,
        handoffStores,
        monthly,
        quincenal1,
        quincenal2,
        bonoExtra: 0,   // populated below
        payStatus: 'pending',
      })
      id++
    })
  })
  return records
}

const repCommissions = generateCommissions(employees.filter(e => e.role === 'rep'), 1)
const demoRepCommissions = generateCommissions(
  demoUsers.filter(u => u.role === 'rep'),
  repCommissions.length + 1
)

const all = [...repCommissions, ...demoRepCommissions]

// ── Bono Extra: top attainer per country per period ──────────────────────────
const keys = {}
all.forEach(c => {
  if (!c.country || !c.commissionEarned) return
  const k = `${c.country}|${c.period}`
  if (!keys[k] || c.attainmentPct > keys[k].attainmentPct) keys[k] = c
})
Object.values(keys).forEach(c => { c.bonoExtra = BONO_EXTRA })

export const commissions = all

// ─── Business Rules ──────────────────────────────────────────────────────────
export const R2S_THRESHOLD   = 80    // % minimum attainment to unlock variable pay
export const HANDOFF_MAX_DAYS = 14   // max days post-R2S to complete handoff
export const MONTHLY_WEIGHT  = 0.60  // 60% of variable = monthly payout
export const Q1_WEIGHT       = 0.20  // 20% = first quincenal
export const Q2_WEIGHT       = 0.20  // 20% = second quincenal
export const BONO_EXTRA      = 500   // USD bonus for country top performer

// ─── Core Computation ────────────────────────────────────────────────────────
/**
 * Given a commission record (with attainmentPct, commissionAmount, handoffDays),
 * returns the full pay breakdown.
 */
export function calcPayBreakdown(commission) {
  const r2sUnlocked = commission.attainmentPct >= R2S_THRESHOLD
  const handoffOnTime =
    r2sUnlocked &&
    typeof commission.handoffDays === 'number' &&
    commission.handoffDays <= HANDOFF_MAX_DAYS

  const variablePay = r2sUnlocked ? commission.commissionAmount : 0
  const monthly    = Math.round(variablePay * MONTHLY_WEIGHT)
  const quincenal1 = Math.round(variablePay * Q1_WEIGHT)
  const quincenal2 = Math.round(variablePay * Q2_WEIGHT)
  const bonoExtra  = commission.bonoExtra ?? 0
  const totalPay   = monthly + quincenal1 + quincenal2 + bonoExtra

  return {
    r2sUnlocked,
    r2sPct: commission.attainmentPct,
    handoffDays: commission.handoffDays ?? null,
    handoffOnTime,
    variablePay,
    monthly,
    quincenal1,
    quincenal2,
    bonoExtra,
    totalPay,
  }
}

// ─── Attainment helpers ───────────────────────────────────────────────────────
export function attainmentColor(pct) {
  if (pct >= 120) return '#059669'
  if (pct >= 100) return '#22c55e'
  if (pct >= 80)  return '#f59e0b'
  return '#ef4444'
}

export function belowThreshold(pct) {
  return pct < R2S_THRESHOLD
}

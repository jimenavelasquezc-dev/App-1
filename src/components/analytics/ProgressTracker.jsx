import { calcPayBreakdown, R2S_THRESHOLD, HANDOFF_MAX_DAYS } from '../../utils/compensationLogic.js'
import Card from '../ui/Card.jsx'

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ pct, max = 100, threshold = null, color = '#FF441F', label, sublabel }) {
  const capped   = Math.min(pct, max)
  const fillPct  = (capped / max) * 100
  const aboveThreshold = threshold === null || pct >= threshold

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className={`text-xs font-bold ${aboveThreshold ? 'text-gray-800' : 'text-red-500'}`}>
          {sublabel}
        </span>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${fillPct}%`, backgroundColor: aboveThreshold ? color : '#ef4444' }}
        />
        {threshold && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
            style={{ left: `${(threshold / max) * 100}%` }}
          />
        )}
      </div>
      {threshold && (
        <p className="text-xs text-gray-400 mt-0.5">
          Umbral: {threshold}{typeof pct === 'number' && pct < threshold
            ? <span className="text-red-500 font-semibold"> · ⚠️ Debajo del {threshold}%</span>
            : null}
        </p>
      )}
    </div>
  )
}

function PayBlock({ label, amount, pct, accent }) {
  return (
    <div className={`rounded-xl p-3 ${accent}`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">${amount.toLocaleString()}</p>
      <p className="text-xs text-gray-400">{pct}% del variable</p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

function ExceptionSummary({ exceptions }) {
  if (!exceptions || exceptions.length === 0) return null
  const pending  = exceptions.filter(e => ['pending', 'under_review'].includes(e.status)).length
  const approved = exceptions.filter(e => e.status === 'approved').length
  const rejected = exceptions.filter(e => e.status === 'rejected').length

  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        Mis solicitudes de excepción
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl p-3 bg-orange-50 border border-orange-100 text-center">
          <p className="text-2xl font-black text-orange-500">{pending}</p>
          <p className="text-xs text-gray-500 mt-0.5">En revisión</p>
        </div>
        <div className="rounded-xl p-3 bg-green-50 border border-green-100 text-center">
          <p className="text-2xl font-black text-green-600">{approved}</p>
          <p className="text-xs text-gray-500 mt-0.5">Aprobadas</p>
        </div>
        <div className="rounded-xl p-3 bg-red-50 border border-red-100 text-center">
          <p className="text-2xl font-black text-red-500">{rejected}</p>
          <p className="text-xs text-gray-500 mt-0.5">Rechazadas</p>
        </div>
      </div>
    </div>
  )
}

export default function ProgressTracker({ commission, exceptions }) {
  if (!commission) {
    return (
      <Card>
        <p className="text-sm text-gray-400 text-center py-4">
          No hay datos de compensación para este período.
        </p>
      </Card>
    )
  }

  const bd = calcPayBreakdown(commission)
  const attPct = commission.attainmentPct

  // R2S bar: show progress toward 80% (capped display at 150%)
  const r2sBarPct    = Math.min(attPct, 150)
  const handoffUsed  = commission.handoffDays ?? 0
  const handoffBarPct = commission.handoffDays !== null
    ? Math.min((commission.handoffDays / HANDOFF_MAX_DAYS) * 100, 100)
    : 0

  return (
    <Card className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">📊 Progress Tracker</h3>
          <p className="text-xs text-gray-500 mt-0.5">Período: {commission.period}</p>
        </div>
        {!bd.r2sUnlocked && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-600 animate-pulse">
            ⚠️ Debajo del 80%
          </span>
        )}
        {bd.r2sUnlocked && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
            ✅ Variable Desbloqueado
          </span>
        )}
      </div>

      {/* R2S Progress */}
      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">R2S — Ready to Sell</p>
        <ProgressBar
          pct={attPct}
          max={150}
          threshold={R2S_THRESHOLD}
          color="#FF441F"
          label="Cumplimiento de Meta"
          sublabel={`${attPct}%`}
        />
        {!bd.r2sUnlocked && (
          <p className="text-xs text-red-500 font-medium">
            Faltan {R2S_THRESHOLD - attPct}% para desbloquear el pago variable.
          </p>
        )}
      </div>

      {/* Handoff */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Handoff</p>
        {commission.handoffDays === null ? (
          <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg">
            <span className="text-gray-400 text-sm">—</span>
            <span className="text-xs text-gray-400">Sin handoff — R2S no alcanzado</span>
          </div>
        ) : (
          <>
            {/* Store delivery format */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
              <div>
                <p className="text-xs text-gray-500 font-medium">Tiendas entregadas</p>
                <p className={`text-xl font-black mt-0.5 ${commission.handoffOnTime ? 'text-gray-900' : 'text-yellow-600'}`}>
                  {commission.handoffStores ?? 0}/{commission.totalStores ?? 1}
                  <span className="text-sm font-normal text-gray-500 ml-1">tiendas</span>
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${bd.handoffOnTime ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {bd.handoffOnTime ? '✅ A tiempo' : '⚠️ Fuera de plazo'}
                </span>
                <p className="text-xs text-gray-400 mt-1">{handoffUsed} días / máx {HANDOFF_MAX_DAYS}</p>
              </div>
            </div>
            {/* Days bar */}
            <ProgressBar
              pct={handoffBarPct}
              max={100}
              color={bd.handoffOnTime ? '#FF441F' : '#ef4444'}
              label="Días utilizados"
              sublabel={`${handoffUsed}/${HANDOFF_MAX_DAYS} días`}
            />
          </>
        )}
      </div>

      {/* Pay Breakdown */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Estructura de Pago
        </p>
        {!bd.r2sUnlocked ? (
          <div className="flex items-center gap-2 py-3 px-4 bg-red-50 border border-red-100 rounded-xl">
            <span className="text-lg">🔒</span>
            <div>
              <p className="text-sm font-semibold text-red-700">Variable bloqueado</p>
              <p className="text-xs text-red-500">Alcanza el 80% de tu meta para desbloquear el pago.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <PayBlock
              label="Mensual (60%)"
              amount={bd.monthly}
              pct={60}
              accent="bg-rappi-bg"
            />
            <PayBlock
              label="1ª Quincena (20%)"
              amount={bd.quincenal1}
              pct={20}
              accent="bg-blue-50"
            />
            <PayBlock
              label="2ª Quincena (20%)"
              amount={bd.quincenal2}
              pct={20}
              accent="bg-purple-50"
            />
          </div>
        )}
      </div>

      {/* Bono Extra */}
      {bd.bonoExtra > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-rappi to-rappi-light text-white">
          <span className="text-2xl">🤩</span>
          <div>
            <p className="text-sm font-bold">¡Bono Extra — Top del País!</p>
            <p className="text-xs text-white/80">Eres el mejor performer de tu país este período.</p>
          </div>
          <span className="ml-auto text-xl font-black">+${bd.bonoExtra.toLocaleString()}</span>
        </div>
      )}

      {/* Exception summary */}
      <ExceptionSummary exceptions={exceptions} />

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Pago Total Estimado</span>
        <span className="text-xl font-black text-rappi">${bd.totalPay.toLocaleString()}</span>
      </div>
    </Card>
  )
}

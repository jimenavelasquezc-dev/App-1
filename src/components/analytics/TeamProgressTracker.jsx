import Card from '../ui/Card.jsx'
import { R2S_THRESHOLD } from '../../utils/compensationLogic.js'

function StatCard({ icon, label, value, sub, alert }) {
  return (
    <div className={`rounded-xl p-4 ${alert ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-2xl font-black ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function TeamBar({ label, pct, value, threshold = null }) {
  const above = threshold === null || pct >= threshold
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className={`text-xs font-bold ${above ? 'text-gray-800' : 'text-red-500'}`}>{value}</span>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: above ? '#FF441F' : '#ef4444',
          }}
        />
        {threshold && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
            style={{ left: `${threshold}%` }}
          />
        )}
      </div>
      {threshold && !above && (
        <p className="text-xs text-red-500 font-medium mt-0.5">
          ⚠️ El equipo está por debajo del umbral del {threshold}%
        </p>
      )}
    </div>
  )
}

export default function TeamProgressTracker({ summary, period }) {
  if (!summary) {
    return (
      <Card>
        <p className="text-sm text-gray-400 text-center py-4">
          Sin datos de equipo para este período.
        </p>
      </Card>
    )
  }

  const teamBelowThreshold = summary.avgR2s < R2S_THRESHOLD
  const handoffPct = summary.avgHandoffPct ?? 0

  const q1Pct = summary.total > 0
    ? Math.round((summary.repsOnTrack / summary.total) * 100)
    : 0

  return (
    <Card className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">📊 Progress Tracker — Equipo</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Período: {period} · {summary.total} comerciales
          </p>
        </div>
        {teamBelowThreshold ? (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-600 animate-pulse">
            ⚠️ Equipo debajo del 80%
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
            ✅ Equipo en objetivo
          </span>
        )}
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon="🎯"
          label="R2S Promedio"
          value={`${summary.avgR2s}%`}
          sub={`${summary.repsOnTrack} de ${summary.total} sobre umbral`}
          alert={teamBelowThreshold}
        />
        <StatCard
          icon="🏪"
          label="Handoff exitoso"
          value={`${handoffPct}%`}
          sub="promedio del equipo"
          alert={handoffPct < 80}
        />
        <StatCard
          icon="💸"
          label="Variable Desbloqueado"
          value={`${q1Pct}%`}
          sub={`${summary.repsBelow80} con variable bloqueado`}
          alert={summary.repsBelow80 > summary.total * 0.3}
        />
      </div>

      {/* R2S Tiendas — total from column V */}
      <div className="rounded-xl bg-gray-50 px-4 py-3 space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Total tiendas en R2S
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-black text-gray-900">{summary.totalStores}</p>
            <p className="text-xs text-gray-400">tiendas totales del equipo</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-500">Handoff: {handoffPct}%</p>
            <p className="text-xs text-gray-400">promedio equipo (col. AH)</p>
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(handoffPct, 100)}%`,
              backgroundColor: handoffPct >= 80 ? '#FF441F' : '#ef4444',
            }}
          />
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-4 pt-1">
        <TeamBar
          label="Cumplimiento R2S promedio del equipo"
          pct={(summary.avgR2s / 150) * 100}
          value={`${summary.avgR2s}%`}
          threshold={(R2S_THRESHOLD / 150) * 100}
        />
        <TeamBar
          label="Handoff exitoso del equipo"
          pct={handoffPct}
          value={`${handoffPct}%`}
          threshold={80}
        />
      </div>

      {/* Quincena attainment */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Attainment por Quincena
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold">1ª Quincena (20%)</p>
            <p className="text-xl font-black text-gray-900 mt-1">{q1Pct}%</p>
            <p className="text-xs text-gray-400 mt-0.5">del equipo desbloqueó Q1</p>
          </div>
          <div className="rounded-xl p-3 bg-purple-50 border border-purple-100">
            <p className="text-xs text-purple-600 font-semibold">2ª Quincena (20%)</p>
            <p className="text-xl font-black text-gray-900 mt-1">{summary.avgR2s}%</p>
            <p className="text-xs text-gray-400 mt-0.5">attainment promedio del equipo</p>
          </div>
        </div>
      </div>

      {/* Alert if many reps below threshold */}
      {summary.repsBelow80 > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <span className="text-lg mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-bold text-red-700">
              {summary.repsBelow80} comercial{summary.repsBelow80 > 1 ? 'es' : ''} debajo del 80%
            </p>
            <p className="text-xs text-red-500">
              Estos comerciales tienen el pago variable bloqueado. Revisa el detalle abajo.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

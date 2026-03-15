import Card from '../ui/Card.jsx'

function KpiCard({ label, value, sub, icon, accentBg, accentText }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col items-center text-center gap-2">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${accentBg || 'bg-rappi-bg'}`}
      >
        {icon}
      </div>
      <p className={`text-3xl font-black tabular-nums tracking-tight ${accentText || 'text-gray-900'}`}>
        {value}
      </p>
      <div>
        <p className="text-xs font-semibold text-gray-600 leading-tight">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function KpiStrip({ stats, openExceptions, compact = false }) {
  return (
    <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-2'}`}>
      <KpiCard
        icon="💪🏻"
        label="Total del Equipo"
        value={stats.total.toLocaleString()}
        accentBg="bg-blue-50"
        accentText="text-blue-700"
      />
      <KpiCard
        icon="💰"
        label="Con Comisión Ganada"
        value={`${stats.pct}%`}
        sub={`${stats.earned} de ${stats.total} supervisores`}
        accentBg="bg-green-50"
        accentText="text-green-700"
      />
      <KpiCard
        icon="🔥"
        label="Cumplimiento Promedio"
        value={`${stats.avgAttainment}%`}
        accentBg="bg-rappi-bg"
        accentText="text-rappi"
      />
      <KpiCard
        icon="💸"
        label="Excepciones Abiertas"
        value={openExceptions}
        sub="pendientes o en revisión"
        accentBg="bg-yellow-50"
        accentText={openExceptions > 0 ? 'text-yellow-600' : 'text-gray-900'}
      />
    </div>
  )
}

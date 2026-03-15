import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useExceptions } from '../context/ExceptionsContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useFilters } from '../context/FiltersContext.jsx'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import FilterBar from '../components/ui/FilterBar.jsx'
import { supervisors } from '../data/mockEmployees.js'
import { useCommissions } from '../context/CommissionsContext.jsx'

const supMap = Object.fromEntries(supervisors.map(s => [s.id, s.name]))

const COUNTRY_FLAG = {
  Colombia: '🇨🇴', México: '🇲🇽', Brasil: '🇧🇷', Perú: '🇵🇪', Chile: '🇨🇱',
}

const TYPE_LABELS = {
  store_not_counting: 'Tienda no contabilizada',
  wrong_owner: 'Propietario incorrecto',
  other: 'Otro',
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysSince(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

// ── Color-coded status KPI cards ──────────────────────────────────────────────
function StatusKpiCards({ exceptions, csvRecords, role }) {
  // Combine seed exceptions + CSV-generated review records
  const csvPending     = csvRecords.filter(r => r.reviewStatus === 'pending')
  const csvUnderReview = csvRecords.filter(r => r.reviewStatus === 'under_review')
  const csvApproved    = csvRecords.filter(r => r.reviewStatus === 'approved')

  const pending     = csvRecords.length > 0 ? csvPending     : exceptions.filter(e => e.status === 'pending')
  const underReview = csvRecords.length > 0 ? csvUnderReview : exceptions.filter(e => e.status === 'under_review')
  const completed   = csvRecords.length > 0 ? csvApproved    : exceptions.filter(e => ['approved', 'rejected'].includes(e.status))

  const isData = role === 'data_person'
  const card2Title = isData ? 'Pendientes de Líder' : 'En Revisión por Data'
  const card2Sub   = isData
    ? 'ya procesadas por Data, esperando Líder'
    : 'en revisión activa por Data'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1 — Acción Requerida (Orange) */}
      <div
        className="rounded-2xl border-2 p-6 shadow-sm flex flex-col gap-3"
        style={{ backgroundColor: '#FFF7F5', borderColor: '#FF441F' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
               style={{ backgroundColor: '#FFE8E2' }}>
            🔥
          </div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FF441F' }}>
            Acción Requerida
          </p>
        </div>
        <p className="text-5xl font-black tabular-nums" style={{ color: '#FF441F' }}>
          {pending.length}
        </p>
        <p className="text-xs text-gray-500">solicitudes pendientes de acción</p>
      </div>

      {/* Card 2 — Estatus Cruzado (Blue) — role-based title */}
      <div className="rounded-2xl border-2 border-blue-400 bg-blue-50 p-6 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
            🔄
          </div>
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            {card2Title}
          </p>
        </div>
        <p className="text-5xl font-black tabular-nums text-blue-700">
          {underReview.length}
        </p>
        <p className="text-xs text-gray-500">{card2Sub}</p>
      </div>

      {/* Card 3 — Total Completadas (Green) */}
      <div className="rounded-2xl border-2 border-green-400 bg-green-50 p-6 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">
            ✅
          </div>
          <p className="text-xs font-bold text-green-700 uppercase tracking-wider">
            Total Completadas
          </p>
        </div>
        <p className="text-5xl font-black tabular-nums text-green-700">
          {completed.length}
        </p>
        <p className="text-xs text-gray-500">aprobadas o rechazadas</p>
      </div>
    </div>
  )
}

// ── Country / Supervisor mini-cards ───────────────────────────────────────────
function MiniStatCard({ title, count, flag }) {
  const isHigh = count > 5
  const isZero = count === 0
  const borderClass = isHigh ? 'border-red-400' : isZero ? 'border-green-400' : 'border-gray-200'
  const numColor = isHigh ? '#ef4444' : isZero ? '#059669' : '#FF441F'

  return (
    <div className={`rounded-2xl border-2 ${borderClass} p-4 bg-white flex flex-col items-center text-center gap-0.5 shadow-sm`}>
      {flag && <span className="text-xl leading-none">{flag}</span>}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight mt-1">
        {title}
      </p>
      <p className="text-3xl font-black tabular-nums mt-1" style={{ color: numColor }}>
        {count}
      </p>
    </div>
  )
}

function ReviewBreakdown({ exceptions }) {
  const pending = exceptions.filter(e => ['pending', 'under_review'].includes(e.status))
  const total   = pending.length || 1

  const byCountry = pending.reduce((acc, e) => {
    if (e.country) acc[e.country] = (acc[e.country] || 0) + 1
    return acc
  }, {})

  const bySupervisor = pending.reduce((acc, e) => {
    if (e.supervisorId) acc[e.supervisorId] = (acc[e.supervisorId] || 0) + 1
    return acc
  }, {})

  const supervisorEntries = Object.entries(bySupervisor).sort((a, b) => b[1] - a[1])

  const Row = ({ flag, label, count }) => {
    const isHigh = count > 5
    return (
      <div className="flex items-center gap-2 py-1">
        {flag && <span className="text-sm w-5 text-center">{flag}</span>}
        <span className="text-xs text-gray-600 flex-1 truncate">{label}</span>
        <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${(count / total) * 100}%`, backgroundColor: isHigh ? '#ef4444' : '#FF441F' }}
          />
        </div>
        <span className={`text-xs font-bold w-5 text-right tabular-nums ${isHigh ? 'text-red-500' : 'text-gray-700'}`}>
          {count}
        </span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* País */}
      <div className="bg-gray-50 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Por País</p>
        {['Colombia', 'México', 'Brasil', 'Perú', 'Chile'].map(c => (
          <Row key={c} flag={COUNTRY_FLAG[c]} label={c} count={byCountry[c] ?? 0} />
        ))}
      </div>

      {/* Supervisor */}
      <div className="bg-gray-50 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Por Supervisor</p>
        {supervisorEntries.length === 0 ? (
          <p className="text-xs text-gray-400 py-1">Sin pendientes</p>
        ) : (
          supervisorEntries.map(([supId, count]) => (
            <Row key={supId} label={supMap[supId] ?? supId} count={count} />
          ))
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ExceptionQueuePage() {
  const { exceptions } = useExceptions()
  const { role, currentUser } = useAuth()
  const { country, supervisorId } = useFilters()
  const { csvCache } = useCommissions()

  // Flatten all CSV commission records that have reviewStatus (from any loaded period)
  const csvRecords = Object.values(csvCache).filter(Boolean).flat()
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType]     = useState('all')

  // Base list — oldest first by default
  let filtered = [...exceptions].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))

  if (role === 'data_person') {
    filtered = filtered.filter(e => e.assignedTo === currentUser.id)
  }
  if (country !== 'all')      filtered = filtered.filter(e => e.country === country)
  if (supervisorId !== 'all') filtered = filtered.filter(e => e.supervisorId === supervisorId)
  if (filterStatus !== 'all') filtered = filtered.filter(e => e.status === filterStatus)
  if (filterType !== 'all')   filtered = filtered.filter(e => e.type === filterType)

  const counts = {
    all:          exceptions.length,
    pending:      exceptions.filter(e => e.status === 'pending').length,
    under_review: exceptions.filter(e => e.status === 'under_review').length,
    approved:     exceptions.filter(e => e.status === 'approved').length,
    rejected:     exceptions.filter(e => e.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cola de Excepciones 💸</h1>
        <p className="text-sm text-gray-500 mt-1">Revisa y procesa las solicitudes de excepción enviadas.</p>
      </div>

      {/* Segmentation filters */}
      <FilterBar />

      {/* Color-coded status KPI cards */}
      <StatusKpiCards exceptions={exceptions} csvRecords={csvRecords} role={role} />

      {/* Country + Supervisor breakdown */}
      <ReviewBreakdown exceptions={exceptions} />

      {/* Status / type filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {['all', 'pending', 'under_review', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === s ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'all' ? 'Todos' : s === 'under_review' ? 'En Revisión' : s === 'pending' ? 'Pendiente' : s === 'approved' ? 'Aprobado' : 'Rechazado'}
              {' '}
              <span className="text-gray-400">({counts[s] ?? filtered.length})</span>
            </button>
          ))}
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-rappi"
        >
          <option value="all">Todos los tipos</option>
          <option value="store_not_counting">Tienda no contabilizada</option>
          <option value="wrong_owner">Propietario incorrecto</option>
          <option value="other">Otro</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="text-center text-gray-400 py-12">
          Ninguna excepción coincide con los filtros actuales.
        </Card>
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-6 font-medium text-gray-600">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Enviado por</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Período</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tienda</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Días desde solicitud</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                <th className="py-3 px-6" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(ex => {
                const days = daysSince(ex.submittedAt)
                const isOld = days > 3
                return (
                  <tr key={ex.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6 font-mono text-xs text-gray-500">{ex.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{ex.submittedByName}</td>
                    <td className="py-3 px-4 text-gray-600">{TYPE_LABELS[ex.type]}</td>
                    <td className="py-3 px-4 text-gray-600">{ex.period}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{ex.storeId}</td>
                    <td className="py-3 px-4"><Badge status={ex.status} /></td>
                    <td className="py-3 px-4">
                      {isOld ? (
                        <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#FF441F' }}>
                          ⚠️ {days}d
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">{days}d</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(ex.submittedAt)}</td>
                    <td className="py-3 px-6">
                      <Link
                        to={`/exceptions/${ex.id}`}
                        className="text-rappi hover:text-rappi-dark text-xs font-semibold"
                      >
                        Revisar →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

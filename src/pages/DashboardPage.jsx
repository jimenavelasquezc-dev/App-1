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
import TeamProgressTracker from '../components/analytics/TeamProgressTracker.jsx'
import ExceptionForm from '../components/exceptions/ExceptionForm.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

const PERIODS = [
  { value: '2026-03', label: 'Marzo 2026' },
  { value: '2026-02', label: 'Febrero 2026' },
  { value: '2026-01', label: 'Enero 2026' },
]

// ── Vista exclusiva del Supervisor (rep) ─────────────────────────────────────
function RepDashboard({ exceptions, currentUser }) {
  const [submitted, setSubmitted] = useState(false)
  const [lastId, setLastId]       = useState(null)

  const total      = exceptions.length
  const enRevision = exceptions.filter(e => ['pending', 'under_review'].includes(e.status)).length
  const aprobadas  = exceptions.filter(e => e.status === 'approved').length
  const rechazadas = exceptions.filter(e => e.status === 'rejected').length

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {currentUser?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Desde aquí puedes reportar una discrepancia o ver el estado de tus solicitudes.
        </p>
      </div>

      {/* Mis excepciones — 4 tarjetas */}
      {total > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Mis solicitudes
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border-2 border-gray-100 bg-white p-4 text-center shadow-sm">
              <p className="text-3xl font-black text-gray-800">{total}</p>
              <p className="text-xs text-gray-500 mt-1">Total enviadas</p>
            </div>
            <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 text-center shadow-sm">
              <p className="text-3xl font-black text-orange-500">{enRevision}</p>
              <p className="text-xs text-gray-500 mt-1">En revisión</p>
            </div>
            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4 text-center shadow-sm">
              <p className="text-3xl font-black text-green-600">{aprobadas}</p>
              <p className="text-xs text-gray-500 mt-1">Aprobadas</p>
            </div>
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-center shadow-sm">
              <p className="text-3xl font-black text-red-500">{rechazadas}</p>
              <p className="text-xs text-gray-500 mt-1">Rechazadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Reportar una discrepancia
        </p>
        {submitted ? (
          <Card className="text-center py-6">
            <div className="text-5xl mb-3">🚀</div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">¡Solicitud enviada!</h2>
            <p className="text-sm text-gray-500 mb-1">
              Tu solicitud <span className="font-mono font-semibold text-rappi">{lastId}</span> está pendiente de revisión.
            </p>
            <p className="text-xs text-gray-400 mb-5">
              El equipo de Data la revisará y te avisará si necesita más información.
            </p>
            <Button onClick={() => { setSubmitted(false); setLastId(null) }}>
              Enviar otra solicitud
            </Button>
          </Card>
        ) : (
          <Card>
            <ExceptionForm onSuccess={(id) => { setLastId(id); setSubmitted(true) }} />
          </Card>
        )}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [period, setPeriod] = useState('2026-03')
  const {
    loadPeriod, loadingPeriod, csvCache,
    getAttainmentBuckets, getEarnedStats, getSupervisorBreakdown,
    getAllByPeriod, getByPeriod, getTeamSummary,
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

  // Rep view — show immediately without CSV
  const myExceptions = role === 'rep'
    ? exceptions.filter(e => e.submittedBy === currentUser?.id)
    : []

  if (role === 'rep') {
    return <RepDashboard exceptions={myExceptions} currentUser={currentUser} />
  }

  // Manager / data view
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

      <FilterBar />

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <TeamProgressTracker summary={teamSummary} period={period} />
        <KpiStrip stats={{ ...earnedStats, avgAttainment }} openExceptions={openExceptions} />
      </div>

      {/* Charts 2×2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttainmentRangeChart data={buckets} />
        <CommissionEarnedPie stats={earnedStats} />
        <div className="lg:col-span-2">
          <SupervisorBreakdown data={supervisorData} />
        </div>
      </div>

      <TeamDetailTable data={allReps} />
    </div>
  )
}

import { useFilters } from '../../context/FiltersContext.jsx'
import { useCommissions } from '../../context/CommissionsContext.jsx'
import { COUNTRIES, supervisors } from '../../data/mockEmployees.js'

const selectCls = `
  px-3 py-2 text-sm rounded-lg bg-white font-medium
  border-2 border-rappi
  focus:outline-none focus:ring-2 focus:ring-rappi/30
  text-gray-800 cursor-pointer
  transition-colors hover:bg-rappi-bg
`.trim()

export default function FilterBar() {
  const { country, setCountry, supervisorId, setSupervisorId, reset } = useFilters()
  const { getCsvSupervisors } = useCommissions()

  // Use real supervisors from CSV if loaded; fall back to first 6 mock supervisors
  const csvSups = getCsvSupervisors()
  const supervisorOptions = csvSups.length > 0
    ? csvSups
    : supervisors.slice(0, 6).map(s => ({ id: s.id, name: s.name, country: s.country }))

  const filteredSups = country === 'all'
    ? supervisorOptions
    : supervisorOptions.filter(s => s.country === country)

  const activeSup = supervisorOptions.find(s => s.id === supervisorId)
  const hasFilters = country !== 'all' || supervisorId !== 'all'

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border-2 border-rappi/20 shadow-sm">
      {/* Country */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-rappi uppercase tracking-wider whitespace-nowrap">
          🌎 Filtrar por País
        </label>
        <select
          value={country}
          onChange={e => { setCountry(e.target.value); setSupervisorId('all') }}
          className={selectCls}
        >
          <option value="all">Todos los países</option>
          {COUNTRIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* Supervisor */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-rappi uppercase tracking-wider whitespace-nowrap">
          👤 Filtrar por Supervisor
        </label>
        <select
          value={supervisorId}
          onChange={e => setSupervisorId(e.target.value)}
          className={selectCls}
        >
          <option value="all">Todos los supervisores</option>
          {filteredSups.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            {country !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rappi text-white">
                🌎 {country}
                <button onClick={() => setCountry('all')} className="ml-1 hover:opacity-70">✕</button>
              </span>
            )}
            {supervisorId !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rappi text-white">
                👤 {activeSup?.name ?? supervisorId}
                <button onClick={() => setSupervisorId('all')} className="ml-1 hover:opacity-70">✕</button>
              </span>
            )}
            <button
              onClick={reset}
              className="text-xs text-gray-400 hover:text-rappi font-medium underline transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import Card from '../ui/Card.jsx'
import { R2S_THRESHOLD } from '../../utils/compensationLogic.js'

function MiniBar({ pct, color = '#FF441F' }) {
  return (
    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden inline-block align-middle ml-1">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}

function R2SCell({ pct }) {
  const color = pct >= 120 ? '#059669' : pct >= 100 ? '#22c55e' : pct >= 80 ? '#FF441F' : '#ef4444'
  const bg    = pct >= 120 ? 'bg-emerald-50 text-emerald-700' : pct >= 100 ? 'bg-green-50 text-green-700' : pct >= 80 ? 'bg-rappi-bg text-rappi' : 'bg-red-50 text-red-600'
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${bg}`}>
        {pct >= 80 ? '' : '⚠️ '}{pct}%
      </span>
      <MiniBar pct={(pct / 150) * 100} color={color} />
    </div>
  )
}

function ReviewBadge({ status, requestDate }) {
  if (!status) return null
  const daysOld = requestDate
    ? Math.floor((Date.now() - new Date(requestDate).getTime()) / 86_400_000)
    : 0
  const urgent = daysOld > 3

  const styles = {
    pending:      'bg-orange-50 border border-orange-300 text-orange-700',
    under_review: 'bg-blue-50 border border-blue-300 text-blue-700',
    approved:     'bg-green-50 border border-green-300 text-green-700',
  }
  const labels = {
    pending:      'Pendiente Data',
    under_review: 'Pendiente Líder',
    approved:     'Completado',
  }
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
        {labels[status] || status}
      </span>
      {status !== 'approved' && (
        <span className={`text-xs font-bold ${urgent ? '' : 'text-gray-400'}`}
              style={urgent ? { color: '#FF441F' } : {}}>
          {urgent ? `⚠️ ${daysOld}d` : `${daysOld}d`}
        </span>
      )}
    </div>
  )
}

function QuincenaCell({ amount, quota }) {
  // Show progress bar: amount vs expected target (20% of potential commission)
  const target = Math.round(quota * 0.05 * 0.20)  // rough target at 100% att
  const pct = target > 0 ? Math.min(Math.round((amount / target) * 100), 100) : 0
  const color = amount > 0 ? '#FF441F' : '#e5e7eb'
  return (
    <div className="text-right">
      <p className="text-xs font-semibold text-gray-800">${amount.toLocaleString()}</p>
      <div className="flex justify-end mt-0.5">
        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  )
}

export default function TeamDetailTable({ data }) {
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 15
  const totalPages = Math.ceil(data.length / PAGE_SIZE)
  const pageData = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <Card padding={false}>
      <div className="p-6 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Detalle por Comercial 🧑‍💼</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.length} comerciales · ordenados por cumplimiento
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rappi inline-block" /> ≥ 80% R2S
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> {'<'} 80%
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-6 font-medium text-gray-600">#</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Comercial</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">R2S %</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Tiendas Entregadas</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">
                1ª Quincena <span className="text-gray-400 font-normal">(20%)</span>
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">
                2ª Quincena <span className="text-gray-400 font-normal">(20%)</span>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Revisión</th>
              <th className="text-right py-3 px-6 font-medium text-gray-600">Comisión Total</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => {
              const globalIdx = page * PAGE_SIZE + i + 1
              const below = row.attainmentPct < R2S_THRESHOLD
              const handoffFull = row.handoffStores === row.totalStores && row.totalStores > 0
              return (
                <tr
                  key={row.id}
                  className={`border-b border-gray-50 transition-colors ${below ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-gray-50'}`}
                >
                  <td className="py-3 px-6 text-xs font-medium text-gray-400">{globalIdx}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-800">{row.employeeName}</p>
                    <p className="text-xs text-gray-400">{row.country}</p>
                  </td>
                  <td className="py-3 px-4">
                    <R2SCell pct={row.attainmentPct} />
                  </td>
                  <td className="py-3 px-4">
                    {row.handoffDays === null ? (
                      <span className="text-xs text-gray-400">— Sin R2S</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${handoffFull ? 'text-green-700' : 'text-yellow-700'}`}>
                          {row.handoffStores}/{row.totalStores} tiendas entregadas
                        </span>
                        {!handoffFull && (
                          <span className="text-xs text-yellow-600">⚠️</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <QuincenaCell amount={row.quincenal1} quota={row.quota} />
                  </td>
                  <td className="py-3 px-4">
                    <QuincenaCell amount={row.quincenal2} quota={row.quota} />
                  </td>
                  <td className="py-3 px-4">
                    <ReviewBadge status={row.reviewStatus} requestDate={row.requestDate} />
                  </td>
                  <td className="py-3 px-6 text-right">
                    <p className={`font-bold text-sm ${below ? 'text-gray-400' : 'text-gray-900'}`}>
                      {below ? '—' : `$${row.commissionAmount.toLocaleString()}`}
                    </p>
                    {row.bonoExtra > 0 && (
                      <p className="text-xs text-rappi font-semibold">+${row.bonoExtra} bono 🤩</p>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, data.length)} de {data.length}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:border-rappi hover:text-rappi transition-colors"
            >
              ← Anterior
            </button>
            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:border-rappi hover:text-rappi transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

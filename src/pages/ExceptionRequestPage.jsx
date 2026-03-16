import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useExceptions } from '../context/ExceptionsContext.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import ExceptionForm from '../components/exceptions/ExceptionForm.jsx'
import Button from '../components/ui/Button.jsx'

const TYPE_LABELS = {
  store_not_counting: 'Tienda no contabilizada',
  wrong_owner:        'Propietario incorrecto',
  other:              'Otro',
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('es', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ExceptionRequestPage() {
  const { currentUser } = useAuth()
  const { exceptions }  = useExceptions()
  const [submitted, setSubmitted] = useState(false)
  const [lastId, setLastId]       = useState(null)

  // Only this supervisor's exceptions
  const mine       = exceptions.filter(e => e.submittedBy === currentUser?.id)
  const enRevision = mine.filter(e => ['pending', 'under_review'].includes(e.status)).length
  const aprobadas  = mine.filter(e => e.status === 'approved').length
  const rechazadas = mine.filter(e => e.status === 'rejected').length

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cola de Excepciones 💸</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Reporta discrepancias y consulta el estado de tus solicitudes.
        </p>
      </div>

      {/* Mini-indicadores */}
      {mine.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border-2 border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="text-3xl font-black text-gray-800">{mine.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total solicitadas</p>
          </div>
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 text-center shadow-sm">
            <p className="text-3xl font-black text-orange-500">{enRevision}</p>
            <p className="text-xs text-gray-500 mt-1">En revisión</p>
          </div>
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-center shadow-sm">
            <p className="text-3xl font-black text-red-500">{rechazadas}</p>
            <p className="text-xs text-gray-500 mt-1">Rechazadas</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Nueva solicitud
        </p>
        {submitted ? (
          <Card className="text-center py-6">
            <div className="text-5xl mb-3">🚀</div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">¡Solicitud enviada!</h2>
            <p className="text-sm text-gray-500 mb-1">
              Tu solicitud <span className="font-mono font-semibold text-rappi">{lastId}</span> está pendiente de revisión.
            </p>
            <p className="text-xs text-gray-400 mb-5">
              El equipo de Data la revisará y te avisará si necesita más info.
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

      {/* Historial */}
      {mine.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Mis solicitudes
          </p>
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tienda</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {mine.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).map(ex => (
                    <tr key={ex.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">{ex.id}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{ex.storeId}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{TYPE_LABELS[ex.type] ?? ex.type}</td>
                      <td className="py-3 px-4"><Badge status={ex.status} /></td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(ex.submittedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

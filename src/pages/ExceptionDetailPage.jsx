import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useExceptions } from '../context/ExceptionsContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import CommentThread from '../components/exceptions/CommentThread.jsx'
import StatusTimeline from '../components/exceptions/StatusTimeline.jsx'

const TYPE_LABELS = {
  store_not_counting: 'Tienda no contabilizada hacia la meta',
  wrong_owner: 'Propietario incorrecto / Solicitud de cambio',
  other: 'Otro',
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('default', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export default function ExceptionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { exceptions, setStatus, addComment } = useExceptions()
  const { role, currentUser } = useAuth()
  const [modal, setModal] = useState(null) // 'approve' | 'reject' | 'review'
  const [resolution, setResolution] = useState('')
  const [acting, setActing] = useState(false)

  const exception = exceptions.find(e => e.id === id)
  if (!exception) {
    return (
      <div className="text-center py-20 text-gray-400">
        Excepción no encontrada.{' '}
        <Link to="/exceptions" className="text-rappi underline">Volver a la cola</Link>
      </div>
    )
  }

  const canResolve = role === 'manager' && ['pending', 'under_review'].includes(exception.status)
  const canMarkReview = role === 'data_person' && exception.status === 'pending'

  const handleAction = (action) => {
    setActing(true)
    if (action === 'review') {
      setStatus(exception.id, 'under_review', null, null)
      // Add auto-comment
      addComment(exception.id, {
        id: `CMT-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: role,
        text: 'Marcado como En Revisión.',
        createdAt: new Date().toISOString(),
      })
    } else {
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      setStatus(exception.id, newStatus, resolution, currentUser.id)
      addComment(exception.id, {
        id: `CMT-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: role,
        text: `${action === 'approve' ? 'Aprobado' : 'Rechazado'}. ${resolution}`,
        createdAt: new Date().toISOString(),
      })
    }
    setTimeout(() => { setActing(false); setModal(null); setResolution('') }, 300)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/exceptions" className="text-sm text-rappi hover:text-rappi-dark font-medium">
        ← Volver a la Cola
      </Link>

      {/* Header card */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{exception.id}</h1>
              <Badge status={exception.status} />
            </div>
            <p className="text-sm text-gray-500">
              Enviado por <span className="font-medium text-gray-700">{exception.submittedByName}</span>{' '}
              el {formatDate(exception.submittedAt)}
            </p>
          </div>
          {/* Action buttons */}
          <div className="flex gap-2">
            {canMarkReview && (
              <Button size="sm" variant="secondary" onClick={() => setModal('review')}>
                Marcar en Revisión
              </Button>
            )}
            {canResolve && (
              <>
                <Button size="sm" variant="danger" onClick={() => setModal('reject')}>Rechazar</Button>
                <Button size="sm" variant="success" onClick={() => setModal('approve')}>Aprobar</Button>
              </>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <StatusTimeline status={exception.status} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tipo</p>
            <p className="font-medium text-gray-800">{TYPE_LABELS[exception.type]}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Período</p>
            <p className="font-medium text-gray-800">{exception.period}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">ID Tienda</p>
            <p className="font-mono font-medium text-gray-800">{exception.storeId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Asignado a</p>
            <p className="font-medium text-gray-800">{exception.assignedTo}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Descripción</p>
          <p className="text-sm text-gray-700 leading-relaxed">{exception.description}</p>
        </div>

        {/* Note */}
        {exception.note && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Nota de Apoyo</p>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{exception.note}</p>
          </div>
        )}

        {/* Resolution */}
        {exception.resolution && (
          <div className={`mt-4 p-4 rounded-xl ${exception.status === 'approved' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Resolución</p>
            <p className="text-sm text-gray-800">{exception.resolution}</p>
          </div>
        )}
      </Card>

      {/* Comments */}
      <Card>
        <CommentThread exception={exception} />
      </Card>

      {/* Modals */}
      <Modal open={modal === 'review'} onClose={() => setModal(null)} title="Marcar en Revisión">
        <p className="text-sm text-gray-600 mb-4">
          Esto moverá la excepción al estado "En Revisión" y notificará al solicitante.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
          <Button onClick={() => handleAction('review')} disabled={acting}>Confirmar</Button>
        </div>
      </Modal>

      <Modal open={modal === 'approve'} onClose={() => setModal(null)} title="Aprobar Excepción 🤩">
        <p className="text-sm text-gray-600 mb-3">Indica la resolución (obligatorio):</p>
        <textarea
          value={resolution}
          onChange={e => setResolution(e.target.value)}
          rows={3}
          placeholder="Describe el ajuste a realizar..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none mb-4"
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
          <Button variant="success" onClick={() => handleAction('approve')} disabled={!resolution.trim() || acting}>
            Aprobar
          </Button>
        </div>
      </Modal>

      <Modal open={modal === 'reject'} onClose={() => setModal(null)} title="Rechazar Excepción">
        <p className="text-sm text-gray-600 mb-3">Indica el motivo del rechazo (obligatorio):</p>
        <textarea
          value={resolution}
          onChange={e => setResolution(e.target.value)}
          rows={3}
          placeholder="Explica por qué se rechaza esta excepción..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none mb-4"
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => handleAction('reject')} disabled={!resolution.trim() || acting}>
            Rechazar
          </Button>
        </div>
      </Modal>
    </div>
  )
}

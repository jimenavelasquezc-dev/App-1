import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useExceptions } from '../../context/ExceptionsContext.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'

function formatDate(iso) {
  return new Date(iso).toLocaleString('default', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export default function CommentThread({ exception }) {
  const { currentUser, role } = useAuth()
  const { addComment } = useExceptions()
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  const canComment = role === 'data_person' || role === 'manager'

  const handlePost = () => {
    if (!text.trim()) return
    setPosting(true)
    addComment(exception.id, {
      id: `CMT-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: role,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    })
    setText('')
    setTimeout(() => setPosting(false), 200)
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Comentarios ({exception.comments.length})
      </h4>

      {exception.comments.length === 0 && (
        <p className="text-sm text-gray-400 italic mb-4">Aún no hay comentarios.</p>
      )}

      <div className="space-y-4 mb-4">
        {exception.comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-rappi-bg border border-rappi/20 flex items-center justify-center text-sm font-bold text-rappi flex-shrink-0">
              {c.authorName[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-800">{c.authorName}</span>
                <Badge status={c.authorRole} />
                <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {canComment && exception.status !== 'approved' && exception.status !== 'rejected' && (
        <div className="border-t border-gray-100 pt-4">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Agrega un comentario..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rappi focus:border-rappi resize-none"
          />
          <div className="flex justify-end mt-2">
            <Button size="sm" onClick={handlePost} disabled={!text.trim() || posting}>
              {posting ? 'Publicando...' : 'Publicar Comentario'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

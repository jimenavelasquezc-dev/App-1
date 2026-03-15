import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useExceptions } from '../../context/ExceptionsContext.jsx'
import Button from '../ui/Button.jsx'

const TYPES = [
  { value: 'store_not_counting', label: 'Tienda no contabilizada hacia la meta' },
  { value: 'wrong_owner', label: 'Propietario incorrecto / Solicitud de cambio' },
  { value: 'other', label: 'Otro' },
]
const PERIODS = ['2026-02', '2026-01']

export default function ExceptionForm({ onSuccess }) {
  const { currentUser } = useAuth()
  const { submitException } = useExceptions()
  const [form, setForm] = useState({
    period: '2026-02',
    storeId: currentUser?.storeId || '',
    type: '',
    description: '',
  })
  const [files, setFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const validate = () => {
    const e = {}
    if (!form.storeId.trim()) e.storeId = 'Store ID is required'
    if (!form.type) e.type = 'Please select a type'
    if (form.description.length < 20) e.description = 'Description must be at least 20 characters'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    const id = `EXC-${Date.now()}`
    submitException({
      id,
      submittedBy: currentUser.id,
      submittedByName: currentUser.name,
      submittedAt: new Date().toISOString(),
      period: form.period,
      storeId: form.storeId.trim().toUpperCase(),
      type: form.type,
      description: form.description,
      attachments: files.map(f => f.name),
      status: 'pending',
      assignedTo: 'DEMO-DATA-01',
      comments: [],
      resolution: null,
      resolvedBy: null,
      resolvedAt: null,
    })
    setTimeout(() => { setSubmitting(false); onSuccess(id) }, 400)
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(er => { const n = {...er}; delete n[field]; return n })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Period */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
        <select
          value={form.period}
          onChange={set('period')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rappi focus:border-rappi"
        >
          {PERIODS.map(p => (
            <option key={p} value={p}>
              {new Date(p + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Store ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ID de Tienda</label>
        <input
          value={form.storeId}
          onChange={set('storeId')}
          placeholder="ej. STR-045"
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rappi focus:border-rappi ${errors.storeId ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.storeId && <p className="mt-1 text-xs text-red-500">El ID de tienda es obligatorio</p>}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Excepción</label>
        <div className="space-y-2">
          {TYPES.map(t => (
            <label key={t.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.type === t.value ? 'border-rappi bg-rappi-bg' : 'border-gray-200 hover:border-gray-300'}`}>
              <input
                type="radio"
                name="type"
                value={t.value}
                checked={form.type === t.value}
                onChange={set('type')}
                className="accent-rappi"
              />
              <span className="text-sm text-gray-800">{t.label}</span>
            </label>
          ))}
        </div>
        {errors.type && <p className="mt-1 text-xs text-red-500">Selecciona un tipo</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span className="text-gray-400 font-normal">(mín. 20 caracteres)</span>
        </label>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={4}
          placeholder="Describe la discrepancia en detalle..."
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rappi focus:border-rappi resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
        />
        <div className="flex justify-between mt-1">
          {errors.description
            ? <p className="text-xs text-red-500">Mínimo 20 caracteres</p>
            : <span />}
          <span className={`text-xs ${form.description.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
            {form.description.length}/20+
          </span>
        </div>
      </div>

      {/* Document Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Documentos de Apoyo <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            const dropped = Array.from(e.dataTransfer.files)
            setFiles(prev => [...prev, ...dropped].slice(0, 5))
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer transition-colors ${
            dragOver
              ? 'border-rappi bg-rappi-bg'
              : 'border-gray-300 hover:border-rappi hover:bg-rappi-bg/50'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dragOver ? 'bg-rappi text-white' : 'bg-gray-100 text-gray-400'}`}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {dragOver ? 'Suelta los archivos aquí' : 'Arrastra y suelta archivos aquí'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">o haz clic para explorar — PDF, PNG, JPG, XLSX (máx. 5 archivos)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
            className="hidden"
            onChange={e => {
              const picked = Array.from(e.target.files)
              setFiles(prev => [...prev, ...picked].slice(0, 5))
              e.target.value = ''
            }}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                <span className="flex items-center gap-2 text-gray-700 truncate">
                  <span className="text-rappi">📎</span>
                  <span className="truncate max-w-xs">{f.name}</span>
                  <span className="text-gray-400 flex-shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
                </span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setFiles(prev => prev.filter((_, j) => j !== i)) }}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button type="submit" disabled={submitting} className="w-full" size="lg">
        {submitting ? 'Enviando...' : 'Enviar Solicitud de Excepción 🚀'}
      </Button>
    </form>
  )
}

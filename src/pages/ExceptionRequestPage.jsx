import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import ExceptionForm from '../components/exceptions/ExceptionForm.jsx'
import Button from '../components/ui/Button.jsx'

export default function ExceptionRequestPage() {
  const [submitted, setSubmitted] = useState(false)
  const [exceptionId, setExceptionId] = useState(null)
  const navigate = useNavigate()

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto pt-8">
        <Card className="text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Excepción Enviada! 🔥</h2>
          <p className="text-gray-500 text-sm mb-2">
            Tu solicitud <span className="font-mono font-semibold text-rappi">{exceptionId}</span> fue enviada y está pendiente de revisión.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            El Equipo de Data revisará tu solicitud y puede contactarte si necesita más información.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => { setSubmitted(false); setExceptionId(null) }}>
              Enviar Otra
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              Ir al Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Solicitud de Excepción 💸</h1>
        <p className="text-sm text-gray-500 mt-1">Reporta una discrepancia de tienda para revisión del Equipo de Data.</p>
      </div>
      <Card>
        <ExceptionForm onSuccess={(id) => { setExceptionId(id); setSubmitted(true) }} />
      </Card>
    </div>
  )
}

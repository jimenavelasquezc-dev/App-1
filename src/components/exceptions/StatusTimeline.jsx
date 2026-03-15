const steps = [
  { key: 'pending', label: 'Enviado' },
  { key: 'under_review', label: 'En Revisión' },
  { key: 'resolved', label: 'Resuelto' },
]

function getStepIndex(status) {
  if (status === 'pending') return 0
  if (status === 'under_review') return 1
  return 2
}

export default function StatusTimeline({ status }) {
  const current = getStepIndex(status)
  const isRejected = status === 'rejected'
  const isApproved = status === 'approved'

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        const isLast = i === steps.length - 1

        let dotClass = 'bg-gray-200 border-gray-300 text-gray-400'
        if (done) dotClass = 'bg-rappi border-rappi text-white'
        if (active) {
          if (isLast && isApproved) dotClass = 'bg-green-500 border-green-500 text-white'
          else if (isLast && isRejected) dotClass = 'bg-red-500 border-red-500 text-white'
          else dotClass = 'bg-rappi-bg border-rappi text-rappi'
        }

        const label = isLast && isRejected ? 'Rechazado' : isLast && isApproved ? 'Aprobado' : step.label

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${dotClass}`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? 'text-gray-800' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 w-16 mx-1 mb-4 ${i < current ? 'bg-rappi' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

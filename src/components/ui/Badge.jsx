const statusConfig = {
  pending: { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-800' },
  under_review: { label: 'En Revisión', cls: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Aprobado', cls: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rechazado', cls: 'bg-red-100 text-red-800' },
  rep: { label: 'Supervisor', cls: 'bg-gray-100 text-gray-700' },
  manager: { label: 'Líder de Inside Sales', cls: 'bg-rappi-bg text-rappi-dark' },
  data_person: { label: 'Equipo de Data', cls: 'bg-purple-100 text-purple-700' },
}

export default function Badge({ status, label, className = '' }) {
  const cfg = statusConfig[status] || { label: label || status, cls: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls} ${className}`}>
      {cfg.label}
    </span>
  )
}

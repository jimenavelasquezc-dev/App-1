import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'

function attainmentBadge(pct) {
  if (pct >= 120) return 'bg-emerald-100 text-emerald-700'
  if (pct >= 100) return 'bg-green-100 text-green-700'
  if (pct >= 80) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export default function TopPerformersTable({ data }) {
  return (
    <Card padding={false}>
      <div className="p-6 pb-2">
        <h3 className="text-base font-semibold text-gray-800">Top Performers 🏆</h3>
        <p className="text-xs text-gray-500 mt-0.5">Top 10 por % de cumplimiento</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-6 font-medium text-gray-600">Posición</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Supervisor</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Tienda</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Cumplimiento</th>
              <th className="text-right py-3 px-6 font-medium text-gray-600">Comisión</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 font-bold text-rappi">#{i + 1}</td>
                <td className="py-3 px-4 font-medium text-gray-800">{row.employeeName}</td>
                <td className="py-3 px-4 text-gray-500">{row.employeeId}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${attainmentBadge(row.attainmentPct)}`}>
                    {row.attainmentPct}%
                  </span>
                </td>
                <td className="py-3 px-6 text-right font-semibold text-gray-800">
                  ${row.commissionAmount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

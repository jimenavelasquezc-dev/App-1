import Card from '../ui/Card.jsx'

export default function SupervisorBreakdown({ data }) {
  const sorted = [...data].sort((a, b) => b.avgAttainment - a.avgAttainment)

  return (
    <Card padding={false}>
      <div className="p-6 pb-2">
        <h3 className="text-base font-semibold text-gray-800">Desempeño por Supervisor 🤩</h3>
        <p className="text-xs text-gray-500 mt-0.5">Ordenado por cumplimiento promedio</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-6 font-medium text-gray-600">Supervisor</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Región</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Equipo</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Tiendas R2S</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">% Con Comisión</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Cum. Prom.</th>
              <th className="text-right py-3 px-6 font-medium text-gray-600">Pago Total</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 10).map((row, i) => (
              <tr key={row.supervisorId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-5">#{i + 1}</span>
                    <span className="font-medium text-gray-800">{row.supervisorName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{row.region}</td>
                <td className="py-3 px-4 text-right text-gray-600">{row.teamSize}</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-800">{row.totalStores}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`font-semibold ${row.earnedPct >= 80 ? 'text-green-600' : row.earnedPct >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {row.earnedPct}%
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`font-semibold ${row.avgAttainment >= 100 ? 'text-green-600' : row.avgAttainment >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {row.avgAttainment}%
                  </span>
                </td>
                <td className="py-3 px-6 text-right font-medium text-gray-800">
                  ${row.totalPayout.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

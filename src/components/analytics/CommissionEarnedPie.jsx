import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card from '../ui/Card.jsx'

const COLORS = ['#FF441F', '#e5e7eb']

export default function CommissionEarnedPie({ stats }) {
  const data = [
    { name: 'Con Comisión 💰', value: stats.earned },
    { name: 'Sin Comisión', value: stats.total - stats.earned },
  ]

  return (
    <Card>
      <h3 className="text-base font-semibold text-gray-800 mb-2">Comisión Ganada 💸</h3>
      <p className="text-3xl font-bold text-rappi mb-1">{stats.pct}%</p>
      <p className="text-xs text-gray-500 mb-4">del equipo ganó comisión este período</p>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val, name) => [`${val} reps`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500 mt-2">
        Pago total: <span className="font-semibold text-gray-800">${stats.totalPayout.toLocaleString()}</span>
      </p>
    </Card>
  )
}

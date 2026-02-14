import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

export default function UtilizationChart({ data }) {
  function getBarColor(utilization) {
    if (utilization > 100) return '#ef4444'
    if (utilization > 80) return '#f59e0b'
    return '#22c55e'
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <ReferenceLine y={100} stroke="#666" strokeDasharray="3 3" label="Capacity" />
        <Bar dataKey="utilizationPercentage" name="Utilization %">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.utilizationPercentage)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

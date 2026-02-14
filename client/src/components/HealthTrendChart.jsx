import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts'

export default function HealthTrendChart({ data }) {
  if (!data || data.length === 0) return <div>No trend data yet.</div>

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="sprint" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" />
        <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="3 3" />
        <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  )
}

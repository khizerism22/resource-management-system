import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import './HealthScoreGauge.css'

export default function HealthScoreGauge({ score }) {
  const safeScore = Math.max(0, Math.min(score, 100))

  function getColor() {
    if (safeScore < 50) return '#ef4444'
    if (safeScore <= 75) return '#f59e0b'
    return '#22c55e'
  }

  const data = [{ value: safeScore }, { value: 100 - safeScore }]
  const colors = [getColor(), '#e2e8f0']

  return (
    <div className="health-score-gauge">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="gauge-value">
        <span className="score-number" style={{ color: getColor() }}>
          {safeScore}
        </span>
        <span className="score-max">/100</span>
      </div>
    </div>
  )
}

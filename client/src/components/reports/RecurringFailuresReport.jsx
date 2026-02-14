import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import './ReportComponents.css'

const COLORS = ['#ef4444', '#f59e0b', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

function formatReason(reason) {
  return reason
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
}

export default function RecurringFailuresReport({ data, summary }) {
  const chartData = data.map((entry) => ({
    name: formatReason(entry.reason),
    value: entry.count
  }))

  return (
    <div className="report-component">
      <h2>Recurring Failure Analysis</h2>

      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Total Failures</div>
            <div className="summary-value danger">{summary.totalFailures}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Unique Reasons</div>
            <div className="summary-value">{summary.uniqueReasons}</div>
          </div>
          <div className="summary-card full-width">
            <div className="summary-label">Top Reason</div>
            <div className="summary-value">{formatReason(summary.topReason)}</div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="chart-container">
          <h3>Failure Distribution</h3>
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="table-container">
        <h3>Detailed Data</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Failure Reason</th>
              <th>Occurrences</th>
              <th>Percentage</th>
              <th>Affected Projects</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.reason}>
                <td>{index + 1}</td>
                <td><strong>{formatReason(row.reason)}</strong></td>
                <td className="danger">{row.count}</td>
                <td>{row.percentage}%</td>
                <td>{row.affectedProjects}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

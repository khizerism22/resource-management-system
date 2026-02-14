import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './ReportComponents.css'

export default function SprintSuccessReport({ data, summary }) {
  return (
    <div className="report-component">
      <h2>Sprint Success Trend</h2>

      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Total Sprints</div>
            <div className="summary-value">{summary.totalSprints}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Successful Sprints</div>
            <div className="summary-value success">{summary.totalSuccess}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Average Success Rate</div>
            <div className="summary-value">{summary.avgSuccessRate}%</div>
          </div>
        </div>
      )}

      <div className="chart-container">
        <h3>Outcome Distribution by Period</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="success" stackId="a" fill="#22c55e" name="Success" />
            <Bar dataKey="atRisk" stackId="a" fill="#f59e0b" name="At Risk" />
            <Bar dataKey="failure" stackId="a" fill="#ef4444" name="Failure" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container">
        <h3>Detailed Data</h3>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Total</th>
              <th>Success</th>
              <th>At Risk</th>
              <th>Failure</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.period}>
                <td>{row.period}</td>
                <td>{row.total}</td>
                <td className="success">{row.success}</td>
                <td className="warning">{row.atRisk}</td>
                <td className="danger">{row.failure}</td>
                <td>
                  <span
                    className={`rate-badge ${row.successRate >= 75 ? 'rate-high' : row.successRate >= 50 ? 'rate-medium' : 'rate-low'}`}
                  >
                    {row.successRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

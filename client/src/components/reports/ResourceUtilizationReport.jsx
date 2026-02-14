import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './ReportComponents.css'

export default function ResourceUtilizationReport({ data, summary }) {
  function getBarColor(utilization) {
    if (utilization > 100) return '#ef4444'
    if (utilization > 80) return '#f59e0b'
    return '#22c55e'
  }

  return (
    <div className="report-component">
      <h2>Resource Utilization</h2>

      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Total Resources</div>
            <div className="summary-value">{summary.totalResources}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Over-Allocated</div>
            <div className="summary-value danger">{summary.overAllocatedCount}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Avg Utilization</div>
            <div className="summary-value">{summary.avgUtilization}%</div>
          </div>
        </div>
      )}

      <div className="chart-container">
        <h3>Utilization by Resource</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 150]} />
            <YAxis dataKey="resourceName" type="category" width={140} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgUtilization" name="Avg Utilization %">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.avgUtilization)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container">
        <h3>Detailed Data</h3>
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Role</th>
              <th>Skills</th>
              <th>Avg Util %</th>
              <th>Allocations</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.resourceName} className={row.overAllocated ? 'over-allocated-row' : ''}>
                <td>{row.resourceName}</td>
                <td>{row.role}</td>
                <td className="skills-cell">{row.skills}</td>
                <td>
                  <span
                    className={`util-badge ${row.avgUtilization > 100 ? 'util-over' : row.avgUtilization > 80 ? 'util-high' : 'util-normal'}`}
                  >
                    {row.avgUtilization}%
                  </span>
                </td>
                <td>{row.allocationsCount}</td>
                <td>
                  {row.overAllocated ? (
                    <span className="status-badge status-danger">Over-Allocated</span>
                  ) : row.avgUtilization > 80 ? (
                    <span className="status-badge status-warning">High</span>
                  ) : (
                    <span className="status-badge status-success">Available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

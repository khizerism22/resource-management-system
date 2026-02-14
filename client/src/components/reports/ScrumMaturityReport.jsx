import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import './ReportComponents.css'

export default function ScrumMaturityReport({ data, summary }) {
  const latestSprint = data.length > 0 ? data[data.length - 1] : null
  const radarData = latestSprint
    ? [
        { dimension: 'Planning', value: latestSprint.sprintPlanning },
        { dimension: 'Backlog', value: latestSprint.backlog },
        { dimension: 'Collaboration', value: latestSprint.collaboration },
        { dimension: 'Daily Scrum', value: latestSprint.dailyScrum },
        { dimension: 'Execution', value: latestSprint.execution },
        { dimension: 'Review', value: latestSprint.review },
        { dimension: 'Retro', value: latestSprint.retrospective }
      ]
    : []

  return (
    <div className="report-component">
      <h2>Scrum Maturity Trend</h2>

      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Current Maturity</div>
            <div className="summary-value">{summary.currentMaturity}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Average Maturity</div>
            <div className="summary-value">{summary.avgMaturity}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Trend</div>
            <div className={`summary-value ${summary.trend === 'improving' ? 'success' : summary.trend === 'declining' ? 'danger' : ''}`}>
              {summary.trend}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Sprints</div>
            <div className="summary-value">{summary.totalSprints}</div>
          </div>
        </div>
      )}

      <div className="charts-row">
        <div className="chart-container">
          <h3>Maturity Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="overallScore" stroke="#2563eb" strokeWidth={2} name="Overall Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {radarData.length > 0 && (
          <div className="chart-container">
            <h3>Latest Sprint Dimensions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="table-container">
        <h3>Detailed Data</h3>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Planning</th>
              <th>Backlog</th>
              <th>Collab</th>
              <th>Daily</th>
              <th>Exec</th>
              <th>Review</th>
              <th>Retro</th>
              <th>Overall</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.period}>
                <td>{row.period}</td>
                <td>{row.sprintPlanning}</td>
                <td>{row.backlog}</td>
                <td>{row.collaboration}</td>
                <td>{row.dailyScrum}</td>
                <td>{row.execution}</td>
                <td>{row.review}</td>
                <td>{row.retrospective}</td>
                <td><strong>{row.overallScore}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

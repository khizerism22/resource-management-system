import { useNavigate } from 'react-router-dom'
import './ProjectHealthCard.css'

export default function ProjectHealthCard({ project }) {
  const navigate = useNavigate()

  function getRAGColor(rag) {
    if (rag === 'Green') return '#22c55e'
    if (rag === 'Amber') return '#f59e0b'
    if (rag === 'Red') return '#ef4444'
    return '#94a3b8'
  }

  return (
    <div className="project-health-card" onClick={() => navigate(`/dashboard/project/${project.projectId}`)}>
      <div className="card-header">
        <div className="project-info">
          <h3>{project.name}</h3>
          <p className="project-client">{project.client}</p>
        </div>
        <div className="rag-indicator-circle" style={{ backgroundColor: getRAGColor(project.ragStatus) }} />
      </div>

      <div className="card-metrics">
        <div className="metric-row">
          <span className="metric-label">Health Score</span>
          <span className="metric-value">{project.avgHealthScore || 0}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Failed Sprints</span>
          <span className="metric-value danger">{project.failedSprints}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">At Risk Sprints</span>
          <span className="metric-value warning">{project.atRiskSprints}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Total Sprints</span>
          <span className="metric-value">{project.totalSprints}</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="utilization-bar-small">
          <div
            className="utilization-fill"
            style={{
              width: `${project.resourceUtilization}%`,
              backgroundColor: project.resourceUtilization > 80 ? 'var(--warning)' : 'var(--success)'
            }}
          />
        </div>
        <span className="utilization-text">Utilization: {project.resourceUtilization}%</span>
      </div>
    </div>
  )
}

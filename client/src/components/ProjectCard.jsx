import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { projectService } from '../services/projectService.js'
import './ProjectCard.css'

export default function ProjectCard({ project, viewMode, onDelete, onClick }) {
  const [health, setHealth] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchHealth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id])

  async function fetchHealth() {
    try {
      const data = await projectService.getProjectHealth(project._id)
      setHealth(data)
    } catch {
      setHealth(null)
    }
  }

  const canDelete = user?.role === 'Admin' || project.createdBy?._id === user?.id

  function getHealthColor(healthStatus) {
    switch (healthStatus) {
      case 'Green':
        return 'var(--success)'
      case 'Amber':
        return 'var(--warning)'
      case 'Red':
        return 'var(--danger)'
      default:
        return 'var(--gray-500)'
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function handleDelete(e) {
    e.stopPropagation()
    onDelete()
  }

  function handleDashboard(e) {
    e.stopPropagation()
    navigate(`/dashboard/project/${project._id}`)
  }

  if (viewMode === 'list') {
    return (
      <div className="project-card-list" onClick={onClick}>
        <div className="project-info">
          <h3>{project.name}</h3>
          <p className="client">{project.client}</p>
        </div>
        <div className="project-dates">
          <span>
            {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : '—'}
          </span>
        </div>
        <div className="project-status">
          <span className={`badge badge-${project.status.toLowerCase()}`}>{project.status}</span>
        </div>
        <div className="project-health">
          {health && (
            <div className="health-indicator" style={{ backgroundColor: getHealthColor(health.health) }}>
              {health.avgScore}
            </div>
          )}
        </div>
        <div className="project-actions">
          <button className="btn-icon" onClick={handleDashboard} title="Dashboard">
            Dashboard
          </button>
          {canDelete && (
            <button className="btn-icon btn-danger" onClick={handleDelete} title="Delete">
              Delete
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="project-card" onClick={onClick}>
      <div className="card-header">
        <span className={`badge badge-${project.status.toLowerCase()}`}>{project.status}</span>
        <div className="project-actions">
          <button className="btn-icon" onClick={handleDashboard} title="Dashboard">
            Dashboard
          </button>
          {canDelete && (
            <button className="btn-icon btn-danger" onClick={handleDelete} title="Delete">
              Delete
            </button>
          )}
        </div>
      </div>

      <h3 className="project-name">{project.name}</h3>
      <p className="project-client">Client: {project.client}</p>

      <div className="project-meta">
        <div className="meta-item">
          <span className="meta-label">Start:</span>
          <span>{formatDate(project.startDate)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">End:</span>
          <span>{project.endDate ? formatDate(project.endDate) : '—'}</span>
        </div>
      </div>

      {health && (
        <div className="health-section">
          <div className="health-label">Project Health</div>
          <div className="health-metrics">
            <div className="health-score" style={{ backgroundColor: getHealthColor(health.health) }}>
              {health.avgScore}
            </div>
            <div className="health-details">
              <div className="health-stat">
                <span className="stat-value">{health.totalSprints}</span>
                <span className="stat-label">Sprints</span>
              </div>
              <div className="health-stat">
                <span className="stat-value">{health.failedSprints}</span>
                <span className="stat-label">Failed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card-footer">
        <span className="created-by">By {project.createdBy?.name || '—'}</span>
      </div>
    </div>
  )
}

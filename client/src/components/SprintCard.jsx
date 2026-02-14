import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sprintService } from '../services/sprintService.js'
import { sprintHealthService } from '../services/sprintHealthService.js'
import './SprintCard.css'

export default function SprintCard({ sprint, onEdit, onDelete, canManage }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [healthData, setHealthData] = useState(null)

  useEffect(() => {
    fetchStatus()
    fetchHealth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprint._id])

  async function fetchStatus() {
    try {
      const data = await sprintService.getSprintStatus(sprint._id)
      setStatus(data)
    } catch {
      setStatus(null)
    }
  }

  async function fetchHealth() {
    try {
      const response = await sprintHealthService.getSprintHealth(sprint._id)
      setHealthData(response.data)
    } catch {
      setHealthData(null)
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function getStatusBadgeClass(value) {
    if (value === 'active') return 'badge-green'
    if (value === 'completed') return 'badge-gray'
    return 'badge-amber'
  }

  return (
    <div className="sprint-card">
      <div className="card-header">
        <div className="sprint-header-info">
          <h3>Sprint #{sprint.sprintNumber}</h3>
          {status && <span className={`badge ${getStatusBadgeClass(status.status)}`}>{status.status}</span>}
        </div>
        {canManage && (
          <div className="card-actions">
            <button className="btn-icon" onClick={onEdit} title="Edit">
              Edit
            </button>
            <button className="btn-icon btn-danger" onClick={onDelete} title="Delete">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="sprint-goal">
        <span className="section-label">Goal:</span>
        <p>{sprint.sprintGoal || 'No goal set'}</p>
      </div>

      <div className="sprint-dates">
        <div className="date-item">
          <span className="date-label">Start:</span>
          <span>{formatDate(sprint.startDate)}</span>
        </div>
        <div className="date-item">
          <span className="date-label">End:</span>
          <span>{formatDate(sprint.endDate)}</span>
        </div>
      </div>

      {status?.status === 'active' && (
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-label">Progress</span>
            <span className="progress-days">{status.daysRemaining} days remaining</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${status.percentComplete}%` }} />
          </div>
          <span className="progress-percentage">{status.percentComplete}%</span>
        </div>
      )}

      {status?.status === 'planned' && (
        <div className="upcoming-info">Starts in {status.daysRemaining} days</div>
      )}

      <div className="sprint-type">
        <span className="type-badge">{sprint.sprintType}</span>
      </div>

      {healthData && (
        <div className="health-indicator">
          <span className={`health-badge health-${healthData.ragStatus.toLowerCase()}`}>
            {healthData.ragStatus} · {healthData.overallHealthScore}
          </span>
        </div>
      )}

      <button
        className="btn btn-secondary"
        onClick={() => navigate(`/sprints/${sprint._id}/health`)}
      >
        {healthData ? 'View Health Report' : 'Add Health Report'}
      </button>
    </div>
  )
}

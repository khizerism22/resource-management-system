import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import { alertService } from '../services/alertService.js'
import './Alerts.css'

const TYPE_LABELS = {
  sprint_failure: 'Sprint Failure',
  sprint_at_risk: 'At-Risk Sprint',
  over_allocation: 'Over-Allocation',
  project_deadline: 'Deadline',
  resource_conflict: 'Resource Conflict',
  system: 'System'
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ severity: '', type: '', isRead: '' })

  useEffect(() => {
    fetchAlerts()
  }, [filters])

  async function fetchAlerts() {
    setLoading(true)
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''))
      const data = await alertService.getUserAlerts(cleanFilters)
      setAlerts(data.data || [])
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(alertId) {
    try {
      await alertService.markAsRead(alertId)
      setAlerts((prev) => prev.map((alert) => (alert._id === alertId ? { ...alert, isRead: true } : alert)))
    } catch {
      // ignore
    }
  }

  async function handleArchive(alertId) {
    try {
      await alertService.archiveAlert(alertId)
      setAlerts((prev) => prev.filter((alert) => alert._id !== alertId))
    } catch {
      // ignore
    }
  }

  async function handleDelete(alertId) {
    if (!window.confirm('Delete this alert?')) return
    try {
      await alertService.deleteAlert(alertId)
      setAlerts((prev) => prev.filter((alert) => alert._id !== alertId))
    } catch {
      // ignore
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AppShell title="Alerts">
        <div>Loading alerts...</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Alerts">
      <div className="alerts-page">
        <div className="page-header">
          <div>
            <h1>Notifications & Alerts</h1>
            <p className="page-subtitle">{alerts.length} alerts</p>
          </div>
        </div>

        <div className="alerts-filters">
          <select
            value={filters.severity}
            onChange={(event) => setFilters({ ...filters, severity: event.target.value })}
            className="form-select"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.type}
            onChange={(event) => setFilters({ ...filters, type: event.target.value })}
            className="form-select"
          >
            <option value="">All Types</option>
            <option value="sprint_failure">Sprint Failure</option>
            <option value="sprint_at_risk">At-Risk Sprint</option>
            <option value="over_allocation">Over-Allocation</option>
            <option value="project_deadline">Deadline</option>
            <option value="resource_conflict">Resource Conflict</option>
          </select>

          <select
            value={filters.isRead}
            onChange={(event) => setFilters({ ...filters, isRead: event.target.value })}
            className="form-select"
          >
            <option value="">All Status</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>

        {alerts.length === 0 ? (
          <div className="empty-state">No alerts found.</div>
        ) : (
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div key={alert._id} className={`alert-card ${alert.isRead ? '' : 'unread'}`}>
                <div className="alert-card-header">
                  <div className="alert-header-left">
                    <span className={`severity-pill ${alert.severity}`}>{alert.severity}</span>
                    <span className="alert-type-badge">{TYPE_LABELS[alert.type] || alert.type}</span>
                  </div>
                  <span className="alert-timestamp">{formatDate(alert.createdAt)}</span>
                </div>

                <div className="alert-card-body">
                  <p className="alert-message-full">{alert.message}</p>

                  {(alert.project || alert.sprint || alert.resource) && (
                    <div className="alert-references">
                      {alert.project && <span className="alert-ref">📁 {alert.project.name}</span>}
                      {alert.sprint && <span className="alert-ref">🏃 Sprint #{alert.sprint.sprintNumber}</span>}
                      {alert.resource && <span className="alert-ref">👤 {alert.resource.name}</span>}
                    </div>
                  )}

                  {alert.metadata && (
                    <div className="alert-metadata">
                      {alert.metadata.consecutiveCount && <span>Consecutive: {alert.metadata.consecutiveCount}</span>}
                      {alert.metadata.totalAllocated && <span>Total Allocated: {alert.metadata.totalAllocated}%</span>}
                      {alert.metadata.sprintNumber && <span>Sprint: #{alert.metadata.sprintNumber}</span>}
                    </div>
                  )}
                </div>

                <div className="alert-card-actions">
                  {!alert.isRead && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleMarkAsRead(alert._id)}>
                      Mark as Read
                    </button>
                  )}
                  <button className="btn btn-outline btn-sm" onClick={() => handleArchive(alert._id)}>
                    Archive
                  </button>
                  <button className="btn btn-danger-outline btn-sm" onClick={() => handleDelete(alert._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

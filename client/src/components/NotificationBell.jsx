import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { alertService } from '../services/alertService.js'
import './NotificationBell.css'

export default function NotificationBell() {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchRecentAlerts()
    }
  }, [isOpen])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  async function fetchUnreadCount() {
    try {
      const count = await alertService.getUnreadCount()
      setUnreadCount(count)
    } catch {
      // ignore
    }
  }

  async function fetchRecentAlerts() {
    setLoading(true)
    try {
      const data = await alertService.getUserAlerts({ limit: 8 })
      setAlerts(data.data || [])
      setUnreadCount(data.unreadCount || 0)
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
      setUnreadCount((prev) => Math.max(prev - 1, 0))
    } catch {
      // ignore
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await alertService.markAllAsRead()
      setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  function handleAlertClick(alert) {
    if (!alert.isRead) {
      handleMarkAsRead(alert._id)
    }
    setIsOpen(false)
    navigate('/alerts')
  }

  function getSeverityClass(severity) {
    if (severity === 'critical') return 'critical'
    if (severity === 'high') return 'high'
    if (severity === 'low') return 'low'
    return 'medium'
  }

  function formatTime(date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button className="bell-button" onClick={() => setIsOpen((prev) => !prev)} aria-label="Notifications">
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all" onClick={handleMarkAllAsRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="dropdown-body">
            {loading ? (
              <div className="dropdown-empty">Loading...</div>
            ) : alerts.length === 0 ? (
              <div className="dropdown-empty">No notifications</div>
            ) : (
              alerts.map((alert) => (
                <button
                  key={alert._id}
                  type="button"
                  className={`alert-row ${alert.isRead ? '' : 'unread'}`}
                  onClick={() => handleAlertClick(alert)}
                >
                  <span className={`severity-dot ${getSeverityClass(alert.severity)}`} />
                  <div className="alert-text">
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-meta">
                      <span>{formatTime(alert.createdAt)}</span>
                      {alert.project && <span>• {alert.project.name}</span>}
                    </div>
                  </div>
                  {!alert.isRead && (
                    <span className="unread-indicator">New</span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="dropdown-footer">
            <button className="view-all" onClick={() => navigate('/alerts')}>
              View all alerts
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { dashboardService } from '../services/dashboardService.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeProjects: 0,
    teamUtilization: 0,
    sprintsAtRisk: 0
  })

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    setLoading(true)
    try {
      const response = await dashboardService.getPortfolioDashboard({})
      const projects = response.data || []

      const activeProjects = projects.filter((p) => p.status === 'Active').length
      const teamUtilization =
        projects.length > 0
          ? Math.round(projects.reduce((sum, p) => sum + (p.resourceUtilization || 0), 0) / projects.length)
          : 0
      const sprintsAtRisk = projects.reduce((sum, p) => sum + (p.atRiskSprints || 0), 0)

      setStats({ activeProjects, teamUtilization, sprintsAtRisk })
    } catch {
      setStats({ activeProjects: 0, teamUtilization: 0, sprintsAtRisk: 0 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Dashboard">
      {loading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-label">Active Projects</div>
              <div className="stat-value">{stats.activeProjects}</div>
              <div className="stat-sub">Current portfolio</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Team Utilization</div>
              <div className="stat-value">{stats.teamUtilization}%</div>
              <div className="stat-sub">
                {stats.teamUtilization > 85 ? 'High load' : 'Healthy range'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Sprints at Risk</div>
              <div className="stat-value">{stats.sprintsAtRisk}</div>
              <div className="stat-sub">Across all projects</div>
            </div>
          </div>

          <div className="panel-row">
            <div className="panel">
              <h3>Delivery Health</h3>
              <p>Track outcome status and Scrum maturity across the last 5 sprints.</p>
              <button className="btn btn-primary" onClick={() => navigate('/reports')}>
                View Reports
              </button>
            </div>
            <div className="panel">
              <h3>Resource Overview</h3>
              <p>Quickly spot overallocation and upcoming capacity constraints.</p>
              <button className="btn btn-secondary" onClick={() => navigate('/capacity')}>
                Open Capacity
              </button>
            </div>
          </div>
        </>
      )}
    </AppShell>
  )
}

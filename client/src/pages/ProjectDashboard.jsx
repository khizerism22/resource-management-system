import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import AppShell from '../components/AppShell.jsx'
import HealthScoreGauge from '../components/HealthScoreGauge.jsx'
import TrendIndicator from '../components/TrendIndicator.jsx'
import SprintOutcomesTimeline from '../components/SprintOutcomesTimeline.jsx'
import HealthTrendChart from '../components/HealthTrendChart.jsx'
import { dashboardService } from '../services/dashboardService.js'
import './ProjectDashboard.css'

const RAG_COLORS = {
  Green: '#22c55e',
  Amber: '#f59e0b',
  Red: '#ef4444',
  NotAssessed: '#94a3b8'
}

export default function ProjectDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
    fetchTrends()
  }, [id])

  async function fetchDashboard() {
    setLoading(true)
    try {
      const data = await dashboardService.getProjectHealth(id)
      setDashboard(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function fetchTrends() {
    try {
      const data = await dashboardService.getProjectTrends(id, 6)
      setTrends(data)
    } catch {
      setTrends(null)
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function formatOutcome(outcome) {
    if (!outcome || outcome === 'NotAssessed') return 'Not Assessed'
    if (outcome === 'AtRisk') return 'At Risk'
    return outcome
  }

  if (loading) {
    return (
      <AppShell title="Project Dashboard">
        <div>Loading dashboard...</div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="Project Dashboard">
        <div className="error">{error}</div>
      </AppShell>
    )
  }

  if (!dashboard) {
    return (
      <AppShell title="Project Dashboard">
        <div className="error">Dashboard not available</div>
      </AppShell>
    )
  }

  const { project, currentSprint, sprintHistory, avgHealthScore, trend, resources, metrics } = dashboard
  const successRateData = trends?.successRate || []
  const utilizationData = resources.map((resource) => ({
    name: resource.resourceName,
    value: resource.allocation
  }))

  return (
    <AppShell title="Project Dashboard">
      <div className="project-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>{project.name}</h1>
            <p className="project-client">{project.client}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => navigate(`/projects/${project._id}`)}>
              Project Details
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/projects/${project._id}/sprints`)}>
              View Sprints
            </button>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Total Sprints</div>
            <div className="metric-value">{metrics.totalSprints}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Success Rate</div>
            <div className="metric-value">{metrics.successRate}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Failed Sprints</div>
            <div className="metric-value danger">{metrics.failedSprints}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">At Risk Sprints</div>
            <div className="metric-value warning">{metrics.atRiskSprints}</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Current Sprint</h3>
              {currentSprint?.health?.ragStatus && (
                <span className={`rag-pill rag-${currentSprint.health.ragStatus.toLowerCase()}`}>
                  {currentSprint.health.ragStatus}
                </span>
              )}
            </div>
            {currentSprint ? (
              <div className="current-sprint">
                <div className="current-sprint-title">Sprint #{currentSprint.sprintNumber}</div>
                <p className="current-sprint-goal">{currentSprint.sprintGoal}</p>
                <div className="current-sprint-meta">
                  <span>{formatDate(currentSprint.startDate)}</span>
                  <span>→</span>
                  <span>{formatDate(currentSprint.endDate)}</span>
                </div>
                <div className="current-sprint-outcome">
                  Outcome: <strong>{formatOutcome(currentSprint.overallOutcome)}</strong>
                </div>
                {currentSprint.health && (
                  <div className="current-sprint-score">Health Score: {currentSprint.health.overallHealthScore}</div>
                )}
              </div>
            ) : (
              <div className="empty-state-small">No active sprint</div>
            )}
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Average Health</h3>
            </div>
            <HealthScoreGauge score={avgHealthScore} />
            <div className="trend-display">
              <TrendIndicator trend={trend} />
            </div>
          </div>
        </div>

        {sprintHistory.length > 0 && (
          <div className="dashboard-card full-width">
            <div className="card-header">
              <h3>Last 5 Sprint Outcomes</h3>
            </div>
            <SprintOutcomesTimeline sprints={sprintHistory} />
          </div>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Health Trend</h3>
            </div>
            {trends?.healthTrend?.length ? (
              <HealthTrendChart data={trends.healthTrend} />
            ) : (
              <div className="empty-state-small">No trend data yet</div>
            )}
          </div>
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Sprint Success Rate</h3>
            </div>
            {successRateData.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={successRateData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successRate" name="Success %" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state-small">No success data yet</div>
            )}
          </div>
        </div>

        <div className="dashboard-card full-width">
          <div className="card-header">
            <h3>Resource Utilization</h3>
          </div>
          {resources.length ? (
            <div className="resource-section">
              <div className="resource-list">
                {resources.map((resource, index) => (
                  <div key={`${resource.resourceName}-${index}`} className="resource-item">
                    <div className="resource-info">
                      <span className="resource-name">{resource.resourceName}</span>
                      <span className="resource-role">{resource.role}</span>
                    </div>
                    <div className="allocation-bar-container">
                      <div
                        className="allocation-bar"
                        style={{
                          width: `${resource.allocation}%`,
                          backgroundColor: resource.allocation > 80 ? 'var(--warning)' : 'var(--success)'
                        }}
                      />
                      <span className="allocation-percentage">{resource.allocation}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="resource-chart">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={utilizationData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                      {utilizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(RAG_COLORS)[index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="empty-state-small">No active allocations</div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

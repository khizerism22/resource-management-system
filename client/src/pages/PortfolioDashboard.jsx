import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import { dashboardService } from '../services/dashboardService.js'
import { projectService } from '../services/projectService.js'
import ProjectHealthCard from '../components/ProjectHealthCard.jsx'
import PortfolioTable from '../components/PortfolioTable.jsx'
import './PortfolioDashboard.css'

export default function PortfolioDashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [filters, setFilters] = useState({ status: '', client: '', methodology: '' })
  const [filterOptions, setFilterOptions] = useState({ clients: [], methodologies: [] })

  useEffect(() => {
    fetchPortfolioData()
    fetchFilterOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  async function fetchPortfolioData() {
    setLoading(true)
    try {
      const response = await dashboardService.getPortfolioDashboard(filters)
      setProjects(response.data || [])
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchFilterOptions() {
    try {
      const allProjects = await projectService.getAllProjects({})
      const clients = [...new Set(allProjects.map((project) => project.client))]
      const methodologies = [...new Set(allProjects.map((project) => project.methodology))]
      setFilterOptions({ clients, methodologies })
    } catch {
      setFilterOptions({ clients: [], methodologies: [] })
    }
  }

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setFilters({ status: '', client: '', methodology: '' })
  }

  const totalProjects = projects.length
  const atRiskProjects = projects.filter((project) => project.ragStatus === 'Red').length
  const avgPortfolioHealth =
    projects.length > 0
      ? Math.round(projects.reduce((sum, project) => sum + (project.avgHealthScore || 0), 0) / projects.length)
      : 0
  const totalResourceUtilization =
    projects.length > 0
      ? Math.round(projects.reduce((sum, project) => sum + project.resourceUtilization, 0) / projects.length)
      : 0

  if (loading) {
    return (
      <AppShell title="Portfolio Dashboard">
        <div>Loading portfolio...</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Portfolio Dashboard">
      <div className="portfolio-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Portfolio Health</h1>
            <p className="page-subtitle">{totalProjects} projects tracked</p>
          </div>
          <div className="view-controls">
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </button>
            <button
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
            >
              Table View
            </button>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-value">{totalProjects}</div>
            <div className="summary-label">Total Projects</div>
          </div>
          <div className="summary-card">
            <div className="summary-value danger">{atRiskProjects}</div>
            <div className="summary-label">Projects at Risk</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{avgPortfolioHealth}</div>
            <div className="summary-label">Avg Health Score</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{totalResourceUtilization}%</div>
            <div className="summary-label">Avg Utilization</div>
          </div>
        </div>

        <div className="filters-section">
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
          <div className="filters-grid">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-select"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="OnHold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={filters.client}
              onChange={(e) => handleFilterChange('client', e.target.value)}
              className="form-select"
            >
              <option value="">All Clients</option>
              {filterOptions.clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>

            <select
              value={filters.methodology}
              onChange={(e) => handleFilterChange('methodology', e.target.value)}
              className="form-select"
            >
              <option value="">All Methodologies</option>
              {filterOptions.methodologies.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">No projects match the selected filters.</div>
        ) : viewMode === 'grid' ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectHealthCard key={project.projectId} project={project} />
            ))}
          </div>
        ) : (
          <PortfolioTable projects={projects} />
        )}
      </div>
    </AppShell>
  )
}

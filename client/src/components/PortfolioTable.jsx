import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './PortfolioTable.css'

export default function PortfolioTable({ projects }) {
  const navigate = useNavigate()
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })

  function handleSort(key) {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
    setSortConfig({ key, direction })
  }

  const sortedProjects = [...projects].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  function getRAGBadgeClass(rag) {
    if (rag === 'Green') return 'rag-green'
    if (rag === 'Amber') return 'rag-amber'
    if (rag === 'Red') return 'rag-red'
    return 'rag-gray'
  }

  function getSortIcon(key) {
    if (sortConfig.key !== key) return '⇅'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="portfolio-table-container">
      <table className="portfolio-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Project {getSortIcon('name')}</th>
            <th onClick={() => handleSort('client')}>Client {getSortIcon('client')}</th>
            <th onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
            <th onClick={() => handleSort('ragStatus')}>RAG {getSortIcon('ragStatus')}</th>
            <th onClick={() => handleSort('avgHealthScore')}>Health {getSortIcon('avgHealthScore')}</th>
            <th onClick={() => handleSort('failedSprints')}>Failed {getSortIcon('failedSprints')}</th>
            <th onClick={() => handleSort('atRiskSprints')}>At Risk {getSortIcon('atRiskSprints')}</th>
            <th onClick={() => handleSort('resourceUtilization')}>Utilization {getSortIcon('resourceUtilization')}</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedProjects.map((project) => (
            <tr key={project.projectId}>
              <td className="project-name">{project.name}</td>
              <td>{project.client}</td>
              <td>
                <span className={`status-badge status-${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
              </td>
              <td>
                <span className={`rag-badge ${getRAGBadgeClass(project.ragStatus)}`}>
                  {project.ragStatus}
                </span>
              </td>
              <td>
                <div className="score-with-bar">
                  <span>{project.avgHealthScore || 0}</span>
                  <div className="mini-bar">
                    <div
                      className="mini-bar-fill"
                      style={{
                        width: `${project.avgHealthScore}%`,
                        backgroundColor:
                          project.avgHealthScore > 75
                            ? '#22c55e'
                            : project.avgHealthScore > 50
                              ? '#f59e0b'
                              : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              </td>
              <td className="text-center danger">{project.failedSprints}</td>
              <td className="text-center warning">{project.atRiskSprints}</td>
              <td>
                <div className="utilization-cell">
                  <div className="utilization-bar-mini">
                    <div
                      className="utilization-bar-mini-fill"
                      style={{
                        width: `${project.resourceUtilization}%`,
                        backgroundColor: project.resourceUtilization > 80 ? '#f59e0b' : '#22c55e'
                      }}
                    />
                  </div>
                  <span>{project.resourceUtilization}%</span>
                </div>
              </td>
              <td>
                <button className="btn-icon" onClick={() => navigate(`/dashboard/project/${project.projectId}`)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

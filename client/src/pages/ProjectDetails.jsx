import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppShell from '../components/AppShell.jsx'
import ProjectForm from '../components/ProjectForm.jsx'
import SprintModal from '../components/SprintModal.jsx'
import { projectService } from '../services/projectService.js'
import { sprintService } from '../services/sprintService.js'
import './ProjectDetails.css'

export default function ProjectDetails() {
  const [project, setProject] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSprintOpen, setIsSprintOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState(null)

  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProject()
    fetchHealth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function fetchProject() {
    setLoading(true)
    try {
      const data = await projectService.getProjectById(id)
      setProject(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  async function fetchHealth() {
    try {
      const data = await projectService.getProjectHealth(id)
      setHealth(data)
    } catch {
      setHealth(null)
    }
  }

  async function handleUpdate(updatedData) {
    await projectService.updateProject(id, updatedData)
    setIsEditing(false)
    fetchProject()
    fetchHealth()
  }

  async function handleSprintSave(payload) {
    if (editingSprint) {
      await sprintService.updateSprint(editingSprint._id, payload)
    } else {
      await sprintService.createSprint(project._id, payload)
    }
    setIsSprintOpen(false)
    setEditingSprint(null)
    fetchProject()
    fetchHealth()
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

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

  function getSprintOutcomeMeta(sprint) {
    const now = new Date()
    const start = new Date(sprint.startDate)
    const end = new Date(sprint.endDate)

    if (sprint.overallOutcome === 'Failure') {
      return { label: 'Failure', className: 'failure' }
    }
    if (sprint.overallOutcome === 'AtRisk') {
      return { label: 'At Risk', className: 'atrisk' }
    }

    if (now < start) return { label: 'Planned', className: 'planned' }
    if (now >= start && now <= end) return { label: 'Active', className: 'active' }
    if (now > end && sprint.overallOutcome === 'Success') {
      return { label: 'Success', className: 'success' }
    }

    return { label: 'Completed', className: 'completed' }
  }

  const canEdit =
    user?.role === 'Admin' || user?.role === 'PM' || project?.createdBy?._id === user?.id

  if (loading) {
    return (
      <AppShell title="Project Details">
        <div>Loading project...</div>
      </AppShell>
    )
  }
  if (error) {
    return (
      <AppShell title="Project Details">
        <div className="error">{error}</div>
      </AppShell>
    )
  }
  if (!project) {
    return (
      <AppShell title="Project Details">
        <div className="error">Project not found</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Project Details">
      <div className="project-details">
        <div className="page-header">
          <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
            ← Back to Projects
          </button>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => navigate(`/dashboard/project/${project._id}`)}>
              View Dashboard
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(`/projects/${project._id}/sprints`)}>
              View Sprints
            </button>
            {canEdit && !isEditing && (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                Edit Project
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="card">
            <h2>Edit Project</h2>
            <ProjectForm project={project} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
          </div>
        ) : (
          <>
            <div className="project-header-card card">
              <div className="project-title-section">
                <h1>{project.name}</h1>
                <span className={`badge badge-${project.status.toLowerCase()}`}>{project.status}</span>
              </div>

              <div className="project-info-grid">
                <div className="info-item">
                  <span className="info-label">Client</span>
                  <span className="info-value">{project.client}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Start Date</span>
                  <span className="info-value">{formatDate(project.startDate)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">End Date</span>
                  <span className="info-value">{project.endDate ? formatDate(project.endDate) : '—'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created By</span>
                  <span className="info-value">{project.createdBy?.name}</span>
                </div>
              </div>
            </div>

            {health && (
              <div className="health-card card">
                <h2>Project Health</h2>
                <div className="health-overview">
                  <div className="health-score-large" style={{ backgroundColor: getHealthColor(health.health) }}>
                    <div className="score-value">{health.avgScore}</div>
                    <div className="score-label">{health.health}</div>
                  </div>

                  <div className="health-stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{health.totalSprints}</div>
                      <div className="stat-label">Total Sprints</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{health.completedSprints}</div>
                      <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{health.atRiskSprints}</div>
                      <div className="stat-label">At Risk</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{health.failedSprints}</div>
                      <div className="stat-label">Failed</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="sprints-card card">
              <div className="card-header">
                <h2>Sprints ({project.sprints?.length || 0})</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingSprint(null)
                    setIsSprintOpen(true)
                  }}
                >
                  + Add Sprint
                </button>
              </div>

              {project.sprints && project.sprints.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Goal</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Outcome</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.sprints.map((sprint) => (
                        <tr key={sprint._id}>
                          <td>{sprint.sprintNumber}</td>
                          <td>{sprint.sprintGoal}</td>
                          <td>{formatDate(sprint.startDate)}</td>
                          <td>{formatDate(sprint.endDate)}</td>
                          <td>
                            {(() => {
                              const outcome = getSprintOutcomeMeta(sprint)
                              return (
                                <span className={`badge badge-${outcome.className}`}>
                                  {outcome.label}
                                </span>
                              )
                            })()}
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                setEditingSprint(sprint)
                                setIsSprintOpen(true)
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No sprints yet</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingSprint(null)
                      setIsSprintOpen(true)
                    }}
                  >
                    Create First Sprint
                  </button>
                </div>
              )}
            </div>
            {isSprintOpen && (
              <SprintModal
                sprint={editingSprint}
                projectId={project._id}
                onSave={handleSprintSave}
                onClose={() => setIsSprintOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}

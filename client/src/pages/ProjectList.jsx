import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppShell from '../components/AppShell.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { CardSkeleton } from '../components/SkeletonLoader.jsx'
import { projectService } from '../services/projectService.js'
import './ProjectList.css'

export default function ProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [statusFilter])

  async function fetchProjects() {
    setLoading(true)
    try {
      const filters = {}
      if (statusFilter) filters.status = statusFilter
      if (searchTerm) filters.search = searchTerm

      const data = await projectService.getAllProjects(filters)
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    fetchProjects()
  }

  async function handleDelete(projectId) {
    try {
      await projectService.deleteProject(projectId)
      setDeleteConfirm(null)
      fetchProjects()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project')
    }
  }

  const canCreateProject = user?.role === 'PM' || user?.role === 'Admin'

  const filteredProjects = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        project.client.toLowerCase().includes(term)
    )
  }, [projects, searchTerm])

  if (loading) {
    return (
      <AppShell title="Projects">
        <CardSkeleton count={6} />
      </AppShell>
    )
  }
  if (error) {
    return (
      <AppShell title="Projects">
        <div className="error">{error}</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Projects">
      <div className="project-list">
        <div className="page-header">
          <div>
            <h1>Projects</h1>
            <p className="page-subtitle">{projects.length} total projects</p>
          </div>
          {canCreateProject && (
            <button className="btn btn-primary" onClick={() => navigate('/projects/create')}>
              + Create Project
            </button>
          )}
        </div>

        <div className="controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </form>

          <div className="filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="OnHold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="view-toggle">
              <button
                type="button"
                className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                ⊞
              </button>
              <button
                type="button"
                className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found</p>
            {canCreateProject && (
              <button className="btn btn-primary" onClick={() => navigate('/projects/create')}>
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className={`projects-container ${viewMode}`}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                viewMode={viewMode}
                onDelete={() => setDeleteConfirm(project)}
                onClick={() => navigate(`/projects/${project._id}`)}
              />
            ))}
          </div>
        )}

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Delete</h3>
              <p>
                Are you sure you want to delete project <strong>{deleteConfirm.name}</strong>?
                <br />
                This will also delete all associated sprints.
              </p>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

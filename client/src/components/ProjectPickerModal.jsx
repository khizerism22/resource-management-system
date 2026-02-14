import { useEffect, useMemo, useState } from 'react'
import { projectService } from '../services/projectService.js'
import './ProjectPickerModal.css'

export default function ProjectPickerModal({ open, onClose, onSelect }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return
    let isMounted = true
    async function fetchProjects() {
      setLoading(true)
      setError('')
      try {
        const data = await projectService.getAllProjects({})
        if (isMounted) setProjects(data)
      } catch (err) {
        if (isMounted) setError(err.response?.data?.error || 'Failed to load projects')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchProjects()
    return () => {
      isMounted = false
    }
  }, [open])

  const filtered = useMemo(() => {
    if (!query) return projects
    const lower = query.toLowerCase()
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(lower) ||
        project.client.toLowerCase().includes(lower)
    )
  }, [projects, query])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content project-picker" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Select a Project</h2>
            <p>Jump directly to that project’s sprint board.</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <input
            type="text"
            className="form-input"
            placeholder="Search by project or client..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {loading && <div className="picker-status">Loading projects...</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {!loading && !error && (
            <div className="picker-list">
              {filtered.length === 0 ? (
                <div className="picker-empty">No projects match your search.</div>
              ) : (
                filtered.map((project) => (
                  <button
                    key={project._id}
                    className="picker-item"
                    onClick={() => onSelect(project._id)}
                  >
                    <div className="picker-title">{project.name}</div>
                    <div className="picker-subtitle">{project.client}</div>
                    <span className={`picker-status-tag status-${project.status.toLowerCase()}`}>
                      {project.status === 'OnHold' ? 'On Hold' : project.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

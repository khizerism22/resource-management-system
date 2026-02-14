import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import SprintCard from '../components/SprintCard.jsx'
import SprintForm from '../components/SprintForm.jsx'
import SprintTimeline from '../components/SprintTimeline.jsx'
import { CardSkeleton } from '../components/SkeletonLoader.jsx'
import { sprintService } from '../services/sprintService.js'
import { projectService } from '../services/projectService.js'
import { useAuth } from '../context/AuthContext.jsx'
import './SprintManagement.css'

export default function SprintManagement() {
  const { projectId } = useParams()
  const [sprints, setSprints] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { user } = useAuth()

  useEffect(() => {
    fetchProject()
    fetchSprints()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, activeTab])

  async function fetchProject() {
    try {
      const data = await projectService.getProjectById(projectId)
      setProject(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load project')
    }
  }

  async function fetchSprints() {
    setLoading(true)
    try {
      const filters = {}
      if (activeTab !== 'all') filters.status = activeTab

      const response = await sprintService.getProjectSprints(projectId, filters)
      setSprints(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load sprints')
    } finally {
      setLoading(false)
    }
  }

  function handleCreate() {
    setEditingSprint(null)
    setIsFormOpen(true)
  }

  function handleEdit(sprint) {
    setEditingSprint(sprint)
    setIsFormOpen(true)
  }

  async function handleSave(sprintData) {
    if (editingSprint) {
      await sprintService.updateSprint(editingSprint._id, sprintData)
    } else {
      await sprintService.createSprint(projectId, sprintData)
    }
    setIsFormOpen(false)
    setEditingSprint(null)
    fetchSprints()
  }

  async function handleDelete(sprintId) {
    try {
      await sprintService.deleteSprint(sprintId)
      setDeleteConfirm(null)
      fetchSprints()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete sprint')
    }
  }

  const canManage = user?.role === 'PM' || user?.role === 'Admin'

  if (loading) {
    return (
      <AppShell title="Sprints">
        <CardSkeleton count={4} />
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="Sprints">
        <div className="error">{error}</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Sprints">
      <div className="sprint-management">
        <div className="page-header">
          <div>
            <h1>{project?.name} - Sprints</h1>
            <p className="page-subtitle">{sprints.length} sprints</p>
          </div>
          {canManage && (
            <button className="btn btn-primary" onClick={handleCreate}>
              + Create Sprint
            </button>
          )}
        </div>

        {sprints.length > 0 && (
          <div className="timeline-section">
            <h3>Sprint Timeline</h3>
            <SprintTimeline sprints={sprints} />
          </div>
        )}

        <div className="tabs">
          <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All
          </button>
          <button className={`tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
            Active
          </button>
          <button className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
            Upcoming
          </button>
          <button className={`tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
            Completed
          </button>
        </div>

        {sprints.length === 0 ? (
          <div className="empty-state">
            <p>No sprints found</p>
            {canManage && (
              <button className="btn btn-primary" onClick={handleCreate}>
                Create your first sprint
              </button>
            )}
          </div>
        ) : (
          <div className="sprints-grid">
            {sprints.map((sprint) => (
              <SprintCard
                key={sprint._id}
                sprint={sprint}
                onEdit={() => handleEdit(sprint)}
                onDelete={() => setDeleteConfirm(sprint)}
                canManage={canManage}
              />
            ))}
          </div>
        )}

        {isFormOpen && (
          <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingSprint ? 'Edit Sprint' : 'Create Sprint'}</h2>
                <button className="modal-close" onClick={() => setIsFormOpen(false)}>
                  x
                </button>
              </div>
              <SprintForm
                sprint={editingSprint}
                projectId={projectId}
                onSubmit={handleSave}
                onCancel={() => {
                  setIsFormOpen(false)
                  setEditingSprint(null)
                }}
              />
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Delete</h3>
              <p>Delete Sprint #{deleteConfirm.sprintNumber}?</p>
              <p className="warning-text">This action cannot be undone.</p>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

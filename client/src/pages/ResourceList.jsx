import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import ResourceCard from '../components/ResourceCard.jsx'
import { CardSkeleton } from '../components/SkeletonLoader.jsx'
import ResourceModal from '../components/ResourceModal.jsx'
import { resourceService } from '../services/resourceService.js'
import { useAuth } from '../context/AuthContext.jsx'
import './ResourceList.css'

export default function ResourceList() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchResources()
  }, [roleFilter])

  async function fetchResources() {
    setLoading(true)
    try {
      const filters = {}
      if (roleFilter) filters.role = roleFilter
      if (searchTerm) filters.search = searchTerm

      const data = await resourceService.getAllResources(filters)
      setResources(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    fetchResources()
  }

  function handleCreate() {
    setEditingResource(null)
    setIsModalOpen(true)
  }

  function handleEdit(resource) {
    setEditingResource(resource)
    setIsModalOpen(true)
  }

  async function handleSave(resourceData) {
    if (editingResource) {
      await resourceService.updateResource(editingResource._id, resourceData)
    } else {
      await resourceService.createResource(resourceData)
    }
    setIsModalOpen(false)
    fetchResources()
  }

  async function handleDelete(resourceId) {
    try {
      await resourceService.deleteResource(resourceId)
      setDeleteConfirm(null)
      fetchResources()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete resource')
    }
  }

  const canManage = user?.role === 'PM' || user?.role === 'Admin'

  const filteredResources = resources.filter((resource) => {
    const term = searchTerm.toLowerCase()
    const matchesName = resource.name.toLowerCase().includes(term)
    const matchesSkill = (resource.skills || []).some((skill) => skill.toLowerCase().includes(term))
    return matchesName || matchesSkill
  })

  if (loading) {
    return (
      <AppShell title="Resources">
        <CardSkeleton count={6} />
      </AppShell>
    )
  }
  if (error) {
    return (
      <AppShell title="Resources">
        <div className="error">{error}</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Resources">
      <div className="resource-list">
        <div className="page-header">
          <div>
            <h1>Resources</h1>
            <p className="page-subtitle">{resources.length} total resources</p>
          </div>
          {canManage && (
            <button className="btn btn-primary" onClick={handleCreate}>
              + Add Resource
            </button>
          )}
        </div>

        <div className="controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by name or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Roles</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="QA">QA</option>
            <option value="DevOps">DevOps</option>
            <option value="Manager">Manager</option>
            <option value="Analyst">Analyst</option>
          </select>
        </div>

        {filteredResources.length === 0 ? (
          <div className="empty-state">
            <p>No resources found</p>
            {canManage && (
              <button className="btn btn-primary" onClick={handleCreate}>
                Add your first resource
              </button>
            )}
          </div>
        ) : (
          <div className="resources-grid">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onEdit={() => handleEdit(resource)}
                onDelete={() => setDeleteConfirm(resource)}
                onManage={() => navigate(`/resources/${resource._id}/allocations`)}
                canManage={canManage}
              />
            ))}
          </div>
        )}

        {isModalOpen && (
          <ResourceModal
            resource={editingResource}
            onSave={handleSave}
            onClose={() => setIsModalOpen(false)}
          />
        )}

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Delete</h3>
              <p>Delete resource <strong>{deleteConfirm.name}</strong>?</p>
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

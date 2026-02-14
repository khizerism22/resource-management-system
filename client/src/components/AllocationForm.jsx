import { useEffect, useState } from 'react'
import { resourceService } from '../services/resourceService.js'
import { projectService } from '../services/projectService.js'
import './AllocationForm.css'

export default function AllocationForm({ allocation, onSave, onClose }) {
  const [formData, setFormData] = useState({
    resourceId: allocation?.resource?._id || allocation?.resourceId?._id || '',
    projectId: allocation?.project?._id || allocation?.projectId?._id || '',
    allocationPercentage: allocation?.allocationPercentage || allocation?.percentage || 50,
    startDate: allocation?.startDate ? new Date(allocation.startDate).toISOString().split('T')[0] : '',
    endDate: allocation?.endDate ? new Date(allocation.endDate).toISOString().split('T')[0] : ''
  })
  const [resources, setResources] = useState([])
  const [projects, setProjects] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchResources()
    fetchProjects()
  }, [])

  async function fetchResources() {
    try {
      const data = await resourceService.getAllResources()
      setResources(data)
    } catch {
      // ignore
    }
  }

  async function fetchProjects() {
    try {
      const data = await projectService.getAllProjects({ status: 'Active' })
      setProjects(data)
    } catch {
      // ignore
    }
  }

  function validate() {
    const newErrors = {}
    if (!formData.resourceId) newErrors.resourceId = 'Resource is required'
    if (!formData.projectId) newErrors.projectId = 'Project is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (formData.allocationPercentage < 1 || formData.allocationPercentage > 100) {
      newErrors.allocationPercentage = 'Allocation must be between 1-100'
    }
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      newErrors.endDate = 'End date must be after start date'
    }
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validate()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save allocation'
      setErrors({ submit: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{allocation ? 'Edit Allocation' : 'New Allocation'}</h2>
          <button className="modal-close" onClick={onClose}>
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

          <div className="form-group">
            <label className="form-label">Resource *</label>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              className={`form-select ${errors.resourceId ? 'error' : ''}`}
            >
              <option value="">Select Resource</option>
              {resources.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.role})
                </option>
              ))}
            </select>
            {errors.resourceId && <span className="form-error">{errors.resourceId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Project *</label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className={`form-select ${errors.projectId ? 'error' : ''}`}
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} - {p.client}
                </option>
              ))}
            </select>
            {errors.projectId && <span className="form-error">{errors.projectId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Allocation % *</label>
            <input
              type="range"
              name="allocationPercentage"
              value={formData.allocationPercentage}
              onChange={handleChange}
              min="1"
              max="100"
              className="form-range"
            />
            <div className="range-value">{formData.allocationPercentage}%</div>
            {errors.allocationPercentage && (
              <span className="form-error">{errors.allocationPercentage}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`form-input ${errors.startDate ? 'error' : ''}`}
              />
              {errors.startDate && <span className="form-error">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`form-input ${errors.endDate ? 'error' : ''}`}
              />
              {errors.endDate && <span className="form-error">{errors.endDate}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : allocation ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

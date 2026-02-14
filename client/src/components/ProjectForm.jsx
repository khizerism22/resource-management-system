import { useState } from 'react'
import './ProjectForm.css'

export default function ProjectForm({ project, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    client: project?.client || '',
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    methodology: project?.methodology || 'Scrum',
    status: project?.status || 'Active'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Project name is required'
    if (!formData.client.trim()) newErrors.client = 'Client name is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'

    if (formData.endDate && formData.startDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date'
      }
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
      await onSubmit(formData)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to save project' })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="project-form">
      {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="Enter project name"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Client *</label>
          <input
            type="text"
            name="client"
            value={formData.client}
            onChange={handleChange}
            className={`form-input ${errors.client ? 'error' : ''}`}
            placeholder="Enter client name"
          />
          {errors.client && <span className="form-error">{errors.client}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Methodology</label>
          <select name="methodology" value={formData.methodology} onChange={handleChange} className="form-select">
            <option value="Scrum">Scrum</option>
            <option value="Kanban">Kanban</option>
          </select>
        </div>

        {project ? (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="form-select">
              <option value="Active">Active</option>
              <option value="OnHold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        ) : (
          <div />
        )}

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
          <label className="form-label">End Date</label>
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

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  )
}

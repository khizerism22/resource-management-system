import { useState } from 'react'
import './ResourceModal.css'

export default function ResourceModal({ resource, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: resource?.name || '',
    role: resource?.role || 'Developer',
    skills: resource?.skills?.join(', ') || '',
    employmentType: resource?.employmentType || 'FullTime',
    availabilityPercentage: resource?.availabilityPercentage ?? 100,
    costRate: resource?.costRate ?? ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.role) newErrors.role = 'Role is required'
    if (formData.availabilityPercentage < 0 || formData.availabilityPercentage > 100) {
      newErrors.availabilityPercentage = 'Availability must be between 0-100'
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
      await onSave({
        ...formData,
        costRate: formData.costRate === '' ? null : Number(formData.costRate),
        skills: formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      })
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to save resource' })
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{resource ? 'Edit Resource' : 'Add Resource'}</h2>
          <button className="modal-close" onClick={onClose}>
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="QA">QA</option>
              <option value="DevOps">DevOps</option>
              <option value="Manager">Manager</option>
              <option value="Analyst">Analyst</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Employment Type</label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="form-select"
            >
              <option value="FullTime">Full-time</option>
              <option value="PartTime">Part-time</option>
              <option value="Contractor">Contractor</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Skills (comma-separated)</label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="form-textarea"
              placeholder="React, Node.js, MongoDB"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Availability %</label>
            <input
              type="number"
              name="availabilityPercentage"
              value={formData.availabilityPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              className={`form-input ${errors.availabilityPercentage ? 'error' : ''}`}
            />
            {errors.availabilityPercentage && (
              <span className="form-error">{errors.availabilityPercentage}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Cost Rate</label>
            <input
              type="number"
              name="costRate"
              value={formData.costRate}
              onChange={handleChange}
              min="0"
              className="form-input"
              placeholder="Optional"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : resource ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

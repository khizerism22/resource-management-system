import { useState } from 'react'
import './SprintForm.css'

export default function SprintForm({ sprint, projectId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    sprintNumber: sprint?.sprintNumber || '',
    sprintGoal: sprint?.sprintGoal || '',
    sprintType: sprint?.sprintType || 'Delivery',
    startDate: sprint?.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : '',
    endDate: sprint?.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const newErrors = {}
    if (!formData.sprintNumber) newErrors.sprintNumber = 'Sprint number is required'
    if (!formData.sprintGoal.trim()) newErrors.sprintGoal = 'Sprint goal is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
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
      await onSubmit({
        sprintNumber: Number(formData.sprintNumber),
        sprintGoal: formData.sprintGoal,
        sprintType: formData.sprintType,
        startDate: formData.startDate,
        endDate: formData.endDate
      })
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to save sprint' })
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
    <form onSubmit={handleSubmit} className="sprint-form">
      {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Sprint Number *</label>
          <input
            type="number"
            name="sprintNumber"
            value={formData.sprintNumber}
            onChange={handleChange}
            className={`form-input ${errors.sprintNumber ? 'error' : ''}`}
          />
          {errors.sprintNumber && <span className="form-error">{errors.sprintNumber}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Sprint Type *</label>
          <select name="sprintType" value={formData.sprintType} onChange={handleChange} className="form-select">
            <option value="Delivery">Delivery</option>
            <option value="Hardening">Hardening</option>
            <option value="Discovery">Discovery</option>
          </select>
        </div>

        <div className="form-group form-span">
          <label className="form-label">Sprint Goal *</label>
          <input
            type="text"
            name="sprintGoal"
            value={formData.sprintGoal}
            onChange={handleChange}
            className={`form-input ${errors.sprintGoal ? 'error' : ''}`}
            placeholder="Define the goal for this sprint"
          />
          {errors.sprintGoal && <span className="form-error">{errors.sprintGoal}</span>}
        </div>

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

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : sprint ? 'Update Sprint' : 'Create Sprint'}
        </button>
      </div>
    </form>
  )
}

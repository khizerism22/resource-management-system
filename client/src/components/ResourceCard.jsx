import './ResourceCard.css'

export default function ResourceCard({ resource, onEdit, onDelete, onManage, canManage }) {
  function getAvailabilityColor(availability) {
    if (availability >= 50) return 'var(--success)'
    if (availability >= 20) return 'var(--warning)'
    return 'var(--danger)'
  }

  function getAvailabilityLabel(availability) {
    if (availability >= 60) return { label: 'Available', className: 'availability-good' }
    if (availability >= 30) return { label: 'Limited', className: 'availability-warn' }
    return { label: 'Critical', className: 'availability-critical' }
  }

  const availabilityMeta = getAvailabilityLabel(resource.availabilityPercentage)

  return (
    <div className="resource-card">
      <div className="card-header">
        <div className="resource-header-info">
          <h3>{resource.name}</h3>
          <span className="role-badge">{resource.role}</span>
          <span className={`availability-chip ${availabilityMeta.className}`}>
            {availabilityMeta.label}
          </span>
        </div>
        {canManage && (
          <div className="card-actions">
            <button className="btn-icon" onClick={onEdit} title="Edit">
              Edit
            </button>
            <button className="btn-icon btn-danger" onClick={onDelete} title="Delete">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="skills-section">
        <span className="section-label">Skills:</span>
        <div className="skills-list">
          {(resource.skills || []).map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="availability-section">
        <div className="availability-label">Availability</div>
        <div className="availability-bar-container">
          <div
            className="availability-bar"
            style={{
              width: `${resource.availabilityPercentage}%`,
              backgroundColor: getAvailabilityColor(resource.availabilityPercentage)
            }}
          />
          <span className="availability-percentage">{resource.availabilityPercentage}%</span>
        </div>
      </div>

      <button className="btn btn-secondary" onClick={onManage}>
        View Allocations
      </button>
    </div>
  )
}

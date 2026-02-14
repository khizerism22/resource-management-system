import SprintForm from './SprintForm.jsx'
import './SprintModal.css'

export default function SprintModal({ sprint, projectId, onSave, onClose }) {
  async function handleSubmit(payload) {
    await onSave(payload)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{sprint ? 'Edit Sprint' : 'Create Sprint'}</h2>
          <button className="modal-close" onClick={onClose}>
            x
          </button>
        </div>
        <SprintForm
          sprint={sprint}
          projectId={projectId}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}

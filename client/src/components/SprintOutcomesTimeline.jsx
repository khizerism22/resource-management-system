import './SprintOutcomesTimeline.css'

export default function SprintOutcomesTimeline({ sprints }) {
  function getOutcomeColor(outcome) {
    if (outcome === 'Success') return 'var(--success)'
    if (outcome === 'AtRisk') return 'var(--warning)'
    if (outcome === 'Failure') return 'var(--danger)'
    return 'var(--gray-500)'
  }

  function getRAGColor(rag) {
    if (rag === 'Green') return 'var(--success)'
    if (rag === 'Amber') return 'var(--warning)'
    if (rag === 'Red') return 'var(--danger)'
    return 'var(--gray-500)'
  }

  return (
    <div className="sprint-outcomes-timeline">
      <div className="timeline-track">
        {sprints.map((sprint, index) => (
          <div key={index} className="timeline-sprint">
            <div
              className="sprint-dot"
              style={{ backgroundColor: getOutcomeColor(sprint.outcome) }}
              title={`${sprint.outcome} - Score: ${sprint.healthScore || 'N/A'}`}
            >
              <span className="sprint-number">{sprint.sprintNumber}</span>
            </div>
            <div className="sprint-info">
              <div className="sprint-label">Sprint {sprint.sprintNumber}</div>
              <div className="sprint-outcome">
                {sprint.outcome === 'AtRisk' ? 'At Risk' : sprint.outcome}
              </div>
              {sprint.healthScore && (
                <div className="sprint-score" style={{ color: getRAGColor(sprint.ragStatus) }}>
                  {sprint.healthScore}
                </div>
              )}
            </div>
            {index < sprints.length - 1 && <div className="timeline-line" />}
          </div>
        ))}
      </div>
    </div>
  )
}

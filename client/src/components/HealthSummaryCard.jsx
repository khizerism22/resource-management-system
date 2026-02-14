import './HealthSummaryCard.css'

export default function HealthSummaryCard({ score, ragStatus, completion, outcome }) {
  const ragLabel = ragStatus || '—'
  const outcomeLabel = outcome === 'AtRisk' ? 'At Risk' : outcome || '—'

  return (
    <aside className="health-summary">
      <div className="summary-header">
        <div>
          <h3>Health Summary</h3>
          <p>Live view of sprint health inputs.</p>
        </div>
      </div>

      <div className="summary-score">
        <div className={`score-ring ${ragLabel.toLowerCase()}`}>
          <span className="score-value">{score}</span>
          <span className="score-label">Score</span>
        </div>
        <div className="summary-meta">
          <span className={`rag-pill rag-${ragLabel.toLowerCase()}`}>{ragLabel}</span>
          <span className="outcome-pill">Outcome: {outcomeLabel}</span>
        </div>
      </div>

      <div className="summary-progress">
        <div className="progress-header">
          <span>Completion</span>
          <span>{completion}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${completion}%` }} />
        </div>
      </div>
    </aside>
  )
}

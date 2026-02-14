import { useEffect, useState } from 'react'
import './ScrumRatingForm.css'

export default function ScrumRatingForm({ values, onChange, errors }) {
  const [localScore, setLocalScore] = useState(0)
  const [ragStatus, setRagStatus] = useState('')

  const dimensions = [
    {
      key: 'sprintPlanningEffectiveness',
      label: 'Sprint Planning Effectiveness',
      description: 'Clarity of sprint goals and planning alignment'
    },
    {
      key: 'backlogReadiness',
      label: 'Backlog Readiness',
      description: 'User stories are refined, estimated, and ready'
    },
    {
      key: 'teamCollaboration',
      label: 'Team Collaboration',
      description: 'Communication quality and team alignment'
    },
    {
      key: 'dailyScrumEffectiveness',
      label: 'Daily Scrum Effectiveness',
      description: 'Standup discipline, blockers surfaced quickly'
    },
    {
      key: 'sprintExecutionDiscipline',
      label: 'Sprint Execution Discipline',
      description: 'Adherence to sprint commitments and flow'
    },
    {
      key: 'sprintReviewQuality',
      label: 'Sprint Review Quality',
      description: 'Demo quality, stakeholder feedback, value shown'
    },
    {
      key: 'retrospectiveEffectiveness',
      label: 'Retrospective Effectiveness',
      description: 'Actionable improvement items and follow-through'
    }
  ]

  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  useEffect(() => {
    calculateScore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  function calculateScore() {
    const ratings = dimensions.map((d) => values[d.key]?.rating || 0)
    const validRatings = ratings.filter((r) => r > 0)

    if (validRatings.length === 0) {
      setLocalScore(0)
      setRagStatus('')
      return
    }

    const average = validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
    const score = (average / 5) * 100

    let multiplier = 1.0
    if (values.overallOutcome === 'AtRisk') multiplier = 0.8
    if (values.overallOutcome === 'Failure') multiplier = 0.5

    const finalScore = Math.round(score * multiplier * 10) / 10
    setLocalScore(finalScore)

    if (finalScore < 50) setRagStatus('Red')
    else if (finalScore <= 75) setRagStatus('Amber')
    else setRagStatus('Green')
  }

  function handleRatingChange(key, rating) {
    onChange({
      ...values,
      [key]: {
        ...values[key],
        rating: parseInt(rating, 10)
      }
    })
  }

  function handleCommentChange(key, comment) {
    onChange({
      ...values,
      [key]: {
        ...values[key],
        comment
      }
    })
  }

  function getRAGColor() {
    if (ragStatus === 'Green') return '#22c55e'
    if (ragStatus === 'Amber') return '#f59e0b'
    if (ragStatus === 'Red') return '#ef4444'
    return '#cbd5f5'
  }

  return (
    <div className="scrum-rating-form">
      <div className="score-display">
        <div>
          <h3>Scrum Maturity Assessment</h3>
          <p>Score updates in real time based on ratings and outcome.</p>
        </div>
        <div className="score-card">
          <div className="score-circle" style={{ borderColor: getRAGColor() }}>
            <span className="score-value">{localScore}</span>
            <span className="score-label">Score</span>
          </div>
          {ragStatus && (
            <div className="rag-indicator" style={{ backgroundColor: getRAGColor() }}>
              {ragStatus} Status
            </div>
          )}
        </div>
      </div>

      <div className="dimensions-container">
        {dimensions.map((dimension, index) => (
          <div key={dimension.key} className="dimension-section">
            <div className="dimension-header">
              <h4>
                {index + 1}. {dimension.label}
              </h4>
              <p className="dimension-description">{dimension.description}</p>
            </div>

            <div className="rating-input">
              <div className="rating-labels">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={values[dimension.key]?.rating || 3}
                onChange={(e) => handleRatingChange(dimension.key, e.target.value)}
                className="rating-slider"
              />
              <div className="rating-value">
                <span className="rating-number">{values[dimension.key]?.rating || 3}</span>
                <span className="rating-text">
                  {ratingLabels[(values[dimension.key]?.rating || 3) - 1]}
                </span>
              </div>
              {errors[dimension.key] && <span className="form-error">{errors[dimension.key]}</span>}
            </div>

            <div className="comment-input">
              <input
                type="text"
                placeholder="Optional: Add specific comments or observations..."
                value={values[dimension.key]?.comment || ''}
                onChange={(e) => handleCommentChange(dimension.key, e.target.value)}
                className="form-input"
                maxLength="500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

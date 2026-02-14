import './SprintOutcomeForm.css'

export default function SprintOutcomeForm({ values, onChange, errors }) {
  const failureReasonOptions = [
    'Unclear requirements',
    'Resource constraints',
    'Technical debt',
    'External dependencies',
    'Scope creep',
    'Team availability',
    'Estimation issues',
    'Quality issues',
    'Other'
  ]

  function handleFailureReasonToggle(reason) {
    const currentReasons = values.failureReasons || []
    const newReasons = currentReasons.includes(reason)
      ? currentReasons.filter((r) => r !== reason)
      : [...currentReasons, reason]

    onChange({ ...values, failureReasons: newReasons })
  }

  const showFailureReasons = values.overallOutcome === 'AtRisk' || values.overallOutcome === 'Failure'

  return (
    <div className="sprint-outcome-form">
      <h3>Sprint Outcome Assessment</h3>

      <div className="form-group">
        <label className="form-label">Sprint Goal Achievement *</label>
        <select
          value={values.goalAchievement || ''}
          onChange={(e) => onChange({ ...values, goalAchievement: e.target.value })}
          className={`form-select ${errors.goalAchievement ? 'error' : ''}`}
        >
          <option value="">Select achievement level</option>
          <option value="Achieved">Achieved</option>
          <option value="PartiallyAchieved">Partially Achieved</option>
          <option value="NotAchieved">Not Achieved</option>
        </select>
        {errors.goalAchievement && <span className="form-error">{errors.goalAchievement}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Overall Outcome *</label>
        <div className="radio-group">
          {['Success', 'AtRisk', 'Failure'].map((opt) => (
            <label
              key={opt}
              className={`radio-option ${opt === 'AtRisk' ? 'at-risk' : opt.toLowerCase()}`}
            >
              <input
                type="radio"
                name="overallOutcome"
                value={opt}
                checked={values.overallOutcome === opt}
                onChange={(e) => onChange({ ...values, overallOutcome: e.target.value, failureReasons: [] })}
              />
              <span className="radio-label">{opt === 'AtRisk' ? 'At Risk' : opt}</span>
            </label>
          ))}
        </div>
        {errors.overallOutcome && <span className="form-error">{errors.overallOutcome}</span>}
      </div>

      {showFailureReasons && (
        <div className="form-group">
          <label className="form-label">Failure Reasons (Select all that apply)</label>
          <div className="checkbox-group">
            {failureReasonOptions.map((reason) => (
              <label key={reason} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={(values.failureReasons || []).includes(reason)}
                  onChange={() => handleFailureReasonToggle(reason)}
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Additional Comments</label>
        <textarea
          value={values.comments || ''}
          onChange={(e) => onChange({ ...values, comments: e.target.value })}
          className="form-textarea"
          placeholder="Provide additional context about the sprint outcome..."
          rows="4"
          maxLength="1000"
        />
        <div className="char-counter">{(values.comments || '').length} / 1000 characters</div>
      </div>
    </div>
  )
}

import './SprintTimeline.css'

export default function SprintTimeline({ sprints }) {
  function getSprintStatus(sprint) {
    const now = new Date()
    const start = new Date(sprint.startDate)
    const end = new Date(sprint.endDate)

    if (now >= start && now <= end) return 'active'
    if (now > end) return 'completed'
    return 'planned'
  }

  function getStatusClass(status) {
    if (status === 'active') return 'timeline-active'
    if (status === 'completed') return 'timeline-completed'
    return 'timeline-planned'
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const sortedSprints = [...sprints].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )

  return (
    <div className="sprint-timeline">
      <div className="timeline-container">
        {sortedSprints.map((sprint, index) => {
          const status = getSprintStatus(sprint)
          return (
            <div key={sprint._id} className="timeline-item">
              <div className={`timeline-dot ${getStatusClass(status)}`}>
                <span className="sprint-number">{sprint.sprintNumber}</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>Sprint #{sprint.sprintNumber}</h4>
                  <span className={`timeline-status ${getStatusClass(status)}`}>{status}</span>
                </div>
                <p className="timeline-goal">{sprint.sprintGoal}</p>
                <div className="timeline-dates">
                  <span>{formatDate(sprint.startDate)}</span>
                  <span> - </span>
                  <span>{formatDate(sprint.endDate)}</span>
                </div>
              </div>
              {index < sortedSprints.length - 1 && <div className="timeline-connector" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

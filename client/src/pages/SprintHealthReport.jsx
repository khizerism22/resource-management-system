import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import SprintOutcomeForm from '../components/SprintOutcomeForm.jsx'
import ScrumRatingForm from '../components/ScrumRatingForm.jsx'
import HealthSummaryCard from '../components/HealthSummaryCard.jsx'
import HealthTrendChart from '../components/HealthTrendChart.jsx'
import { sprintHealthService } from '../services/sprintHealthService.js'
import { sprintService } from '../services/sprintService.js'
import { useAuth } from '../context/AuthContext.jsx'
import './SprintHealthReport.css'

export default function SprintHealthReport() {
  const { sprintId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [sprint, setSprint] = useState(null)
  const [existingHealth, setExistingHealth] = useState(null)
  const [previousHealth, setPreviousHealth] = useState(null)
  const [history, setHistory] = useState([])
  const [trend, setTrend] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    goalAchievement: '',
    overallOutcome: 'Success',
    failureReasons: [],
    comments: '',
    sprintPlanningEffectiveness: { rating: 3, comment: '' },
    backlogReadiness: { rating: 3, comment: '' },
    teamCollaboration: { rating: 3, comment: '' },
    dailyScrumEffectiveness: { rating: 3, comment: '' },
    sprintExecutionDiscipline: { rating: 3, comment: '' },
    sprintReviewQuality: { rating: 3, comment: '' },
    retrospectiveEffectiveness: { rating: 3, comment: '' }
  })

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprintId])

  async function fetchData() {
    setLoading(true)
    try {
      const sprintData = await sprintService.getSprintById(sprintId)
      setSprint(sprintData)

      try {
        const healthResponse = await sprintHealthService.getSprintHealth(sprintId)
        setExistingHealth(healthResponse.data)
        setPreviousHealth(healthResponse.previousHealth)
        setTrend(healthResponse.trend)

        if (healthResponse.data) {
          setFormData({
            goalAchievement: healthResponse.data.sprint?.goalAchievement || '',
            overallOutcome: healthResponse.data.sprint?.overallOutcome || 'Success',
            failureReasons: healthResponse.data.sprint?.failureReasons || [],
            comments: healthResponse.data.sprint?.comments || '',
            sprintPlanningEffectiveness: healthResponse.data.sprintPlanningEffectiveness,
            backlogReadiness: healthResponse.data.backlogReadiness,
            teamCollaboration: healthResponse.data.teamCollaboration,
            dailyScrumEffectiveness: healthResponse.data.dailyScrumEffectiveness,
            sprintExecutionDiscipline: healthResponse.data.sprintExecutionDiscipline,
            sprintReviewQuality: healthResponse.data.sprintReviewQuality,
            retrospectiveEffectiveness: healthResponse.data.retrospectiveEffectiveness
          })
        }
      } catch {
        // no existing health
      }

      try {
        const historyData = await sprintHealthService.getHealthHistory(sprintId)
        setHistory(historyData)
      } catch {
        setHistory([])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  function validate() {
    const newErrors = {}

    if (!formData.goalAchievement) newErrors.goalAchievement = 'Goal achievement is required'
    if (!formData.overallOutcome) newErrors.overallOutcome = 'Overall outcome is required'

    const dimensions = [
      'sprintPlanningEffectiveness',
      'backlogReadiness',
      'teamCollaboration',
      'dailyScrumEffectiveness',
      'sprintExecutionDiscipline',
      'sprintReviewQuality',
      'retrospectiveEffectiveness'
    ]

    dimensions.forEach((dim) => {
      if (!formData[dim]?.rating || formData[dim].rating < 1 || formData[dim].rating > 5) {
        newErrors[dim] = 'Rating is required (1-5)'
      }
    })

    return newErrors
  }

  async function handleSubmit() {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      if (existingHealth) {
        await sprintHealthService.updateSprintHealth(sprintId, formData)
      } else {
        await sprintHealthService.createSprintHealth(sprintId, formData)
      }
      navigate(`/projects/${sprint.project?._id}/sprints`)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save sprint health data')
    } finally {
      setSaving(false)
    }
  }

  const canManage = ['PM', 'Admin', 'TeamLead'].includes(user?.role)

  const completion = (() => {
    const required = [
      'goalAchievement',
      'overallOutcome',
      'sprintPlanningEffectiveness',
      'backlogReadiness',
      'teamCollaboration',
      'dailyScrumEffectiveness',
      'sprintExecutionDiscipline',
      'sprintReviewQuality',
      'retrospectiveEffectiveness'
    ]

    const filled = required.reduce((count, key) => {
      if (key === 'goalAchievement' || key === 'overallOutcome') {
        return formData[key] ? count + 1 : count
      }
      return formData[key]?.rating ? count + 1 : count
    }, 0)

    return Math.round((filled / required.length) * 100)
  })()

  const liveScore = (() => {
    const ratings = [
      formData.sprintPlanningEffectiveness?.rating,
      formData.backlogReadiness?.rating,
      formData.teamCollaboration?.rating,
      formData.dailyScrumEffectiveness?.rating,
      formData.sprintExecutionDiscipline?.rating,
      formData.sprintReviewQuality?.rating,
      formData.retrospectiveEffectiveness?.rating
    ].filter((v) => typeof v === 'number')
    if (ratings.length === 0) return 0
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    let multiplier = 1
    if (formData.overallOutcome === 'AtRisk') multiplier = 0.8
    if (formData.overallOutcome === 'Failure') multiplier = 0.5
    return Math.round(((avg / 5) * 100 * multiplier) * 10) / 10
  })()

  const liveRag = liveScore < 50 ? 'Red' : liveScore <= 75 ? 'Amber' : 'Green'

  if (loading) {
    return (
      <AppShell title="Sprint Health">
        <div>Loading sprint health data...</div>
      </AppShell>
    )
  }
  if (!sprint) {
    return (
      <AppShell title="Sprint Health">
        <div className="error">Sprint not found</div>
      </AppShell>
    )
  }
  if (!canManage) {
    return (
      <AppShell title="Sprint Health">
        <div className="error">You do not have access to this page</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Sprint Health">
      <div className="sprint-health-report">
        <div className="page-header">
          <div>
            <h1>Sprint Health Report</h1>
            <p className="page-subtitle">
              {sprint.project?.name} - Sprint #{sprint.sprintNumber}
            </p>
          </div>
        </div>

        <div className="health-layout">
          <HealthSummaryCard
            score={liveScore}
            ragStatus={liveRag}
            completion={completion}
            outcome={formData.overallOutcome}
          />

          <div className="health-main">
            {previousHealth && trend && (
              <div className="comparison-card">
                <h3>Previous Sprint Comparison</h3>
                <div className="comparison-stats">
                  <div className="stat-item">
                    <span className="stat-label">Previous Score</span>
                    <span className="stat-value">{previousHealth.overallHealthScore}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Previous RAG</span>
                    <span className={`rag-badge rag-${previousHealth.ragStatus.toLowerCase()}`}>
                      {previousHealth.ragStatus}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Trend</span>
                    <span className={`trend-indicator trend-${trend.direction}`}>
                      {trend.direction === 'improving' && '↑'}
                      {trend.direction === 'declining' && '↓'}
                      {trend.direction === 'stable' && '→'}
                      {trend.direction === 'new' && '●'}
                      {trend.percentage > 0 && ` ${trend.percentage}%`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="chart-card">
              <h3>Last 5 Sprint Trend</h3>
              <HealthTrendChart data={history.slice(-5)} />
            </div>

            <div className="stepper">
              <div
                className={`step ${activeStep === 0 ? 'active' : ''} ${activeStep > 0 ? 'completed' : ''}`}
              >
                <div className="step-number">1</div>
                <div className="step-label">Sprint Outcome</div>
              </div>
              <div className="step-connector" />
              <div className={`step ${activeStep === 1 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Scrum Ratings</div>
              </div>
            </div>

            <div className="form-container">
              {activeStep === 0 && (
                <SprintOutcomeForm values={formData} onChange={setFormData} errors={errors} />
              )}

              {activeStep === 1 && (
                <ScrumRatingForm values={formData} onChange={setFormData} errors={errors} />
              )}
            </div>

            <div className="form-actions">
              {activeStep > 0 && (
                <button className="btn btn-secondary" onClick={() => setActiveStep(activeStep - 1)}>
                  Previous
                </button>
              )}

              {activeStep < 1 ? (
                <button className="btn btn-primary" onClick={() => setActiveStep(activeStep + 1)}>
                  Next
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                  {saving ? 'Saving...' : existingHealth ? 'Update Health Data' : 'Submit Health Data'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

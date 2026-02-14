import SprintHealth from '../models/SprintHealth.js'
import Sprint from '../models/Sprint.js'
import AlertService from '../services/alertService.js'
import {
  calculateOverallScore,
  calculateRAGStatus,
  validateDimensions,
  getHealthTrend
} from '../utils/healthCalculator.js'

export async function createSprintHealth(req, res, next) {
  try {
    const { sprintId } = req.params
    const {
      sprintPlanningEffectiveness,
      backlogReadiness,
      teamCollaboration,
      dailyScrumEffectiveness,
      sprintExecutionDiscipline,
      sprintReviewQuality,
      retrospectiveEffectiveness,
      goalAchievement,
      overallOutcome,
      failureReasons,
      comments
    } = req.body

    const sprint = await Sprint.findById(sprintId).populate('project', 'name')
    if (!sprint) {
      return res.status(404).json({ success: false, error: 'Sprint not found' })
    }

    const existingHealth = await SprintHealth.findOne({ sprint: sprintId })
    if (existingHealth) {
      return res.status(400).json({
        success: false,
        error: 'Health data already exists for this sprint. Use PUT to update.'
      })
    }

    const dimensions = {
      sprintPlanningEffectiveness,
      backlogReadiness,
      teamCollaboration,
      dailyScrumEffectiveness,
      sprintExecutionDiscipline,
      sprintReviewQuality,
      retrospectiveEffectiveness
    }

    const validationErrors = validateDimensions(dimensions)
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      })
    }

    const validOutcomes = ['Success', 'AtRisk', 'Failure']
    if (!validOutcomes.includes(overallOutcome)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid outcome. Must be Success, At Risk, or Failure'
      })
    }

    const overallHealthScore = calculateOverallScore(dimensions, overallOutcome)
    const ragStatus = calculateRAGStatus(overallHealthScore)

    const sprintHealth = await SprintHealth.create({
      sprint: sprintId,
      ...dimensions,
      overallHealthScore,
      ragStatus,
      createdBy: req.user?._id || null
    })

    const previousOutcome = sprint.overallOutcome

    await Sprint.findByIdAndUpdate(sprintId, {
      goalAchievement,
      overallOutcome,
      failureReasons: failureReasons || [],
      comments
    })

    const populated = await SprintHealth.findById(sprintHealth._id)
      .populate('sprint', 'sprintNumber project startDate endDate')
      .populate('createdBy', 'name email')

    if (overallOutcome === 'Failure' && previousOutcome !== 'Failure') {
      await AlertService.notifySprintFailure(sprint, sprint.project)
    }

    if (overallOutcome === 'AtRisk') {
      await AlertService.checkConsecutiveAtRiskSprints(sprint.project?._id || sprint.project)
    }

    return res.status(201).json({
      success: true,
      data: populated,
      message: 'Sprint health data recorded successfully'
    })
  } catch (error) {
    return next(error)
  }
}

export async function getSprintHealth(req, res, next) {
  try {
    const { sprintId } = req.params

    const sprint = await Sprint.findById(sprintId).populate('project', 'name')
    if (!sprint) {
      return res.status(404).json({ success: false, error: 'Sprint not found' })
    }

    const health = await SprintHealth.findOne({ sprint: sprintId })
      .populate('sprint', 'sprintNumber project startDate endDate goalAchievement overallOutcome failureReasons comments')
      .populate('createdBy', 'name email')

    if (!health) {
      return res.status(404).json({ success: false, error: 'No health data found for this sprint' })
    }

    const previousSprint = await Sprint.findOne({
      project: sprint.project,
      sprintNumber: sprint.sprintNumber - 1
    })

    let previousHealth = null
    let trend = null

    if (previousSprint) {
      previousHealth = await SprintHealth.findOne({ sprint: previousSprint._id }).select(
        'overallHealthScore ragStatus'
      )

      if (previousHealth) {
        trend = getHealthTrend(previousHealth.overallHealthScore, health.overallHealthScore)
      }
    }

    return res.json({
      success: true,
      data: health,
      previousHealth,
      trend
    })
  } catch (error) {
    return next(error)
  }
}

export async function updateSprintHealth(req, res, next) {
  try {
    const { sprintId } = req.params
    const {
      sprintPlanningEffectiveness,
      backlogReadiness,
      teamCollaboration,
      dailyScrumEffectiveness,
      sprintExecutionDiscipline,
      sprintReviewQuality,
      retrospectiveEffectiveness,
      goalAchievement,
      overallOutcome,
      failureReasons,
      comments
    } = req.body

    const health = await SprintHealth.findOne({ sprint: sprintId })
    if (!health) {
      return res.status(404).json({
        success: false,
        error: 'Health data not found. Use POST to create.'
      })
    }

    const dimensions = {
      sprintPlanningEffectiveness: sprintPlanningEffectiveness || health.sprintPlanningEffectiveness,
      backlogReadiness: backlogReadiness || health.backlogReadiness,
      teamCollaboration: teamCollaboration || health.teamCollaboration,
      dailyScrumEffectiveness: dailyScrumEffectiveness || health.dailyScrumEffectiveness,
      sprintExecutionDiscipline: sprintExecutionDiscipline || health.sprintExecutionDiscipline,
      sprintReviewQuality: sprintReviewQuality || health.sprintReviewQuality,
      retrospectiveEffectiveness: retrospectiveEffectiveness || health.retrospectiveEffectiveness
    }

    const validationErrors = validateDimensions(dimensions)
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      })
    }

    const sprint = await Sprint.findById(sprintId)
    const previousOutcome = sprint?.overallOutcome
    const outcome = overallOutcome || sprint?.overallOutcome || 'Success'

    const overallHealthScore = calculateOverallScore(dimensions, outcome)
    const ragStatus = calculateRAGStatus(overallHealthScore)

    const updated = await SprintHealth.findOneAndUpdate(
      { sprint: sprintId },
      {
        ...dimensions,
        overallHealthScore,
        ragStatus,
        updatedBy: req.user?._id || null
      },
      { new: true, runValidators: true }
    )
      .populate('sprint', 'sprintNumber project')
      .populate('createdBy', 'name email')

    if (goalAchievement || overallOutcome || failureReasons || comments) {
      await Sprint.findByIdAndUpdate(sprintId, {
        ...(goalAchievement && { goalAchievement }),
        ...(overallOutcome && { overallOutcome }),
        ...(failureReasons && { failureReasons }),
        ...(comments && { comments })
      })
    }

    const updatedSprint = await Sprint.findById(sprintId).populate('project', 'name')

    if (overallOutcome === 'Failure' && previousOutcome !== 'Failure') {
      await AlertService.notifySprintFailure(updatedSprint, updatedSprint.project)
    }

    if (overallOutcome === 'AtRisk') {
      await AlertService.checkConsecutiveAtRiskSprints(updatedSprint.project?._id || updatedSprint.project)
    }

    return res.json({
      success: true,
      data: updated,
      message: 'Sprint health data updated successfully'
    })
  } catch (error) {
    return next(error)
  }
}

export async function getHealthHistory(req, res, next) {
  try {
    const { sprintId } = req.params

    const sprint = await Sprint.findById(sprintId)
    if (!sprint) {
      return res.status(404).json({ success: false, error: 'Sprint not found' })
    }

    const projectSprints = await Sprint.find({
      project: sprint.project,
      sprintNumber: { $lte: sprint.sprintNumber }
    }).sort({ sprintNumber: 1 })

    const sprintIds = projectSprints.map((s) => s._id)

    const healthRecords = await SprintHealth.find({ sprint: { $in: sprintIds } })
      .populate('sprint', 'sprintNumber overallOutcome')
      .sort({ 'sprint.sprintNumber': 1 })

    const history = healthRecords.map((h) => ({
      sprintNumber: h.sprint?.sprintNumber,
      overallHealthScore: h.overallHealthScore,
      ragStatus: h.ragStatus,
      outcome: h.sprint?.overallOutcome,
      createdAt: h.createdAt
    }))

    return res.json({ success: true, data: history })
  } catch (error) {
    return next(error)
  }
}

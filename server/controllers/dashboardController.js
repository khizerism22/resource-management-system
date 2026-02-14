import Project from '../models/Project.js'
import Sprint from '../models/Sprint.js'
import SprintHealth from '../models/SprintHealth.js'
import ResourceAllocation from '../models/ResourceAllocation.js'
import Resource from '../models/Resource.js'

export async function getProjectHealth(req, res, next) {
  try {
    const { id } = req.params

    const project = await Project.findById(id)
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const sprints = await Sprint.find({ project: id }).sort({ sprintNumber: 1 })

    if (sprints.length === 0) {
      return res.json({
        success: true,
        data: {
          project,
          currentSprint: null,
          sprintHistory: [],
          avgHealthScore: 0,
          trend: { direction: 'new', percentage: 0 },
          resources: [],
          metrics: {
            totalSprints: 0,
            failedSprints: 0,
            atRiskSprints: 0,
            successRate: 0
          }
        }
      })
    }

    const sprintIds = sprints.map((s) => s._id)

    const now = new Date()
    const currentSprint = await Sprint.findOne({
      project: id,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('project', 'name')

    let currentSprintHealth = null
    if (currentSprint) {
      currentSprintHealth = await SprintHealth.findOne({ sprint: currentSprint._id })
    }

    const recentSprints = sprints.slice(-5)
    const recentIds = recentSprints.map((s) => s._id)
    const recentHealth = await SprintHealth.find({ sprint: { $in: recentIds } })

    const healthBySprint = new Map()
    recentHealth.forEach((h) => healthBySprint.set(String(h.sprint), h))

    const sprintHistory = recentSprints.map((sprint) => {
      const health = healthBySprint.get(String(sprint._id))
      return {
        sprintNumber: sprint.sprintNumber,
        sprintGoal: sprint.sprintGoal,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        outcome: sprint.overallOutcome || 'NotAssessed',
        healthScore: health?.overallHealthScore ?? null,
        ragStatus: health?.ragStatus ?? null
      }
    })

    const healthRecords = await SprintHealth.find({ sprint: { $in: sprintIds } })
    const avgHealthScore =
      healthRecords.length > 0
        ? Math.round(
            (healthRecords.reduce((sum, h) => sum + h.overallHealthScore, 0) /
              healthRecords.length) *
              10
          ) / 10
        : 0

    let trend = { direction: 'stable', percentage: 0 }
    if (healthRecords.length >= 6) {
      const sprintOrder = new Map(sprints.map((s) => [String(s._id), s.sprintNumber]))
      const sortedHealth = [...healthRecords].sort(
        (a, b) => sprintOrder.get(String(a.sprint)) - sprintOrder.get(String(b.sprint))
      )

      const recentAvg =
        sortedHealth.slice(-3).reduce((sum, h) => sum + h.overallHealthScore, 0) / 3
      const previousAvg =
        sortedHealth.slice(-6, -3).reduce((sum, h) => sum + h.overallHealthScore, 0) / 3

      const difference = recentAvg - previousAvg
      const percentageChange = Math.round((difference / previousAvg) * 100)

      if (difference > 2) trend = { direction: 'improving', percentage: Math.abs(percentageChange) }
      else if (difference < -2)
        trend = { direction: 'declining', percentage: Math.abs(percentageChange) }
      else trend = { direction: 'stable', percentage: 0 }
    }

    const allocations = await ResourceAllocation.find({
      project: id,
      endDate: { $gte: now }
    }).populate('resource', 'name role')

    const resourceUtilization = allocations.map((a) => ({
      resourceName: a.resource?.name || 'Unknown',
      role: a.resource?.role || '—',
      allocation: a.allocationPercentage
    }))

    const totalSprints = sprints.length
    const failedSprints = sprints.filter((s) => s.overallOutcome === 'Failure').length
    const atRiskSprints = sprints.filter((s) => s.overallOutcome === 'AtRisk').length
    const successfulSprints = sprints.filter((s) => s.overallOutcome === 'Success').length
    const successRate = totalSprints > 0 ? Math.round((successfulSprints / totalSprints) * 100) : 0

    return res.json({
      success: true,
      data: {
        project,
        currentSprint: currentSprint
          ? {
              ...currentSprint.toObject(),
              health: currentSprintHealth
            }
          : null,
        sprintHistory,
        avgHealthScore,
        trend,
        resources: resourceUtilization,
        metrics: {
          totalSprints,
          failedSprints,
          atRiskSprints,
          successRate
        }
      }
    })
  } catch (error) {
    return next(error)
  }
}

export async function getPortfolioOverview(req, res, next) {
  try {
    const { status, client, methodology, page = 1, limit = 20 } = req.query

    const query = {}
    if (status) query.status = status
    if (client) query.client = { $regex: client, $options: 'i' }
    if (methodology) query.methodology = methodology

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10)
    const projects = await Project.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit, 10))
      .skip(skip)

    const total = await Project.countDocuments(query)

    const portfolioData = []

    for (const project of projects) {
      const sprints = await Sprint.find({ project: project._id })
      const sprintIds = sprints.map((s) => s._id)

      const healthRecords = await SprintHealth.find({ sprint: { $in: sprintIds } })

      let latestRag = 'NotAssessed'
      if (healthRecords.length > 0) {
        const sortedHealth = [...healthRecords].sort((a, b) => b.createdAt - a.createdAt)
        latestRag = sortedHealth[0].ragStatus
      }

      const failedSprints = sprints.filter((s) => s.overallOutcome === 'Failure').length
      const atRiskSprints = sprints.filter((s) => s.overallOutcome === 'AtRisk').length
      const avgHealthScore =
        healthRecords.length > 0
          ? Math.round(
              (healthRecords.reduce((sum, h) => sum + h.overallHealthScore, 0) /
                healthRecords.length) *
                10
            ) / 10
          : 0

      const allocations = await ResourceAllocation.find({
        project: project._id,
        endDate: { $gte: new Date() }
      })

      const totalAllocation = allocations.reduce((sum, a) => sum + a.allocationPercentage, 0)
      const resourceUtilization = allocations.length > 0 ? Math.round(totalAllocation / allocations.length) : 0

      portfolioData.push({
        projectId: project._id,
        name: project.name,
        client: project.client,
        status: project.status,
        methodology: project.methodology,
        ragStatus: latestRag,
        failedSprints,
        atRiskSprints,
        avgHealthScore,
        resourceUtilization,
        totalSprints: sprints.length
      })
    }

    return res.json({
      success: true,
      data: portfolioData,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    })
  } catch (error) {
    return next(error)
  }
}

export async function getProjectTrends(req, res, next) {
  try {
    const { projectId } = req.params
    const { months = 6 } = req.query

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - parseInt(months, 10))

    const sprints = await Sprint.find({
      project: projectId,
      startDate: { $gte: startDate }
    }).sort({ sprintNumber: 1 })

    const sprintIds = sprints.map((s) => s._id)

    const healthRecords = await SprintHealth.find({ sprint: { $in: sprintIds } })
    const healthTrend = []

    for (const sprint of sprints) {
      const health = healthRecords.find((h) => String(h.sprint) === String(sprint._id))
      healthTrend.push({
        sprint: `Sprint ${sprint.sprintNumber}`,
        sprintNumber: sprint.sprintNumber,
        score: health?.overallHealthScore || 0,
        date: sprint.startDate,
        ragStatus: health?.ragStatus || 'NotAssessed'
      })
    }

    const successRateByMonth = {}
    sprints.forEach((sprint) => {
      const monthKey = `${sprint.startDate.getFullYear()}-${String(sprint.startDate.getMonth() + 1).padStart(2, '0')}`
      if (!successRateByMonth[monthKey]) {
        successRateByMonth[monthKey] = { total: 0, success: 0, atRisk: 0, failure: 0 }
      }
      successRateByMonth[monthKey].total += 1
      if (sprint.overallOutcome === 'Success') successRateByMonth[monthKey].success += 1
      if (sprint.overallOutcome === 'AtRisk') successRateByMonth[monthKey].atRisk += 1
      if (sprint.overallOutcome === 'Failure') successRateByMonth[monthKey].failure += 1
    })

    const successRate = Object.entries(successRateByMonth).map(([month, data]) => ({
      month,
      successRate: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0,
      success: data.success,
      atRisk: data.atRisk,
      failure: data.failure
    }))

    const allocations = await ResourceAllocation.find({
      project: projectId,
      startDate: { $gte: startDate }
    })

    const utilizationByMonth = {}
    allocations.forEach((alloc) => {
      const monthKey = `${alloc.startDate.getFullYear()}-${String(alloc.startDate.getMonth() + 1).padStart(2, '0')}`
      if (!utilizationByMonth[monthKey]) {
        utilizationByMonth[monthKey] = { total: 0, count: 0 }
      }
      utilizationByMonth[monthKey].total += alloc.allocationPercentage
      utilizationByMonth[monthKey].count += 1
    })

    const utilization = Object.entries(utilizationByMonth).map(([month, data]) => ({
      month,
      avgUtilization: data.count > 0 ? Math.round(data.total / data.count) : 0
    }))

    return res.json({
      success: true,
      data: {
        healthTrend,
        successRate,
        utilization
      }
    })
  } catch (error) {
    return next(error)
  }
}

import Sprint from '../models/Sprint.js'
import SprintHealth from '../models/SprintHealth.js'
import Project from '../models/Project.js'
import Resource from '../models/Resource.js'
import ResourceAllocation from '../models/ResourceAllocation.js'

export async function generateSprintSuccessTrendReport(projectId, startDate, endDate) {
  const query = { project: projectId }

  if (startDate && endDate) {
    query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) }
  }

  const sprints = await Sprint.find(query).sort({ sprintNumber: 1 })

  const monthlyData = {}

  sprints.forEach((sprint) => {
    const monthKey = `${sprint.startDate.getFullYear()}-${String(sprint.startDate.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        period: monthKey,
        total: 0,
        success: 0,
        atRisk: 0,
        failure: 0,
        successRate: 0
      }
    }

    monthlyData[monthKey].total += 1
    if (sprint.overallOutcome === 'Success') monthlyData[monthKey].success += 1
    if (sprint.overallOutcome === 'AtRisk') monthlyData[monthKey].atRisk += 1
    if (sprint.overallOutcome === 'Failure') monthlyData[monthKey].failure += 1
  })

  return Object.values(monthlyData).map((data) => ({
    ...data,
    successRate: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0
  }))
}

export async function generateScrumMaturityTrendReport(projectId, startDate, endDate) {
  const sprintQuery = { project: projectId }

  if (startDate && endDate) {
    sprintQuery.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) }
  }

  const sprints = await Sprint.find(sprintQuery).sort({ sprintNumber: 1 })
  const sprintIds = sprints.map((sprint) => sprint._id)

  const healthRecords = await SprintHealth.find({ sprint: { $in: sprintIds } }).populate(
    'sprint',
    'sprintNumber startDate'
  )

  const healthBySprint = new Map(healthRecords.map((health) => [String(health.sprint?._id), health]))

  return sprints
    .map((sprint) => {
      const health = healthBySprint.get(String(sprint._id))
      if (!health) return null

      const dimensions = {
        sprintPlanning: health.sprintPlanningEffectiveness.rating,
        backlog: health.backlogReadiness.rating,
        collaboration: health.teamCollaboration.rating,
        dailyScrum: health.dailyScrumEffectiveness.rating,
        execution: health.sprintExecutionDiscipline.rating,
        review: health.sprintReviewQuality.rating,
        retrospective: health.retrospectiveEffectiveness.rating
      }

      const avgDimensionScore =
        Object.values(dimensions).reduce((sum, value) => sum + value, 0) / 7

      return {
        period: `Sprint ${sprint.sprintNumber}`,
        sprintNumber: sprint.sprintNumber,
        date: sprint.startDate,
        ...dimensions,
        overallScore: health.overallHealthScore,
        avgDimensionScore: Math.round(avgDimensionScore * 10) / 10
      }
    })
    .filter(Boolean)
}

export async function generateResourceUtilizationReport(startDate, endDate) {
  const dateFilter = {}

  if (startDate && endDate) {
    dateFilter.$or = [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      }
    ]
  }

  const resources = await Resource.find()
  const report = []

  for (const resource of resources) {
    const allocations = await ResourceAllocation.find({
      resource: resource._id,
      ...dateFilter
    }).populate('project', 'name')

    const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.allocationPercentage, 0)
    const avgUtilization = allocations.length > 0 ? Math.round(totalAllocated / allocations.length) : 0

    const projects = allocations.map((allocation) => ({
      projectName: allocation.project?.name || 'Unknown',
      allocation: allocation.allocationPercentage,
      startDate: allocation.startDate,
      endDate: allocation.endDate
    }))

    report.push({
      resourceName: resource.name,
      role: resource.role,
      skills: resource.skills.join(', '),
      totalAllocated,
      avgUtilization,
      allocationsCount: allocations.length,
      overAllocated: totalAllocated > 100,
      projects
    })
  }

  return report.sort((a, b) => b.avgUtilization - a.avgUtilization)
}

export async function generateRecurringFailuresReport(startDate, endDate, minOccurrences = 2) {
  const query = {
    overallOutcome: { $in: ['Failure', 'AtRisk'] }
  }

  if (startDate && endDate) {
    query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) }
  }

  const sprints = await Sprint.find(query).populate('project', 'name')

  const reasonCounts = {}
  const reasonProjects = {}

  sprints.forEach((sprint) => {
    if (sprint.failureReasons && sprint.failureReasons.length > 0) {
      sprint.failureReasons.forEach((reason) => {
        if (!reasonCounts[reason]) {
          reasonCounts[reason] = 0
          reasonProjects[reason] = new Map()
        }
        reasonCounts[reason] += 1

        const projectName = sprint.project?.name || 'Unknown'
        if (!reasonProjects[reason].has(projectName)) {
          reasonProjects[reason].set(projectName, 0)
        }
        reasonProjects[reason].set(projectName, reasonProjects[reason].get(projectName) + 1)
      })
    }
  })

  return Object.entries(reasonCounts)
    .filter(([, count]) => count >= minOccurrences)
    .map(([reason, count]) => {
      const projects = Array.from(reasonProjects[reason].entries()).map(([name, sprintCount]) => ({
        projectName: name,
        sprintCount
      }))

      const totalFailures = sprints.length || 1
      const percentage = Math.round((count / totalFailures) * 100)

      return {
        reason,
        count,
        percentage,
        affectedProjects: projects.length,
        projects
      }
    })
    .sort((a, b) => b.count - a.count)
}

export function exportToCSV(data, headers) {
  if (!data || data.length === 0) {
    return 'No data available'
  }

  const headerRow = headers.map((header) => header.label).join(',')

  const dataRows = data
    .map((row) =>
      headers
        .map((header) => {
          const value = row[header.key]

          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }

          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }

          return value !== undefined && value !== null ? value : ''
        })
        .join(',')
    )
    .join('\n')

  return `${headerRow}\n${dataRows}`
}

export async function verifyProject(projectId) {
  return Project.findById(projectId)
}

import {
  generateSprintSuccessTrendReport,
  generateScrumMaturityTrendReport,
  generateResourceUtilizationReport,
  generateRecurringFailuresReport,
  exportToCSV,
  verifyProject
} from '../utils/reportGenerator.js'

export async function getSprintSuccessTrend(req, res, next) {
  try {
    const { projectId } = req.params
    const { startDate, endDate, format = 'json' } = req.query

    const project = await verifyProject(projectId)
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const data = await generateSprintSuccessTrendReport(projectId, startDate, endDate)

    const totalSprints = data.reduce((sum, entry) => sum + entry.total, 0)
    const totalSuccess = data.reduce((sum, entry) => sum + entry.success, 0)
    const avgSuccessRate = totalSprints > 0 ? Math.round((totalSuccess / totalSprints) * 100) : 0

    const summary = {
      totalSprints,
      totalSuccess,
      avgSuccessRate,
      reportPeriod: { startDate, endDate }
    }

    if (format === 'csv') {
      const headers = [
        { label: 'Period', key: 'period' },
        { label: 'Total Sprints', key: 'total' },
        { label: 'Success', key: 'success' },
        { label: 'At Risk', key: 'atRisk' },
        { label: 'Failure', key: 'failure' },
        { label: 'Success Rate %', key: 'successRate' }
      ]

      const csv = exportToCSV(data, headers)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=sprint-success-trend-${projectId}.csv`)
      return res.send(csv)
    }

    return res.json({ success: true, data, summary })
  } catch (error) {
    return next(error)
  }
}

export async function getScrumMaturityTrend(req, res, next) {
  try {
    const { projectId } = req.params
    const { startDate, endDate, format = 'json' } = req.query

    const project = await verifyProject(projectId)
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const data = await generateScrumMaturityTrendReport(projectId, startDate, endDate)

    const currentMaturity = data.length > 0 ? data[data.length - 1].overallScore : 0
    const avgMaturity =
      data.length > 0
        ? Math.round((data.reduce((sum, entry) => sum + entry.overallScore, 0) / data.length) * 10) / 10
        : 0

    let trend = 'stable'
    if (data.length >= 2) {
      const recent = data[data.length - 1].overallScore
      const previous = data[data.length - 2].overallScore
      const diff = recent - previous
      if (diff > 2) trend = 'improving'
      if (diff < -2) trend = 'declining'
    }

    const summary = {
      currentMaturity,
      avgMaturity,
      trend,
      totalSprints: data.length
    }

    if (format === 'csv') {
      const headers = [
        { label: 'Period', key: 'period' },
        { label: 'Sprint Planning', key: 'sprintPlanning' },
        { label: 'Backlog', key: 'backlog' },
        { label: 'Collaboration', key: 'collaboration' },
        { label: 'Daily Scrum', key: 'dailyScrum' },
        { label: 'Execution', key: 'execution' },
        { label: 'Review', key: 'review' },
        { label: 'Retrospective', key: 'retrospective' },
        { label: 'Overall Score', key: 'overallScore' }
      ]

      const csv = exportToCSV(data, headers)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=scrum-maturity-trend-${projectId}.csv`)
      return res.send(csv)
    }

    return res.json({ success: true, data, summary })
  } catch (error) {
    return next(error)
  }
}

export async function getResourceUtilization(req, res, next) {
  try {
    const { startDate, endDate, format = 'json' } = req.query

    const data = await generateResourceUtilizationReport(startDate, endDate)

    const totalResources = data.length
    const overAllocatedCount = data.filter((row) => row.overAllocated).length
    const avgUtilization =
      data.length > 0
        ? Math.round(data.reduce((sum, row) => sum + row.avgUtilization, 0) / data.length)
        : 0

    const summary = {
      totalResources,
      overAllocatedCount,
      avgUtilization,
      reportPeriod: { startDate, endDate }
    }

    if (format === 'csv') {
      const headers = [
        { label: 'Resource Name', key: 'resourceName' },
        { label: 'Role', key: 'role' },
        { label: 'Skills', key: 'skills' },
        { label: 'Total Allocated %', key: 'totalAllocated' },
        { label: 'Avg Utilization %', key: 'avgUtilization' },
        { label: 'Allocations Count', key: 'allocationsCount' },
        { label: 'Over-Allocated', key: 'overAllocated' }
      ]

      const csv = exportToCSV(data, headers)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=resource-utilization.csv')
      return res.send(csv)
    }

    return res.json({ success: true, data, summary })
  } catch (error) {
    return next(error)
  }
}

export async function getRecurringFailures(req, res, next) {
  try {
    const { startDate, endDate, minOccurrences = 2, format = 'json' } = req.query

    const data = await generateRecurringFailuresReport(startDate, endDate, parseInt(minOccurrences, 10))

    const topReason = data.length > 0 ? data[0].reason : 'None'
    const totalFailures = data.reduce((sum, entry) => sum + entry.count, 0)
    const uniqueReasons = data.length

    const summary = {
      topReason,
      totalFailures,
      uniqueReasons,
      minOccurrences: parseInt(minOccurrences, 10)
    }

    if (format === 'csv') {
      const headers = [
        { label: 'Failure Reason', key: 'reason' },
        { label: 'Occurrences', key: 'count' },
        { label: 'Percentage', key: 'percentage' },
        { label: 'Affected Projects', key: 'affectedProjects' }
      ]

      const csv = exportToCSV(data, headers)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=recurring-failures.csv')
      return res.send(csv)
    }

    return res.json({ success: true, data, summary })
  } catch (error) {
    return next(error)
  }
}

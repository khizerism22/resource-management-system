import Alert from '../models/Alert.js'
import User from '../models/User.js'
import Sprint from '../models/Sprint.js'
import Project from '../models/Project.js'

class AlertService {
  async createAlert(type, message, userIds, options = {}) {
    const { severity = 'medium', project, sprint, resource, metadata } = options

    if (!userIds || userIds.length === 0) return []

    const payload = userIds.map((userId) => ({
      type,
      message,
      severity,
      user: userId,
      project: project || null,
      sprint: sprint || null,
      resource: resource || null,
      metadata: metadata || null
    }))

    return Alert.insertMany(payload)
  }

  async notifySprintFailure(sprintDoc, projectDoc) {
    try {
      const managers = await User.find({ role: { $in: ['PM', 'Admin'] } }).select('_id')
      const userIds = managers.map((user) => user._id)
      if (!userIds.length) return

      const message = `Sprint #${sprintDoc.sprintNumber} in ${projectDoc.name} was marked as FAILURE.`

      await this.createAlert('sprint_failure', message, userIds, {
        severity: 'critical',
        project: projectDoc._id,
        sprint: sprintDoc._id,
        metadata: {
          sprintNumber: sprintDoc.sprintNumber,
          outcome: sprintDoc.overallOutcome,
          projectName: projectDoc.name
        }
      })
    } catch (error) {
      console.error('Sprint failure notification failed:', error)
    }
  }

  async notifyConsecutiveAtRisk(projectId, consecutiveCount, sprintIds) {
    try {
      const project = await Project.findById(projectId)
      if (!project) return

      const managers = await User.find({ role: { $in: ['PM', 'Admin'] } }).select('_id')
      const userIds = managers.map((user) => user._id)
      if (!userIds.length) return

      const recentAlert = await Alert.findOne({
        type: 'sprint_at_risk',
        project: projectId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })

      if (recentAlert) return

      const message = `Project "${project.name}" has ${consecutiveCount} consecutive at-risk sprints.`

      await this.createAlert('sprint_at_risk', message, userIds, {
        severity: 'critical',
        project: projectId,
        metadata: {
          projectName: project.name,
          consecutiveCount,
          sprintIds
        }
      })
    } catch (error) {
      console.error('Consecutive at-risk notification failed:', error)
    }
  }

  async notifyOverAllocation(resourceDoc, totalAllocated, projectId) {
    try {
      const managers = await User.find({ role: { $in: ['PM', 'Admin'] } }).select('_id')
      const userIds = managers.map((user) => user._id)
      if (!userIds.length) return

      const message = `Resource "${resourceDoc.name}" is over-allocated at ${totalAllocated}%.`

      await this.createAlert('over_allocation', message, userIds, {
        severity: 'high',
        project: projectId,
        resource: resourceDoc._id,
        metadata: {
          resourceName: resourceDoc.name,
          totalAllocated
        }
      })
    } catch (error) {
      console.error('Over-allocation notification failed:', error)
    }
  }

  async checkConsecutiveAtRiskSprints(projectId, threshold = 3) {
    try {
      const sprints = await Sprint.find({ project: projectId })
        .sort({ startDate: -1 })
        .limit(threshold)

      if (sprints.length < threshold) return

      const consecutiveAtRisk = sprints.every((sprint) => sprint.overallOutcome === 'AtRisk')
      if (!consecutiveAtRisk) return

      await this.notifyConsecutiveAtRisk(
        projectId,
        threshold,
        sprints.map((s) => s._id)
      )
    } catch (error) {
      console.error('Consecutive at-risk check failed:', error)
    }
  }
}

export default new AlertService()

import Project from '../models/Project.js'
import Sprint from '../models/Sprint.js'
import SprintHealth from '../models/SprintHealth.js'

const VALID_STATUSES = ['Active', 'OnHold', 'Completed']

function canEditProject(project, user) {
  if (!project || !user) return false
  const isCreator = String(project.createdBy) === String(user._id)
  const isAdmin = user.role === 'Admin'
  const isPM = user.role === 'PM'
  return isCreator || isAdmin || isPM
}

function canDeleteProject(project, user) {
  if (!project || !user) return false
  const isCreator = String(project.createdBy) === String(user._id)
  const isAdmin = user.role === 'Admin'
  return isCreator || isAdmin
}

export async function getAllProjects(req, res, next) {
  try {
    const { status, client, search } = req.query
    const query = {}

    if (status) query.status = status
    if (client) query.client = { $regex: client, $options: 'i' }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } }
      ]
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    return res.json({ success: true, data: projects })
  } catch (error) {
    return next(error)
  }
}

export async function getProjectById(req, res, next) {
  try {
    const project = await Project.findById(req.params.id).populate('createdBy', 'name email role')

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const sprints = await Sprint.find({ project: req.params.id }).sort({ sprintNumber: 1 })

    return res.json({
      success: true,
      data: {
        ...project.toObject(),
        sprints
      }
    })
  } catch (error) {
    return next(error)
  }
}

export async function createProject(req, res, next) {
  try {
    const { name, client, startDate, endDate, methodology, status } = req.body

    if (!name || !client || !startDate) {
      return res
        .status(400)
        .json({ success: false, error: 'Name, client, and startDate are required' })
    }

    if (endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ success: false, error: 'End date must be after start date' })
    }

    const existing = await Project.findOne({ name })
    if (existing) {
      return res.status(400).json({ success: false, error: 'Project name already exists' })
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' })
    }

    const project = await Project.create({
      name,
      client,
      startDate,
      endDate: endDate || null,
      methodology: methodology || 'Scrum',
      status: status || 'Active',
      createdBy: req.user._id
    })

    const populatedProject = await Project.findById(project._id).populate('createdBy', 'name email')

    return res.status(201).json({ success: true, data: populatedProject })
  } catch (error) {
    return next(error)
  }
}

export async function updateProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    if (!canEditProject(project, req.user)) {
      return res
        .status(403)
        .json({ success: false, error: 'Not authorized to update this project' })
    }

    const { name, client, startDate, endDate, status, methodology } = req.body

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ success: false, error: 'End date must be after start date' })
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' })
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { name, client, startDate, endDate, status, methodology },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')

    return res.json({ success: true, data: updated })
  } catch (error) {
    return next(error)
  }
}

export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    if (!canDeleteProject(project, req.user)) {
      return res
        .status(403)
        .json({ success: false, error: 'Not authorized to delete this project' })
    }

    await Sprint.deleteMany({ project: req.params.id })
    await Project.findByIdAndDelete(req.params.id)

    return res.json({ success: true, message: 'Project and associated sprints deleted' })
  } catch (error) {
    return next(error)
  }
}

export async function getProjectHealth(req, res, next) {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const sprints = await Sprint.find({ project: req.params.id })
    if (sprints.length === 0) {
      return res.json({
        success: true,
        data: {
          avgScore: 0,
          health: 'No data',
          totalSprints: 0,
          completedSprints: 0,
          failedSprints: 0,
          atRiskSprints: 0
        }
      })
    }

    const sprintIds = sprints.map((s) => s._id)
    const sprintHealths = await SprintHealth.find({ sprint: { $in: sprintIds } })

    const recent = [...sprintHealths]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)

    const avgScore =
      recent.length > 0
        ? recent.reduce((sum, s) => sum + (s.overallHealthScore || 0), 0) / recent.length
        : 0

    const failedCount = sprintHealths.filter((s) => s.ragStatus === 'Red').length
    const atRiskCount = sprintHealths.filter((s) => s.ragStatus === 'Amber').length
    const completedCount = sprints.filter((s) => s.overallOutcome).length

    let health = 'Green'
    if (avgScore < 60 || failedCount >= 3) health = 'Red'
    else if (avgScore < 80 || failedCount >= 2) health = 'Amber'

    return res.json({
      success: true,
      data: {
        avgScore: Number(avgScore.toFixed(1)),
        health,
        totalSprints: sprints.length,
        completedSprints: completedCount,
        failedSprints: failedCount,
        atRiskSprints: atRiskCount
      }
    })
  } catch (error) {
    return next(error)
  }
}

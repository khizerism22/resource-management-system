import Sprint from '../models/Sprint.js'
import Project from '../models/Project.js'

function statusFromDates(startDate, endDate) {
  const now = new Date()
  if (now >= startDate && now <= endDate) return 'active'
  if (now > endDate) return 'completed'
  return 'planned'
}

export async function createSprint(req, res, next) {
  try {
    const { sprintNumber, startDate, endDate, sprintGoal, sprintType } = req.body
    const { projectId } = req.params

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    if (!startDate || !endDate || !sprintNumber || !sprintGoal) {
      return res.status(400).json({
        success: false,
        error: 'sprintNumber, startDate, endDate, and sprintGoal are required'
      })
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ success: false, error: 'End date must be after start date' })
    }

    const overlappingSprints = await Sprint.find({
      project: projectId,
      $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }]
    })

    if (overlappingSprints.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Sprint dates overlap with existing sprint',
        overlappingSprints: overlappingSprints.map((s) => ({
          sprintNumber: s.sprintNumber,
          startDate: s.startDate,
          endDate: s.endDate
        }))
      })
    }

    const sprint = await Sprint.create({
      project: projectId,
      sprintNumber,
      startDate,
      endDate,
      sprintGoal,
      sprintType: sprintType || 'Delivery'
    })

    const populated = await Sprint.findById(sprint._id).populate('project', 'name client')

    return res.status(201).json({ success: true, data: populated })
  } catch (error) {
    return next(error)
  }
}

export async function getProjectSprints(req, res, next) {
  try {
    const { projectId } = req.params
    const { status, sort = '-startDate', limit = 20, page = 1 } = req.query

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const query = { project: projectId }

    if (status) {
      const now = new Date()
      if (status === 'active') {
        query.startDate = { $lte: now }
        query.endDate = { $gte: now }
      } else if (status === 'upcoming') {
        query.startDate = { $gt: now }
      } else if (status === 'completed') {
        query.endDate = { $lt: now }
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10)
    const sprints = await Sprint.find(query)
      .populate('project', 'name client status')
      .sort(sort)
      .limit(parseInt(limit, 10))
      .skip(skip)

    const total = await Sprint.countDocuments(query)

    return res.json({
      success: true,
      data: sprints,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    })
  } catch (error) {
    return next(error)
  }
}

export async function getSprintById(req, res, next) {
  try {
    const sprint = await Sprint.findById(req.params.id).populate('project', 'name client status')

    if (!sprint) {
      return res.status(404).json({ success: false, error: 'Sprint not found' })
    }

    return res.json({
      success: true,
      data: {
        ...sprint.toObject(),
        status: statusFromDates(sprint.startDate, sprint.endDate)
      }
    })
  } catch (error) {
    return next(error)
  }
}

export async function updateSprint(req, res, next) {
  try {
    const { sprintNumber, startDate, endDate, sprintGoal, sprintType } = req.body

    const sprint = await Sprint.findById(req.params.id)
    if (!sprint) {
      return res.status(404).json({ success: false, error: 'Sprint not found' })
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ success: false, error: 'End date must be after start date' })
    }

    if (startDate || endDate) {
      const overlappingSprints = await Sprint.find({
        project: sprint.project,
        _id: { $ne: req.params.id },
        $or: [
          {
            startDate: { $lte: new Date(endDate || sprint.endDate) },
            endDate: { $gte: new Date(startDate || sprint.startDate) }
          }
        ]
      })

      if (overlappingSprints.length > 0) {
        return res.status(400).json({ success: false, error: 'Updated dates overlap with existing sprint' })
      }
    }

    const updated = await Sprint.findByIdAndUpdate(
      req.params.id,
      { sprintNumber, startDate, endDate, sprintGoal, sprintType },
      { new: true, runValidators: true }
    ).populate('project', 'name client')

    return res.json({ success: true, data: updated })
  } catch (error) {
    return next(error)
  }
}

export async function deleteSprint(req, res, next) {
  try {
    const sprint = await Sprint.findById(req.params.id)
    if (!sprint) {
      return res.status(404).json({ success: false, error: 'Sprint not found' })
    }

    const now = new Date()
    if (now > sprint.endDate) {
      return res
        .status(400)
        .json({ success: false, error: 'Cannot delete completed sprint. Archive instead.' })
    }

    await Sprint.findByIdAndDelete(req.params.id)

    return res.json({ success: true, message: 'Sprint deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

export async function getSprintStatus(req, res, next) {
  try {
    const sprint = await Sprint.findById(req.params.id)
    if (!sprint) {
      return res.status(404).json({ success: false, error: 'Sprint not found' })
    }

    const now = new Date()
    let status = 'planned'
    let daysRemaining = 0
    let percentComplete = 0

    if (now >= sprint.startDate && now <= sprint.endDate) {
      status = 'active'
      daysRemaining = Math.ceil((sprint.endDate - now) / (1000 * 60 * 60 * 24))
      const totalDays = Math.ceil((sprint.endDate - sprint.startDate) / (1000 * 60 * 60 * 24))
      const daysElapsed = totalDays - daysRemaining
      percentComplete = Math.round((daysElapsed / totalDays) * 100)
    } else if (now > sprint.endDate) {
      status = 'completed'
      percentComplete = 100
    } else {
      const daysUntilStart = Math.ceil((sprint.startDate - now) / (1000 * 60 * 60 * 24))
      daysRemaining = daysUntilStart
    }

    return res.json({
      success: true,
      data: {
        sprintId: sprint._id,
        status,
        daysRemaining,
        percentComplete,
        startDate: sprint.startDate,
        endDate: sprint.endDate
      }
    })
  } catch (error) {
    return next(error)
  }
}

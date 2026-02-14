import ResourceAllocation from '../models/ResourceAllocation.js'
import Resource from '../models/Resource.js'
import Project from '../models/Project.js'

function canManage(user) {
  return ['Admin', 'PM'].includes(user?.role)
}

export async function getAllAllocations(req, res, next) {
  try {
    const { resourceId, projectId } = req.query
    const query = {}

    if (resourceId) query.resource = resourceId
    if (projectId) query.project = projectId

    const allocations = await ResourceAllocation.find(query)
      .populate('resource', 'name role')
      .populate('project', 'name client status')
      .sort({ startDate: -1 })

    return res.json({ success: true, data: allocations })
  } catch (error) {
    return next(error)
  }
}

export async function createAllocation(req, res, next) {
  try {
    if (!canManage(req.user)) {
      return res.status(403).json({ success: false, error: 'Not authorized to create allocations' })
    }

    const { resourceId, projectId, allocationPercentage, startDate, endDate, sprint } = req.body

    if (!resourceId || !projectId || !allocationPercentage || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'resourceId, projectId, allocationPercentage, startDate, and endDate are required'
      })
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, error: 'End date must be after start date' })
    }

    const resource = await Resource.findById(resourceId)
    const project = await Project.findById(projectId)

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' })
    }
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const overlappingAllocations = await ResourceAllocation.find({
      resource: resourceId,
      $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }]
    })

    const totalAllocated =
      overlappingAllocations.reduce((sum, a) => sum + a.allocationPercentage, 0) +
      Number(allocationPercentage)

    const capacity = resource.availabilityPercentage ?? 100

    if (totalAllocated > capacity) {
      return res.status(400).json({
        success: false,
        error: `Over-allocation detected. Resource would be allocated ${totalAllocated}% (capacity ${capacity}%)`,
        totalAllocated,
        capacity,
        warning: true
      })
    }

    const allocation = await ResourceAllocation.create({
      resource: resourceId,
      project: projectId,
      allocationPercentage,
      startDate,
      endDate,
      sprint: sprint || null
    })

    const populated = await ResourceAllocation.findById(allocation._id)
      .populate('resource', 'name role')
      .populate('project', 'name client')

    return res.status(201).json({ success: true, data: populated })
  } catch (error) {
    return next(error)
  }
}

export async function updateAllocation(req, res, next) {
  try {
    if (!canManage(req.user)) {
      return res.status(403).json({ success: false, error: 'Not authorized to update allocations' })
    }

    const { allocationPercentage, startDate, endDate, sprint } = req.body

    const allocation = await ResourceAllocation.findById(req.params.id)
    if (!allocation) {
      return res.status(404).json({ success: false, error: 'Allocation not found' })
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, error: 'End date must be after start date' })
    }

    const overlappingAllocations = await ResourceAllocation.find({
      resource: allocation.resource,
      _id: { $ne: req.params.id },
      $or: [
        {
          startDate: { $lte: new Date(endDate || allocation.endDate) },
          endDate: { $gte: new Date(startDate || allocation.startDate) }
        }
      ]
    })

    const effectivePercent = allocationPercentage ?? allocation.allocationPercentage
    const totalAllocated =
      overlappingAllocations.reduce((sum, a) => sum + a.allocationPercentage, 0) +
      Number(effectivePercent)

    const resource = await Resource.findById(allocation.resource)
    const capacity = resource?.availabilityPercentage ?? 100

    if (totalAllocated > capacity) {
      return res.status(400).json({
        success: false,
        error: `Over-allocation detected. Total would be ${totalAllocated}% (capacity ${capacity}%)`,
        warning: true
      })
    }

    const updated = await ResourceAllocation.findByIdAndUpdate(
      req.params.id,
      { allocationPercentage, startDate, endDate, sprint },
      { new: true, runValidators: true }
    )
      .populate('resource', 'name role')
      .populate('project', 'name client')

    return res.json({ success: true, data: updated })
  } catch (error) {
    return next(error)
  }
}

export async function deleteAllocation(req, res, next) {
  try {
    if (!canManage(req.user)) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete allocations' })
    }

    const allocation = await ResourceAllocation.findByIdAndDelete(req.params.id)
    if (!allocation) {
      return res.status(404).json({ success: false, error: 'Allocation not found' })
    }

    return res.json({ success: true, message: 'Allocation deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

export async function checkConflicts(req, res, next) {
  try {
    const resources = await Resource.find()
    const conflicts = []

    for (const resource of resources) {
      const allocations = await ResourceAllocation.find({
        resource: resource._id,
        endDate: { $gte: new Date() }
      }).populate('project', 'name')

      if (allocations.length === 0) continue

      const grouped = {}
      allocations.forEach((alloc) => {
        const key = `${alloc.startDate.toISOString()}-${alloc.endDate.toISOString()}`
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(alloc)
      })

      for (const allocs of Object.values(grouped)) {
        const total = allocs.reduce((sum, a) => sum + a.allocationPercentage, 0)
        const capacity = resource.availabilityPercentage ?? 100
        if (total > capacity) {
          conflicts.push({
            resourceId: resource._id,
            resourceName: resource.name,
            totalAllocated: total,
            capacity,
            allocations: allocs.map((a) => ({
              projectName: a.project?.name,
              allocationPercentage: a.allocationPercentage,
              startDate: a.startDate,
              endDate: a.endDate
            }))
          })
        }
      }
    }

    return res.json({ success: true, data: conflicts, count: conflicts.length })
  } catch (error) {
    return next(error)
  }
}

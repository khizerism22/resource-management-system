import Resource from '../models/Resource.js'
import ResourceAllocation from '../models/ResourceAllocation.js'

export async function getAllResources(req, res, next) {
  try {
    const { role, search, minAvailability } = req.query
    const query = {}

    if (role) query.role = role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    if (minAvailability) query.availabilityPercentage = { $gte: parseInt(minAvailability, 10) }

    const resources = await Resource.find(query).sort({ name: 1 })
    return res.json({ success: true, data: resources })
  } catch (error) {
    return next(error)
  }
}

export async function getResourceById(req, res, next) {
  try {
    const resource = await Resource.findById(req.params.id)
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' })
    }
    return res.json({ success: true, data: resource })
  } catch (error) {
    return next(error)
  }
}

export async function createResource(req, res, next) {
  try {
    const {
      name,
      role,
      skills = [],
      employmentType,
      availabilityPercentage,
      costRate,
      user
    } = req.body

    const normalizedSkills = Array.isArray(skills)
      ? skills
      : String(skills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

    const resource = await Resource.create({
      name,
      role,
      skills: normalizedSkills,
      employmentType: employmentType || 'FullTime',
      availabilityPercentage: availabilityPercentage ?? 100,
      costRate: costRate ?? null,
      user: user || null
    })

    return res.status(201).json({ success: true, data: resource })
  } catch (error) {
    return next(error)
  }
}

export async function updateResource(req, res, next) {
  try {
    const {
      name,
      role,
      skills,
      employmentType,
      availabilityPercentage,
      costRate,
      user
    } = req.body

    const normalizedSkills =
      skills === undefined
        ? undefined
        : Array.isArray(skills)
          ? skills
          : String(skills)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)

    const update = {
      name,
      role,
      employmentType,
      availabilityPercentage,
      costRate,
      user
    }

    if (normalizedSkills !== undefined) update.skills = normalizedSkills

    const resource = await Resource.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    })

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' })
    }

    return res.json({ success: true, data: resource })
  } catch (error) {
    return next(error)
  }
}

export async function deleteResource(req, res, next) {
  try {
    const activeAllocations = await ResourceAllocation.find({
      resource: req.params.id,
      endDate: { $gte: new Date() }
    })

    if (activeAllocations.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete resource with ${activeAllocations.length} active allocations`
      })
    }

    const resource = await Resource.findByIdAndDelete(req.params.id)
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' })
    }

    await ResourceAllocation.deleteMany({ resource: req.params.id })

    return res.json({ success: true, message: 'Resource deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

export async function getAvailableResources(req, res, next) {
  try {
    const { startDate, endDate, minAvailability = 0 } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      })
    }

    const resources = await Resource.find()
    const availabilityData = []

    for (const resource of resources) {
      const allocations = await ResourceAllocation.find({
        resource: resource._id,
        $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }]
      }).populate('project', 'name')

      const totalAllocated = allocations.reduce((sum, a) => sum + a.allocationPercentage, 0)
      const maxCapacity = resource.availabilityPercentage ?? 100
      const availablePercentage = Math.max(maxCapacity - totalAllocated, 0)

      if (availablePercentage >= Number(minAvailability)) {
        availabilityData.push({
          ...resource.toObject(),
          currentAllocations: allocations,
          totalAllocated,
          availablePercentage
        })
      }
    }

    return res.json({ success: true, data: availabilityData })
  } catch (error) {
    return next(error)
  }
}

export async function getResourceAllocations(req, res, next) {
  try {
    const allocations = await ResourceAllocation.find({ resource: req.params.id })
      .populate('project', 'name client status')
      .sort({ startDate: -1 })

    return res.json({ success: true, data: allocations })
  } catch (error) {
    return next(error)
  }
}

export async function getUtilizationMetrics(req, res, next) {
  try {
    const { startDate, endDate } = req.query
    const dateFilter = {}

    if (startDate && endDate) {
      dateFilter.$or = [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }]
    }

    const resources = await Resource.find()
    const utilizationData = []

    for (const resource of resources) {
      const allocations = await ResourceAllocation.find({
        resource: resource._id,
        ...dateFilter
      })

      const totalAllocated = allocations.reduce((sum, a) => sum + a.allocationPercentage, 0)
      const maxCapacity = resource.availabilityPercentage ?? 100

      utilizationData.push({
        resourceId: resource._id,
        name: resource.name,
        role: resource.role,
        totalAllocated,
        utilizationPercentage: Math.min(totalAllocated, 100),
        overAllocated: totalAllocated > maxCapacity,
        allocationsCount: allocations.length
      })
    }

    return res.json({ success: true, data: utilizationData })
  } catch (error) {
    return next(error)
  }
}

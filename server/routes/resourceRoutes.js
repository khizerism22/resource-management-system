import { Router } from 'express'
import {
  getAllResources,
  getAvailableResources,
  getUtilizationMetrics,
  getResourceById,
  getResourceAllocations,
  createResource,
  updateResource,
  deleteResource
} from '../controllers/resourceController.js'
import { requireAuth, checkRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', getAllResources)
router.get('/available', getAvailableResources)
router.get('/utilization', getUtilizationMetrics)
router.get('/:id', getResourceById)
router.get('/:id/allocations', getResourceAllocations)

router.post('/', checkRole('PM', 'Admin'), createResource)
router.put('/:id', checkRole('PM', 'Admin'), updateResource)
router.delete('/:id', checkRole('Admin'), deleteResource)

export default router

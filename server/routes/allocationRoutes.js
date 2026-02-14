import { Router } from 'express'
import {
  getAllAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  checkConflicts
} from '../controllers/allocationController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', getAllAllocations)
router.get('/conflicts', checkConflicts)
router.post('/', createAllocation)
router.put('/:id', updateAllocation)
router.delete('/:id', deleteAllocation)

export default router

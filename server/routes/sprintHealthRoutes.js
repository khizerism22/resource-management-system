import { Router } from 'express'
import {
  createSprintHealth,
  getSprintHealth,
  updateSprintHealth,
  getHealthHistory
} from '../controllers/sprintHealthController.js'
import { requireAuth, checkRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.post('/sprints/:sprintId/health', checkRole('PM', 'Admin', 'TeamLead'), createSprintHealth)
router.get('/sprints/:sprintId/health', getSprintHealth)
router.put('/sprints/:sprintId/health', checkRole('PM', 'Admin', 'TeamLead'), updateSprintHealth)
router.get('/sprints/:sprintId/health/history', getHealthHistory)

export default router

import { Router } from 'express'
import {
  createSprint,
  getProjectSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
  getSprintStatus
} from '../controllers/sprintController.js'
import { requireAuth, checkRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.post('/projects/:projectId/sprints', checkRole('PM', 'Admin'), createSprint)
router.get('/projects/:projectId/sprints', getProjectSprints)

router.get('/sprints/:id', getSprintById)
router.get('/sprints/:id/status', getSprintStatus)
router.put('/sprints/:id', checkRole('PM', 'Admin'), updateSprint)
router.delete('/sprints/:id', checkRole('PM', 'Admin'), deleteSprint)

export default router

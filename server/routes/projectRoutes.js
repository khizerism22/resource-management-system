import { Router } from 'express'
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectHealth
} from '../controllers/projectController.js'
import { requireAuth, checkRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', getAllProjects)
router.get('/:id', getProjectById)
router.get('/:id/health', getProjectHealth)

router.post('/', checkRole('PM', 'Admin'), createProject)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

export default router

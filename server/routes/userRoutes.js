import { Router } from 'express'
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole
} from '../controllers/userController.js'
import { requireAuth, checkRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', checkRole('Admin'), getAllUsers)
router.post('/', checkRole('Admin'), createUser)
router.delete('/:id', checkRole('Admin'), deleteUser)
router.put('/:id/role', checkRole('Admin'), changeUserRole)

router.get('/:id', getUserById)
router.put('/:id', updateUser)

export default router

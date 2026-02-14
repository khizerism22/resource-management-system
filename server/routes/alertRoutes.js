import { Router } from 'express'
import {
  getUserAlerts,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveAlert,
  deleteAlert
} from '../controllers/alertController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', getUserAlerts)
router.get('/unread-count', getUnreadCount)
router.put('/mark-all-read', markAllAsRead)
router.put('/:id/read', markAsRead)
router.put('/:id/archive', archiveAlert)
router.delete('/:id', deleteAlert)

export default router

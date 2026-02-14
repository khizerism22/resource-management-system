import { Router } from 'express'
import {
  getSprintSuccessTrend,
  getScrumMaturityTrend,
  getResourceUtilization,
  getRecurringFailures
} from '../controllers/reportController.js'
import { requireAuth, checkRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/reports/sprint-success-trend/:projectId', getSprintSuccessTrend)
router.get('/reports/scrum-maturity-trend/:projectId', getScrumMaturityTrend)
router.get('/reports/resource-utilization', checkRole('Admin', 'PM'), getResourceUtilization)
router.get('/reports/recurring-failures', checkRole('Admin', 'PM', 'TeamLead'), getRecurringFailures)

export default router

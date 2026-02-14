import { Router } from 'express'
import { getProjectHealth, getPortfolioOverview, getProjectTrends } from '../controllers/dashboardController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/dashboard/project/:id', getProjectHealth)
router.get('/dashboard/portfolio', getPortfolioOverview)
router.get('/dashboard/trends/:projectId', getProjectTrends)

export default router

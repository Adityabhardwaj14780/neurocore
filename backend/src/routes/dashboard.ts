import express from 'express';
import dashboardController from '../controllers/dashboardController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Protected routes
router.get('/', authMiddleware, dashboardController.getDashboardData);
router.put('/subscription', authMiddleware, dashboardController.updateSubscription);

export default router;
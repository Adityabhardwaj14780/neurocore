import express from 'express';
import aiController from '../controllers/aiController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Protected routes
router.post('/chat', authMiddleware, aiController.chat);
router.get('/conversation/:id', authMiddleware, aiController.getConversation);
router.get('/conversations', authMiddleware, aiController.getConversations);

export default router;
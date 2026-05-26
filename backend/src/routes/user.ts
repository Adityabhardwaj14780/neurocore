import express from 'express';
import userController from '../controllers/userController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Protected routes
router.put('/update', authMiddleware, userController.updateUser);
router.delete('/delete', authMiddleware, userController.deleteUser);

// Admin routes (protected by admin role)
router.get('/', authMiddleware, userController.getAllUsers);

export default router;
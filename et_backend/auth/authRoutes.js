import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword, updateTheme } from './authController.js';
import { verifyToken } from './authMiddleware.js';

const router = Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Protected Routes (Require valid JWT)
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);
router.put('/theme', verifyToken, updateTheme);

export default router;

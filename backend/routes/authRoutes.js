import express from 'express';
import {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
import express from 'express';
import {
  getRecommendationsBySong,
  getPersonalizedRecommendationsForUser,
  getSimilarSongsByFeatures,
  getHomeRecommendations,
  getUserStats,
} from '../controllers/recommendationController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (some with optional auth)
router.get('/song/:id', getRecommendationsBySong);
router.post('/similar', getSimilarSongsByFeatures);
router.get('/home', optionalAuth, getHomeRecommendations);

// Protected routes
router.get('/personalized', protect, getPersonalizedRecommendationsForUser);
router.get('/stats', protect, getUserStats);

export default router;
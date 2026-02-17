import express from 'express';
import {
  uploadSong,
  getAllSongs,
  getSongById,
  searchSongs,
  likeSong,
  playSong,
  getTrendingSongs,
  getSongsByGenre,
  deleteSong,
} from '../controllers/songController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadSong as uploadMiddleware, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllSongs);
router.get('/search', searchSongs);
router.get('/trending', getTrendingSongs);
router.get('/genre/:genre', getSongsByGenre);
router.get('/:id', getSongById);

// Protected routes
router.post('/upload', protect, admin, uploadMiddleware, handleUploadError, uploadSong);
router.post('/:id/like', protect, likeSong);
router.post('/:id/play', protect, playSong);
router.delete('/:id', protect, admin, deleteSong);

export default router;
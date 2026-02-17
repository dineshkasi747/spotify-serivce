import express from 'express';
import {
  createPlaylist,
  getMyPlaylists,
  getAllPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  playPlaylist,
} from '../controllers/playlistController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllPlaylists);
router.get('/:id', optionalAuth, getPlaylistById);
router.post('/:id/play', playPlaylist);

// Protected routes
router.post('/', protect, createPlaylist);
router.get('/my/all', protect, getMyPlaylists);
router.put('/:id', protect, updatePlaylist);
router.delete('/:id', protect, deletePlaylist);
router.post('/:id/songs', protect, addSongToPlaylist);
router.delete('/:id/songs/:songId', protect, removeSongFromPlaylist);

export default router;
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Song APIs
export const songAPI = {
  getAllSongs: (params) => api.get('/songs', { params }),
  getSongById: (id) => api.get(`/songs/${id}`),
  uploadSong: (formData) => api.post('/songs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateSong: (id, data) => api.put(`/songs/${id}`, data),
  deleteSong: (id) => api.delete(`/songs/${id}`),
  searchSongs: (query) => api.get(`/songs/search?q=${query}`),
  getTrendingSongs: (limit) => api.get(`/songs/trending?limit=${limit}`),
  getSongsByGenre: (genre) => api.get(`/songs/genre/${genre}`),
};

// Playlist APIs
export const playlistAPI = {
  getAllPlaylists: (params) => api.get('/playlists', { params }),
  getPlaylistById: (id) => api.get(`/playlists/${id}`),
  createPlaylist: (data) => api.post('/playlists', data),
  updatePlaylist: (id, data) => api.put(`/playlists/${id}`, data),
  deletePlaylist: (id) => api.delete(`/playlists/${id}`),
  addSongToPlaylist: (id, songId) => api.post(`/playlists/${id}/songs`, { songId }),
  removeSongFromPlaylist: (id, songId) => api.delete(`/playlists/${id}/songs/${songId}`),
};

// Recommendation APIs
export const recommendationAPI = {
  getRecommendationsBySong: (songId, limit) => 
    api.get(`/recommendations/song/${songId}?limit=${limit}`),
  getPersonalizedRecommendations: (limit) => 
    api.get(`/recommendations/personalized?limit=${limit}`),
  getHomeRecommendations: () => api.get('/recommendations/home'),
  getUserStats: () => api.get('/recommendations/stats'),
};

// User APIs (admin only)
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;
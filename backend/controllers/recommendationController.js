import Song from '../models/Song.js';
import UserInteraction from '../models/UserInteraction.js';
import {
  getRecommendations,
  getPersonalizedRecommendations,
  getSimilarSongs,
} from '../utils/mlService.js';

// @desc    Get recommendations based on a song
// @route   GET /api/recommendations/song/:id
// @access  Public
export const getRecommendationsBySong = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Check if song exists
    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    // Get recommendations from ML service
    const mlResponse = await getRecommendations(id, limit);

    if (!mlResponse.success) {
      // Fallback: Use genre-based recommendations
      const fallbackSongs = await Song.find({
        genre: song.genre,
        _id: { $ne: song._id },
      })
        .sort({ playCount: -1 })
        .limit(limit)
        .select('title artist genre imageUrl audioUrl playCount likeCount features');

      return res.status(200).json({
        success: true,
        message: 'Using fallback recommendations (genre-based)',
        recommendations: fallbackSongs,
      });
    }

    // Fetch full song details for recommended song IDs
    const recommendedIds = mlResponse.data.recommendations;
    const recommendations = await Song.find({ _id: { $in: recommendedIds } })
      .select('title artist genre imageUrl audioUrl playCount likeCount features');

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message,
    });
  }
};

// @desc    Get personalized recommendations for user
// @route   GET /api/recommendations/personalized
// @access  Private
export const getPersonalizedRecommendationsForUser = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const userId = req.user._id.toString();

    // Get user's listening history
    const userInteractions = await UserInteraction.find({
      user: req.user._id,
      interactionType: { $in: ['play', 'like'] },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('song');

    if (userInteractions.length === 0) {
      // New user: return trending songs
      const trendingSongs = await Song.find()
        .sort({ playCount: -1 })
        .limit(limit)
        .select('title artist genre imageUrl audioUrl playCount likeCount features');

      return res.status(200).json({
        success: true,
        message: 'Showing trending songs (no listening history yet)',
        recommendations: trendingSongs,
      });
    }

    // Get personalized recommendations from ML service
    const mlResponse = await getPersonalizedRecommendations(userId, limit);

    if (!mlResponse.success) {
      // Fallback: Use content-based filtering
      const likedSongIds = userInteractions
        .filter((i) => i.interactionType === 'like')
        .map((i) => i.song._id);

      const likedSongs = await Song.find({ _id: { $in: likedSongIds } });
      const genres = [...new Set(likedSongs.map((s) => s.genre))];

      const fallbackSongs = await Song.find({
        genre: { $in: genres },
        _id: { $nin: likedSongIds },
      })
        .sort({ playCount: -1 })
        .limit(limit)
        .select('title artist genre imageUrl audioUrl playCount likeCount features');

      return res.status(200).json({
        success: true,
        message: 'Using fallback recommendations (content-based)',
        recommendations: fallbackSongs,
      });
    }

    // Fetch full song details
    const recommendedIds = mlResponse.data.recommendations;
    const recommendations = await Song.find({ _id: { $in: recommendedIds } })
      .select('title artist genre imageUrl audioUrl playCount likeCount features');

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get personalized recommendations',
      error: error.message,
    });
  }
};

// @desc    Get similar songs based on audio features
// @route   POST /api/recommendations/similar
// @access  Public
export const getSimilarSongsByFeatures = async (req, res) => {
  try {
    const { features } = req.body;
    const limit = parseInt(req.query.limit) || 10;

    if (!features) {
      return res.status(400).json({
        success: false,
        message: 'Please provide audio features',
      });
    }

    // Get similar songs from ML service
    const mlResponse = await getSimilarSongs(features, limit);

    if (!mlResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'ML service unavailable',
      });
    }

    // Fetch full song details
    const recommendedIds = mlResponse.data.recommendations;
    const recommendations = await Song.find({ _id: { $in: recommendedIds } })
      .select('title artist genre imageUrl audioUrl playCount likeCount features');

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('Get similar songs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get similar songs',
      error: error.message,
    });
  }
};

// @desc    Get recommendations for home screen
// @route   GET /api/recommendations/home
// @access  Private (optional auth)
export const getHomeRecommendations = async (req, res) => {
  try {
    const limit = 10;

    // Get trending songs
    const trending = await Song.find()
      .sort({ playCount: -1 })
      .limit(limit)
      .select('title artist genre imageUrl audioUrl playCount likeCount');

    // Get recently added songs
    const recentlyAdded = await Song.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title artist genre imageUrl audioUrl playCount likeCount');

    let personalized = [];
    let recentlyPlayed = [];

    // If user is authenticated, get personalized recommendations
    if (req.user) {
      // Get recently played
      const userInteractions = await UserInteraction.find({
        user: req.user._id,
        interactionType: 'play',
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('song', 'title artist genre imageUrl audioUrl playCount likeCount');

      recentlyPlayed = userInteractions
        .map((i) => i.song)
        .filter((song) => song !== null);

      // Get personalized recommendations
      const mlResponse = await getPersonalizedRecommendations(
        req.user._id.toString(),
        limit
      );

      if (mlResponse.success) {
        const recommendedIds = mlResponse.data.recommendations;
        personalized = await Song.find({ _id: { $in: recommendedIds } })
          .select('title artist genre imageUrl audioUrl playCount likeCount')
          .limit(limit);
      }
    }

    // Get songs by popular genres
    const genres = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical'];
    const genreSections = await Promise.all(
      genres.map(async (genre) => {
        const songs = await Song.find({ genre })
          .sort({ playCount: -1 })
          .limit(10)
          .select('title artist genre imageUrl audioUrl playCount likeCount');
        return {
          genre,
          songs,
        };
      })
    );

    res.status(200).json({
      success: true,
      sections: {
        trending,
        recentlyAdded,
        recentlyPlayed,
        personalized,
        genres: genreSections.filter((g) => g.songs.length > 0),
      },
    });
  } catch (error) {
    console.error('Get home recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get home recommendations',
      error: error.message,
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/recommendations/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    // Total plays
    const totalPlays = await UserInteraction.countDocuments({
      user: req.user._id,
      interactionType: 'play',
    });

    // Total likes
    const totalLikes = await UserInteraction.countDocuments({
      user: req.user._id,
      interactionType: 'like',
    });

    // Total listening time (in seconds)
    const listeningTimeResult = await UserInteraction.aggregate([
      {
        $match: {
          user: req.user._id,
          interactionType: 'play',
        },
      },
      {
        $group: {
          _id: null,
          totalTime: { $sum: '$listenDuration' },
        },
      },
    ]);

    const totalListeningTime = listeningTimeResult[0]?.totalTime || 0;

    // Top genres
    const topGenresResult = await UserInteraction.aggregate([
      {
        $match: {
          user: req.user._id,
          interactionType: 'play',
        },
      },
      {
        $lookup: {
          from: 'songs',
          localField: 'song',
          foreignField: '_id',
          as: 'songData',
        },
      },
      {
        $unwind: '$songData',
      },
      {
        $group: {
          _id: '$songData.genre',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Top artists
    const topArtistsResult = await UserInteraction.aggregate([
      {
        $match: {
          user: req.user._id,
          interactionType: 'play',
        },
      },
      {
        $lookup: {
          from: 'songs',
          localField: 'song',
          foreignField: '_id',
          as: 'songData',
        },
      },
      {
        $unwind: '$songData',
      },
      {
        $group: {
          _id: '$songData.artist',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalPlays,
        totalLikes,
        totalListeningTime,
        totalListeningHours: (totalListeningTime / 3600).toFixed(2),
        topGenres: topGenresResult.map((g) => ({
          genre: g._id,
          plays: g.count,
        })),
        topArtists: topArtistsResult.map((a) => ({
          artist: a._id,
          plays: a.count,
        })),
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message,
    });
  }
};
import Song from '../models/Song.js';
import User from '../models/User.js';
import UserInteraction from '../models/UserInteraction.js';
import cloudinary from '../config/cloudinary.js';
import { getRecommendations } from '../utils/mlService.js';

// @desc    Upload a new song
// @route   POST /api/songs/upload
// @access  Private (Admin only)
export const uploadSong = async (req, res) => {
  try {
    const {
      title,
      artist,
      album,
      genre,
      duration,
      releaseYear,
      danceability,
      energy,
      acousticness,
      instrumentalness,
      valence,
      tempo,
      speechiness,
      liveness,
      loudness,
    } = req.body;

    // Check if files are uploaded
    if (!req.files || !req.files.audio) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an audio file',
      });
    }

    // Upload audio to Cloudinary
    const audioFile = req.files.audio[0];
    const audioUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Audio files are uploaded as video type
          folder: 'music-player/audio',
          format: 'mp3',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(audioFile.buffer);
    });

    let imageUpload = null;
    // Upload image to Cloudinary if provided
    if (req.files.image) {
      const imageFile = req.files.image[0];
      imageUpload = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'music-player/images',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(imageFile.buffer);
      });
    }

    // Create song in database
    const song = await Song.create({
      title,
      artist,
      album,
      genre,
      duration: duration || 0,
      releaseYear: releaseYear || new Date().getFullYear(),
      audioUrl: audioUpload.secure_url,
      imageUrl: imageUpload ? imageUpload.secure_url : '',
      cloudinaryPublicId: {
        audio: audioUpload.public_id,
        image: imageUpload ? imageUpload.public_id : '',
      },
      features: {
        danceability: danceability || 0.5,
        energy: energy || 0.5,
        acousticness: acousticness || 0.5,
        instrumentalness: instrumentalness || 0.5,
        valence: valence || 0.5,
        tempo: tempo || 120,
        speechiness: speechiness || 0.5,
        liveness: liveness || 0.5,
        loudness: loudness || -10,
      },
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Song uploaded successfully',
      song,
    });
  } catch (error) {
    console.error('Upload song error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload song',
      error: error.message,
    });
  }
};

// @desc    Get all songs with pagination and filters
// @route   GET /api/songs
// @access  Public
export const getAllSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    if (req.query.genre) filter.genre = req.query.genre;
    if (req.query.artist) filter.artist = new RegExp(req.query.artist, 'i');
    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { artist: new RegExp(req.query.search, 'i') },
        { album: new RegExp(req.query.search, 'i') },
      ];
    }

    // Sort options
    let sort = { createdAt: -1 }; // Default: newest first
    if (req.query.sort === 'popular') sort = { playCount: -1 };
    if (req.query.sort === 'likes') sort = { likeCount: -1 };
    if (req.query.sort === 'title') sort = { title: 1 };

    const songs = await Song.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name');

    const total = await Song.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: songs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      songs,
    });
  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get songs',
      error: error.message,
    });
  }
};

// @desc    Get single song by ID with recommendations
// @route   GET /api/songs/:id
// @access  Public
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy', 'name email');

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    // Get recommendations from ML service
    const mlResponse = await getRecommendations(song._id.toString(), 5);
    
    let recommendations = [];
    if (mlResponse.success && mlResponse.data.recommendations) {
      // Fetch full song details for recommended song IDs
      const recommendedIds = mlResponse.data.recommendations;
      recommendations = await Song.find({ _id: { $in: recommendedIds } })
        .select('title artist genre imageUrl audioUrl playCount likeCount')
        .limit(5);
    }

    res.status(200).json({
      success: true,
      song,
      recommendations,
    });
  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get song',
      error: error.message,
    });
  }
};

// @desc    Search songs
// @route   GET /api/songs/search
// @access  Public
export const searchSongs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide search query',
      });
    }

    const songs = await Song.find({
      $text: { $search: q },
    })
      .limit(20)
      .select('title artist album genre imageUrl audioUrl playCount likeCount');

    res.status(200).json({
      success: true,
      count: songs.length,
      songs,
    });
  } catch (error) {
    console.error('Search songs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search songs',
      error: error.message,
    });
  }
};

// @desc    Like a song
// @route   POST /api/songs/:id/like
// @access  Private
export const likeSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    const user = await User.findById(req.user._id);

    // Check if already liked
    const alreadyLiked = user.likedSongs.includes(song._id);

    if (alreadyLiked) {
      // Unlike
      user.likedSongs = user.likedSongs.filter(
        (id) => id.toString() !== song._id.toString()
      );
      song.likeCount = Math.max(0, song.likeCount - 1);
    } else {
      // Like
      user.likedSongs.push(song._id);
      song.likeCount += 1;

      // Record interaction
      await UserInteraction.create({
        user: user._id,
        song: song._id,
        interactionType: 'like',
      });
    }

    await user.save();
    await song.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Song unliked' : 'Song liked',
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error('Like song error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like song',
      error: error.message,
    });
  }
};

// @desc    Play a song (track interaction)
// @route   POST /api/songs/:id/play
// @access  Private
export const playSong = async (req, res) => {
  try {
    const { listenDuration, completionRate, context, deviceType } = req.body;

    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    // Increment play count
    song.playCount += 1;
    await song.save();

    // Add to user play history
    const user = await User.findById(req.user._id);
    user.playHistory.unshift({
      song: song._id,
      playedAt: new Date(),
    });

    // Keep only last 100 plays
    if (user.playHistory.length > 100) {
      user.playHistory = user.playHistory.slice(0, 100);
    }

    await user.save();

    // Record interaction
    await UserInteraction.create({
      user: user._id,
      song: song._id,
      interactionType: 'play',
      listenDuration: listenDuration || 0,
      completionRate: completionRate || 0,
      context: context || 'direct',
      deviceType: deviceType || 'web',
    });

    res.status(200).json({
      success: true,
      message: 'Play recorded',
    });
  } catch (error) {
    console.error('Play song error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record play',
      error: error.message,
    });
  }
};

// @desc    Get trending songs
// @route   GET /api/songs/trending
// @access  Public
export const getTrendingSongs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get songs with highest play count in last 7 days
    const songs = await Song.find()
      .sort({ playCount: -1, likeCount: -1 })
      .limit(limit)
      .select('title artist genre imageUrl audioUrl playCount likeCount');

    res.status(200).json({
      success: true,
      count: songs.length,
      songs,
    });
  } catch (error) {
    console.error('Get trending songs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending songs',
      error: error.message,
    });
  }
};

// @desc    Get songs by genre
// @route   GET /api/songs/genre/:genre
// @access  Public
export const getSongsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const songs = await Song.find({ genre })
      .sort({ playCount: -1 })
      .limit(limit)
      .select('title artist album imageUrl audioUrl playCount likeCount');

    res.status(200).json({
      success: true,
      count: songs.length,
      genre,
      songs,
    });
  } catch (error) {
    console.error('Get songs by genre error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get songs by genre',
      error: error.message,
    });
  }
};

// @desc    Delete a song
// @route   DELETE /api/songs/:id
// @access  Private (Admin only)
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    // Delete from Cloudinary
    if (song.cloudinaryPublicId.audio) {
      await cloudinary.uploader.destroy(song.cloudinaryPublicId.audio, {
        resource_type: 'video',
      });
    }
    if (song.cloudinaryPublicId.image) {
      await cloudinary.uploader.destroy(song.cloudinaryPublicId.image);
    }

    await song.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Song deleted successfully',
    });
  } catch (error) {
    console.error('Delete song error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete song',
      error: error.message,
    });
  }
};

// ================================================================
// ADD THIS TO THE BOTTOM OF YOUR songController.js
// Also run: npm install node-fetch
// Add to .env: MUSIXMATCH_API_KEY=your_key_here
// Free key at: https://developer.musixmatch.com/signup
// ================================================================

// @desc    Get synced lyrics for a song via Musixmatch
// @route   GET /api/songs/:id/lyrics
// @access  Public
// ================================================================
// ADD THIS TO THE BOTTOM OF YOUR songController.js
// Uses lrclib.net — completely FREE, no API key, no signup needed
// Supports synced (timestamped) lyrics!
// ================================================================

// @desc    Get synced lyrics for a song via lrclib.net (free, no key needed)
// @route   GET /api/songs/:id/lyrics
// @access  Public
export const getSongLyrics = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    const title    = encodeURIComponent(song.title);
    const artist   = encodeURIComponent(song.artist);
    const album    = encodeURIComponent(song.album || '');
    const duration = song.duration || 0;

    // lrclib.net — free, no API key required
    // Try exact match first (with duration for accuracy)
    let url = `https://lrclib.net/api/get?artist_name=${artist}&track_name=${title}&album_name=${album}&duration=${duration}`;
    let response = await fetch(url, {
      headers: { 'User-Agent': 'SpotifyCloneApp/1.0 (https://github.com/yourrepo)' }
    });

    // If not found, try without album/duration (looser search)
    if (!response.ok || response.status === 404) {
      url = `https://lrclib.net/api/search?artist_name=${artist}&track_name=${title}`;
      response = await fetch(url, {
        headers: { 'User-Agent': 'SpotifyCloneApp/1.0 (https://github.com/yourrepo)' }
      });

      if (response.ok) {
        const results = await response.json();
        if (!results || results.length === 0) {
          return res.json({ success: false, message: 'Lyrics not found for this song' });
        }
        // Use first result
        const best = results[0];
        return sendLyricsResponse(res, best);
      }

      return res.json({ success: false, message: 'Lyrics not found for this song' });
    }

    const data = await response.json();
    return sendLyricsResponse(res, data);

  } catch (error) {
    console.error('Get lyrics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lyrics', error: error.message });
  }
};

/**
 * Formats the lrclib response and sends it to the client.
 * Prefers synced lyrics (LRC) over plain lyrics.
 */
function sendLyricsResponse(res, data) {
  // lrclib returns: { syncedLyrics: "[00:12.34] line...", plainLyrics: "line\nline..." }
  if (data.syncedLyrics) {
    const lines = parseLRC(data.syncedLyrics);
    if (lines.length > 0) {
      return res.json({
        success: true,
        data: { synced: true, lines }
      });
    }
  }

  // Fallback to plain lyrics
  if (data.plainLyrics) {
    const lines = data.plainLyrics
      .split('\n')
      .filter(l => l.trim() !== '')
      .map(text => ({ time: null, text }));
    return res.json({
      success: true,
      data: { synced: false, lines }
    });
  }

  return res.json({ success: false, message: 'Lyrics not available for this song' });
}

/**
 * Parses LRC format string into array of { time: ms, text: string }
 * LRC format: [mm:ss.xx] lyric text
 */
function parseLRC(lrc) {
  const lines = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
  let match;
  while ((match = regex.exec(lrc)) !== null) {
    const minutes      = parseInt(match[1]);
    const seconds      = parseInt(match[2]);
    const centiseconds = parseInt(match[3]);
    const timeMs       = (minutes * 60 + seconds) * 1000 + centiseconds * 10;
    const text         = match[4].trim();
    if (text) lines.push({ time: timeMs, text });
  }
  return lines;
}
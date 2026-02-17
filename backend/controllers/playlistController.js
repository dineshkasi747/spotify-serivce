import Playlist from '../models/Playlist.js';
import Song from '../models/Song.js';

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
export const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, coverImage } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a playlist name',
      });
    }

    const playlist = await Playlist.create({
      name,
      description: description || '',
      isPublic: isPublic !== undefined ? isPublic : true,
      coverImage: coverImage || '',
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Playlist created successfully',
      playlist,
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create playlist',
      error: error.message,
    });
  }
};

// @desc    Get all playlists for current user
// @route   GET /api/playlists/my
// @access  Private
export const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate('songs.song', 'title artist imageUrl duration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: playlists.length,
      playlists,
    });
  } catch (error) {
    console.error('Get my playlists error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get playlists',
      error: error.message,
    });
  }
};

// @desc    Get all public playlists
// @route   GET /api/playlists
// @access  Public
export const getAllPlaylists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const playlists = await Playlist.find({ isPublic: true })
      .populate('owner', 'name profilePicture')
      .populate('songs.song', 'title artist imageUrl')
      .sort({ playCount: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Playlist.countDocuments({ isPublic: true });

    res.status(200).json({
      success: true,
      count: playlists.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      playlists,
    });
  } catch (error) {
    console.error('Get all playlists error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get playlists',
      error: error.message,
    });
  }
};

// @desc    Get single playlist by ID
// @route   GET /api/playlists/:id
// @access  Public
export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('owner', 'name email profilePicture')
      .populate('songs.song', 'title artist album genre imageUrl audioUrl duration playCount')
      .populate('collaborators', 'name profilePicture');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check if user has access to private playlist
    if (!playlist.isPublic) {
      if (!req.user || req.user._id.toString() !== playlist.owner._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this playlist',
        });
      }
    }

    res.status(200).json({
      success: true,
      playlist,
    });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get playlist',
      error: error.message,
    });
  }
};

// @desc    Update playlist
// @route   PUT /api/playlists/:id
// @access  Private
export const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this playlist',
      });
    }

    const { name, description, isPublic, coverImage } = req.body;

    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (coverImage !== undefined) playlist.coverImage = coverImage;

    await playlist.save();

    res.status(200).json({
      success: true,
      message: 'Playlist updated successfully',
      playlist,
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update playlist',
      error: error.message,
    });
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private
export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this playlist',
      });
    }

    await playlist.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Playlist deleted successfully',
    });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete playlist',
      error: error.message,
    });
  }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
// @access  Private
export const addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a song ID',
      });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this playlist',
      });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    // Check if song already in playlist
    const songExists = playlist.songs.some(
      (item) => item.song.toString() === songId
    );

    if (songExists) {
      return res.status(400).json({
        success: false,
        message: 'Song already in playlist',
      });
    }

    // Add song
    playlist.songs.push({
      song: songId,
      addedAt: new Date(),
    });

    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlist._id)
      .populate('songs.song', 'title artist imageUrl duration');

    res.status(200).json({
      success: true,
      message: 'Song added to playlist',
      playlist: updatedPlaylist,
    });
  } catch (error) {
    console.error('Add song to playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add song to playlist',
      error: error.message,
    });
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { id, songId } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this playlist',
      });
    }

    // Remove song
    playlist.songs = playlist.songs.filter(
      (item) => item.song.toString() !== songId
    );

    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlist._id)
      .populate('songs.song', 'title artist imageUrl duration');

    res.status(200).json({
      success: true,
      message: 'Song removed from playlist',
      playlist: updatedPlaylist,
    });
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove song from playlist',
      error: error.message,
    });
  }
};

// @desc    Increment playlist play count
// @route   POST /api/playlists/:id/play
// @access  Public
export const playPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    playlist.playCount += 1;
    await playlist.save();

    res.status(200).json({
      success: true,
      message: 'Playlist play recorded',
    });
  } catch (error) {
    console.error('Play playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record playlist play',
      error: error.message,
    });
  }
};
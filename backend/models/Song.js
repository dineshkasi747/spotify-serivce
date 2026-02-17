import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a song title'],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, 'Please provide an artist name'],
      trim: true,
    },
    album: {
      type: String,
      default: '',
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Please provide a genre'],
      trim: true,
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0,
    },
    releaseYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    audioUrl: {
      type: String,
      required: [true, 'Please provide an audio URL'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    cloudinaryPublicId: {
      audio: String,
      image: String,
    },
    // Audio features for ML-based recommendations
    features: {
      danceability: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5,
      },
      energy: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5,
      },
      acousticness: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5,
      },
      instrumentalness: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5,
      },
      valence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5,
      },
      tempo: {
        type: Number,
        min: 0,
        max: 250,
        default: 120,
      },
      speechiness: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5,
      },
      liveness: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5,
      },
      loudness: {
        type: Number,
        min: -60,
        max: 0,
        default: -10,
      },
    },
    playCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
songSchema.index({ title: 'text', artist: 'text', album: 'text' });
songSchema.index({ genre: 1 });
songSchema.index({ playCount: -1 });

const Song = mongoose.model('Song', songSchema);

export default Song;
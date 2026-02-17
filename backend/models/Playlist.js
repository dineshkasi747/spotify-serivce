import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a playlist name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    songs: [
      {
        song: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Song',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    playCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
playlistSchema.index({ owner: 1 });
playlistSchema.index({ name: 'text', description: 'text' });

// Virtual for song count
playlistSchema.virtual('songCount').get(function () {
  return this.songs.length;
});

// Ensure virtuals are included in JSON
playlistSchema.set('toJSON', { virtuals: true });
playlistSchema.set('toObject', { virtuals: true });

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;
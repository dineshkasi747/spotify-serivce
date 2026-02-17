import mongoose from 'mongoose';

const userInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
      required: true,
    },
    interactionType: {
      type: String,
      enum: ['play', 'like', 'dislike', 'skip', 'complete'],
      required: true,
    },
    // How long the user listened (in seconds)
    listenDuration: {
      type: Number,
      default: 0,
    },
    // Percentage of song completed (0-100)
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Context of interaction
    context: {
      type: String,
      enum: ['search', 'recommendation', 'playlist', 'album', 'artist', 'direct'],
      default: 'direct',
    },
    deviceType: {
      type: String,
      enum: ['android', 'web', 'ios'],
      default: 'web',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for faster queries
userInteractionSchema.index({ user: 1, song: 1 });
userInteractionSchema.index({ user: 1, interactionType: 1 });
userInteractionSchema.index({ song: 1, interactionType: 1 });
userInteractionSchema.index({ createdAt: -1 });

// Static method to get user listening stats
userInteractionSchema.statics.getUserStats = async function (userId) {
  return await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$interactionType',
        count: { $sum: 1 },
        totalListenTime: { $sum: '$listenDuration' },
      },
    },
  ]);
};

// Static method to get song popularity
userInteractionSchema.statics.getSongPopularity = async function (songId) {
  return await this.aggregate([
    { $match: { song: mongoose.Types.ObjectId(songId) } },
    {
      $group: {
        _id: '$interactionType',
        count: { $sum: 1 },
      },
    },
  ]);
};

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

export default UserInteraction;
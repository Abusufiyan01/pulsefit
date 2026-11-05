/**
 * Achievement Mongoose Model
 */
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Achievement must belong to a user'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Achievement type is required'],
    },
    name: {
      type: String,
      required: [true, 'Achievement name is required'],
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required'],
    },
    icon: {
      type: String,
      default: '🏆',
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

achievementSchema.index({ user: 1, type: 1 }, { unique: true });

const Achievement = mongoose.model('Achievement', achievementSchema);
module.exports = Achievement;

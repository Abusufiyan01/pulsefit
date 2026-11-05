/**
 * ProgressPhoto Mongoose Model
 */
const mongoose = require('mongoose');
const { PHOTO_TAGS } = require('../config/constants');

const progressPhotoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Progress photo must belong to a user'],
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    photoUrl: {
      type: String,
      required: [true, 'Photo URL is required'],
    },
    photoPublicId: {
      type: String,
      default: '',
    },
    weight: {
      type: Number,
      min: 20,
    },
    notes: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
        enum: PHOTO_TAGS,
      },
    ],
  },
  {
    timestamps: true,
  }
);

progressPhotoSchema.index({ user: 1, date: -1 });

const ProgressPhoto = mongoose.model('ProgressPhoto', progressPhotoSchema);
module.exports = ProgressPhoto;

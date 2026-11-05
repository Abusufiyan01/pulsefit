/**
 * PersonalRecord Mongoose Model
 */
const mongoose = require('mongoose');
const { PR_TYPES } = require('../config/constants');

const personalRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'PR must belong to a user'],
      index: true,
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: [true, 'Exercise is required for PR'],
      index: true,
    },
    exerciseName: {
      type: String,
      required: [true, 'Exercise name is required'],
    },
    type: {
      type: String,
      enum: PR_TYPES,
      required: [true, 'PR type is required'],
    },
    value: {
      type: Number,
      required: [true, 'PR value is required'],
      min: 0,
    },
    weight: {
      type: Number,
      default: 0,
      min: 0,
    },
    reps: {
      type: Number,
      default: 0,
      min: 0,
    },
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      default: null,
    },
    achievedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

personalRecordSchema.index({ user: 1, exerciseId: 1, type: 1 });

const PersonalRecord = mongoose.model('PersonalRecord', personalRecordSchema);
module.exports = PersonalRecord;

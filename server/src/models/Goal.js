/**
 * Goal Mongoose Model
 */
const mongoose = require('mongoose');
const { GOAL_TYPES } = require('../config/constants');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Goal must belong to a user'],
      index: true,
    },
    type: {
      type: String,
      enum: GOAL_TYPES,
      required: [true, 'Goal type is required'],
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ user: 1, isCompleted: 1 });

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;

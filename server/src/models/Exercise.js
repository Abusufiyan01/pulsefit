/**
 * Exercise Mongoose Model
 */
const mongoose = require('mongoose');
const {
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  DIFFICULTY_LEVELS,
  EXERCISE_CATEGORIES,
} = require('../config/constants');

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      unique: true,
      trim: true,
    },
    muscleGroup: {
      primary: {
        type: String,
        required: [true, 'Primary muscle group is required'],
        enum: MUSCLE_GROUPS,
      },
      secondary: [
        {
          type: String,
          enum: MUSCLE_GROUPS,
        },
      ],
    },
    equipment: {
      type: String,
      required: [true, 'Equipment is required'],
      enum: EQUIPMENT_TYPES,
      default: 'bodyweight',
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      default: 'beginner',
    },
    category: {
      type: String,
      enum: EXERCISE_CATEGORIES,
      default: 'strength',
    },
    instructions: {
      type: [String],
      default: [],
    },
    tips: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster searching
exerciseSchema.index({ name: 'text' });
exerciseSchema.index({ 'muscleGroup.primary': 1, category: 1 });
exerciseSchema.index({ isCustom: 1, createdBy: 1 });

const Exercise = mongoose.model('Exercise', exerciseSchema);
module.exports = Exercise;

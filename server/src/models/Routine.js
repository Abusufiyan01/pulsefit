/**
 * Routine Mongoose Model
 */
const mongoose = require('mongoose');
const { DIFFICULTY_LEVELS } = require('../config/constants');

const routineSetSchema = new mongoose.Schema(
  {
    targetWeight: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetReps: {
      type: Number,
      default: 10,
      min: 1,
    },
    targetRpe: {
      type: Number,
      default: 8,
      min: 1,
      max: 10,
    },
  },
  { _id: false }
);

const routineExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
    },
    exerciseName: {
      type: String,
      required: [true, 'Exercise name is required in routine'],
    },
    sets: [routineSetSchema],
    notes: {
      type: String,
      default: '',
    },
    restSeconds: {
      type: Number,
      default: 90,
      min: 0,
    },
  },
  { _id: false }
);

const routineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Routine name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    exercises: [routineExerciseSchema],
    isPrebuilt: {
      type: Boolean,
      default: false,
      index: true,
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      default: 'beginner',
    },
    estimatedDuration: {
      type: Number,
      default: 45, // in minutes
      min: 5,
    },
  },
  {
    timestamps: true,
  }
);

routineSchema.index({ user: 1, isPrebuilt: 1 });

const Routine = mongoose.model('Routine', routineSchema);
module.exports = Routine;

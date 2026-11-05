/**
 * Workout Mongoose Model
 */
const mongoose = require('mongoose');

const workoutSetSchema = new mongoose.Schema(
  {
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
    rpe: {
      type: Number,
      min: 1,
      max: 10,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    isWarmup: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const workoutExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
    },
    exerciseName: {
      type: String,
      required: [true, 'Exercise name is required'],
    },
    sets: [workoutSetSchema],
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Workout must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Workout title is required'],
      trim: true,
    },
    exercises: [workoutExerciseSchema],
    duration: {
      type: Number,
      default: 45, // in minutes
      min: 0,
    },
    totalVolume: {
      type: Number,
      default: 0,
      min: 0,
    },
    caloriesBurned: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: true,
    },
    fromTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      default: null,
    },
    prsHit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate total volume if not set or modified
workoutSchema.pre('save', function (next) {
  if (this.exercises && this.exercises.length > 0) {
    let volume = 0;
    this.exercises.forEach((ex) => {
      if (ex.sets && Array.isArray(ex.sets)) {
        ex.sets.forEach((set) => {
          if (set.completed && !set.isWarmup) {
            volume += (Number(set.weight) || 0) * (Number(set.reps) || 0);
          }
        });
      }
    });
    this.totalVolume = Math.round(volume);
  }
  next();
});

workoutSchema.index({ user: 1, startTime: -1 });

const Workout = mongoose.model('Workout', workoutSchema);
module.exports = Workout;

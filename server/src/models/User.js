/**
 * User Mongoose Model
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateDailyCalorieTarget,
  calculateMacros,
  calculateWaterTarget,
} = require('../utils/fitness');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    age: {
      type: Number,
      default: 25,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Age cannot exceed 120'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    height: {
      type: Number, // in centimeters
      default: 175,
      min: [50, 'Height must be at least 50 cm'],
      max: [280, 'Height cannot exceed 280 cm'],
    },
    weight: {
      type: Number, // in kilograms
      default: 70,
      min: [20, 'Weight must be at least 20 kg'],
      max: [400, 'Weight cannot exceed 400 kg'],
    },
    unitPreference: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric',
    },
    goal: {
      type: String,
      enum: ['lose_fat', 'build_muscle', 'maintain', 'improve_endurance'],
      default: 'build_muscle',
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    workoutDaysPerWeek: {
      type: Number,
      default: 4,
      min: [1, 'Workout days per week must be between 1 and 7'],
      max: [7, 'Workout days per week cannot exceed 7'],
    },
    availableEquipment: {
      type: [String],
      default: ['barbell', 'dumbbell', 'bodyweight'],
    },
    bmi: {
      type: Number,
      default: 22.86,
    },
    bmr: {
      type: Number,
      default: 1720,
    },
    tdee: {
      type: Number,
      default: 2666,
    },
    dailyCalorieTarget: {
      type: Number,
      default: 2966,
    },
    macroTargets: {
      protein: {
        type: Number,
        default: 154, // grams
      },
      carbs: {
        type: Number,
        default: 367, // grams
      },
      fat: {
        type: Number,
        default: 82, // grams
      },
    },
    waterTarget: {
      type: Number,
      default: 2500, // ml
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWorkouts: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastWorkoutDate: {
      type: Date,
      default: null,
    },
    isOnboardingComplete: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    notifications: {
      workoutReminder: {
        type: Boolean,
        default: true,
      },
      reminderTime: {
        type: String,
        default: '08:00',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Method to recalculate all fitness metrics
userSchema.methods.recalculateFitnessMetrics = function () {
  this.bmi = calculateBMI(this.weight, this.height);
  this.bmr = calculateBMR(this.weight, this.height, this.age, this.gender);
  this.tdee = calculateTDEE(this.bmr, this.workoutDaysPerWeek);
  this.dailyCalorieTarget = calculateDailyCalorieTarget(this.tdee, this.goal);
  this.macroTargets = calculateMacros(this.dailyCalorieTarget, this.weight);
  this.waterTarget = calculateWaterTarget(this.weight);
};

// Pre-save middleware to hash password and recalculate metrics
userSchema.pre('save', async function (next) {
  try {
    // If fitness profile fields were modified, recalculate metrics
    if (
      this.isModified('weight') ||
      this.isModified('height') ||
      this.isModified('age') ||
      this.isModified('gender') ||
      this.isModified('goal') ||
      this.isModified('workoutDaysPerWeek') ||
      this.isNew
    ) {
      this.recalculateFitnessMetrics();
    }

    // Only hash password if it was modified (or is new)
    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare candidate password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

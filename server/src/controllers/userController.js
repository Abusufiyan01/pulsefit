/**
 * User Controller
 */
const fs = require('fs');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Routine = require('../models/Routine');
const FoodLog = require('../models/FoodLog');
const WaterLog = require('../models/WaterLog');
const BodyMetric = require('../models/BodyMetric');
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');
const ProgressPhoto = require('../models/ProgressPhoto');
const PersonalRecord = require('../models/PersonalRecord');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userSafe = req.user.toObject();
    delete userSafe.password;
    delete userSafe.refreshToken;
    return successResponse(res, userSafe, 'Profile retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Update profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const allowedFields = [
      'name',
      'age',
      'gender',
      'height',
      'weight',
      'unitPreference',
      'goal',
      'experienceLevel',
      'workoutDaysPerWeek',
      'availableEquipment',
      'notifications',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    user.isOnboardingComplete = true;
    user.recalculateFitnessMetrics();
    await user.save();

    const userSafe = user.toObject();
    delete userSafe.password;
    delete userSafe.refreshToken;

    return successResponse(res, userSafe, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required.', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters.', 400);
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password does not match.', 400);
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, null, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Update Avatar
 */
const updateAvatar = async (req, res, next) => {
  try {
    let avatarUrl = req.body.avatar;

    if (req.file) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    if (!avatarUrl) {
      return errorResponse(res, 'No avatar file or URL provided.', 400);
    }

    const user = await User.findById(req.user._id);

    // Clean up old uploaded avatar if replaced
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldAvatarRel = user.avatar.replace(/^\/uploads\//, '');
      const oldAvatarPath = path.resolve(__dirname, '../../uploads', oldAvatarRel);
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
        } catch (_err) {
          // Ignore unlink errors on non-existent files
        }
      }
    }

    user.avatar = avatarUrl;
    await user.save();

    return successResponse(res, { avatar: avatarUrl }, 'Avatar updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Export all user data as JSON
 */
const exportData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      workouts,
      routines,
      foodLogs,
      waterLogs,
      bodyMetrics,
      goals,
      achievements,
      progressPhotos,
      personalRecords,
    ] = await Promise.all([
      Workout.find({ user: userId }),
      Routine.find({ user: userId }),
      FoodLog.find({ user: userId }),
      WaterLog.find({ user: userId }),
      BodyMetric.find({ user: userId }),
      Goal.find({ user: userId }),
      Achievement.find({ user: userId }),
      ProgressPhoto.find({ user: userId }),
      PersonalRecord.find({ user: userId }),
    ]);

    const userSafe = req.user.toObject();
    delete userSafe.password;
    delete userSafe.refreshToken;

    const exportPayload = {
      profile: userSafe,
      workouts,
      routines,
      foodLogs,
      waterLogs,
      bodyMetrics,
      goals,
      achievements,
      progressPhotos,
      personalRecords,
      exportedAt: new Date().toISOString(),
    };

    return successResponse(res, exportPayload, 'User data exported successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Delete user account and all related records
 */
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Workout.deleteMany({ user: userId }),
      Routine.deleteMany({ user: userId }),
      FoodLog.deleteMany({ user: userId }),
      WaterLog.deleteMany({ user: userId }),
      BodyMetric.deleteMany({ user: userId }),
      Goal.deleteMany({ user: userId }),
      Achievement.deleteMany({ user: userId }),
      ProgressPhoto.deleteMany({ user: userId }),
      PersonalRecord.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId),
    ]);

    return successResponse(res, null, 'Account and all associated data have been permanently deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  updateAvatar,
  exportData,
  deleteAccount,
};

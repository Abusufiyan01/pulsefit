/**
 * Workout Controller
 */
const Workout = require('../models/Workout');
const PersonalRecord = require('../models/PersonalRecord');
const { updateStreakOnWorkout, calculateUserStreak } = require('../services/streakService');
const { checkAndAwardAchievements } = require('../services/achievementService');
const { getWorkoutStats } = require('../services/statsService');
const { estimateCaloriesBurned, calculateOneRepMax } = require('../utils/fitness');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

/**
 * Get workouts for current user
 */
const getWorkouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    const query = { user: req.user._id };
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [workouts, total] = await Promise.all([
      Workout.find(query).sort({ startTime: -1 }).skip(skip).limit(limitNum).populate('prsHit', 'name'),
      Workout.countDocuments(query),
    ]);

    return paginatedResponse(res, workouts, pageNum, limitNum, total, 'Workouts retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new workout session
 */
const createWorkout = async (req, res, next) => {
  try {
    const {
      title,
      exercises,
      duration = 45,
      caloriesBurned,
      notes = '',
      startTime = new Date(),
      endTime,
      isCompleted = true,
      fromTemplate,
    } = req.body;

    if (!title || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return errorResponse(res, 'Workout title and at least one exercise are required.', 400);
    }

    // Estimate calories burned if not provided
    const estimatedCalories =
      caloriesBurned || estimateCaloriesBurned(duration, req.user.weight, 6.0);

    const workout = new Workout({
      user: req.user._id,
      title: title.trim(),
      exercises,
      duration,
      caloriesBurned: estimatedCalories,
      notes,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      isCompleted,
      fromTemplate: fromTemplate || null,
      prsHit: [],
    });

    await workout.save();

    // Check for Personal Records on completed sets
    const prExerciseIds = [];

    for (const ex of workout.exercises) {
      if (!ex.exerciseId || !ex.sets || ex.sets.length === 0) continue;

      let maxWeightInSession = 0;
      let maxRepsInSession = 0;
      let maxEstimated1Rm = 0;
      let setForMaxWeight = null;
      let setForMax1Rm = null;

      ex.sets.forEach((set) => {
        if (set.completed && !set.isWarmup) {
          const w = Number(set.weight) || 0;
          const r = Number(set.reps) || 0;
          const oneRm = calculateOneRepMax(w, r);

          if (w > maxWeightInSession) {
            maxWeightInSession = w;
            setForMaxWeight = set;
          }
          if (r > maxRepsInSession) {
            maxRepsInSession = r;
          }
          if (oneRm > maxEstimated1Rm) {
            maxEstimated1Rm = oneRm;
            setForMax1Rm = set;
          }
        }
      });

      if (maxWeightInSession > 0) {
        // Check existing max weight PR
        const existingWeightPR = await PersonalRecord.findOne({
          user: req.user._id,
          exerciseId: ex.exerciseId,
          type: 'max_weight',
        }).sort({ value: -1 });

        if (!existingWeightPR || maxWeightInSession > existingWeightPR.value) {
          await PersonalRecord.create({
            user: req.user._id,
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            type: 'max_weight',
            value: maxWeightInSession,
            weight: maxWeightInSession,
            reps: setForMaxWeight?.reps || 1,
            workoutId: workout._id,
            achievedAt: workout.startTime,
          });
          prExerciseIds.push(ex.exerciseId);
        }
      }

      if (maxEstimated1Rm > 0) {
        // Check existing 1RM PR
        const existing1RmPR = await PersonalRecord.findOne({
          user: req.user._id,
          exerciseId: ex.exerciseId,
          type: 'estimated_1rm',
        }).sort({ value: -1 });

        if (!existing1RmPR || maxEstimated1Rm > existing1RmPR.value) {
          await PersonalRecord.create({
            user: req.user._id,
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            type: 'estimated_1rm',
            value: maxEstimated1Rm,
            weight: setForMax1Rm?.weight || 0,
            reps: setForMax1Rm?.reps || 1,
            workoutId: workout._id,
            achievedAt: workout.startTime,
          });
          if (!prExerciseIds.includes(ex.exerciseId)) {
            prExerciseIds.push(ex.exerciseId);
          }
        }
      }
    }

    // Attach any PRs to workout
    if (prExerciseIds.length > 0) {
      workout.prsHit = prExerciseIds;
      await workout.save();
    }

    // Update user streak & workout count
    if (isCompleted) {
      await updateStreakOnWorkout(req.user, workout);
    }

    // Check & award achievements
    const newlyUnlockedAchievements = await checkAndAwardAchievements(req.user._id, {
      workout,
      hasPr: prExerciseIds.length > 0,
    });

    return successResponse(
      res,
      {
        workout,
        prsHit: prExerciseIds,
        newAchievements: newlyUnlockedAchievements,
      },
      'Workout saved successfully.',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get workout statistics
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await getWorkoutStats(req.user._id);
    return successResponse(res, stats, 'Workout statistics calculated.');
  } catch (err) {
    next(err);
  }
};

/**
 * Get single workout by ID
 */
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id }).populate(
      'prsHit',
      'name'
    );

    if (!workout) {
      return errorResponse(res, 'Workout not found.', 404);
    }

    return successResponse(res, workout, 'Workout retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Update workout
 */
const updateWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) {
      return errorResponse(res, 'Workout not found.', 404);
    }

    const fields = ['title', 'exercises', 'duration', 'caloriesBurned', 'notes', 'startTime', 'endTime', 'isCompleted'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        workout[f] = req.body[f];
      }
    });

    await workout.save();
    return successResponse(res, workout, 'Workout updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Delete workout
 */
const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!workout) {
      return errorResponse(res, 'Workout not found.', 404);
    }

    // Recalculate streak after deletion
    await updateStreakOnWorkout(req.user, workout);

    return successResponse(res, null, 'Workout deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWorkouts,
  createWorkout,
  getStats,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
};

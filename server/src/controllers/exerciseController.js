/**
 * Exercise Controller
 */
const Exercise = require('../models/Exercise');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

/**
 * List all exercises with filtering and pagination
 */
const getExercises = async (req, res, next) => {
  try {
    const { muscleGroup, category, difficulty, equipment, page = 1, limit = 50 } = req.query;

    const query = {
      $or: [{ isCustom: false }, { isCustom: true, createdBy: req.user._id }],
    };

    if (muscleGroup) {
      query['muscleGroup.primary'] = muscleGroup.toLowerCase();
    }
    if (category) {
      query.category = category.toLowerCase();
    }
    if (difficulty) {
      query.difficulty = difficulty.toLowerCase();
    }
    if (equipment) {
      query.equipment = equipment.toLowerCase();
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [exercises, total] = await Promise.all([
      Exercise.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
      Exercise.countDocuments(query),
    ]);

    return paginatedResponse(res, exercises, pageNum, limitNum, total, 'Exercises retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Search exercises by name or keyword
 */
const searchExercises = async (req, res, next) => {
  try {
    const { q, muscleGroup } = req.query;
    if (!q && !muscleGroup) {
      return errorResponse(res, 'Search query or muscle group is required.', 400);
    }

    const query = {
      $or: [{ isCustom: false }, { isCustom: true, createdBy: req.user._id }],
    };

    if (q) {
      query.name = { $regex: q.trim(), $options: 'i' };
    }

    if (muscleGroup) {
      query['muscleGroup.primary'] = muscleGroup.toLowerCase();
    }

    const exercises = await Exercise.find(query).limit(50);
    return successResponse(res, exercises, `Found ${exercises.length} exercises.`);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single exercise by ID
 */
const getExerciseById = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return errorResponse(res, 'Exercise not found.', 404);
    }

    if (exercise.isCustom && exercise.createdBy && exercise.createdBy.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied to this custom exercise.', 403);
    }

    return successResponse(res, exercise, 'Exercise details retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Create custom exercise
 */
const createExercise = async (req, res, next) => {
  try {
    const { name, muscleGroup, equipment, difficulty, category, instructions, tips, imageUrl, videoUrl } = req.body;

    const existing = await Exercise.findOne({ name: name.trim() });
    if (existing) {
      return errorResponse(res, 'An exercise with this name already exists.', 400);
    }

    const newExercise = await Exercise.create({
      name: name.trim(),
      muscleGroup: {
        primary: muscleGroup?.primary || muscleGroup,
        secondary: muscleGroup?.secondary || [],
      },
      equipment: equipment || 'bodyweight',
      difficulty: difficulty || 'beginner',
      category: category || 'strength',
      instructions: instructions || [],
      tips: tips || [],
      imageUrl: imageUrl || '',
      videoUrl: videoUrl || '',
      isCustom: true,
      createdBy: req.user._id,
    });

    return successResponse(res, newExercise, 'Custom exercise created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Update custom exercise
 */
const updateExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return errorResponse(res, 'Exercise not found.', 404);
    }

    if (!exercise.isCustom || !exercise.createdBy || exercise.createdBy.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Cannot edit prebuilt system exercises or another user’s exercise.', 403);
    }

    const fields = ['name', 'muscleGroup', 'equipment', 'difficulty', 'category', 'instructions', 'tips', 'imageUrl', 'videoUrl'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        exercise[f] = req.body[f];
      }
    });

    await exercise.save();
    return successResponse(res, exercise, 'Custom exercise updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Delete custom exercise
 */
const deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return errorResponse(res, 'Exercise not found.', 404);
    }

    if (!exercise.isCustom || !exercise.createdBy || exercise.createdBy.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Cannot delete prebuilt system exercises or another user’s exercise.', 403);
    }

    await Exercise.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Custom exercise deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExercises,
  searchExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};

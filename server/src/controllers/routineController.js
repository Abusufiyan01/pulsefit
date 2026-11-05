/**
 * Routine Controller
 */
const Routine = require('../models/Routine');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get all routines (system prebuilts + user routines)
 */
const getRoutines = async (req, res, next) => {
  try {
    const { category, difficulty } = req.query;

    const query = {
      $or: [{ isPrebuilt: true }, { user: req.user._id }],
    };

    if (category) {
      query.category = category;
    }
    if (difficulty) {
      query.difficulty = difficulty.toLowerCase();
    }

    const routines = await Routine.find(query).sort({ isPrebuilt: -1, createdAt: -1 });
    return successResponse(res, routines, 'Routines retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new routine
 */
const createRoutine = async (req, res, next) => {
  try {
    const { name, description, category, exercises, difficulty, estimatedDuration } = req.body;

    if (!name || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return errorResponse(res, 'Routine name and exercises list are required.', 400);
    }

    const routine = await Routine.create({
      user: req.user._id,
      name: name.trim(),
      description: description || '',
      category: category || 'Custom',
      exercises,
      difficulty: difficulty || 'beginner',
      estimatedDuration: estimatedDuration || 45,
      isPrebuilt: false,
    });

    return successResponse(res, routine, 'Routine created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get routine by ID
 */
const getRoutineById = async (req, res, next) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return errorResponse(res, 'Routine not found.', 404);
    }

    // Ensure user has access if not prebuilt
    if (!routine.isPrebuilt && routine.user && routine.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied to this private routine.', 403);
    }

    return successResponse(res, routine, 'Routine details retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Update user routine
 */
const updateRoutine = async (req, res, next) => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, user: req.user._id });
    if (!routine) {
      return errorResponse(res, 'Routine not found or cannot be modified.', 404);
    }

    const fields = ['name', 'description', 'category', 'exercises', 'difficulty', 'estimatedDuration'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        routine[f] = req.body[f];
      }
    });

    await routine.save();
    return successResponse(res, routine, 'Routine updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Delete user routine
 */
const deleteRoutine = async (req, res, next) => {
  try {
    const routine = await Routine.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!routine) {
      return errorResponse(res, 'Routine not found or cannot be deleted.', 404);
    }

    return successResponse(res, null, 'Routine deleted successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Duplicate a routine into user's personal routine collection
 */
const duplicateRoutine = async (req, res, next) => {
  try {
    const sourceRoutine = await Routine.findById(req.params.id);
    if (!sourceRoutine) {
      return errorResponse(res, 'Source routine not found.', 404);
    }

    const duplicated = await Routine.create({
      user: req.user._id,
      name: `${sourceRoutine.name} (Copy)`,
      description: sourceRoutine.description,
      category: sourceRoutine.category,
      exercises: sourceRoutine.exercises,
      difficulty: sourceRoutine.difficulty,
      estimatedDuration: sourceRoutine.estimatedDuration,
      isPrebuilt: false,
    });

    return successResponse(res, duplicated, 'Routine duplicated successfully.', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRoutines,
  createRoutine,
  getRoutineById,
  updateRoutine,
  deleteRoutine,
  duplicateRoutine,
};

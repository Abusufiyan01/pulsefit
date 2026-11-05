/**
 * Goal Controller
 */
const Goal = require('../models/Goal');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get all goals for current user
 */
const getGoals = async (req, res, next) => {
  try {
    const { isCompleted } = req.query;
    const query = { user: req.user._id };

    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === 'true';
    }

    const goals = await Goal.find(query).sort({ isCompleted: 1, createdAt: -1 });
    return successResponse(res, goals, 'Goals retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new goal
 */
const createGoal = async (req, res, next) => {
  try {
    const { type, title, description, targetValue, currentValue = 0, unit, startDate, targetDate, exerciseId } = req.body;

    if (!type || !title || targetValue === undefined) {
      return errorResponse(res, 'Type, title, and target value are required.', 400);
    }

    const goal = await Goal.create({
      user: req.user._id,
      type,
      title: title.trim(),
      description: description || '',
      targetValue: Number(targetValue),
      currentValue: Number(currentValue),
      unit: unit || '',
      startDate: startDate ? new Date(startDate) : new Date(),
      targetDate: targetDate ? new Date(targetDate) : null,
      exerciseId: exerciseId || null,
      isCompleted: Number(currentValue) >= Number(targetValue),
      completedDate: Number(currentValue) >= Number(targetValue) ? new Date() : null,
    });

    return successResponse(res, goal, 'Goal created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single goal by ID
 */
const getGoalById = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id }).populate('exerciseId', 'name');
    if (!goal) {
      return errorResponse(res, 'Goal not found.', 404);
    }
    return successResponse(res, goal, 'Goal retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Update goal
 */
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return errorResponse(res, 'Goal not found.', 404);
    }

    const fields = ['title', 'description', 'targetValue', 'currentValue', 'unit', 'targetDate', 'isCompleted'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        goal[f] = req.body[f];
      }
    });

    // Check completion condition
    if (goal.currentValue >= goal.targetValue && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedDate = new Date();
    } else if (req.body.isCompleted === true && !goal.completedDate) {
      goal.completedDate = new Date();
    } else if (req.body.isCompleted === false) {
      goal.completedDate = null;
    }

    await goal.save();
    return successResponse(res, goal, 'Goal updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Delete goal
 */
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return errorResponse(res, 'Goal not found.', 404);
    }
    return successResponse(res, null, 'Goal deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
};

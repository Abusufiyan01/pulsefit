/**
 * AI Controller
 */
const aiService = require('../services/aiService');
const { getWorkoutStats, getBodyStats } = require('../services/statsService');
const { successResponse } = require('../utils/apiResponse');

/**
 * Generate personalized workout plan
 */
const generateWorkoutPlan = async (req, res, next) => {
  try {
    const preferences = req.body || {};
    const plan = await aiService.generateWorkoutPlan(req.user, preferences);
    return successResponse(res, plan, 'Workout plan generated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Generate meal suggestions
 */
const generateMealSuggestions = async (req, res, next) => {
  try {
    const context = req.body || {};
    const suggestions = await aiService.generateMealSuggestions(req.user, context);
    return successResponse(res, suggestions, 'Meal suggestions generated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Generate progress insights
 */
const getProgressInsights = async (req, res, next) => {
  try {
    const [workoutStats, bodyStats] = await Promise.all([
      getWorkoutStats(req.user._id),
      getBodyStats(req.user._id),
    ]);

    const stats = {
      totalWorkouts: workoutStats.totalWorkouts,
      averageVolume: workoutStats.averageVolume,
      weightChange: bodyStats.weightChange,
    };

    const insights = await aiService.generateProgressInsights(req.user, stats);
    return successResponse(res, insights, 'Progress insights generated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Get daily motivational quote
 */
const getQuote = async (_req, res, next) => {
  try {
    const quote = aiService.getDailyQuote();
    return successResponse(res, quote, 'Daily motivational quote.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateWorkoutPlan,
  generateMealSuggestions,
  getProgressInsights,
  getQuote,
};

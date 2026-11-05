/**
 * Body Metrics Controller
 */
const BodyMetric = require('../models/BodyMetric');
const { getBodyStats } = require('../services/statsService');
const { checkAndAwardAchievements } = require('../services/achievementService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * List body metric history
 */
const getBodyMetrics = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const metrics = await BodyMetric.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(parseInt(limit, 10));

    return successResponse(res, metrics, 'Body metrics retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Log new body metric entry
 */
const createBodyMetric = async (req, res, next) => {
  try {
    const { date = new Date(), weight, bodyFat, measurements, notes } = req.body;

    if (!weight) {
      return errorResponse(res, 'Weight is required.', 400);
    }

    const metric = await BodyMetric.create({
      user: req.user._id,
      date: new Date(date),
      weight: Number(weight),
      bodyFat: bodyFat !== undefined ? Number(bodyFat) : undefined,
      measurements: measurements || {},
      notes: notes || '',
    });

    // Update current weight in user document and recalculate fitness metrics
    req.user.weight = Number(weight);
    req.user.recalculateFitnessMetrics();
    await req.user.save();

    // Check achievements (e.g. weightloss_5)
    const newAchievements = await checkAndAwardAchievements(req.user._id);

    return successResponse(
      res,
      {
        metric,
        newAchievements,
        updatedMetrics: {
          bmi: req.user.bmi,
          bmr: req.user.bmr,
          tdee: req.user.tdee,
          dailyCalorieTarget: req.user.dailyCalorieTarget,
          macroTargets: req.user.macroTargets,
        },
      },
      'Body metric logged successfully.',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get body statistics and trends
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await getBodyStats(req.user._id);
    return successResponse(res, stats, 'Body statistics retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Get single metric by ID
 */
const getBodyMetricById = async (req, res, next) => {
  try {
    const metric = await BodyMetric.findOne({ _id: req.params.id, user: req.user._id });
    if (!metric) {
      return errorResponse(res, 'Body metric not found.', 404);
    }
    return successResponse(res, metric, 'Body metric details retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Delete body metric
 */
const deleteBodyMetric = async (req, res, next) => {
  try {
    const metric = await BodyMetric.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!metric) {
      return errorResponse(res, 'Body metric not found.', 404);
    }
    return successResponse(res, null, 'Body metric deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBodyMetrics,
  createBodyMetric,
  getStats,
  getBodyMetricById,
  deleteBodyMetric,
};

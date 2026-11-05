/**
 * Water Controller
 */
const WaterLog = require('../models/WaterLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get water logs history
 */
const getWaterLogs = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - parseInt(days, 10));

    const logs = await WaterLog.find({
      user: req.user._id,
      date: { $gte: sinceDate },
    }).sort({ date: -1 });

    return successResponse(res, logs, 'Water logs retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Log or update water intake for a day
 */
const logWater = async (req, res, next) => {
  try {
    const { date = new Date(), glasses, mlPerGlass = 250, totalMl, incrementGlasses } = req.body;

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    let log = await WaterLog.findOne({
      user: req.user._id,
      date: targetDate,
    });

    if (!log) {
      const initialGlasses = incrementGlasses ? Number(incrementGlasses) : Number(glasses) || 0;
      const initialMl = totalMl !== undefined ? Number(totalMl) : initialGlasses * (Number(mlPerGlass) || 250);

      log = new WaterLog({
        user: req.user._id,
        date: targetDate,
        glasses: initialGlasses,
        mlPerGlass: Number(mlPerGlass) || 250,
        totalMl: initialMl,
      });
    } else {
      if (incrementGlasses !== undefined) {
        log.glasses += Number(incrementGlasses);
        log.totalMl = log.glasses * log.mlPerGlass;
      } else if (glasses !== undefined) {
        log.glasses = Number(glasses);
        log.totalMl = log.glasses * (Number(mlPerGlass) || log.mlPerGlass);
      } else if (totalMl !== undefined) {
        log.totalMl = Number(totalMl);
        log.glasses = Math.round(log.totalMl / log.mlPerGlass);
      }
      if (mlPerGlass !== undefined) {
        log.mlPerGlass = Number(mlPerGlass);
      }
    }

    await log.save();

    const target = req.user.waterTarget || 2500;
    const progressPercent = Math.min(100, Math.round((log.totalMl / target) * 100));

    return successResponse(
      res,
      {
        log,
        target,
        progressPercent,
      },
      'Water intake recorded successfully.',
      200
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get water log for a specific date
 */
const getWaterByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    if (!date) {
      return errorResponse(res, 'Date parameter is required (YYYY-MM-DD).', 400);
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    let log = await WaterLog.findOne({
      user: req.user._id,
      date: targetDate,
    });

    const target = req.user.waterTarget || 2500;

    if (!log) {
      log = {
        date: targetDate,
        glasses: 0,
        mlPerGlass: 250,
        totalMl: 0,
      };
    }

    const progressPercent = Math.min(100, Math.round((log.totalMl / target) * 100));

    return successResponse(
      res,
      {
        log,
        target,
        progressPercent,
      },
      'Water log for date retrieved.'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWaterLogs,
  logWater,
  getWaterByDate,
};

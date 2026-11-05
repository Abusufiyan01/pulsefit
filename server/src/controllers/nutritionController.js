/**
 * Nutrition Controller
 */
const Food = require('../models/Food');
const FoodLog = require('../models/FoodLog');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

/**
 * List foods
 */
const getFoods = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;

    const query = {
      $or: [{ isCustom: false }, { isCustom: true, createdBy: req.user._id }],
    };

    if (category) {
      query.category = category;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [foods, total] = await Promise.all([
      Food.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
      Food.countDocuments(query),
    ]);

    return paginatedResponse(res, foods, pageNum, limitNum, total, 'Foods retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Search foods
 */
const searchFoods = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    if (!q && !category) {
      return errorResponse(res, 'Search term or category is required.', 400);
    }

    const query = {
      $or: [{ isCustom: false }, { isCustom: true, createdBy: req.user._id }],
    };

    if (q) {
      query.name = { $regex: q.trim(), $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const foods = await Food.find(query).limit(50);
    return successResponse(res, foods, `Found ${foods.length} foods.`);
  } catch (err) {
    next(err);
  }
};

/**
 * Create custom food
 */
const createFood = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      category,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      servingSize,
      servingUnit,
    } = req.body;

    if (!name || calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
      return errorResponse(res, 'Name, calories, protein, carbs, and fat are required.', 400);
    }

    const food = await Food.create({
      name: name.trim(),
      brand: brand || 'Custom',
      category: category || 'Snack',
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      fiber: Number(fiber) || 0,
      sugar: Number(sugar) || 0,
      servingSize: Number(servingSize) || 100,
      servingUnit: servingUnit || 'g',
      isCustom: true,
      createdBy: req.user._id,
    });

    return successResponse(res, food, 'Custom food created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * List food logs
 */
const getFoodLogs = async (req, res, next) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { user: req.user._id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      FoodLog.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limitNum),
      FoodLog.countDocuments(query),
    ]);

    return paginatedResponse(res, logs, pageNum, limitNum, total, 'Food logs retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Create food log entry
 */
const createFoodLog = async (req, res, next) => {
  try {
    const { date = new Date(), meal, foods } = req.body;

    if (!meal || !foods || !Array.isArray(foods) || foods.length === 0) {
      return errorResponse(res, 'Meal type and at least one food item are required.', 400);
    }

    const log = new FoodLog({
      user: req.user._id,
      date: new Date(date),
      meal,
      foods,
    });

    await log.save();
    return successResponse(res, log, 'Meal logged successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get daily food logs and macro summary for a specific date
 */
const getDailyFoodLogs = async (req, res, next) => {
  try {
    const { date } = req.params;
    if (!date) {
      return errorResponse(res, 'Date parameter is required (YYYY-MM-DD).', 400);
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const logs = await FoodLog.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: 1 });

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const meals = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    logs.forEach((log) => {
      totalCalories += log.totalCalories || 0;
      totalProtein += log.totalProtein || 0;
      totalCarbs += log.totalCarbs || 0;
      totalFat += log.totalFat || 0;

      if (meals[log.meal]) {
        meals[log.meal].push(log);
      }
    });

    const userTargets = {
      calories: req.user.dailyCalorieTarget || 2000,
      protein: req.user.macroTargets?.protein || 150,
      carbs: req.user.macroTargets?.carbs || 200,
      fat: req.user.macroTargets?.fat || 60,
    };

    const remaining = {
      calories: Math.max(0, userTargets.calories - totalCalories),
      protein: Math.max(0, userTargets.protein - Math.round(totalProtein)),
      carbs: Math.max(0, userTargets.carbs - Math.round(totalCarbs)),
      fat: Math.max(0, userTargets.fat - Math.round(totalFat)),
    };

    return successResponse(
      res,
      {
        date,
        meals,
        logs,
        totals: {
          calories: Math.round(totalCalories),
          protein: Math.round(totalProtein * 10) / 10,
          carbs: Math.round(totalCarbs * 10) / 10,
          fat: Math.round(totalFat * 10) / 10,
        },
        targets: userTargets,
        remaining,
      },
      'Daily nutrition summary retrieved.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get single food log by ID
 */
const getFoodLogById = async (req, res, next) => {
  try {
    const log = await FoodLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) {
      return errorResponse(res, 'Food log not found.', 404);
    }
    return successResponse(res, log, 'Food log retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Update food log
 */
const updateFoodLog = async (req, res, next) => {
  try {
    const log = await FoodLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) {
      return errorResponse(res, 'Food log not found.', 404);
    }

    if (req.body.meal) log.meal = req.body.meal;
    if (req.body.date) log.date = new Date(req.body.date);
    if (req.body.foods && Array.isArray(req.body.foods)) {
      log.foods = req.body.foods;
    }

    await log.save();
    return successResponse(res, log, 'Food log updated.');
  } catch (err) {
    next(err);
  }
};

/**
 * Delete food log
 */
const deleteFoodLog = async (req, res, next) => {
  try {
    const log = await FoodLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) {
      return errorResponse(res, 'Food log not found.', 404);
    }
    return successResponse(res, null, 'Food log deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFoods,
  searchFoods,
  createFood,
  getFoodLogs,
  createFoodLog,
  getDailyFoodLogs,
  getFoodLogById,
  updateFoodLog,
  deleteFoodLog,
};

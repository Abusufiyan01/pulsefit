/**
 * Stats and Analytics Service
 */
const Workout = require('../models/Workout');
const FoodLog = require('../models/FoodLog');
const BodyMetric = require('../models/BodyMetric');
const PersonalRecord = require('../models/PersonalRecord');

/**
 * Calculate comprehensive workout statistics for a user
 * @param {string|mongoose.Types.ObjectId} userId 
 */
const getWorkoutStats = async (userId) => {
  const workouts = await Workout.find({ user: userId, isCompleted: true }).populate('exercises.exerciseId');

  let totalWorkouts = workouts.length;
  let totalVolume = 0;
  let totalDuration = 0;
  let totalCaloriesBurned = 0;
  const muscleDistribution = {};
  const weeklyVolumeMap = {};
  const dayOfWeekCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  workouts.forEach((w) => {
    totalVolume += w.totalVolume || 0;
    totalDuration += w.duration || 0;
    totalCaloriesBurned += w.caloriesBurned || 0;

    const d = new Date(w.startTime);
    const dayName = dayNames[d.getDay()];
    dayOfWeekCounts[dayName] = (dayOfWeekCounts[dayName] || 0) + 1;

    // ISO Week key for volume trend
    const year = d.getFullYear();
    const firstDay = new Date(year, 0, 1);
    const weekNumber = Math.ceil(((d - firstDay) / 86400000 + firstDay.getDay() + 1) / 7);
    const weekKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;
    weeklyVolumeMap[weekKey] = (weeklyVolumeMap[weekKey] || 0) + (w.totalVolume || 0);

    // Muscle group distribution
    w.exercises?.forEach((ex) => {
      const primaryGroup = ex.exerciseId?.muscleGroup?.primary || 'other';
      muscleDistribution[primaryGroup] = (muscleDistribution[primaryGroup] || 0) + 1;
    });
  });

  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
  const averageVolume = totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0;

  // Format weekly volume as array sorted chronologically
  const weeklyVolume = Object.keys(weeklyVolumeMap)
    .sort()
    .slice(-8)
    .map((week) => ({
      week,
      volume: weeklyVolumeMap[week],
    }));

  return {
    totalWorkouts,
    totalVolume,
    totalDuration,
    totalCaloriesBurned,
    averageDuration,
    averageVolume,
    dayOfWeekCounts,
    weeklyVolume,
    muscleDistribution,
  };
};

/**
 * Calculate nutrition stats for a user (past N days)
 * @param {string|mongoose.Types.ObjectId} userId 
 * @param {number} days 
 */
const getNutritionStats = async (userId, days = 30) => {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  const logs = await FoodLog.find({
    user: userId,
    date: { $gte: sinceDate },
  }).sort({ date: 1 });

  // Group by date to get daily totals
  const dailyTotals = {};
  logs.forEach((log) => {
    const dateKey = new Date(log.date).toISOString().split('T')[0];
    if (!dailyTotals[dateKey]) {
      dailyTotals[dateKey] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    dailyTotals[dateKey].calories += log.totalCalories || 0;
    dailyTotals[dateKey].protein += log.totalProtein || 0;
    dailyTotals[dateKey].carbs += log.totalCarbs || 0;
    dailyTotals[dateKey].fat += log.totalFat || 0;
  });

  const loggedDays = Object.keys(dailyTotals).length;
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  Object.values(dailyTotals).forEach((d) => {
    totalCalories += d.calories;
    totalProtein += d.protein;
    totalCarbs += d.carbs;
    totalFat += d.fat;
  });

  const avgCalories = loggedDays > 0 ? Math.round(totalCalories / loggedDays) : 0;
  const avgProtein = loggedDays > 0 ? Math.round(totalProtein / loggedDays) : 0;
  const avgCarbs = loggedDays > 0 ? Math.round(totalCarbs / loggedDays) : 0;
  const avgFat = loggedDays > 0 ? Math.round(totalFat / loggedDays) : 0;

  return {
    daysAnalyzed: days,
    loggedDays,
    avgCalories,
    avgMacros: {
      protein: avgProtein,
      carbs: avgCarbs,
      fat: avgFat,
    },
    dailyHistory: dailyTotals,
  };
};

/**
 * Calculate body metric progression
 * @param {string|mongoose.Types.ObjectId} userId 
 */
const getBodyStats = async (userId) => {
  const metrics = await BodyMetric.find({ user: userId }).sort({ date: 1 });

  if (metrics.length === 0) {
    return {
      currentWeight: null,
      startingWeight: null,
      weightChange: 0,
      minWeight: null,
      maxWeight: null,
      bodyFatChange: 0,
      totalEntries: 0,
    };
  }

  const startingWeight = metrics[0].weight;
  const currentWeight = metrics[metrics.length - 1].weight;
  const weightChange = Math.round((currentWeight - startingWeight) * 10) / 10;

  const weights = metrics.map((m) => m.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  let bodyFatChange = 0;
  const bfEntries = metrics.filter((m) => m.bodyFat !== undefined && m.bodyFat !== null);
  if (bfEntries.length >= 2) {
    bodyFatChange =
      Math.round((bfEntries[bfEntries.length - 1].bodyFat - bfEntries[0].bodyFat) * 10) / 10;
  }

  return {
    currentWeight,
    startingWeight,
    weightChange,
    minWeight,
    maxWeight,
    bodyFatChange,
    totalEntries: metrics.length,
    recentEntries: metrics.slice(-10),
  };
};

module.exports = {
  getWorkoutStats,
  getNutritionStats,
  getBodyStats,
};

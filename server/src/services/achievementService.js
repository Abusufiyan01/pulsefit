/**
 * Achievement Service
 * Handles badge unlocking logic and notifications
 */
const Achievement = require('../models/Achievement');
const Workout = require('../models/Workout');
const PersonalRecord = require('../models/PersonalRecord');
const BodyMetric = require('../models/BodyMetric');
const User = require('../models/User');
const { ACHIEVEMENTS, BADGE_DEFINITIONS } = require('../config/constants');

/**
 * Check eligibility and award any newly earned badges
 * @param {string|mongoose.Types.ObjectId} userId 
 * @param {object} context Optional runtime context (e.g., current workout, new pr)
 * @returns {Promise<Array>} List of newly unlocked achievements
 */
const checkAndAwardAchievements = async (userId, context = {}) => {
  const user = await User.findById(userId);
  if (!user) return [];

  // Fetch already earned achievements
  const existingAchievements = await Achievement.find({ user: userId }).select('type');
  const unlockedTypeSet = new Set(existingAchievements.map((a) => a.type));

  const badgesToAward = [];

  // Helper to mark badge for awarding
  const tryAward = (type) => {
    if (!unlockedTypeSet.has(type)) {
      const def = BADGE_DEFINITIONS.find((b) => b.type === type);
      if (def) {
        badgesToAward.push(def);
        unlockedTypeSet.add(type);
      }
    }
  };

  // 1. FIRST_WORKOUT
  if (user.totalWorkouts >= 1 || context.workout) {
    tryAward(ACHIEVEMENTS.FIRST_WORKOUT);
  }

  // 2. WEEK_STREAK_7
  if ((user.currentStreak >= 7 || user.longestStreak >= 7)) {
    tryAward(ACHIEVEMENTS.WEEK_STREAK_7);
  }

  // 3. MONTH_STREAK_30
  if ((user.currentStreak >= 30 || user.longestStreak >= 30)) {
    tryAward(ACHIEVEMENTS.MONTH_STREAK_30);
  }

  // 4. FIRST_PR
  if (context.hasPr) {
    tryAward(ACHIEVEMENTS.FIRST_PR);
  } else if (!unlockedTypeSet.has(ACHIEVEMENTS.FIRST_PR)) {
    const prCount = await PersonalRecord.countDocuments({ user: userId });
    if (prCount > 0) {
      tryAward(ACHIEVEMENTS.FIRST_PR);
    }
  }

  // 5. STRENGTH_MILESTONE (Lifted 100kg+)
  if (context.workout) {
    let lifted100 = false;
    context.workout.exercises?.forEach((ex) => {
      ex.sets?.forEach((s) => {
        if (Number(s.weight) >= 100 && s.completed) {
          lifted100 = true;
        }
      });
    });
    if (lifted100) {
      tryAward(ACHIEVEMENTS.STRENGTH_MILESTONE);
    }
  }

  // 6. EARLY_BIRD (< 7:00 AM) & NIGHT_OWL (>= 22:00 / 10 PM)
  if (context.workout && context.workout.startTime) {
    const workoutHour = new Date(context.workout.startTime).getHours();
    if (workoutHour < 7) {
      tryAward(ACHIEVEMENTS.EARLY_BIRD);
    }
    if (workoutHour >= 22) {
      tryAward(ACHIEVEMENTS.NIGHT_OWL);
    }
  }

  // For complex aggregations, only query if not already unlocked
  const needsSetsCheck = !unlockedTypeSet.has(ACHIEVEMENTS.HUNDRED_SETS);
  const needsConsistencyCheck =
    !unlockedTypeSet.has(ACHIEVEMENTS.BEAST_MODE) ||
    !unlockedTypeSet.has(ACHIEVEMENTS.CONSISTENT) ||
    !unlockedTypeSet.has(ACHIEVEMENTS.EARLY_BIRD) ||
    !unlockedTypeSet.has(ACHIEVEMENTS.NIGHT_OWL) ||
    !unlockedTypeSet.has(ACHIEVEMENTS.STRENGTH_MILESTONE);

  if (needsSetsCheck || needsConsistencyCheck) {
    const allWorkouts = await Workout.find({ user: userId, isCompleted: true }).select(
      'startTime exercises'
    );

    let totalCompletedSets = 0;
    const workoutsByWeek = {};
    const workoutsByMonth = {};
    let hasEarly = false;
    let hasNight = false;
    let lifted100InHistory = false;

    allWorkouts.forEach((w) => {
      const d = new Date(w.startTime);
      const hour = d.getHours();
      if (hour < 7) hasEarly = true;
      if (hour >= 22) hasNight = true;

      // Group by week (YYYY-WW)
      const year = d.getFullYear();
      const firstDayOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      const weekKey = `${year}-W${weekNumber}`;
      workoutsByWeek[weekKey] = (workoutsByWeek[weekKey] || 0) + 1;

      // Group by month (YYYY-MM)
      const monthKey = `${year}-${d.getMonth() + 1}`;
      workoutsByMonth[monthKey] = (workoutsByMonth[monthKey] || 0) + 1;

      w.exercises?.forEach((ex) => {
        ex.sets?.forEach((s) => {
          if (s.completed) {
            totalCompletedSets++;
            if (Number(s.weight) >= 100) {
              lifted100InHistory = true;
            }
          }
        });
      });
    });

    if (totalCompletedSets >= 100) {
      tryAward(ACHIEVEMENTS.HUNDRED_SETS);
    }
    if (hasEarly) {
      tryAward(ACHIEVEMENTS.EARLY_BIRD);
    }
    if (hasNight) {
      tryAward(ACHIEVEMENTS.NIGHT_OWL);
    }
    if (lifted100InHistory) {
      tryAward(ACHIEVEMENTS.STRENGTH_MILESTONE);
    }

    // BEAST_MODE: 5+ workouts in a week
    if (Object.values(workoutsByWeek).some((count) => count >= 5)) {
      tryAward(ACHIEVEMENTS.BEAST_MODE);
    }

    // CONSISTENT: 12+ workouts in a month
    if (Object.values(workoutsByMonth).some((count) => count >= 12)) {
      tryAward(ACHIEVEMENTS.CONSISTENT);
    }
  }

  // 10. WEIGHTLOSS_5 (Lost 5kg)
  if (!unlockedTypeSet.has(ACHIEVEMENTS.WEIGHTLOSS_5)) {
    const metrics = await BodyMetric.find({ user: userId }).sort({ date: 1 }).select('weight');
    if (metrics.length >= 2) {
      const startingWeight = metrics[0].weight;
      const currentWeight = metrics[metrics.length - 1].weight;
      if (startingWeight - currentWeight >= 5) {
        tryAward(ACHIEVEMENTS.WEIGHTLOSS_5);
      }
    }
  }

  // Save new achievements to DB
  const newlyCreated = [];
  for (const badge of badgesToAward) {
    const achievementDoc = await Achievement.create({
      user: userId,
      type: badge.type,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      unlockedAt: new Date(),
    });
    newlyCreated.push(achievementDoc);
  }

  return newlyCreated;
};

module.exports = {
  checkAndAwardAchievements,
};

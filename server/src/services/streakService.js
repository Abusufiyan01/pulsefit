/**
 * Streak Service
 * Accurately calculates workout streaks, factoring in scheduled rest days.
 */
const Workout = require('../models/Workout');

/**
 * Format Date to YYYY-MM-DD UTC string for consistent day comparison
 * @param {Date|string} date 
 * @returns {string} YYYY-MM-DD
 */
const toDateString = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Get difference in whole calendar days between two date strings (date1 - date2)
 * @param {string} dateStr1 
 * @param {string} dateStr2 
 * @returns {number} difference in days
 */
const getDayDiff = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d1.getTime() - d2.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate user streaks based on workout history and schedule
 * @param {string|mongoose.Types.ObjectId} userId 
 * @param {number} workoutDaysPerWeek 
 * @returns {Promise<{ currentStreak: number, longestStreak: number, totalWorkouts: number, lastWorkoutDate: Date|null }>}
 */
const calculateUserStreak = async (userId, workoutDaysPerWeek = 4) => {
  // Retrieve all completed workouts for this user sorted by date descending
  const workouts = await Workout.find({
    user: userId,
    isCompleted: true,
  })
    .sort({ startTime: -1 })
    .select('startTime');

  const totalWorkouts = workouts.length;

  if (totalWorkouts === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalWorkouts: 0,
      lastWorkoutDate: null,
    };
  }

  // Extract distinct workout dates in descending order (newest first)
  const dateSet = new Set();
  workouts.forEach((w) => {
    dateSet.add(toDateString(w.startTime));
  });
  const uniqueDates = Array.from(dateSet).sort().reverse();

  const lastWorkoutDate = workouts[0].startTime;
  const todayStr = toDateString(new Date());

  // Allowed rest days in between scheduled workouts
  // E.g., 4 days/week -> 3 rest days allowed across week (max gap ~ 2-3 days)
  const restDaysAllowed = Math.max(1, Math.ceil((7 - (workoutDaysPerWeek || 4)) / 2) + 1);

  // Check if current streak is still alive
  // Streak is alive if latest workout was today, yesterday, or within allowed rest interval
  const daysSinceLatest = getDayDiff(todayStr, uniqueDates[0]);
  const isStreakAlive = daysSinceLatest <= restDaysAllowed;

  let currentStreak = 0;
  let longestStreak = 0;

  if (isStreakAlive) {
    currentStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const diff = getDayDiff(uniqueDates[i], uniqueDates[i + 1]);
      if (diff === 1) {
        // Consecutive workout day
        currentStreak++;
      } else if (diff <= restDaysAllowed + 1) {
        // Valid rest day within schedule
        currentStreak++;
      } else {
        // Streak broken
        break;
      }
    }
  }

  // Calculate historical longest streak
  // Sort dates ascending for forward pass
  const ascendingDates = [...uniqueDates].reverse();
  let tempStreak = ascendingDates.length > 0 ? 1 : 0;
  longestStreak = tempStreak;

  for (let i = 0; i < ascendingDates.length - 1; i++) {
    const diff = getDayDiff(ascendingDates[i + 1], ascendingDates[i]);
    if (diff === 1 || diff <= restDaysAllowed + 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    totalWorkouts,
    lastWorkoutDate,
  };
};

/**
 * Update user's streak fields after saving a workout
 * @param {object} user Mongoose user document
 * @param {object} workout Workout document
 */
const updateStreakOnWorkout = async (user, workout) => {
  if (!user) return null;

  const streakStats = await calculateUserStreak(user._id, user.workoutDaysPerWeek);

  user.currentStreak = streakStats.currentStreak;
  user.longestStreak = Math.max(user.longestStreak || 0, streakStats.longestStreak);
  user.totalWorkouts = streakStats.totalWorkouts;
  user.lastWorkoutDate = streakStats.lastWorkoutDate || workout.startTime;

  await user.save();
  return streakStats;
};

module.exports = {
  calculateUserStreak,
  updateStreakOnWorkout,
  toDateString,
  getDayDiff,
};

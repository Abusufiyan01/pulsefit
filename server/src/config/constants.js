/**
 * PulseFit Application Constants
 */

const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'arms',
  'quads',
  'hamstrings',
  'calves',
  'glutes',
  'legs',
  'abs',
  'obliques',
  'core',
  'cardio',
  'full_body',
];

const EQUIPMENT_TYPES = [
  'barbell',
  'dumbbell',
  'kettlebell',
  'machine',
  'cable',
  'bodyweight',
  'bands',
  'other',
];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const EXERCISE_CATEGORIES = ['strength', 'cardio', 'flexibility', 'calisthenics'];

const GOALS = ['lose_fat', 'build_muscle', 'maintain', 'improve_endurance'];

const UNIT_PREFERENCES = ['metric', 'imperial'];

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const FOOD_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Indian',
  'Beverage',
  'Other',
];

const GOAL_TYPES = [
  'weight',
  'workout_frequency',
  'lift_target',
  'daily_steps',
  'water_intake',
];

const PR_TYPES = ['max_weight', 'max_reps', 'estimated_1rm'];

const PHOTO_TAGS = ['front', 'side', 'back'];

const ACHIEVEMENTS = {
  FIRST_WORKOUT: 'first_workout',
  WEEK_STREAK_7: 'week_streak_7',
  MONTH_STREAK_30: 'month_streak_30',
  HUNDRED_SETS: 'hundred_sets',
  FIRST_PR: 'first_pr',
  EARLY_BIRD: 'early_bird',
  NIGHT_OWL: 'night_owl',
  BEAST_MODE: 'beast_mode',
  CONSISTENT: 'consistent',
  WEIGHTLOSS_5: 'weightloss_5',
  STRENGTH_MILESTONE: 'strength_milestone',
};

const BADGE_DEFINITIONS = [
  {
    type: ACHIEVEMENTS.FIRST_WORKOUT,
    name: 'First Step',
    description: 'Completed your first workout on PulseFit',
    icon: '🚀',
  },
  {
    type: ACHIEVEMENTS.WEEK_STREAK_7,
    name: '7-Day Streak',
    description: 'Maintained an active workout streak for 7 consecutive days',
    icon: '🔥',
  },
  {
    type: ACHIEVEMENTS.MONTH_STREAK_30,
    name: 'Unstoppable Momentum',
    description: 'Maintained an active workout streak for 30 consecutive days',
    icon: '⚡',
  },
  {
    type: ACHIEVEMENTS.HUNDRED_SETS,
    name: 'Century Club',
    description: 'Completed 100 sets of exercise',
    icon: '💯',
  },
  {
    type: ACHIEVEMENTS.FIRST_PR,
    name: 'Record Breaker',
    description: 'Achieved your first personal record',
    icon: '🥇',
  },
  {
    type: ACHIEVEMENTS.EARLY_BIRD,
    name: 'Early Bird',
    description: 'Crushed a workout session before 7:00 AM',
    icon: '🌅',
  },
  {
    type: ACHIEVEMENTS.NIGHT_OWL,
    name: 'Night Owl',
    description: 'Completed a workout session after 10:00 PM',
    icon: '🌙',
  },
  {
    type: ACHIEVEMENTS.BEAST_MODE,
    name: 'Beast Mode',
    description: 'Completed 5 or more workouts in a single calendar week',
    icon: '🦁',
  },
  {
    type: ACHIEVEMENTS.CONSISTENT,
    name: 'Iron Consistency',
    description: 'Logged 12 or more workouts in a single month',
    icon: '🛡️',
  },
  {
    type: ACHIEVEMENTS.WEIGHTLOSS_5,
    name: 'Progress Pioneer',
    description: 'Successfully lost 5 kg toward your fitness transformation',
    icon: '📉',
  },
  {
    type: ACHIEVEMENTS.STRENGTH_MILESTONE,
    name: 'Triple Digit Club',
    description: 'Lifted 100 kg or more in a working set',
    icon: '🏋️‍♂️',
  },
];

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

module.exports = {
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  DIFFICULTY_LEVELS,
  EXERCISE_CATEGORIES,
  GOALS,
  UNIT_PREFERENCES,
  MEAL_TYPES,
  FOOD_CATEGORIES,
  GOAL_TYPES,
  PR_TYPES,
  PHOTO_TAGS,
  ACHIEVEMENTS,
  BADGE_DEFINITIONS,
  ACTIVITY_MULTIPLIERS,
};

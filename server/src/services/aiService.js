/**
 * AI Service for PulseFit
 * Provides Gemini API integration with rule-based fallback, 10-minute caching, and user rate limiting.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cache = require('../utils/cache');
const Food = require('../models/Food');
const Exercise = require('../models/Exercise');
const Routine = require('../models/Routine');

// User hourly rate limit: 3 calls per 60 minutes
const MAX_CALLS_PER_HOUR = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// In-memory call tracker: { userId: [timestamp1, timestamp2] }
const userCallTracker = new Map();

/**
 * Check and record user rate limit
 * @param {string} userId 
 * @returns {{ allowed: boolean, remaining: number, resetInMinutes: number }}
 */
const checkRateLimit = (userId) => {
  const now = Date.now();
  const timestamps = userCallTracker.get(userId) || [];

  // Filter timestamps within past 60 minutes
  const recentCalls = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recentCalls.length >= MAX_CALLS_PER_HOUR) {
    const oldestCall = recentCalls[0];
    const resetInMinutes = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldestCall)) / 60000);
    return {
      allowed: false,
      remaining: 0,
      resetInMinutes,
    };
  }

  recentCalls.push(now);
  userCallTracker.set(userId, recentCalls);

  return {
    allowed: true,
    remaining: MAX_CALLS_PER_HOUR - recentCalls.length,
    resetInMinutes: 60,
  };
};

/**
 * Helper to call Gemini model with prompt
 * @param {string} prompt 
 * @returns {Promise<string|null>}
 */
const generateWithGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your-gemini-api-key-here') {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.warn(`[AIService] Gemini API call failed, falling back to rule engine: ${error.message}`);
    return null;
  }
};

/**
 * Rule-based fallback workout plan generator
 */
const getFallbackWorkoutPlan = async (goal, experience, equipment) => {
  // Query suitable exercises from database
  const query = {};
  if (equipment && equipment.length > 0) {
    query.equipment = { $in: equipment };
  }

  const exercises = await Exercise.find(query).limit(30);

  const chestExercises = exercises.filter((e) => e.muscleGroup?.primary === 'chest');
  const backExercises = exercises.filter((e) => e.muscleGroup?.primary === 'back');
  const legExercises = exercises.filter((e) => ['quads', 'hamstrings', 'glutes'].includes(e.muscleGroup?.primary));
  const shoulderExercises = exercises.filter((e) => e.muscleGroup?.primary === 'shoulders');
  const armExercises = exercises.filter((e) => ['biceps', 'triceps'].includes(e.muscleGroup?.primary));
  const coreExercises = exercises.filter((e) => e.muscleGroup?.primary === 'abs');

  const getSetRep = () => {
    if (goal === 'build_muscle') return { sets: 4, reps: '8-12', rpe: 8 };
    if (goal === 'lose_fat') return { sets: 3, reps: '12-15', rpe: 7 };
    if (goal === 'improve_endurance') return { sets: 3, reps: '15-20', rpe: 7 };
    return { sets: 3, reps: '10-12', rpe: 8 };
  };

  const sr = getSetRep();

  return {
    title: `Custom ${experience || 'Intermediate'} ${goal ? goal.replace('_', ' ').toUpperCase() : 'FITNESS'} Plan`,
    goal: goal || 'build_muscle',
    experienceLevel: experience || 'intermediate',
    weeklySchedule: [
      {
        day: 'Monday',
        focus: 'Chest & Triceps (Push)',
        exercises: [
          { name: chestExercises[0]?.name || 'Barbell Bench Press', ...sr },
          { name: chestExercises[1]?.name || 'Incline Dumbbell Press', ...sr },
          { name: armExercises[0]?.name || 'Tricep Rope Pushdown', ...sr },
          { name: coreExercises[0]?.name || 'Hanging Leg Raises', sets: 3, reps: '15', rpe: 8 },
        ],
      },
      {
        day: 'Tuesday',
        focus: 'Back & Biceps (Pull)',
        exercises: [
          { name: backExercises[0]?.name || 'Lat Pulldown', ...sr },
          { name: backExercises[1]?.name || 'Barbell Bent Over Row', ...sr },
          { name: armExercises[1]?.name || 'Dumbbell Bicep Curl', ...sr },
          { name: coreExercises[1]?.name || 'Plank', sets: 3, reps: '60s hold', rpe: 8 },
        ],
      },
      {
        day: 'Wednesday',
        focus: 'Active Recovery or Cardio',
        exercises: [{ name: 'Incline Treadmill Walk or Light Cycling', sets: 1, reps: '30-40 mins', rpe: 6 }],
      },
      {
        day: 'Thursday',
        focus: 'Legs & Calves (Lower)',
        exercises: [
          { name: legExercises[0]?.name || 'Barbell Back Squat', ...sr },
          { name: legExercises[1]?.name || 'Romanian Deadlift', ...sr },
          { name: legExercises[2]?.name || 'Leg Press', ...sr },
          { name: 'Standing Calf Raises', sets: 4, reps: '15-20', rpe: 8 },
        ],
      },
      {
        day: 'Friday',
        focus: 'Shoulders & Full Core',
        exercises: [
          { name: shoulderExercises[0]?.name || 'Overhead Dumbbell Press', ...sr },
          { name: shoulderExercises[1]?.name || 'Lateral Raises', ...sr },
          { name: backExercises[2]?.name || 'Face Pulls', ...sr },
          { name: coreExercises[0]?.name || 'Ab Wheel Rollouts', sets: 3, reps: '12', rpe: 8 },
        ],
      },
      {
        day: 'Saturday & Sunday',
        focus: 'Rest & Recovery',
        exercises: [{ name: 'Hydration, mobility stretches, and 8 hours sleep', sets: 1, reps: 'Rest', rpe: 1 }],
      },
    ],
    tips: [
      'Focus on progressive overload by increasing weight or reps each week.',
      'Maintain 60-90 seconds rest between working sets.',
      'Prioritize protein intake and sleep quality for optimal recovery.',
    ],
    source: 'rule_based_fallback',
  };
};

/**
 * Generate Workout Plan
 * @param {object} user 
 * @param {object} preferences 
 */
const generateWorkoutPlan = async (user, preferences = {}) => {
  const cacheKey = `ai_plan_${user._id}_${preferences.goal || user.goal}_${preferences.experienceLevel || user.experienceLevel}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const rateCheck = checkRateLimit(user._id.toString());
  if (!rateCheck.allowed) {
    // If rate limit reached, return cached or fallback with notice
    const fallback = await getFallbackWorkoutPlan(user.goal, user.experienceLevel, user.availableEquipment);
    fallback.notice = `AI rate limit reached (3/hr). Showing calibrated smart template. Resets in ${rateCheck.resetInMinutes}m.`;
    return fallback;
  }

  const goal = preferences.goal || user.goal || 'build_muscle';
  const experience = preferences.experienceLevel || user.experienceLevel || 'intermediate';
  const equipment = preferences.availableEquipment || user.availableEquipment || ['barbell', 'dumbbell'];
  const daysPerWeek = preferences.workoutDaysPerWeek || user.workoutDaysPerWeek || 4;

  const prompt = `You are an elite certified strength & conditioning coach.
Generate a structured, personalized weekly workout routine in valid JSON format for:
- User Goal: ${goal}
- Experience Level: ${experience}
- Workout Days Per Week: ${daysPerWeek}
- Equipment Available: ${equipment.join(', ')}

Return ONLY a valid JSON object with the following structure:
{
  "title": "string",
  "goal": "${goal}",
  "experienceLevel": "${experience}",
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Muscle groups",
      "exercises": [
        { "name": "Exercise Name", "sets": 3, "reps": "8-12", "rpe": 8 }
      ]
    }
  ],
  "tips": ["tip1", "tip2"]
}`;

  const geminiText = await generateWithGemini(prompt);
  if (geminiText) {
    try {
      const cleanJson = geminiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      parsed.source = 'gemini_ai';
      cache.set(cacheKey, parsed, 600);
      return parsed;
    } catch (_e) {
      // JSON parse error, fall back
    }
  }

  const fallback = await getFallbackWorkoutPlan(goal, experience, equipment);
  cache.set(cacheKey, fallback, 600);
  return fallback;
};

/**
 * Fallback meal recommendations from database
 */
const getFallbackMealSuggestions = async (calorieTarget, remainingMacros) => {
  const highProteinFoods = await Food.find({ protein: { $gte: 15 } }).limit(6);
  const carbSources = await Food.find({ carbs: { $gte: 20 } }).limit(6);
  const healthyFats = await Food.find({ fat: { $gte: 10 } }).limit(4);

  return {
    targetCalories: calorieTarget,
    targetMacros: remainingMacros,
    suggestions: [
      {
        meal: 'Breakfast',
        items: [
          highProteinFoods[0] ? `${highProteinFoods[0].name} (${highProteinFoods[0].servingSize}${highProteinFoods[0].servingUnit})` : 'Eggs / Paneer',
          carbSources[0] ? `${carbSources[0].name} (${carbSources[0].servingSize}${carbSources[0].servingUnit})` : 'Oats / Roti',
        ],
        estimatedCalories: 450,
        estimatedProtein: 32,
      },
      {
        meal: 'Lunch',
        items: [
          highProteinFoods[1] ? `${highProteinFoods[1].name} (${highProteinFoods[1].servingSize}${highProteinFoods[1].servingUnit})` : 'Chicken Breast / Dal & Paneer',
          carbSources[1] ? `${carbSources[1].name} (${carbSources[1].servingSize}${carbSources[1].servingUnit})` : 'Steamed Brown Rice',
          'Mixed green vegetables salad with 1 tsp olive oil',
        ],
        estimatedCalories: 650,
        estimatedProtein: 45,
      },
      {
        meal: 'Snack',
        items: [
          highProteinFoods[2] ? `${highProteinFoods[2].name}` : 'Greek Yogurt / Whey Shake',
          healthyFats[0] ? `${healthyFats[0].name}` : 'Almonds (20g)',
        ],
        estimatedCalories: 280,
        estimatedProtein: 25,
      },
      {
        meal: 'Dinner',
        items: [
          highProteinFoods[3] ? `${highProteinFoods[3].name}` : 'Fish Curry / Tofu Bowl',
          carbSources[2] ? `${carbSources[2].name}` : 'Whole Wheat Roti (2 pcs)',
          'Sautéed spinach and broccoli',
        ],
        estimatedCalories: 550,
        estimatedProtein: 38,
      },
    ],
    source: 'rule_based_fallback',
  };
};

/**
 * Generate Meal Suggestions
 * @param {object} user 
 * @param {object} context 
 */
const generateMealSuggestions = async (user, context = {}) => {
  const cacheKey = `ai_meals_${user._id}_${context.date || new Date().toISOString().split('T')[0]}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const rateCheck = checkRateLimit(user._id.toString());
  const remainingMacros = context.remainingMacros || user.macroTargets;
  const targetCalories = context.remainingCalories || user.dailyCalorieTarget;

  if (!rateCheck.allowed) {
    const fallback = await getFallbackMealSuggestions(targetCalories, remainingMacros);
    fallback.notice = `AI rate limit reached (3/hr). Showing calibrated macro suggestions. Resets in ${rateCheck.resetInMinutes}m.`;
    return fallback;
  }

  const prompt = `You are a sports nutritionist. Generate a wholesome daily meal plan matching these target macros:
- Calories: ~${targetCalories} kcal
- Protein: ~${remainingMacros.protein} g
- Carbs: ~${remainingMacros.carbs} g
- Fat: ~${remainingMacros.fat} g
- User Goal: ${user.goal}
- Include varied choices with Indian and international fitness staple foods (e.g. oats, eggs, paneer, dal, rice, chicken, Greek yogurt).

Return ONLY a valid JSON object matching:
{
  "targetCalories": ${targetCalories},
  "suggestions": [
    {
      "meal": "Breakfast",
      "items": ["Item 1", "Item 2"],
      "estimatedCalories": 450,
      "estimatedProtein": 30
    }
  ],
  "tips": ["Hydrate properly", "Space protein evenly"]
}`;

  const geminiText = await generateWithGemini(prompt);
  if (geminiText) {
    try {
      const cleanJson = geminiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      parsed.source = 'gemini_ai';
      cache.set(cacheKey, parsed, 600);
      return parsed;
    } catch (_e) {
      // Fall through to fallback
    }
  }

  const fallback = await getFallbackMealSuggestions(targetCalories, remainingMacros);
  cache.set(cacheKey, fallback, 600);
  return fallback;
};

/**
 * Generate Progress Insights based on user stats
 * @param {object} user 
 * @param {object} stats 
 */
const generateProgressInsights = async (user, stats = {}) => {
  const cacheKey = `ai_insights_${user._id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const rateCheck = checkRateLimit(user._id.toString());

  // Rule-based fallback insights
  const streak = user.currentStreak || 0;
  const workoutsCount = stats.totalWorkouts || user.totalWorkouts || 0;
  const weightChange = stats.weightChange || 0;

  const ruleInsights = [];
  if (streak >= 7) {
    ruleInsights.push(`Incredible dedication! You have sustained an active ${streak}-day workout streak.`);
  } else if (streak > 0) {
    ruleInsights.push(`Good rhythm! You have an active ${streak}-day streak. Keep showing up today.`);
  } else {
    ruleInsights.push('Time to jump back in! Log a workout today to reignite your streak.');
  }

  if (workoutsCount >= 20) {
    ruleInsights.push(`You have logged ${workoutsCount} total workouts. Consistency is clearly building your foundation.`);
  }

  if (user.goal === 'lose_fat') {
    if (weightChange < 0) {
      ruleInsights.push(`Great job: you are down ${Math.abs(weightChange)} kg. Your caloric deficit is working smoothly.`);
    } else {
      ruleInsights.push('Weight is holding steady. Ensure you are logging all snacks and tracking liquid calories.');
    }
  } else if (user.goal === 'build_muscle') {
    if (weightChange > 0) {
      ruleInsights.push(`You have gained ${weightChange} kg. Maintain adequate protein (~${user.macroTargets?.protein}g) to support lean muscle hypertrophy.`);
    } else {
      ruleInsights.push(`For muscle growth, aim to consistently hit your target of ~${user.dailyCalorieTarget} kcal/day.`);
    }
  }

  const fallbackResult = {
    summary: `PulseFit Analysis for ${user.name}`,
    insights: ruleInsights,
    recommendations: [
      'Prioritize 7-8 hours of restful sleep for neuromuscular recovery.',
      'Drink at least 2.5-3.0 liters of water daily.',
      'Progressive overload: try to add 1 extra rep or 1-2.5 kg on your compound lifts this week.',
    ],
    source: 'rule_based_fallback',
  };

  if (!rateCheck.allowed) {
    fallbackResult.notice = `AI rate limit reached (3/hr). Showing calculated stats insights.`;
    return fallbackResult;
  }

  const prompt = `You are a high-performance fitness coach analyzing athlete data:
- User: ${user.name}, Goal: ${user.goal}, Weight: ${user.weight}kg, Height: ${user.height}cm
- Current Streak: ${streak} days, Total Workouts: ${workoutsCount}
- Weight Change: ${weightChange} kg
- Workout Frequency: ${user.workoutDaysPerWeek} days/week

Return ONLY a valid JSON object matching:
{
  "summary": "Short 2-sentence performance summary",
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Actionable tip 1", "Actionable tip 2"]
}`;

  const geminiText = await generateWithGemini(prompt);
  if (geminiText) {
    try {
      const cleanJson = geminiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      parsed.source = 'gemini_ai';
      cache.set(cacheKey, parsed, 600);
      return parsed;
    } catch (_e) {
      // Fall through
    }
  }

  cache.set(cacheKey, fallbackResult, 600);
  return fallbackResult;
};

/**
 * Get daily motivational fitness quote
 */
const getDailyQuote = () => {
  const quotes = [
    { quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
    { quote: 'The body achieves what the mind believes.', author: 'Napoleon Hill' },
    { quote: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
    { quote: 'Success starts with self-discipline.', author: 'Dwayne Johnson' },
    { quote: 'No citizen has a right to be an amateur in the matter of physical training.', author: 'Socrates' },
    { quote: 'The only bad workout is the one that did not happen.', author: 'Unknown' },
    { quote: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
    { quote: 'Continuous effort—not strength or intelligence—is the key to unlocking our potential.', author: 'Winston Churchill' },
  ];

  // Pick quote based on day of year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const selected = quotes[dayOfYear % quotes.length];

  return selected;
};

module.exports = {
  checkRateLimit,
  generateWorkoutPlan,
  generateMealSuggestions,
  generateProgressInsights,
  getDailyQuote,
  getFallbackWorkoutPlan,
  getFallbackMealSuggestions,
};

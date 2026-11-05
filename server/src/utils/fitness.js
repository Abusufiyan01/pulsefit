/**
 * Fitness Calculations Utility
 * Handles BMI, BMR (Mifflin-St Jeor), TDEE, Calorie Targets, Macros, and 1RM
 */
const { ACTIVITY_MULTIPLIERS } = require('../config/constants');

/**
 * Calculate Body Mass Index (BMI)
 * @param {number} weightKg Weight in kilograms
 * @param {number} heightCm Height in centimeters
 * @returns {number} BMI rounded to 2 decimal places
 */
const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 100) / 100;
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
 * Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 * Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {number} age
 * @param {string} gender 'male' | 'female' | 'other'
 * @returns {number} BMR rounded integer
 */
const calculateBMR = (weightKg, heightCm, age, gender = 'male') => {
  if (!weightKg || !heightCm || !age) return 1800;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'female') {
    return Math.round(base - 161);
  }
  // For male and other, default to male formula or midpoint
  if (gender === 'male') {
    return Math.round(base + 5);
  }
  return Math.round(base - 78);
};

/**
 * Map workout days per week to activity level
 * @param {number} workoutDaysPerWeek 
 * @returns {string} activity level key
 */
const getActivityLevelFromDays = (workoutDaysPerWeek = 4) => {
  if (workoutDaysPerWeek <= 1) return 'sedentary';
  if (workoutDaysPerWeek <= 2) return 'light';
  if (workoutDaysPerWeek <= 4) return 'moderate';
  if (workoutDaysPerWeek <= 6) return 'very_active';
  return 'extra_active';
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * @param {number} bmr 
 * @param {string|number} activity Activity key or days per week
 * @returns {number} TDEE rounded integer
 */
const calculateTDEE = (bmr, activity = 'moderate') => {
  if (!bmr) return 2000;
  let multiplier = ACTIVITY_MULTIPLIERS.moderate;

  if (typeof activity === 'number') {
    const level = getActivityLevelFromDays(activity);
    multiplier = ACTIVITY_MULTIPLIERS[level] || 1.55;
  } else if (ACTIVITY_MULTIPLIERS[activity]) {
    multiplier = ACTIVITY_MULTIPLIERS[activity];
  }

  return Math.round(bmr * multiplier);
};

/**
 * Calculate Daily Calorie Target based on TDEE and Goal
 * @param {number} tdee 
 * @param {string} goal 'lose_fat' | 'build_muscle' | 'maintain' | 'improve_endurance'
 * @returns {number} Calorie target integer
 */
const calculateDailyCalorieTarget = (tdee, goal = 'build_muscle') => {
  if (!tdee) return 2200;
  let target = tdee;

  switch (goal) {
    case 'lose_fat':
      target = tdee - 500;
      break;
    case 'build_muscle':
      target = tdee + 300;
      break;
    case 'maintain':
      target = tdee;
      break;
    case 'improve_endurance':
      target = tdee + 100;
      break;
    default:
      target = tdee;
  }

  // Enforce a minimum safe calorie threshold (1200 kcal)
  return Math.max(1200, Math.round(target));
};

/**
 * Calculate Macronutrient splits
 * Protein: 2.2g per kg bodyweight
 * Fat: 25% of total calories (9 kcal/g)
 * Carbs: Remaining calories (4 kcal/g)
 * @param {number} calorieTarget 
 * @param {number} weightKg 
 * @returns {{ protein: number, carbs: number, fat: number }}
 */
const calculateMacros = (calorieTarget, weightKg) => {
  const safeCalories = Math.max(calorieTarget || 2000, 1200);
  const safeWeight = weightKg || 70;

  // Protein: 2.2g per kg
  const proteinGrams = Math.round(safeWeight * 2.2);
  const proteinCalories = proteinGrams * 4;

  // Fat: 25% of calories
  const fatCalories = safeCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Carbs: Remaining calories
  const remainingCalories = Math.max(0, safeCalories - proteinCalories - (fatGrams * 9));
  const carbGrams = Math.round(remainingCalories / 4);

  return {
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
  };
};

/**
 * Calculate Daily Water Intake Target (in ml)
 * Default: ~35ml per kg bodyweight, minimum 2500ml
 * @param {number} weightKg 
 * @returns {number} ml
 */
const calculateWaterTarget = (weightKg = 70) => {
  return Math.max(2500, Math.round(weightKg * 35));
};

/**
 * Calculate One Rep Max (1RM) using Epley Formula
 * 1RM = weight * (1 + reps / 30)
 * @param {number} weight 
 * @param {number} reps 
 * @returns {number} 1RM rounded to 1 decimal place
 */
const calculateOneRepMax = (weight, reps) => {
  if (!weight || weight <= 0) return 0;
  if (!reps || reps <= 1) return weight;
  const epley = weight * (1 + reps / 30);
  return Math.round(epley * 10) / 10;
};

/**
 * Estimate calories burned during a workout session
 * MET formula: MET * 3.5 * weightKg / 200 * durationMinutes
 * Standard weight training MET ~ 6.0
 * @param {number} durationMinutes 
 * @param {number} weightKg 
 * @param {number} met 
 * @returns {number} calories burned
 */
const estimateCaloriesBurned = (durationMinutes = 45, weightKg = 70, met = 6.0) => {
  if (!durationMinutes || durationMinutes <= 0) return 0;
  const safeWeight = weightKg || 70;
  const calories = (met * 3.5 * safeWeight / 200) * durationMinutes;
  return Math.round(calories);
};

module.exports = {
  calculateBMI,
  calculateBMR,
  getActivityLevelFromDays,
  calculateTDEE,
  calculateDailyCalorieTarget,
  calculateMacros,
  calculateWaterTarget,
  calculateOneRepMax,
  estimateCaloriesBurned,
};

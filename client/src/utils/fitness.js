/**
 * Fitness Calculations and Conversions Utility
 */

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
}

export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return 0
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  return Math.round(bmi * 10) / 10
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-500' }
  if (bmi < 25) return { label: 'Normal weight', color: 'text-emerald-500' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-500' }
  return { label: 'Obese', color: 'text-red-500' }
}

export function calculateBMR(weightKg, heightCm, age, gender = 'male') {
  if (!weightKg || !heightCm || !age) return 1800
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  if (gender === 'female') {
    return Math.round(base - 161)
  }
  if (gender === 'male') {
    return Math.round(base + 5)
  }
  return Math.round(base - 78)
}

export function getActivityMultiplier(workoutDays = 4) {
  if (workoutDays <= 1) return ACTIVITY_MULTIPLIERS.sedentary
  if (workoutDays <= 2) return ACTIVITY_MULTIPLIERS.light
  if (workoutDays <= 4) return ACTIVITY_MULTIPLIERS.moderate
  if (workoutDays <= 6) return ACTIVITY_MULTIPLIERS.very_active
  return ACTIVITY_MULTIPLIERS.extra_active
}

export function calculateTDEE(bmr, workoutDays = 4) {
  if (!bmr) return 2000
  const multiplier = getActivityMultiplier(workoutDays)
  return Math.round(bmr * multiplier)
}

export function calculateDailyCalorieTarget(tdee, goal = 'build_muscle') {
  if (!tdee) return 2200
  let target = tdee
  switch (goal) {
    case 'lose_fat':
      target = tdee - 500
      break
    case 'build_muscle':
      target = tdee + 300
      break
    case 'maintain':
      target = tdee
      break
    case 'improve_endurance':
      target = tdee + 150
      break
    default:
      target = tdee
  }
  return Math.max(1200, Math.round(target))
}

export function calculateMacros(calorieTarget, weightKg = 70) {
  const safeCalories = Math.max(calorieTarget || 2000, 1200)
  const safeWeight = weightKg || 70

  // Protein: 2.2g per kg
  const proteinGrams = Math.round(safeWeight * 2.2)
  const proteinCalories = proteinGrams * 4

  // Fat: 25% of calories
  const fatCalories = safeCalories * 0.25
  const fatGrams = Math.round(fatCalories / 9)

  // Carbs: Remaining calories
  const remainingCalories = Math.max(0, safeCalories - proteinCalories - (fatGrams * 9))
  const carbGrams = Math.round(remainingCalories / 4)

  return {
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
  }
}

export function calculateWaterTarget(weightKg = 70) {
  return Math.max(2500, Math.round((weightKg || 70) * 35))
}

export function calculateOneRepMax(weight, reps) {
  if (!weight || weight <= 0) return 0
  if (!reps || reps <= 1) return Number(weight)
  const epley = weight * (1 + reps / 30)
  return Math.round(epley * 10) / 10
}

export function estimateCaloriesBurned(durationMinutes = 45, weightKg = 70, met = 6.0) {
  if (!durationMinutes || durationMinutes <= 0) return 0
  const safeWeight = weightKg || 70
  const calories = (met * 3.5 * safeWeight / 200) * durationMinutes
  return Math.round(calories)
}

export function kgToLbs(kg) {
  if (!kg) return 0
  return Math.round(kg * 2.20462 * 10) / 10
}

export function lbsToKg(lbs) {
  if (!lbs) return 0
  return Math.round((lbs / 2.20462) * 10) / 10
}

export function cmToInches(cm) {
  if (!cm) return 0
  return Math.round((cm / 2.54) * 10) / 10
}

export function inchesToCm(inches) {
  if (!inches) return 0
  return Math.round(inches * 2.54 * 10) / 10
}

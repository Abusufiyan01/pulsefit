import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Apple,
  Droplets,
  Flame,
  Search,
  Sparkles,
  PieChart,
  Calendar,
  Zap,
} from 'lucide-react'
import { format, addDays, subDays, isToday } from 'date-fns'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ProgressRing from '../../components/ui/ProgressRing'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import FoodSearchModal from '../../components/FoodSearchModal'
import { useAuthStore } from '../../store/authStore'
import nutritionService from '../../services/nutritionService'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🍳', defaultTime: '08:00 AM' },
  { id: 'lunch', label: 'Lunch', icon: '🥗', defaultTime: '01:00 PM' },
  { id: 'dinner', label: 'Dinner', icon: '🍲', defaultTime: '07:30 PM' },
  { id: 'snack', label: 'Snacks & Supplements', icon: '🍎', defaultTime: 'Anytime' },
]

export default function NutritionPage() {
  const { user } = useAuthStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [nutritionData, setNutritionData] = useState({
    totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
  })
  const [waterData, setWaterData] = useState({ glasses: 0, totalMl: 0 })
  const [activeModalMeal, setActiveModalMeal] = useState(null)
  const [isWaterUpdating, setIsWaterUpdating] = useState(false)

  const dateString = format(selectedDate, 'yyyy-MM-dd')

  useEffect(() => {
    fetchDayData(dateString)
  }, [dateString])

  const fetchDayData = async (dateStr) => {
    setLoading(true)
    try {
      const [foodRes, waterRes] = await Promise.allSettled([
        nutritionService.getFoodLogs(dateStr),
        nutritionService.getWater(dateStr),
      ])

      if (foodRes.status === 'fulfilled') {
        const payload = foodRes.value.data?.data || foodRes.value.data || {}
        setNutritionData({
          totals: payload.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
          meals: payload.meals || { breakfast: [], lunch: [], dinner: [], snack: [] },
        })
      }

      if (waterRes.status === 'fulfilled') {
        const wPayload = waterRes.value.data?.data || waterRes.value.data || {}
        setWaterData({
          glasses: wPayload.glasses || 0,
          totalMl: wPayload.totalMl || (wPayload.glasses || 0) * 250,
        })
      }
    } catch {
      toast.error('Failed to load nutrition logs')
    } finally {
      setLoading(false)
    }
  }

  // Targets from user or defaults
  const targetCalories = user?.dailyCalorieTarget || 2200
  const targetProtein = user?.macroTargets?.protein || 160
  const targetCarbs = user?.macroTargets?.carbs || 220
  const targetFat = user?.macroTargets?.fat || 65
  const targetWaterGlasses = user?.waterTarget ? Math.round(user.waterTarget / 250) : 10

  const calories = Math.round(nutritionData.totals.calories || 0)
  const protein = Math.round(nutritionData.totals.protein || 0)
  const carbs = Math.round(nutritionData.totals.carbs || 0)
  const fat = Math.round(nutritionData.totals.fat || 0)

  // Handle adding food from modal
  const handleAddFoodItem = async (foodItem) => {
    try {
      const meal = foodItem.mealType || activeModalMeal || 'breakfast'
      const payload = {
        date: dateString,
        meal: meal.toLowerCase() === 'snacks' ? 'snack' : meal.toLowerCase(),
        foods: [
          {
            foodId: foodItem.foodId,
            name: foodItem.name,
            servingSize: foodItem.servingSize || 100,
            servingUnit: foodItem.servingUnit || 'g',
            servings: foodItem.servings || 1,
            calories: Number(foodItem.calories) || 0,
            protein: Number(foodItem.protein) || 0,
            carbs: Number(foodItem.carbs) || 0,
            fat: Number(foodItem.fat) || 0,
          },
        ],
      }

      await nutritionService.addFoodLog(payload)
      toast.success(`Added to ${meal}`)
      fetchDayData(dateString)
    } catch {
      toast.error('Failed to log food item')
    }
  }

  // Handle removing a food log
  const handleDeleteLog = async (logId) => {
    try {
      await nutritionService.removeFoodLog(logId)
      toast.success('Food entry removed')
      fetchDayData(dateString)
    } catch {
      toast.error('Failed to delete food entry')
    }
  }

  // Handle Water Logging
  const handleIncrementWater = async (amount = 1) => {
    setIsWaterUpdating(true)
    try {
      const nextGlasses = Math.max(0, (waterData.glasses || 0) + amount)
      await nutritionService.logWater({
        date: dateString,
        glasses: nextGlasses,
        totalMl: nextGlasses * 250,
      })
      setWaterData({ glasses: nextGlasses, totalMl: nextGlasses * 250 })
    } catch {
      toast.error('Could not update water log')
    } finally {
      setIsWaterUpdating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header and Date Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-display tracking-tight">
            Nutrition & Hydration
          </h1>
          <p className="text-muted text-sm mt-1">
            Track your caloric intake, macro splits, and daily hydration targets.
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-surface border border-border p-1.5 rounded-2xl shadow-sm">
          <button
            onClick={() => setSelectedDate((d) => subDays(d, 1))}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer text-muted hover:text-current"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date())}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isToday(selectedDate)
                ? 'bg-primary-500 text-white'
                : 'text-current hover:bg-white/10'
            }`}
          >
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
          </button>

          <button
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer text-muted hover:text-current"
            aria-label="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Macro Rings Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base lg:text-lg">Daily Macro Breakdown</h2>
          <span className="text-xs text-muted">
            Target: <strong>{targetCalories} kcal</strong>
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-2">
              <ProgressRing
                value={calories}
                max={targetCalories}
                size={88}
                strokeWidth={7}
                color="#FF5A1F"
                label={String(calories)}
                sublabel="cal"
              />
              <span className="text-xs font-bold text-current">Calories</span>
              <span className="text-xs text-muted">
                {calories} / {targetCalories} kcal
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <ProgressRing
                value={protein}
                max={targetProtein}
                size={88}
                strokeWidth={7}
                color="#10B981"
                label={`${protein}g`}
                sublabel="protein"
              />
              <span className="text-xs font-bold text-current">Protein</span>
              <span className="text-xs text-muted">
                {protein}g / {targetProtein}g
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <ProgressRing
                value={carbs}
                max={targetCarbs}
                size={88}
                strokeWidth={7}
                color="#3B82F6"
                label={`${carbs}g`}
                sublabel="carbs"
              />
              <span className="text-xs font-bold text-current">Carbs</span>
              <span className="text-xs text-muted">
                {carbs}g / {targetCarbs}g
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <ProgressRing
                value={fat}
                max={targetFat}
                size={88}
                strokeWidth={7}
                color="#F59E0B"
                label={`${fat}g`}
                sublabel="fat"
              />
              <span className="text-xs font-bold text-current">Fat</span>
              <span className="text-xs text-muted">
                {fat}g / {targetFat}g
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Water Tracker Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-current">Hydration Tracker</h3>
                <Badge color="info" size="xs">
                  {waterData.totalMl} ml
                </Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {waterData.glasses} of {targetWaterGlasses} glasses recorded today (250ml / glass)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={waterData.glasses <= 0 || isWaterUpdating}
              onClick={() => handleIncrementWater(-1)}
            >
              -1 Glass
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              loading={isWaterUpdating}
              onClick={() => handleIncrementWater(1)}
            >
              +1 Glass
            </Button>
          </div>
        </div>

        {/* Glasses Progress Bar */}
        <div className="mt-4">
          <div className="h-3 rounded-full bg-surface border border-border/60 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  100,
                  Math.round(((waterData.glasses || 0) / targetWaterGlasses) * 100)
                )}%`,
              }}
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
            />
          </div>
        </div>
      </Card>

      {/* Meals List */}
      <div className="space-y-4">
        {MEAL_TYPES.map((mealType) => {
          const logsForMeal = nutritionData.meals[mealType.id] || []
          const mealCalories = logsForMeal.reduce(
            (sum, log) => sum + (log.totalCalories || log.calories || 0),
            0
          )
          const mealProtein = logsForMeal.reduce(
            (sum, log) => sum + (log.totalProtein || log.protein || 0),
            0
          )

          return (
            <Card key={mealType.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{mealType.icon}</span>
                  <div>
                    <h3 className="font-bold text-base text-current">{mealType.label}</h3>
                    <span className="text-xs text-muted">
                      {mealCalories} kcal • {Math.round(mealProtein)}g protein
                    </span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setActiveModalMeal(mealType.id)}
                >
                  Add Food
                </Button>
              </div>

              {logsForMeal.length === 0 ? (
                <div className="py-6 text-center rounded-xl bg-surface/50 border border-border/40">
                  <Apple className="w-7 h-7 text-muted mx-auto mb-1.5 opacity-40" />
                  <p className="text-xs text-muted">No items logged for {mealType.label.toLowerCase()}</p>
                  <button
                    onClick={() => setActiveModalMeal(mealType.id)}
                    className="text-xs font-semibold text-primary-500 hover:underline mt-1.5 cursor-pointer inline-flex items-center gap-1"
                  >
                    + Log food item
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {logsForMeal.map((log) => {
                    const foods = log.foods || [log]
                    return foods.map((f, fIdx) => (
                      <div
                        key={`${log._id || log.id}-${fIdx}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border/50 text-xs"
                      >
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-sm text-current">{f.name}</h4>
                          <p className="text-muted">
                            {f.servings || 1} serving • {f.servingSize || 100}
                            {f.servingUnit || 'g'}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-bold text-sm text-primary-500 block">
                              {Math.round(f.calories || 0)} kcal
                            </span>
                            <span className="text-[10px] text-muted">
                              P: {Math.round(f.protein || 0)}g • C: {Math.round(f.carbs || 0)}g • F: {Math.round(f.fat || 0)}g
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteLog(log._id || log.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                            aria-label="Remove Food Log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Food Search & Custom Food Modal */}
      <FoodSearchModal
        isOpen={!!activeModalMeal}
        onClose={() => setActiveModalMeal(null)}
        mealType={activeModalMeal || 'breakfast'}
        onAddFood={handleAddFoodItem}
      />
    </motion.div>
  )
}

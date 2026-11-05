import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Flame,
  Dumbbell,
  Apple,
  Droplets,
  TrendingUp,
  Trophy,
  Sparkles,
  Target,
  Zap,
  ChevronRight,
  Clock,
  ArrowUpRight,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, startOfWeek, addDays, isToday } from 'date-fns'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import ProgressRing from '../../components/ui/ProgressRing'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import api from '../../lib/api'

// Motivational quotes fallback
const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Push yourself, because no one else is going to do it for you.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Success starts with self-discipline.",
  "The difference between try and triumph is a little umph.",
  "Don't stop when you're tired. Stop when you're done.",
  "Be stronger than your excuses.",
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    todayNutrition: null,
    todayWater: null,
    weeklyWorkouts: [],
    recentPRs: [],
    goals: [],
    insights: [],
    quote: QUOTES[Math.floor(Math.random() * QUOTES.length)],
    nextRoutine: null,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const today = format(new Date(), 'yyyy-MM-dd')

    try {
      const [nutritionRes, waterRes, workoutsRes, prsRes, goalsRes] = await Promise.allSettled([
        api.get(`/nutrition/food-logs/date/${today}`),
        api.get(`/water/date/${today}`),
        api.get('/workouts', { params: { limit: 14 } }),
        api.get('/personal-records'),
        api.get('/goals'),
      ])

      // Build weekly activity chart data
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const rawWorkouts = workoutsRes.status === 'fulfilled'
        ? (workoutsRes.value.data?.data || workoutsRes.value.data || [])
        : []
      const workouts = Array.isArray(rawWorkouts) ? rawWorkouts : []

      const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const day = addDays(weekStart, i)
        const dayStr = format(day, 'yyyy-MM-dd')
        const count = workouts.filter((w) => {
          const wDate = w.startTime || w.createdAt || w.date
          return wDate && format(new Date(wDate), 'yyyy-MM-dd') === dayStr
        }).length
        return {
          day: format(day, 'EEE'),
          workouts: count,
          isToday: isToday(day),
        }
      })

      // Parse PRs
      let prs = []
      if (prsRes.status === 'fulfilled') {
        const resData = prsRes.value.data?.data || prsRes.value.data
        if (Array.isArray(resData)) {
          prs = resData
        } else if (resData?.allRecords && Array.isArray(resData.allRecords)) {
          prs = resData.allRecords
        } else if (resData?.groupedByExercise && Array.isArray(resData.groupedByExercise)) {
          prs = resData.groupedByExercise.map((g) => {
            const firstKey = Object.keys(g.records || {})[0]
            return g.records?.[firstKey] || { exerciseName: g.exerciseName, value: 0, type: 'max_weight' }
          })
        }
      }

      // Parse Goals
      const rawGoals = goalsRes.status === 'fulfilled'
        ? (goalsRes.value.data?.data || goalsRes.value.data || [])
        : []
      const goals = Array.isArray(rawGoals) ? rawGoals : []

      setData({
        todayNutrition: nutritionRes.status === 'fulfilled' ? nutritionRes.value.data?.data || nutritionRes.value.data : null,
        todayWater: waterRes.status === 'fulfilled' ? waterRes.value.data?.data || waterRes.value.data : null,
        weeklyWorkouts: weeklyData,
        recentPRs: prs.slice(0, 3),
        goals: goals.slice(0, 4),
        quote: QUOTES[Math.floor(Math.random() * QUOTES.length)],
        nextRoutine: null,
        insights: [],
      })

      // Fetch AI insights separately (non-blocking)
      try {
        const insightsRes = await api.get('/ai/progress-insights')
        const rawInsights = insightsRes.data?.insights || insightsRes.data?.data?.insights || []
        setData((prev) => ({
          ...prev,
          insights: Array.isArray(rawInsights) ? rawInsights : [rawInsights].filter(Boolean),
        }))
      } catch {
        // AI insights optional fallback
      }
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const targetCalories = user?.dailyCalorieTarget || 2000
  const targetProtein = user?.macroTargets?.protein || 150
  const targetWater = user?.waterTarget ? Math.round(user.waterTarget / 250) : 10

  // Calculate totals from nutrition data
  let totalCalories = 0
  let totalProtein = 0

  if (data.todayNutrition) {
    if (data.todayNutrition.totals) {
      totalCalories = Math.round(data.todayNutrition.totals.calories || 0)
      totalProtein = Math.round(data.todayNutrition.totals.protein || 0)
    } else if (Array.isArray(data.todayNutrition)) {
      totalCalories = data.todayNutrition.reduce((s, l) => s + (l.totalCalories || l.calories || 0), 0)
      totalProtein = data.todayNutrition.reduce((s, l) => s + (l.totalProtein || l.protein || 0), 0)
    }
  }

  const totalWater = data.todayWater?.glasses ?? (data.todayWater?.totalMl ? Math.round(data.todayWater.totalMl / 250) : 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" lines={2} className="max-w-xs" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
        <Skeleton variant="chart" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-48" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-8"
    >
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-display tracking-tight">
            {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Athlete'}</span>! 💪
          </h1>
          <p className="text-muted text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-primary-500/20 shadow-sm self-start sm:self-auto"
          style={{ background: 'rgba(255,90,31,0.12)' }}
        >
          <Flame className="w-5 h-5 text-primary-500" fill="currentColor" />
          <div>
            <span className="font-bold text-sm text-primary-500">{user?.currentStreak || 0} Day Streak</span>
            <span className="text-[10px] block text-muted font-medium">Keep crushing it!</span>
          </div>
        </div>
      </div>

      {/* Today's Progress Rings */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base lg:text-lg">Today's Nutrition & Activity</h2>
          <span className="text-xs text-muted">Daily Targets</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center gap-2">
            <ProgressRing
              value={totalCalories}
              max={targetCalories}
              size={84}
              strokeWidth={7}
              color="#FF5A1F"
              label={String(totalCalories)}
              sublabel="cal"
            />
            <span className="text-xs font-semibold text-current">Calories</span>
            <span className="text-xs text-muted">
              {totalCalories} / {targetCalories} kcal
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ProgressRing
              value={totalProtein}
              max={targetProtein}
              size={84}
              strokeWidth={7}
              color="#10B981"
              label={`${totalProtein}g`}
              sublabel="protein"
            />
            <span className="text-xs font-semibold text-current">Protein</span>
            <span className="text-xs text-muted">
              {totalProtein}g / {targetProtein}g
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ProgressRing
              value={totalWater}
              max={targetWater}
              size={84}
              strokeWidth={7}
              color="#3B82F6"
              label={String(totalWater)}
              sublabel={`/ ${targetWater}`}
            />
            <span className="text-xs font-semibold text-current">Water</span>
            <span className="text-xs text-muted">
              {totalWater} / {targetWater} glasses
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ProgressRing
              value={user?.totalWorkouts || 0}
              max={user?.workoutDaysPerWeek || 4}
              size={84}
              strokeWidth={7}
              color="#8B5CF6"
              label={String(user?.totalWorkouts || 0)}
              sublabel="total"
            />
            <span className="text-xs font-semibold text-current">Workouts</span>
            <span className="text-xs text-muted">
              {user?.totalWorkouts || 0} completed
            </span>
          </div>
        </div>
      </Card>

      {/* Weekly Activity Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-base lg:text-lg">Weekly Workout Frequency</h2>
            <p className="text-xs text-muted">Sessions completed this week</p>
          </div>
          <button
            onClick={() => navigate('/app/progress')}
            className="text-xs font-semibold text-primary-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View Full Report <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={data.weeklyWorkouts} barSize={32} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                fontSize: '12px',
                color: 'var(--color-text)',
              }}
              cursor={{ fill: 'rgba(255,90,31,0.06)' }}
              formatter={(v) => [v, 'Workouts']}
            />
            <Bar dataKey="workouts" radius={[6, 6, 0, 0]}>
              {data.weeklyWorkouts.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.isToday
                      ? '#FF5A1F'
                      : entry.workouts > 0
                      ? 'rgba(255,90,31,0.5)'
                      : 'var(--color-surface)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Quick Actions + Goal Progress Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <Card className="md:col-span-1">
          <h2 className="font-bold text-base mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Log Workout', icon: Dumbbell, to: '/app/workout/log', color: '#FF5A1F' },
              { label: 'Log Meal', icon: Apple, to: '/app/nutrition', color: '#10B981' },
              { label: 'Add Water', icon: Droplets, to: '/app/nutrition', color: '#3B82F6' },
              { label: 'Log Weight', icon: TrendingUp, to: '/app/body', color: '#8B5CF6' },
            ].map(({ label, icon: Icon, to, color }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl transition-all hover:scale-[1.03] active:scale-95 cursor-pointer border border-transparent hover:border-border"
                style={{ background: `${color}15` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}25` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-xs font-semibold text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Goals Progress */}
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base">Active Goals</h2>
              <p className="text-xs text-muted">Tracking your fitness targets</p>
            </div>
            <button
              onClick={() => navigate('/app/goals')}
              className="text-xs font-semibold text-primary-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Goals <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data.goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No active goals set</p>
              <p className="text-xs text-muted mt-0.5">Set a bodyweight, strength or frequency milestone.</p>
              <button
                onClick={() => navigate('/app/goals')}
                className="text-xs text-primary-500 font-semibold mt-3 hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                Create your first goal <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.goals.map((goal) => {
                const target = goal.targetValue || 1
                const current = goal.currentValue || 0
                const pct = Math.min(100, Math.max(0, Math.round((current / target) * 100)))
                return (
                  <div key={goal._id || goal.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-current truncate pr-2">{goal.title}</span>
                      <span className="text-xs text-muted flex-shrink-0">
                        <strong className="text-current font-bold">{current}</strong> / {target} {goal.unit || ''} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-primary"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent PRs + AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent PRs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Personal Records
            </h2>
            <button
              onClick={() => navigate('/app/workout/personal-records')}
              className="text-xs font-semibold text-primary-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {data.recentPRs.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No PRs recorded yet</p>
              <p className="text-xs text-muted mt-0.5">Log a workout to automatically detect new personal records!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentPRs.map((pr) => (
                <div
                  key={pr._id || pr.id || `${pr.exerciseName}-${pr.type}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/40"
                  style={{ background: 'var(--color-surface)' }}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-400/15 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{pr.exerciseName}</p>
                    <p className="text-xs text-muted">
                      {pr.type === 'max_weight'
                        ? `${pr.value} kg (Heaviest Weight)`
                        : pr.type === 'max_reps'
                        ? `${pr.value} reps (Max Reps)`
                        : `${typeof pr.value === 'number' ? pr.value.toFixed(1) : pr.value} kg (Estimated 1RM)`}
                    </p>
                  </div>
                  <Badge color="warning" size="xs">PR</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Insights */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base">AI Coach Insights</h2>
              <Badge color="primary" size="xs">
                <Sparkles className="w-3 h-3 inline mr-1" /> Pulse AI
              </Badge>
            </div>
          </div>
          {data.insights.length === 0 ? (
            <div className="space-y-3">
              <div
                className="p-4 rounded-xl border"
                style={{
                  background: 'rgba(255,90,31,0.06)',
                  borderColor: 'rgba(255,90,31,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-2 text-primary-500 font-bold text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4" /> Daily Spark
                </div>
                <p className="text-sm italic text-muted leading-relaxed">"{data.quote}"</p>
              </div>
              <p className="text-xs text-muted">
                Log regular workouts and meals to generate personalized AI recovery and volume feedback.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.insights.slice(0, 3).map((insight, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-border/40 text-sm leading-relaxed"
                  style={{ background: 'var(--color-surface)' }}
                >
                  {insight}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Motivational Quote Banner */}
      <Card className="text-center py-7 px-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-3">
          <Flame className="w-6 h-6 text-primary-500" />
        </div>
        <p className="text-base lg:text-lg font-semibold italic max-w-xl mx-auto text-current">
          "{data.quote}"
        </p>
        <span className="text-xs font-semibold text-primary-500 tracking-wider uppercase mt-2 block">
          Daily Motivation • PulseFit
        </span>
      </Card>
    </motion.div>
  )
}

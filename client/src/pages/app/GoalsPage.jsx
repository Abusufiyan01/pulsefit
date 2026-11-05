import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Trophy,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Lock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Edit2,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Tabs from '../../components/ui/Tabs'
import goalService from '../../services/goalService'
import api from '../../lib/api'
import { formatDate } from '../../utils/dates'
import toast from 'react-hot-toast'

const DEFAULT_ACHIEVEMENTS = [
  {
    type: 'first_workout',
    name: 'First Step',
    description: 'Logged your very first workout in PulseFit.',
    icon: '⚡',
    isUnlocked: true,
    unlockedAt: '2026-10-01T08:00:00.000Z',
  },
  {
    type: 'streak_7',
    name: 'On Fire',
    description: 'Maintained a 7-day workout streak.',
    icon: '🔥',
    isUnlocked: true,
    unlockedAt: '2026-10-08T08:00:00.000Z',
  },
  {
    type: 'streak_30',
    name: 'Iron Will',
    description: 'Maintained a 30-day streak of workouts or hydration.',
    icon: '🛡️',
    isUnlocked: false,
  },
  {
    type: 'prs_5',
    name: 'Record Breaker',
    description: 'Achieved 5 unique Personal Records.',
    icon: '🏆',
    isUnlocked: true,
    unlockedAt: '2026-10-20T14:30:00.000Z',
  },
  {
    type: 'prs_20',
    name: 'Century Lifter',
    description: 'Achieved 20 Personal Records across your exercise catalog.',
    icon: '👑',
    isUnlocked: false,
  },
  {
    type: 'heavy_squat',
    name: 'Leg Day Hero',
    description: 'Squatted over 100 kg for at least one repetition.',
    icon: '🏋️',
    isUnlocked: true,
    unlockedAt: '2026-10-18T16:30:00.000Z',
  },
  {
    type: 'volume_100k',
    name: 'Titan Volume',
    description: 'Accumulated over 100,000 kg in total training volume.',
    icon: '⛰️',
    isUnlocked: false,
  },
  {
    type: 'hydration_master',
    name: 'Hydration Pro',
    description: 'Hit 100% of your daily water intake 14 days in a row.',
    icon: '💧',
    isUnlocked: false,
  },
]

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState('goals') // 'goals' or 'achievements'
  const [goals, setGoals] = useState([])
  const [achievements, setAchievements] = useState([])
  const [stats, setStats] = useState({ totalUnlocked: 0, totalBadges: 8, percentage: 0 })
  const [loading, setLoading] = useState(true)

  // Create Goal Modal
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    type: 'weight',
    title: '',
    targetValue: '',
    currentValue: '',
    unit: 'kg',
    targetDate: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  // Update Progress Modal
  const [progressModalGoal, setProgressModalGoal] = useState(null)
  const [newProgressValue, setNewProgressValue] = useState('')
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false)

  // Delete Goal
  const [goalToDelete, setGoalToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchGoalsAndAchievements()
  }, [])

  const fetchGoalsAndAchievements = async () => {
    setLoading(true)
    try {
      const [goalsRes, achRes] = await Promise.allSettled([
        goalService.getGoals(),
        goalService.getAchievements(),
      ])

      if (goalsRes.status === 'fulfilled') {
        const data = goalsRes.value.data?.data || goalsRes.value.data || []
        setGoals(Array.isArray(data) ? data : [])
      }

      if (achRes.status === 'fulfilled') {
        const aData = achRes.value.data?.data || achRes.value.data || {}
        const list = aData.achievements || aData
        if (Array.isArray(list) && list.length > 0) {
          setAchievements(list)
          const unlocked = list.filter((a) => a.isUnlocked).length
          setStats({
            totalUnlocked: unlocked,
            totalBadges: list.length,
            percentage: Math.round((unlocked / list.length) * 100),
          })
        } else {
          setAchievements(DEFAULT_ACHIEVEMENTS)
          const unl = DEFAULT_ACHIEVEMENTS.filter((a) => a.isUnlocked).length
          setStats({
            totalUnlocked: unl,
            totalBadges: DEFAULT_ACHIEVEMENTS.length,
            percentage: Math.round((unl / DEFAULT_ACHIEVEMENTS.length) * 100),
          })
        }
      } else {
        setAchievements(DEFAULT_ACHIEVEMENTS)
      }
    } catch {
      toast.error('Failed to load goals & achievements')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoalSubmit = async (e) => {
    e.preventDefault()
    if (!createForm.title.trim() || !createForm.targetValue) {
      toast.error('Title and target value are required')
      return
    }

    setIsCreating(true)
    try {
      const payload = {
        type: createForm.type,
        title: createForm.title.trim(),
        targetValue: Number(createForm.targetValue),
        currentValue: Number(createForm.currentValue) || 0,
        unit: createForm.unit || 'kg',
        targetDate: createForm.targetDate || undefined,
      }

      const res = await goalService.createGoal(payload)
      const created = res.data?.data || res.data || { ...payload, _id: Date.now().toString() }

      setGoals((prev) => [created, ...prev])
      toast.success('Goal created successfully!')
      setCreateModalOpen(false)
      setCreateForm({
        type: 'weight',
        title: '',
        targetValue: '',
        currentValue: '',
        unit: 'kg',
        targetDate: '',
      })
    } catch {
      toast.error('Failed to create goal')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateProgressSubmit = async (e) => {
    e.preventDefault()
    if (!progressModalGoal) return

    setIsUpdatingProgress(true)
    try {
      const id = progressModalGoal._id || progressModalGoal.id
      const val = Number(newProgressValue)
      const isCompleted = val >= progressModalGoal.targetValue

      await goalService.updateGoal(id, {
        currentValue: val,
        isCompleted,
      })

      setGoals((prev) =>
        prev.map((g) =>
          (g._id || g.id) === id ? { ...g, currentValue: val, isCompleted } : g
        )
      )

      toast.success(isCompleted ? '🎉 Goal Completed!' : 'Progress updated!')
      setProgressModalGoal(null)
    } catch {
      toast.error('Failed to update goal progress')
    } finally {
      setIsUpdatingProgress(false)
    }
  }

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return
    setIsDeleting(true)
    try {
      const id = goalToDelete._id || goalToDelete.id
      await goalService.deleteGoal(id)
      setGoals((prev) => prev.filter((g) => (g._id || g.id) !== id))
      toast.success('Goal deleted')
      setGoalToDelete(null)
    } catch {
      toast.error('Failed to delete goal')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-display tracking-tight flex items-center gap-2.5">
            <Target className="w-8 h-8 text-primary-500" /> Goals & Trophies
          </h1>
          <p className="text-muted text-sm mt-1">
            Set ambitious targets, log milestone progress, and unlock fitness achievements.
          </p>
        </div>

        {activeTab === 'goals' && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create New Goal
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs
        tabs={[
          { value: 'goals', label: `Active Goals (${goals.length})` },
          { value: 'achievements', label: `Achievements (${stats.totalUnlocked}/${stats.totalBadges})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* GOALS TAB */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="card" className="h-32" />
              ))}
            </div>
          ) : goals.length === 0 ? (
            <Card>
              <EmptyState
                icon={Target}
                title="No Goals Created Yet"
                description="Set a body weight target, workout frequency, or strength benchmark to stay motivated."
                action={() => setCreateModalOpen(true)}
                actionLabel="Create First Goal"
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const target = goal.targetValue || 1
                const current = goal.currentValue || 0
                const pct = Math.min(100, Math.max(0, Math.round((current / target) * 100)))
                const isFinished = pct >= 100 || goal.isCompleted

                return (
                  <Card key={goal._id || goal.id} className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isFinished ? 'bg-emerald-500/15' : 'bg-primary-500/15'
                          }`}
                        >
                          {isFinished ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Target className="w-5 h-5 text-primary-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-current">{goal.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <span className="capitalize">{goal.type?.replace('_', ' ')}</span>
                            {goal.targetDate && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Target: {formatDate(goal.targetDate, 'MMM d, yyyy')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setProgressModalGoal(goal)
                            setNewProgressValue(String(goal.currentValue || 0))
                          }}
                        >
                          Update
                        </Button>
                        <button
                          onClick={() => setGoalToDelete(goal)}
                          className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Numerical stats */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-current">
                          {current} / {target} {goal.unit || ''}
                        </span>
                        <span className="font-bold text-primary-500">{pct}% Completed</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-surface border border-border/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${
                            isFinished ? 'bg-emerald-500' : 'bg-gradient-primary'
                          }`}
                        />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ACHIEVEMENTS TAB */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Achievement Progress Overview Card */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-500">
                  Hall of Trophies
                </span>
                <h2 className="text-xl font-bold mt-0.5">
                  {stats.totalUnlocked} of {stats.totalBadges} Badges Unlocked
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Accomplish daily workout and strength milestones to unlock new badges.
                </p>
              </div>

              <div className="w-36 text-right">
                <span className="text-xl font-black text-current">{stats.percentage}%</span>
                <div className="h-2 rounded-full bg-surface border border-border/50 overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Grid of Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {achievements.map((badge, idx) => {
              const unlocked = badge.isUnlocked

              return (
                <Card
                  key={badge.type || idx}
                  className={`flex flex-col items-center text-center p-5 transition-all ${
                    unlocked
                      ? 'border-primary-500/40 shadow-glow'
                      : 'border-border/60 opacity-60 grayscale'
                  }`}
                >
                  <div
                    className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 ${
                      unlocked
                        ? 'bg-gradient-to-tr from-[#FF5A1F] to-[#F0261B] text-white shadow-md'
                        : 'bg-surface border border-border text-muted'
                    }`}
                  >
                    <span>{badge.icon || '🏆'}</span>
                    {!unlocked && (
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-bg-card border border-border text-muted">
                        <Lock className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-current leading-snug">{badge.name}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>

                  {unlocked && badge.unlockedAt && (
                    <span className="text-[10px] font-bold text-primary-500 mt-3 block">
                      Unlocked {formatDate(badge.unlockedAt, 'MMM d, yyyy')}
                    </span>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Fitness Goal"
        size="md"
      >
        <form onSubmit={handleCreateGoalSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              Goal Type
            </label>
            <select
              value={createForm.type}
              onChange={(e) => {
                const t = e.target.value
                setCreateForm((prev) => ({
                  ...prev,
                  type: t,
                  unit: t === 'workout_frequency' ? 'days/week' : t === 'water' ? 'glasses' : 'kg',
                }))
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="weight">Bodyweight Target</option>
              <option value="strength">Strength / Lift PR Target</option>
              <option value="workout_frequency">Weekly Workout Frequency</option>
              <option value="water">Daily Water Intake</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Bench Press 100kg"
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Target Value *
              </label>
              <input
                type="number"
                step="any"
                required
                value={createForm.targetValue}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, targetValue: e.target.value }))}
                placeholder="100"
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Current Starting Value
              </label>
              <input
                type="number"
                step="any"
                value={createForm.currentValue}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, currentValue: e.target.value }))}
                placeholder="80"
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={createForm.unit}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, unit: e.target.value }))}
                placeholder="kg"
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Target Deadline
              </label>
              <input
                type="date"
                value={createForm.targetDate}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, targetDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isCreating}>
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Goal Progress Modal */}
      <Modal
        open={!!progressModalGoal}
        onClose={() => setProgressModalGoal(null)}
        title="Update Goal Progress"
        size="sm"
      >
        {progressModalGoal && (
          <form onSubmit={handleUpdateProgressSubmit} className="space-y-4">
            <div>
              <h4 className="font-bold text-sm text-current">{progressModalGoal.title}</h4>
              <p className="text-xs text-muted mt-0.5">
                Target: {progressModalGoal.targetValue} {progressModalGoal.unit}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                New Current Value ({progressModalGoal.unit})
              </label>
              <input
                type="number"
                step="any"
                required
                value={newProgressValue}
                onChange={(e) => setNewProgressValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setProgressModalGoal(null)}
                disabled={isUpdatingProgress}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={isUpdatingProgress}>
                Save Progress
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={handleDeleteGoal}
        title="Delete Goal?"
        message={`Are you sure you want to remove the goal "${goalToDelete?.title}"?`}
        confirmLabel="Delete Goal"
        danger
        loading={isDeleting}
      />
    </motion.div>
  )
}

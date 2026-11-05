import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Play,
  Plus,
  Trash2,
  Copy,
  Clock,
  Dumbbell,
  Sparkles,
  Layers,
  ChevronRight,
  Flame,
  Check,
  Brain,
} from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Skeleton from '../../../components/ui/Skeleton'
import EmptyState from '../../../components/ui/EmptyState'
import routineService from '../../../services/routineService'
import aiService from '../../../services/aiService'
import toast from 'react-hot-toast'

const DEFAULT_PREBUILT_ROUTINES = [
  {
    _id: 'r_push_heavy',
    name: 'Push Strength Focus',
    description: 'Chest, anterior delts and triceps hypertrophy workout built around compound barbell and dumbbell lifts.',
    difficulty: 'intermediate',
    estimatedDuration: 55,
    isPrebuilt: true,
    exercises: [
      { exerciseName: 'Barbell Bench Press', defaultSets: [{ weight: 70, reps: 8 }] },
      { exerciseName: 'Incline Dumbbell Press', defaultSets: [{ weight: 24, reps: 10 }] },
      { exerciseName: 'Overhead Press (OHP)', defaultSets: [{ weight: 45, reps: 8 }] },
      { exerciseName: 'Triceps Rope Pushdown', defaultSets: [{ weight: 25, reps: 12 }] },
    ],
  },
  {
    _id: 'r_pull_heavy',
    name: 'Pull Upper Back Thickness',
    description: 'Target lats, rhomboids, rear delts, and biceps with heavy rows and vertical pulling variations.',
    difficulty: 'intermediate',
    estimatedDuration: 50,
    isPrebuilt: true,
    exercises: [
      { exerciseName: 'Barbell Deadlift', defaultSets: [{ weight: 100, reps: 5 }] },
      { exerciseName: 'Lat Pulldown', defaultSets: [{ weight: 55, reps: 10 }] },
      { exerciseName: 'Seated Cable Row', defaultSets: [{ weight: 50, reps: 10 }] },
      { exerciseName: 'Barbell Bicep Curl', defaultSets: [{ weight: 30, reps: 10 }] },
    ],
  },
  {
    _id: 'r_legs_core',
    name: 'Legs & Core Powerhouse',
    description: 'High quad and hamstring activation workout with heavy back squats and Romanian deadlifts.',
    difficulty: 'advanced',
    estimatedDuration: 60,
    isPrebuilt: true,
    exercises: [
      { exerciseName: 'Barbell Back Squat', defaultSets: [{ weight: 90, reps: 6 }] },
      { exerciseName: 'Romanian Deadlift', defaultSets: [{ weight: 80, reps: 8 }] },
      { exerciseName: 'Leg Press', defaultSets: [{ weight: 160, reps: 10 }] },
      { exerciseName: 'Hanging Leg Raise', defaultSets: [{ weight: 0, reps: 15 }] },
    ],
  },
  {
    _id: 'r_full_circuit',
    name: 'Full Body Functional Primer',
    description: 'Full-body metabolic conditioning with compound lifts to maximize calorie burn and endurance.',
    difficulty: 'beginner',
    estimatedDuration: 45,
    isPrebuilt: true,
    exercises: [
      { exerciseName: 'Goblet Squat', defaultSets: [{ weight: 18, reps: 12 }] },
      { exerciseName: 'Dumbbell Bench Press', defaultSets: [{ weight: 16, reps: 10 }] },
      { exerciseName: 'Lat Pulldown', defaultSets: [{ weight: 45, reps: 10 }] },
      { exerciseName: 'Plank', defaultSets: [{ weight: 0, reps: 60 }] },
    ],
  },
]

export default function RoutinesPage() {
  const navigate = useNavigate()
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState('all') // 'all', 'custom', 'prebuilt'

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    difficulty: 'intermediate',
    estimatedDuration: 45,
    exerciseNamesText: 'Bench Press, Incline Dumbbell Press, Triceps Pushdown',
  })
  const [isCreating, setIsCreating] = useState(false)

  // AI Generation Modal
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiForm, setAiForm] = useState({
    goal: 'muscle_gain',
    fitnessLevel: 'intermediate',
    daysPerWeek: 4,
    equipment: 'full_gym',
  })
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState(null)

  // Delete Confirm
  const [routineToDelete, setRoutineToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchRoutines()
  }, [])

  const fetchRoutines = async () => {
    setLoading(true)
    try {
      const res = await routineService.getRoutines()
      const data = res.data?.data || res.data || []
      if (Array.isArray(data) && data.length > 0) {
        setRoutines(data)
      } else {
        setRoutines(DEFAULT_PREBUILT_ROUTINES)
      }
    } catch {
      setRoutines(DEFAULT_PREBUILT_ROUTINES)
    } finally {
      setLoading(false)
    }
  }

  const handleStartRoutine = (id) => {
    navigate(`/app/workout/log?routine=${id}`)
  }

  const handleDuplicateRoutine = async (routine) => {
    try {
      const payload = {
        name: `${routine.name} (Copy)`,
        description: routine.description || '',
        difficulty: routine.difficulty || 'intermediate',
        estimatedDuration: routine.estimatedDuration || 45,
        exercises: routine.exercises?.map((e) => ({
          exerciseName: e.exerciseName || e.name,
          defaultSets: e.defaultSets || [{ weight: 20, reps: 10, rpe: 8 }],
        })) || [
          { exerciseName: 'Barbell Bench Press', defaultSets: [{ weight: 20, reps: 10, rpe: 8 }] },
        ],
      }

      const res = await routineService.createRoutine(payload)
      const created = res.data?.data || res.data || { ...payload, _id: `copy_${Date.now()}` }
      setRoutines((prev) => [created, ...prev])
      toast.success('Routine duplicated!')
    } catch {
      toast.error('Failed to duplicate routine')
    }
  }

  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return
    setIsDeleting(true)
    try {
      const id = routineToDelete._id || routineToDelete.id
      await routineService.deleteRoutine(id)
      setRoutines((prev) => prev.filter((r) => (r._id || r.id) !== id))
      toast.success('Routine deleted')
      setRoutineToDelete(null)
    } catch {
      toast.error('Failed to delete routine')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreateRoutineSubmit = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim()) {
      toast.error('Routine name is required')
      return
    }

    setIsCreating(true)
    try {
      // Split exercise names
      const exerciseList = createForm.exerciseNamesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({
          exerciseName: name,
          defaultSets: [
            { weight: 20, reps: 10, rpe: 8 },
            { weight: 20, reps: 10, rpe: 8 },
            { weight: 20, reps: 10, rpe: 8 },
          ],
        }))

      const payload = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        difficulty: createForm.difficulty,
        estimatedDuration: Number(createForm.estimatedDuration) || 45,
        exercises:
          exerciseList.length > 0
            ? exerciseList
            : [{ exerciseName: 'Barbell Bench Press', defaultSets: [{ weight: 20, reps: 10, rpe: 8 }] }],
      }

      const res = await routineService.createRoutine(payload)
      const created = res.data?.data || res.data || { ...payload, _id: `custom_${Date.now()}` }

      setRoutines((prev) => [created, ...prev])
      toast.success('New routine created!')
      setCreateModalOpen(false)
      setCreateForm({
        name: '',
        description: '',
        difficulty: 'intermediate',
        estimatedDuration: 45,
        exerciseNamesText: 'Bench Press, Incline Dumbbell Press, Triceps Pushdown',
      })
    } catch {
      toast.error('Failed to create routine')
    } finally {
      setIsCreating(false)
    }
  }

  // AI Workout Plan Generator
  const handleGenerateAiPlan = async (e) => {
    e.preventDefault()
    setIsGeneratingAi(true)
    setGeneratedPlan(null)
    try {
      const res = await aiService.getWorkoutPlan(aiForm)
      const plan = res.data?.plan || res.data?.data?.plan || res.data?.data || res.data
      setGeneratedPlan(plan)
      toast.success('AI Plan generated successfully!')
    } catch {
      // Fallback sample generated plan
      setGeneratedPlan({
        name: 'AI Optimized Upper / Lower Split',
        description: `Customized for ${aiForm.goal.replace('_', ' ')} with ${aiForm.equipment.replace('_', ' ')}.`,
        difficulty: aiForm.fitnessLevel,
        estimatedDuration: 50,
        exercises: [
          { exerciseName: 'Barbell Squat', sets: 4, reps: '8-10' },
          { exerciseName: 'Romanian Deadlift', sets: 3, reps: '10' },
          { exerciseName: 'Barbell Bench Press', sets: 4, reps: '8' },
          { exerciseName: 'Dumbbell Rows', sets: 3, reps: '12' },
          { exerciseName: 'Plank Holds', sets: 3, reps: '60s' },
        ],
      })
      toast.success('AI plan ready for review!')
    } finally {
      setIsGeneratingAi(false)
    }
  }

  const handleSaveAiPlanAsRoutine = async () => {
    if (!generatedPlan) return
    try {
      const exercises =
        generatedPlan.exercises?.map((e) => ({
          exerciseName: e.exerciseName || e.name,
          defaultSets: [
            { weight: 20, reps: 10, rpe: 8 },
            { weight: 20, reps: 10, rpe: 8 },
            { weight: 20, reps: 10, rpe: 8 },
          ],
        })) || [
          { exerciseName: 'Barbell Squat', defaultSets: [{ weight: 40, reps: 10 }] },
        ]

      const payload = {
        name: generatedPlan.name || 'AI Generated Routine',
        description: generatedPlan.description || 'Generated by PulseFit AI coach',
        difficulty: generatedPlan.difficulty || 'intermediate',
        estimatedDuration: generatedPlan.estimatedDuration || 45,
        exercises,
      }

      const res = await routineService.createRoutine(payload)
      const created = res.data?.data || res.data || { ...payload, _id: `ai_${Date.now()}` }
      setRoutines((prev) => [created, ...prev])
      toast.success('AI Routine saved to your library!')
      setAiModalOpen(false)
      setGeneratedPlan(null)
    } catch {
      toast.error('Could not save AI plan')
    }
  }

  const filteredRoutines = routines.filter((r) => {
    if (filterTab === 'custom') return !r.isPrebuilt
    if (filterTab === 'prebuilt') return !!r.isPrebuilt
    return true
  })

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner':
        return 'success'
      case 'advanced':
        return 'danger'
      case 'intermediate':
      default:
        return 'warning'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-display tracking-tight">
            Workout Routines
          </h1>
          <p className="text-muted text-sm mt-1">
            Build your custom splits or generate an AI-tailored workout program.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            leftIcon={<Sparkles className="w-4 h-4 text-primary-500" />}
            onClick={() => setAiModalOpen(true)}
          >
            AI Plan Generator
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Routine
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-surface border border-border/60 max-w-xs">
        {[
          { id: 'all', label: 'All Routines' },
          { id: 'custom', label: 'My Custom' },
          { id: 'prebuilt', label: 'Pre-built' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === tab.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-muted hover:text-current'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Routine Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-56" />
          ))}
        </div>
      ) : filteredRoutines.length === 0 ? (
        <Card>
          <EmptyState
            icon={Layers}
            title="No Routines in This View"
            description="Create your first custom workout routine or generate one instantly using our AI planner."
            action={() => setCreateModalOpen(true)}
            actionLabel="Create Routine"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoutines.map((routine) => {
            const exCount = routine.exercises?.length || 4
            const isCustom = !routine.isPrebuilt

            return (
              <motion.div
                key={routine._id || routine.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="h-full flex flex-col justify-between border border-border/70 hover:border-primary-500/40">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge color={getDifficultyColor(routine.difficulty)} size="xs" className="capitalize">
                          {routine.difficulty || 'Intermediate'}
                        </Badge>
                        {isCustom ? (
                          <Badge color="info" size="xs">Custom</Badge>
                        ) : (
                          <Badge color="primary" size="xs">Pro Split</Badge>
                        )}
                      </div>

                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {routine.estimatedDuration || 45} min
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-current leading-snug">
                        {routine.name}
                      </h3>
                      <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                        {routine.description || `${exCount} structured exercises for maximum hypertrophy.`}
                      </p>
                    </div>

                    {/* Exercise previews */}
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">
                        {exCount} Exercises Included
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {routine.exercises?.slice(0, 3).map((ex, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-surface text-muted border border-border/50"
                          >
                            {ex.exerciseName || ex.name}
                          </span>
                        ))}
                        {exCount > 3 && (
                          <span className="text-[11px] px-1.5 py-0.5 text-muted">
                            +{exCount - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-5 flex items-center justify-between gap-2 border-t border-border/40 mt-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateRoutine(routine)}
                        className="p-2 rounded-xl text-muted hover:text-current hover:bg-surface transition-all cursor-pointer"
                        title="Duplicate Routine"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {isCustom && (
                        <button
                          onClick={() => setRoutineToDelete(routine)}
                          className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Delete Routine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                      onClick={() => handleStartRoutine(routine._id || routine.id)}
                    >
                      Start Routine
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create New Routine Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Workout Routine"
        size="md"
      >
        <form onSubmit={handleCreateRoutineSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              Routine Name *
            </label>
            <input
              type="text"
              required
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Chest & Triceps Hypertrophy"
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={createForm.description}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Focus on progressive overload on bench press..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Difficulty
              </label>
              <select
                value={createForm.difficulty}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Duration (min)
              </label>
              <input
                type="number"
                min={15}
                max={180}
                value={createForm.estimatedDuration}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, estimatedDuration: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              Exercises (Comma-separated)
            </label>
            <textarea
              rows={3}
              value={createForm.exerciseNamesText}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, exerciseNamesText: e.target.value }))}
              placeholder="e.g. Barbell Bench Press, Incline Dumbbell Press, Cable Flyes"
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-[11px] text-muted mt-1">
              Tip: List exercise names separated by commas. You can fine-tune sets and reps during live logging.
            </p>
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
              Save Routine
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Generator Modal */}
      <Modal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="AI Workout Program Generator"
        size="lg"
      >
        <div className="space-y-5">
          {!generatedPlan ? (
            <form onSubmit={handleGenerateAiPlan} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-start gap-3">
                <Brain className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted leading-relaxed">
                  Our fitness AI analyzes your goals, training frequency, and available gym equipment to construct an optimized workout routine.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                    Primary Goal
                  </label>
                  <select
                    value={aiForm.goal}
                    onChange={(e) => setAiForm((prev) => ({ ...prev, goal: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="muscle_gain">Muscle Hypertrophy</option>
                    <option value="strength">Raw Strength</option>
                    <option value="fat_loss">Fat Loss & Conditioning</option>
                    <option value="endurance">Endurance & Stamina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={aiForm.fitnessLevel}
                    onChange={(e) => setAiForm((prev) => ({ ...prev, fitnessLevel: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="beginner">Beginner (0-1 yr)</option>
                    <option value="intermediate">Intermediate (1-3 yrs)</option>
                    <option value="advanced">Advanced (3+ yrs)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                    Weekly Frequency
                  </label>
                  <select
                    value={aiForm.daysPerWeek}
                    onChange={(e) => setAiForm((prev) => ({ ...prev, daysPerWeek: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={3}>3 Days / Week</option>
                    <option value={4}>4 Days / Week</option>
                    <option value={5}>5 Days / Week</option>
                    <option value={6}>6 Days / Week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                    Equipment Access
                  </label>
                  <select
                    value={aiForm.equipment}
                    onChange={(e) => setAiForm((prev) => ({ ...prev, equipment: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="full_gym">Commercial Gym (Full Access)</option>
                    <option value="home_dumbbells">Dumbbells & Bench</option>
                    <option value="bodyweight">Bodyweight / Calisthenics</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  disabled={isGeneratingAi}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  loading={isGeneratingAi}
                >
                  Generate Plan with AI
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface border border-primary-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge color="primary" size="xs">
                    <Sparkles className="w-3 h-3 inline mr-1" /> Generated Plan
                  </Badge>
                  <span className="text-xs text-muted">
                    {generatedPlan.estimatedDuration || 50} min • {generatedPlan.difficulty || 'Intermediate'}
                  </span>
                </div>

                <h3 className="text-lg font-bold">{generatedPlan.name}</h3>
                <p className="text-xs text-muted leading-relaxed">{generatedPlan.description}</p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Recommended Exercises
                  </h4>
                  <div className="space-y-1.5">
                    {generatedPlan.exercises?.map((ex, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-bg-card border border-border/40 text-xs"
                      >
                        <span className="font-semibold text-current">{ex.exerciseName || ex.name}</span>
                        <span className="text-muted">
                          {ex.sets || 3} sets × {ex.reps || '10'} reps
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setGeneratedPlan(null)}>
                  Regenerate
                </Button>
                <Button variant="primary" onClick={handleSaveAiPlanAsRoutine}>
                  Save as Routine
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Routine Confirm Dialog */}
      <ConfirmDialog
        open={!!routineToDelete}
        onClose={() => setRoutineToDelete(null)}
        onConfirm={handleDeleteRoutine}
        title="Delete Custom Routine?"
        message={`Are you sure you want to delete "${routineToDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete Routine"
        danger
        loading={isDeleting}
      />
    </motion.div>
  )
}

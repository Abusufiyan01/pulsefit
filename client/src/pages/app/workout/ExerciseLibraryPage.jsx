import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  Heart,
  Dumbbell,
  Filter,
  Info,
  Sparkles,
  Flame,
  Check,
  ChevronRight,
  Layers,
} from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import Skeleton from '../../../components/ui/Skeleton'
import SearchInput from '../../../components/ui/SearchInput'
import Tabs from '../../../components/ui/Tabs'
import EmptyState from '../../../components/ui/EmptyState'
import exerciseService from '../../../services/exerciseService'
import api from '../../../lib/api'
import toast from 'react-hot-toast'

const MUSCLE_GROUPS = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Abs',
  'Cardio',
]

const EQUIPMENT_OPTIONS = [
  'All',
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Kettlebell',
]

const DIFFICULTY_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced']

const DEFAULT_EXERCISES = [
  {
    _id: 'ex_1',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions:
      'Lie flat on the bench with your eyes under the bar. Grip the bar slightly wider than shoulder-width. Unrack, lower bar with control to mid-chest, then press forcefully back up.',
    tips: 'Keep wrists straight and drive your feet into the floor.',
  },
  {
    _id: 'ex_2',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    equipment: 'Dumbbell',
    difficulty: 'intermediate',
    instructions:
      'Set bench to a 30-45 degree incline. Bring dumbbells to shoulders, press up until arms are extended but not locked.',
    tips: 'Do not bounce dumbbells together at the top of the movement.',
  },
  {
    _id: 'ex_3',
    name: 'Barbell Back Squat',
    muscleGroup: 'Quads',
    equipment: 'Barbell',
    difficulty: 'advanced',
    instructions:
      'Place bar across upper traps. Stand with feet shoulder-width apart. Squat down until thighs are parallel to the ground or lower, then drive through mid-foot to stand.',
    tips: 'Maintain a neutral spine and keep your chest upright.',
  },
  {
    _id: 'ex_4',
    name: 'Romanian Deadlift',
    muscleGroup: 'Hamstrings',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions:
      'Hold barbell at hip level. Push your hips back while keeping slight bend in your knees. Lower the bar down your shins until you feel a deep hamstring stretch, then drive hips forward.',
    tips: 'Keep the bar glued close to your legs throughout the movement.',
  },
  {
    _id: 'ex_5',
    name: 'Barbell Deadlift',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    difficulty: 'advanced',
    instructions:
      'Stand with mid-foot under the bar. Hinge down and take a double overhand grip. Pull slack out of the bar, brace core, and drive the floor away to lockout.',
    tips: 'Lock out hips and knees simultaneously.',
  },
  {
    _id: 'ex_6',
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    equipment: 'Cable',
    difficulty: 'beginner',
    instructions:
      'Sit comfortably with thighs secured under pads. Grasp the bar with a wide overhand grip. Pull the bar down towards upper chest while driving elbows down and back.',
    tips: 'Avoid excessive leaning back during the pull.',
  },
  {
    _id: 'ex_7',
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    equipment: 'Cable',
    difficulty: 'beginner',
    instructions:
      'Sit on bench with feet on footplates and knees slightly bent. Grasp handle, pull back until torso is 90 degrees, and pull handle into abdomen while retracting shoulder blades.',
    tips: 'Squeeze your shoulder blades together for a 1-second pause.',
  },
  {
    _id: 'ex_8',
    name: 'Overhead Press (OHP)',
    muscleGroup: 'Shoulders',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions:
      'Hold bar at collarbone height. Brace abs and glutes, press the bar straight overhead, moving head back slightly to clear the bar path.',
    tips: 'Lock out overhead with arms in line with your ears.',
  },
  {
    _id: 'ex_9',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbell',
    difficulty: 'beginner',
    instructions:
      'Stand upright holding dumbbells at sides. Raise weights out to sides with a slight elbow bend until arms are parallel with the floor.',
    tips: 'Lead with elbows and pour like a pitcher at the apex.',
  },
  {
    _id: 'ex_10',
    name: 'Barbell Bicep Curl',
    muscleGroup: 'Biceps',
    equipment: 'Barbell',
    difficulty: 'beginner',
    instructions:
      'Stand tall holding barbell with an underhand grip. Curl weight upward toward chest while keeping elbows pinned to sides.',
    tips: 'Avoid swinging your hips to cheat the weight up.',
  },
  {
    _id: 'ex_11',
    name: 'Triceps Rope Pushdown',
    muscleGroup: 'Triceps',
    equipment: 'Cable',
    difficulty: 'beginner',
    instructions:
      'Attach rope to high pulley. Grip rope ends, pin elbows to ribs, and press downward spreading rope ends apart at the bottom.',
    tips: 'Fully lock out triceps at the bottom of the movement.',
  },
  {
    _id: 'ex_12',
    name: 'Leg Press',
    muscleGroup: 'Quads',
    equipment: 'Machine',
    difficulty: 'beginner',
    instructions:
      'Sit on leg press machine with feet hip-width on sled. Release safety catches and lower sled until knees form 90-degree angle. Press back up without locking knees.',
    tips: 'Never lock knees forcefully at full extension.',
  },
]

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all' or 'favorites'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState('All')
  const [selectedEquipment, setSelectedEquipment] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')

  // Modals
  const [detailExercise, setDetailExercise] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Custom Exercise Form State
  const [customForm, setCustomForm] = useState({
    name: '',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions: '',
    tips: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Favorites in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pulsefit_fav_exercises') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    setLoading(true)
    try {
      const res = await exerciseService.getExercises()
      const data = res.data?.data || res.data || []
      if (Array.isArray(data) && data.length > 0) {
        setExercises(data)
      } else {
        setExercises(DEFAULT_EXERCISES)
      }
    } catch {
      setExercises(DEFAULT_EXERCISES)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (e, id) => {
    e.stopPropagation()
    const nextFavs = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id]

    setFavorites(nextFavs)
    localStorage.setItem('pulsefit_fav_exercises', JSON.stringify(nextFavs))
    toast.success(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleCreateExercise = async (e) => {
    e.preventDefault()
    if (!customForm.name.trim()) {
      toast.error('Exercise name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: customForm.name.trim(),
        muscleGroup: customForm.muscleGroup.toLowerCase(),
        equipment: customForm.equipment.toLowerCase(),
        difficulty: customForm.difficulty.toLowerCase(),
        instructions: customForm.instructions,
        tips: customForm.tips,
      }

      const res = await exerciseService.createExercise(payload)
      const newEx = res.data?.data || res.data || { ...payload, _id: `custom_${Date.now()}` }

      setExercises((prev) => [newEx, ...prev])
      toast.success('Custom exercise created!')
      setCreateModalOpen(false)
      setCustomForm({
        name: '',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        difficulty: 'intermediate',
        instructions: '',
        tips: '',
      })
    } catch {
      toast.error('Failed to create custom exercise')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const exId = ex._id || ex.id

      // Tab check
      if (activeTab === 'favorites' && !favorites.includes(exId)) {
        return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const nameMatch = ex.name?.toLowerCase().includes(q)
        const muscleMatch = (ex.muscleGroup || '').toLowerCase().includes(q)
        if (!nameMatch && !muscleMatch) return false
      }

      // Muscle group filter
      if (selectedMuscle !== 'All') {
        const mg = (ex.muscleGroup?.primary || ex.muscleGroup || '').toLowerCase()
        if (mg !== selectedMuscle.toLowerCase()) return false
      }

      // Equipment filter
      if (selectedEquipment !== 'All') {
        const eq = (ex.equipment || '').toLowerCase()
        if (eq !== selectedEquipment.toLowerCase()) return false
      }

      // Difficulty filter
      if (selectedDifficulty !== 'All') {
        const diff = (ex.difficulty || '').toLowerCase()
        if (diff !== selectedDifficulty.toLowerCase()) return false
      }

      return true
    })
  }, [
    exercises,
    activeTab,
    favorites,
    searchQuery,
    selectedMuscle,
    selectedEquipment,
    selectedDifficulty,
  ])

  const getDifficultyBadgeColor = (diff) => {
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
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-display tracking-tight">
            Exercise Library
          </h1>
          <p className="text-muted text-sm mt-1">
            Browse movements, filter by target muscle group, and add custom exercises.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Custom Exercise
        </Button>
      </div>

      {/* Tabs: All vs Favorites */}
      <Tabs
        tabs={[
          { value: 'all', label: `All Exercises (${exercises.length})` },
          { value: 'favorites', label: `Favorites (${favorites.length})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Search & Filter Controls */}
      <Card padding="sm" className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise by name or muscle..."
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Muscle Group Filter */}
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-surface text-current focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {MUSCLE_GROUPS.map((m) => (
                <option key={m} value={m}>
                  {m === 'All' ? 'All Muscles' : m}
                </option>
              ))}
            </select>

            {/* Equipment Filter */}
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-surface text-current focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {EQUIPMENT_OPTIONS.map((eq) => (
                <option key={eq} value={eq}>
                  {eq === 'All' ? 'All Equipment' : eq}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-surface text-current focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Levels' : d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Grid of Exercises */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-40" />
          ))}
        </div>
      ) : filteredExercises.length === 0 ? (
        <Card>
          <EmptyState
            icon={Dumbbell}
            title={activeTab === 'favorites' ? 'No Favorites Saved Yet' : 'No Exercises Found'}
            description={
              activeTab === 'favorites'
                ? 'Click the heart icon on any exercise card to save it to your favorites list.'
                : 'Try adjusting your filters or search keywords.'
            }
            action={() => {
              setSearchQuery('')
              setSelectedMuscle('All')
              setSelectedEquipment('All')
              setSelectedDifficulty('All')
              setActiveTab('all')
            }}
            actionLabel="Reset Filters"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            const exId = exercise._id || exercise.id
            const isFav = favorites.includes(exId)
            const muscle = exercise.muscleGroup?.primary || exercise.muscleGroup || 'Full Body'

            return (
              <motion.div
                key={exId}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
              >
                <Card
                  hover
                  onClick={() => setDetailExercise(exercise)}
                  className="cursor-pointer h-full flex flex-col justify-between border border-border/60 hover:border-primary-500/40"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-5 h-5 text-primary-500" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, exId)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isFav
                            ? 'text-red-500 bg-red-500/10'
                            : 'text-muted hover:text-red-500 hover:bg-white/5'
                        }`}
                        aria-label={isFav ? 'Remove Favorite' : 'Add Favorite'}
                      >
                        <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-current leading-snug">
                        {exercise.name}
                      </h3>
                      <p className="text-xs text-muted capitalize mt-0.5">
                        {muscle} • {exercise.equipment || 'Bodyweight'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-border/40 mt-3">
                    <Badge color={getDifficultyBadgeColor(exercise.difficulty)} size="xs" className="capitalize">
                      {exercise.difficulty || 'All Levels'}
                    </Badge>
                    <span className="text-xs font-semibold text-primary-500 flex items-center gap-1">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Exercise Detail Modal */}
      <Modal
        open={!!detailExercise}
        onClose={() => setDetailExercise(null)}
        title={detailExercise?.name || 'Exercise Details'}
        size="md"
      >
        {detailExercise && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge color="primary" size="sm" className="capitalize">
                {detailExercise.muscleGroup?.primary || detailExercise.muscleGroup || 'Full Body'}
              </Badge>
              <Badge color="default" size="sm" className="capitalize">
                {detailExercise.equipment || 'Bodyweight'}
              </Badge>
              <Badge color={getDifficultyBadgeColor(detailExercise.difficulty)} size="sm" className="capitalize">
                {detailExercise.difficulty || 'Intermediate'}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                How to Perform
              </h4>
              <p className="text-sm text-current leading-relaxed p-3.5 rounded-xl bg-surface border border-border/60">
                {detailExercise.instructions ||
                  'Maintain proper posture throughout the full range of motion. Control the eccentric lowering phase and squeeze at the contraction.'}
              </p>
            </div>

            {detailExercise.tips && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary-500" /> Pro Tips
                </h4>
                <p className="text-xs text-muted leading-relaxed p-3 rounded-xl bg-surface border border-border/60">
                  {detailExercise.tips}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setDetailExercise(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Custom Exercise Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Custom Exercise"
        size="md"
      >
        <form onSubmit={handleCreateExercise} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              Exercise Name *
            </label>
            <input
              type="text"
              required
              value={customForm.name}
              onChange={(e) => setCustomForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Incline Cable Flyes"
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Target Muscle
              </label>
              <select
                value={customForm.muscleGroup}
                onChange={(e) => setCustomForm((prev) => ({ ...prev, muscleGroup: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {MUSCLE_GROUPS.filter((m) => m !== 'All').map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Equipment
              </label>
              <select
                value={customForm.equipment}
                onChange={(e) => setCustomForm((prev) => ({ ...prev, equipment: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {EQUIPMENT_OPTIONS.filter((eq) => eq !== 'All').map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              Difficulty
            </label>
            <select
              value={customForm.difficulty}
              onChange={(e) => setCustomForm((prev) => ({ ...prev, difficulty: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {DIFFICULTY_OPTIONS.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={customForm.instructions}
              onChange={(e) => setCustomForm((prev) => ({ ...prev, instructions: e.target.value }))}
              placeholder="Step by step execution tips..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              Save Exercise
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}

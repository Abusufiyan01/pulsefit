import React, { useState, useEffect, useMemo } from 'react'
import { Heart, Dumbbell } from 'lucide-react'
import { Modal } from './ui/Modal'
import { SearchInput } from './ui/SearchInput'
import { Badge } from './ui/Badge'
import exerciseService from '../services/exerciseService'

const MUSCLES = [
  'All',
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'abs',
  'cardio',
]

const DEFAULT_EXERCISES = [
  { _id: 'ex_1', name: 'Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell', difficulty: 'intermediate' },
  { _id: 'ex_2', name: 'Incline Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbell', difficulty: 'intermediate' },
  { _id: 'ex_3', name: 'Barbell Back Squat', muscleGroup: 'quads', equipment: 'barbell', difficulty: 'advanced' },
  { _id: 'ex_4', name: 'Romanian Deadlift', muscleGroup: 'hamstrings', equipment: 'barbell', difficulty: 'intermediate' },
  { _id: 'ex_5', name: 'Barbell Deadlift', muscleGroup: 'back', equipment: 'barbell', difficulty: 'advanced' },
  { _id: 'ex_6', name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'cable', difficulty: 'beginner' },
  { _id: 'ex_7', name: 'Seated Cable Row', muscleGroup: 'back', equipment: 'cable', difficulty: 'beginner' },
  { _id: 'ex_8', name: 'Overhead Press (OHP)', muscleGroup: 'shoulders', equipment: 'barbell', difficulty: 'intermediate' },
  { _id: 'ex_9', name: 'Dumbbell Lateral Raise', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { _id: 'ex_10', name: 'Barbell Bicep Curl', muscleGroup: 'biceps', equipment: 'barbell', difficulty: 'beginner' },
  { _id: 'ex_11', name: 'Incline Dumbbell Curl', muscleGroup: 'biceps', equipment: 'dumbbell', difficulty: 'beginner' },
  { _id: 'ex_12', name: 'Triceps Rope Pushdown', muscleGroup: 'triceps', equipment: 'cable', difficulty: 'beginner' },
  { _id: 'ex_13', name: 'Dips', muscleGroup: 'triceps', equipment: 'bodyweight', difficulty: 'intermediate' },
  { _id: 'ex_14', name: 'Leg Press', muscleGroup: 'quads', equipment: 'machine', difficulty: 'beginner' },
  { _id: 'ex_15', name: 'Leg Extension', muscleGroup: 'quads', equipment: 'machine', difficulty: 'beginner' },
  { _id: 'ex_16', name: 'Seated Leg Curl', muscleGroup: 'hamstrings', equipment: 'machine', difficulty: 'beginner' },
  { _id: 'ex_17', name: 'Standing Calf Raise', muscleGroup: 'calves', equipment: 'machine', difficulty: 'beginner' },
  { _id: 'ex_18', name: 'Hanging Leg Raise', muscleGroup: 'abs', equipment: 'bodyweight', difficulty: 'intermediate' },
  { _id: 'ex_19', name: 'Plank', muscleGroup: 'abs', equipment: 'bodyweight', difficulty: 'beginner' },
  { _id: 'ex_20', name: 'Treadmill Incline Walk', muscleGroup: 'cardio', equipment: 'machine', difficulty: 'beginner' },
]

export function ExercisePicker({ isOpen, onClose, onSelectExercise }) {
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES)
  const [search, setSearch] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState('All')
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pulsefit_fav_exercises') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (!isOpen) return
    const fetchApiExercises = async () => {
      try {
        const res = await exerciseService.getExercises()
        const data = res.data?.exercises || res.data?.data || res.data
        if (Array.isArray(data) && data.length > 0) {
          setExercises(data)
        }
      } catch (err) {
        // Fallback to DEFAULT_EXERCISES
      }
    }
    fetchApiExercises()
  }, [isOpen])

  const toggleFavorite = (e, id) => {
    e.stopPropagation()
    const nextFavs = favorites.includes(id)
      ? favorites.filter((fav) => fav !== id)
      : [...favorites, id]
    setFavorites(nextFavs)
    localStorage.setItem('pulsefit_fav_exercises', JSON.stringify(nextFavs))
  }

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase())
      const matchesMuscle =
        selectedMuscle === 'All' ||
        ex.muscleGroup?.toLowerCase() === selectedMuscle.toLowerCase()
      return matchesSearch && matchesMuscle
    }).sort((a, b) => {
      const aFav = favorites.includes(a._id || a.id) ? 1 : 0
      const bFav = favorites.includes(b._id || b.id) ? 1 : 0
      return bFav - aFav
    })
  }, [exercises, search, selectedMuscle, favorites])

  const handleSelect = (exercise) => {
    onSelectExercise(exercise)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose an Exercise"
      subtitle="Select an exercise to add to your workout"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Search */}
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by exercise name..."
          autoFocus
        />

        {/* Muscle group chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {MUSCLES.map((muscle) => {
            const isSelected = selectedMuscle === muscle
            return (
              <button
                key={muscle}
                type="button"
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-surface text-muted hover:text-current'
                }`}
              >
                {muscle}
              </button>
            )
          })}
        </div>

        {/* Exercise List */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {filteredExercises.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">
              No exercises match your search criteria.
            </div>
          ) : (
            filteredExercises.map((ex) => {
              const id = ex._id || ex.id
              const isFav = favorites.includes(id)
              return (
                <div
                  key={id}
                  onClick={() => handleSelect(ex)}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border hover:border-primary-500/40 hover:bg-surface transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-current group-hover:text-primary-500 transition-colors">
                        {ex.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold text-muted capitalize">
                          {ex.muscleGroup}
                        </span>
                        <span className="text-muted text-[10px]">•</span>
                        <span className="text-[11px] text-muted capitalize">
                          {ex.equipment}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge color="primary" size="sm" className="capitalize">
                      {ex.difficulty || 'All levels'}
                    </Badge>
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(e, id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isFav
                          ? 'text-rose-500'
                          : 'text-muted hover:text-rose-500 hover:bg-surface'
                      }`}
                      aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={isFav ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ExercisePicker

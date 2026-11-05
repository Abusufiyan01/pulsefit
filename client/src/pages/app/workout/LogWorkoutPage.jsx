import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Check,
  Plus,
  Trash2,
  Clock,
  Dumbbell,
  FileText,
  AlertTriangle,
  Trophy,
  Sparkles,
  ChevronDown,
  X,
  Volume2,
  RotateCcw,
  SkipForward,
  Timer,
  Flame,
} from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import SearchInput from '../../../components/ui/SearchInput'
import routineService from '../../../services/routineService'
import exerciseService from '../../../services/exerciseService'
import api from '../../../lib/api'
import { formatTimer, formatVolume } from '../../../utils/format'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'activeWorkout'

// Fallback initial workout generator
function createInitialWorkout(title = 'Live Workout') {
  return {
    id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    startTime: new Date().toISOString(),
    exercises: [
      {
        exerciseId: 'ex_bench',
        exerciseName: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        sets: [
          { id: `set_${Date.now()}_1`, weight: 60, reps: 10, rpe: 7, completed: false },
          { id: `set_${Date.now()}_2`, weight: 65, reps: 8, rpe: 8, completed: false },
          { id: `set_${Date.now()}_3`, weight: 70, reps: 6, rpe: 9, completed: false },
        ],
        notes: '',
      },
    ],
    notes: '',
  }
}

// Sound synthesizer using Web Audio API for timer completion
function playRestTimerBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)

    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch {}

  // Device vibration if supported
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200])
    } catch {}
  }
}

export default function LogWorkoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const routineIdParam = searchParams.get('routine')

  // Load from localStorage or create new
  const [workout, setWorkout] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.warn('Failed to parse activeWorkout from localStorage', e)
    }
    return createInitialWorkout()
  })

  // Elapsed duration state
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(null)
  const [restDuration, setRestDuration] = useState(60) // default 60s
  const [isRestTimerActive, setIsRestTimerActive] = useState(false)

  // Modal states
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false)
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Exercises for picker
  const [catalogExercises, setCatalogExercises] = useState([])
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerMuscle, setPickerMuscle] = useState('All')

  // If launched with a routineId and no previous active session was stored
  useEffect(() => {
    if (!routineIdParam) return
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing) return

    const loadRoutine = async () => {
      try {
        const res = await routineService.getRoutine(routineIdParam)
        const routine = res.data?.data || res.data
        if (routine) {
          const newWorkout = {
            id: `workout_${Date.now()}`,
            title: routine.name || 'Routine Session',
            startTime: new Date().toISOString(),
            exercises: routine.exercises?.map((e, idx) => ({
              exerciseId: e.exercise || e.exerciseId || `ex_${idx}`,
              exerciseName: e.exerciseName || e.name || 'Exercise',
              muscleGroup: e.muscleGroup || 'Full Body',
              sets: (e.defaultSets && e.defaultSets.length > 0)
                ? e.defaultSets.map((s, sIdx) => ({
                    id: `set_${idx}_${sIdx}_${Date.now()}`,
                    weight: s.weight || 20,
                    reps: s.reps || 10,
                    rpe: s.rpe || 8,
                    completed: false,
                  }))
                : [
                    { id: `set_${idx}_1`, weight: 20, reps: 10, rpe: 8, completed: false },
                    { id: `set_${idx}_2`, weight: 20, reps: 10, rpe: 8, completed: false },
                    { id: `set_${idx}_3`, weight: 20, reps: 10, rpe: 8, completed: false },
                  ],
              notes: '',
            })) || [],
            notes: routine.description || '',
          }
          setWorkout(newWorkout)
        }
      } catch {
        // Fallback continues with default
      }
    }
    loadRoutine()
  }, [routineIdParam])

  // Save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workout))
    } catch (e) {
      console.warn('Failed to save workout to localStorage', e)
    }
  }, [workout])

  // Duration timer: counts up every second from workout.startTime
  useEffect(() => {
    if (!workout?.startTime) return

    const tick = () => {
      const start = new Date(workout.startTime).getTime()
      const now = Date.now()
      setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [workout?.startTime])

  // Rest Timer countdown effect
  useEffect(() => {
    if (!isRestTimerActive || restSecondsRemaining === null) return

    if (restSecondsRemaining <= 0) {
      playRestTimerBeep()
      toast('🔔 Rest time over! Next set!', {
        icon: '💪',
        style: {
          borderRadius: '12px',
          background: '#FF5A1F',
          color: '#fff',
        },
      })
      setIsRestTimerActive(false)
      setRestSecondsRemaining(null)
      return
    }

    const timer = setInterval(() => {
      setRestSecondsRemaining((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearInterval(timer)
  }, [isRestTimerActive, restSecondsRemaining])

  // Fetch exercises catalog for the picker modal
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await exerciseService.getExercises()
        const data = res.data?.data || res.data || []
        if (Array.isArray(data) && data.length > 0) {
          setCatalogExercises(data)
        }
      } catch {
        // Fallback default exercises
        setCatalogExercises([
          { _id: 'ex_1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
          { _id: 'ex_2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell' },
          { _id: 'ex_3', name: 'Barbell Back Squat', muscleGroup: 'Quads', equipment: 'Barbell' },
          { _id: 'ex_4', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', equipment: 'Barbell' },
          { _id: 'ex_5', name: 'Barbell Deadlift', muscleGroup: 'Back', equipment: 'Barbell' },
          { _id: 'ex_6', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable' },
          { _id: 'ex_7', name: 'Overhead Press (OHP)', muscleGroup: 'Shoulders', equipment: 'Barbell' },
          { _id: 'ex_8', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
          { _id: 'ex_9', name: 'Barbell Bicep Curl', muscleGroup: 'Biceps', equipment: 'Barbell' },
          { _id: 'ex_10', name: 'Triceps Rope Pushdown', muscleGroup: 'Triceps', equipment: 'Cable' },
        ])
      }
    }
    fetchCatalog()
  }, [])

  // Exercise and Sets modifiers
  const handleUpdateTitle = (title) => {
    setWorkout((prev) => ({ ...prev, title }))
  }

  const handleAddExerciseFromPicker = (exercise) => {
    const newEx = {
      exerciseId: exercise._id || exercise.id || `ex_${Date.now()}`,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup?.primary || exercise.muscleGroup || 'Full Body',
      sets: [
        { id: `set_${Date.now()}_1`, weight: 20, reps: 10, rpe: 7, completed: false },
        { id: `set_${Date.now()}_2`, weight: 20, reps: 10, rpe: 8, completed: false },
        { id: `set_${Date.now()}_3`, weight: 20, reps: 10, rpe: 8, completed: false },
      ],
      notes: '',
    }
    setWorkout((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newEx],
    }))
    setIsPickerOpen(false)
    toast.success(`Added ${exercise.name}`)
  }

  const handleRemoveExercise = (exIdx) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== exIdx),
    }))
  }

  const handleAddSet = (exIdx) => {
    setWorkout((prev) => {
      const copy = { ...prev }
      const ex = copy.exercises[exIdx]
      const lastSet = ex.sets[ex.sets.length - 1]
      const newSet = {
        id: `set_${Date.now()}_${ex.sets.length + 1}`,
        weight: lastSet ? lastSet.weight : 20,
        reps: lastSet ? lastSet.reps : 10,
        rpe: lastSet ? lastSet.rpe : 8,
        completed: false,
      }
      ex.sets = [...ex.sets, newSet]
      return copy
    })
  }

  const handleRemoveSet = (exIdx, setIdx) => {
    setWorkout((prev) => {
      const copy = { ...prev }
      copy.exercises[exIdx].sets = copy.exercises[exIdx].sets.filter((_, idx) => idx !== setIdx)
      return copy
    })
  }

  const handleUpdateSetField = (exIdx, setIdx, field, value) => {
    setWorkout((prev) => {
      const copy = { ...prev }
      const s = { ...copy.exercises[exIdx].sets[setIdx] }
      s[field] = value
      copy.exercises[exIdx].sets[setIdx] = s
      return copy
    })
  }

  const handleToggleSetComplete = (exIdx, setIdx) => {
    setWorkout((prev) => {
      const copy = { ...prev }
      const setItem = copy.exercises[exIdx].sets[setIdx]
      const wasCompleted = setItem.completed
      setItem.completed = !wasCompleted

      // Auto start 60s rest timer on completing a set
      if (!wasCompleted) {
        setRestSecondsRemaining(restDuration)
        setIsRestTimerActive(true)

        // Celebrate if high weight
        if (Number(setItem.weight) >= 100) {
          toast('🔥 Heavy set crushed! Keep that momentum!', { icon: '⚡' })
        }
      }

      return copy
    })
  }

  const handleUpdateExerciseNotes = (exIdx, notes) => {
    setWorkout((prev) => {
      const copy = { ...prev }
      copy.exercises[exIdx].notes = notes
      return copy
    })
  }

  // Summary Metrics
  const totalVolume = useMemo(() => {
    return (
      workout.exercises?.reduce((sum, ex) => {
        return (
          sum +
          ex.sets?.reduce((sSum, s) => {
            const w = Number(s.weight) || 0
            const r = Number(s.reps) || 0
            return sSum + (s.completed ? w * r : 0)
          }, 0)
        )
      }, 0) || 0
    )
  }, [workout])

  const completedSetsCount = useMemo(() => {
    return (
      workout.exercises?.reduce((sum, ex) => {
        return sum + (ex.sets?.filter((s) => s.completed).length || 0)
      }, 0) || 0
    )
  }, [workout])

  const totalSetsCount = useMemo(() => {
    return (
      workout.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0
    )
  }, [workout])

  // Save Workout to API & Navigate
  const handleSaveWorkout = async () => {
    setIsSaving(true)
    try {
      const durationMin = Math.max(1, Math.round(elapsedSeconds / 60))

      const formattedExercises = workout.exercises.map((ex) => ({
        exerciseName: ex.exerciseName,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets.map((s) => ({
          weight: Number(s.weight) || 0,
          reps: Number(s.reps) || 0,
          rpe: s.rpe ? Number(s.rpe) : undefined,
          completed: Boolean(s.completed),
        })),
        notes: ex.notes || '',
      }))

      const payload = {
        title: workout.title || 'Workout Session',
        exercises: formattedExercises,
        duration: durationMin,
        notes: workout.notes || '',
        startTime: workout.startTime || new Date().toISOString(),
        endTime: new Date().toISOString(),
        isCompleted: true,
      }

      await api.post('/workouts', payload)
      localStorage.removeItem(STORAGE_KEY)
      toast.success('Workout logged and saved successfully! 🎉')
      navigate('/app/workout/history')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save workout session')
    } finally {
      setIsSaving(false)
    }
  }

  // Discard Workout
  const handleDiscardConfirm = () => {
    localStorage.removeItem(STORAGE_KEY)
    setIsDiscardDialogOpen(false)
    toast('Workout session discarded')
    navigate('/app/workout')
  }

  // Filter exercises in picker modal
  const filteredPickerExercises = useMemo(() => {
    return catalogExercises.filter((ex) => {
      const nameMatch = !pickerSearch || ex.name.toLowerCase().includes(pickerSearch.toLowerCase())
      const muscle = (ex.muscleGroup?.primary || ex.muscleGroup || '').toLowerCase()
      const muscleMatch = pickerMuscle === 'All' || muscle === pickerMuscle.toLowerCase()
      return nameMatch && muscleMatch
    })
  }, [catalogExercises, pickerSearch, pickerMuscle])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-24 max-w-4xl mx-auto"
    >
      {/* Top Floating / Sticky Header with Timer & Finish */}
      <div className="sticky top-0 z-30 bg-bg/95 backdrop-blur-md py-3 border-b border-border -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title and Clock */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 text-primary-500" />
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={workout.title}
                onChange={(e) => handleUpdateTitle(e.target.value)}
                className="font-black text-lg lg:text-xl text-current bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full truncate cursor-pointer hover:opacity-80"
                placeholder="Workout Title"
              />
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary-500 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(elapsedSeconds)}</span>
                <span className="text-muted font-sans font-normal">• {workout.exercises.length} Exercises</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDiscardDialogOpen(true)}
              className="text-red-500 hover:bg-red-500/10"
            >
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
              onClick={() => setIsFinishModalOpen(true)}
            >
              Finish Workout
            </Button>
          </div>
        </div>
      </div>

      {/* Rest Timer Banner */}
      <AnimatePresence>
        {isRestTimerActive && restSecondsRemaining !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3.5 rounded-2xl bg-gradient-primary text-white shadow-glow flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Timer className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider opacity-90 block">
                    Resting Countdown
                  </span>
                  <span className="text-xl font-black font-mono">
                    {formatTimer(restSecondsRemaining)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRestSecondsRemaining((s) => (s !== null ? s + 30 : 30))}
                  className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30 transition-all cursor-pointer"
                >
                  +30s
                </button>
                <button
                  onClick={() => {
                    setIsRestTimerActive(false)
                    setRestSecondsRemaining(null)
                  }}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-all cursor-pointer"
                  title="Skip Rest"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercises List */}
      <div className="space-y-6">
        {workout.exercises.map((exercise, exIdx) => (
          <Card key={exercise.exerciseId || exIdx} className="space-y-4">
            {/* Exercise Header */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-4 h-4 text-primary-500" />
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-base text-current truncate">
                    {exercise.exerciseName}
                  </h3>
                  <span className="text-xs text-muted capitalize">
                    {exercise.muscleGroup || 'Strength'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveExercise(exIdx)}
                className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Remove Exercise"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Sets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted text-left font-bold uppercase tracking-wider">
                    <th className="py-2 px-2 w-12 text-center">Set</th>
                    <th className="py-2 px-2 min-w-[90px]">Weight (kg)</th>
                    <th className="py-2 px-2 min-w-[70px]">Reps</th>
                    <th className="py-2 px-2 min-w-[60px]">RPE</th>
                    <th className="py-2 px-2 w-14 text-center">Done</th>
                    <th className="py-2 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {exercise.sets.map((set, sIdx) => {
                    const isDone = Boolean(set.completed)

                    return (
                      <tr
                        key={set.id || sIdx}
                        className={`transition-colors ${
                          isDone ? 'bg-primary-500/5' : 'hover:bg-surface/50'
                        }`}
                      >
                        {/* Set Index */}
                        <td className="py-2.5 px-2 text-center font-bold text-muted">
                          {sIdx + 1}
                        </td>

                        {/* Weight */}
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            step="any"
                            value={set.weight}
                            onChange={(e) =>
                              handleUpdateSetField(exIdx, sIdx, 'weight', e.target.value)
                            }
                            className={`w-full max-w-[85px] px-2.5 py-1.5 rounded-lg font-bold text-sm bg-surface border text-current text-center focus:ring-1 focus:ring-primary-500 ${
                              isDone ? 'border-emerald-500/40 text-emerald-500' : 'border-border'
                            }`}
                          />
                        </td>

                        {/* Reps */}
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) =>
                              handleUpdateSetField(exIdx, sIdx, 'reps', e.target.value)
                            }
                            className={`w-full max-w-[65px] px-2.5 py-1.5 rounded-lg font-bold text-sm bg-surface border text-current text-center focus:ring-1 focus:ring-primary-500 ${
                              isDone ? 'border-emerald-500/40 text-emerald-500' : 'border-border'
                            }`}
                          />
                        </td>

                        {/* RPE */}
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={set.rpe || ''}
                            placeholder="-"
                            onChange={(e) =>
                              handleUpdateSetField(exIdx, sIdx, 'rpe', e.target.value)
                            }
                            className="w-full max-w-[55px] px-2 py-1.5 rounded-lg text-xs bg-surface border border-border text-current text-center focus:ring-1 focus:ring-primary-500"
                          />
                        </td>

                        {/* Complete Checkmark Button */}
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSetComplete(exIdx, sIdx)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-500 text-white shadow-sm hover:scale-105 active:scale-95'
                                : 'bg-surface border border-border text-muted hover:border-primary-500 hover:text-primary-500 active:scale-95'
                            }`}
                            aria-label="Toggle Complete Set"
                          >
                            <Check className={`w-4 h-4 ${isDone ? 'stroke-[3]' : ''}`} />
                          </button>
                        </td>

                        {/* Delete Set */}
                        <td className="py-2.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(exIdx, sIdx)}
                            className="p-1 rounded text-muted hover:text-red-500 transition-colors"
                            title="Remove Set"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Set Actions & Notes */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => handleAddSet(exIdx)}
              >
                Add Set
              </Button>

              <input
                type="text"
                placeholder="Exercise notes (e.g. paused at chest)..."
                value={exercise.notes || ''}
                onChange={(e) => handleUpdateExerciseNotes(exIdx, e.target.value)}
                className="flex-1 max-w-sm px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-current placeholder:text-muted focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </Card>
        ))}

        {/* Add Exercise Hero Button */}
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-border hover:border-primary-500 hover:bg-primary-500/5 transition-all flex items-center justify-center gap-2 font-bold text-sm text-primary-500 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Add Exercise to Workout
        </button>
      </div>

      {/* Rest Duration Controls Widget */}
      <Card padding="sm" className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary-500" />
          <span className="text-xs font-bold text-current">Auto Rest Countdown Duration:</span>
        </div>

        <div className="flex items-center gap-1">
          {[30, 60, 90, 120].map((sec) => (
            <button
              key={sec}
              onClick={() => setRestDuration(sec)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                restDuration === sec
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface border border-border text-muted hover:text-current'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>
      </Card>

      {/* Exercise Picker Modal */}
      <Modal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        title="Select Exercise"
        size="md"
      >
        <div className="space-y-4">
          <SearchInput
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder="Search exercises by name..."
          />

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Abs'].map(
              (m) => (
                <button
                  key={m}
                  onClick={() => setPickerMuscle(m)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    pickerMuscle === m
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-surface border border-border text-muted hover:text-current'
                  }`}
                >
                  {m}
                </button>
              )
            )}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredPickerExercises.map((exercise) => {
              const exId = exercise._id || exercise.id
              const muscle = exercise.muscleGroup?.primary || exercise.muscleGroup || 'Full Body'

              return (
                <div
                  key={exId}
                  onClick={() => handleAddExerciseFromPicker(exercise)}
                  className="p-3 rounded-xl bg-surface border border-border/60 hover:border-primary-500 hover:bg-primary-500/5 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <h4 className="font-bold text-sm text-current group-hover:text-primary-500 transition-colors">
                      {exercise.name}
                    </h4>
                    <span className="text-xs text-muted capitalize">
                      {muscle} • {exercise.equipment || 'Standard'}
                    </span>
                  </div>

                  <span className="p-1.5 rounded-lg bg-primary-500/10 text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <Plus className="w-4 h-4" />
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>

      {/* Finish Workout Summary Modal */}
      <Modal
        open={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        title="Finish & Save Workout"
        size="md"
      >
        <div className="space-y-5">
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-lg font-black text-current">Outstanding Effort!</h3>
            <p className="text-xs text-muted mt-0.5">
              Review your session metrics before saving to your training log.
            </p>
          </div>

          {/* Metric Badges Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-surface border border-border text-center">
              <span className="text-[11px] text-muted block mb-0.5 uppercase font-bold">
                Duration
              </span>
              <span className="text-base font-black text-current">
                {formatTimer(elapsedSeconds)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border text-center">
              <span className="text-[11px] text-muted block mb-0.5 uppercase font-bold">
                Total Volume
              </span>
              <span className="text-base font-black text-primary-500">
                {formatVolume(totalVolume)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border text-center">
              <span className="text-[11px] text-muted block mb-0.5 uppercase font-bold">
                Sets Done
              </span>
              <span className="text-base font-black text-emerald-500">
                {completedSetsCount} / {totalSetsCount}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              General Workout Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={workout.notes || ''}
              onChange={(e) => setWorkout((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Felt strong on bench, energy was high..."
              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-current text-xs focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button
              variant="secondary"
              onClick={() => setIsFinishModalOpen(false)}
              disabled={isSaving}
            >
              Resume Session
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveWorkout}
              loading={isSaving}
            >
              Save Workout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Discard Confirmation Dialog */}
      <ConfirmDialog
        open={isDiscardDialogOpen}
        onClose={() => setIsDiscardDialogOpen(false)}
        onConfirm={handleDiscardConfirm}
        title="Discard Active Workout?"
        message="All logged sets, weights, and timestamps in this session will be lost permanently."
        confirmLabel="Discard Workout"
        danger
      />
    </motion.div>
  )
}

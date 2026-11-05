import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pulsefit_active_workout'

const defaultState = {
  title: 'Afternoon Workout',
  startTime: null,
  exercises: [],
  notes: '',
}

export function useActiveWorkout() {
  const [workout, setWorkout] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.warn('Failed to parse active workout from localStorage', e)
    }
    return defaultState
  })

  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Sync to localStorage
  useEffect(() => {
    try {
      if (workout.startTime) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workout))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (e) {
      console.warn('Failed to save active workout to localStorage', e)
    }
  }, [workout])

  // Timer loop
  useEffect(() => {
    if (!workout.startTime) {
      setElapsedSeconds(0)
      return
    }

    const calculateElapsed = () => {
      const start = new Date(workout.startTime).getTime()
      const now = Date.now()
      return Math.max(0, Math.floor((now - start) / 1000))
    }

    setElapsedSeconds(calculateElapsed())
    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsed())
    }, 1000)

    return () => clearInterval(interval)
  }, [workout.startTime])

  const startWorkout = useCallback((initialData = {}) => {
    const newWorkout = {
      title: initialData.title || 'Workout Session',
      startTime: new Date().toISOString(),
      exercises: initialData.exercises || [],
      notes: initialData.notes || '',
      routineId: initialData.routineId || null,
    }
    setWorkout(newWorkout)
  }, [])

  const updateTitle = useCallback((title) => {
    setWorkout((prev) => ({ ...prev, title }))
  }, [])

  const addExercise = useCallback((exercise) => {
    setWorkout((prev) => {
      const newExercise = {
        id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        exerciseId: exercise._id || exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        notes: '',
        sets: [
          {
            id: `set_${Date.now()}_1`,
            setNumber: 1,
            weight: 20,
            reps: 10,
            rpe: 8,
            isCompleted: false,
            previousWeight: exercise.lastWeight || null,
            previousReps: exercise.lastReps || null,
          },
        ],
      }
      return {
        ...prev,
        startTime: prev.startTime || new Date().toISOString(),
        exercises: [...prev.exercises, newExercise],
      }
    })
  }, [])

  const removeExercise = useCallback((exerciseIndex) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== exerciseIndex),
    }))
  }, [])

  const addSet = useCallback((exerciseIndex) => {
    setWorkout((prev) => {
      const exercises = [...prev.exercises]
      const targetEx = exercises[exerciseIndex]
      if (!targetEx) return prev

      const lastSet = targetEx.sets[targetEx.sets.length - 1]
      const newSet = {
        id: `set_${Date.now()}_${targetEx.sets.length + 1}`,
        setNumber: targetEx.sets.length + 1,
        weight: lastSet ? lastSet.weight : 20,
        reps: lastSet ? lastSet.reps : 10,
        rpe: lastSet ? lastSet.rpe : 8,
        isCompleted: false,
        previousWeight: lastSet ? lastSet.previousWeight : null,
        previousReps: lastSet ? lastSet.previousReps : null,
      }

      exercises[exerciseIndex] = {
        ...targetEx,
        sets: [...targetEx.sets, newSet],
      }
      return { ...prev, exercises }
    })
  }, [])

  const updateSet = useCallback((exerciseIndex, setIndex, field, value) => {
    setWorkout((prev) => {
      const exercises = [...prev.exercises]
      const targetEx = exercises[exerciseIndex]
      if (!targetEx || !targetEx.sets[setIndex]) return prev

      const sets = [...targetEx.sets]
      sets[setIndex] = {
        ...sets[setIndex],
        [field]: value,
      }

      exercises[exerciseIndex] = {
        ...targetEx,
        sets,
      }
      return { ...prev, exercises }
    })
  }, [])

  const removeSet = useCallback((exerciseIndex, setIndex) => {
    setWorkout((prev) => {
      const exercises = [...prev.exercises]
      const targetEx = exercises[exerciseIndex]
      if (!targetEx) return prev

      const sets = targetEx.sets
        .filter((_, sIdx) => sIdx !== setIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }))

      exercises[exerciseIndex] = { ...targetEx, sets }
      return { ...prev, exercises }
    })
  }, [])

  const toggleSetComplete = useCallback((exerciseIndex, setIndex) => {
    let completedNow = false
    setWorkout((prev) => {
      const exercises = [...prev.exercises]
      const targetEx = exercises[exerciseIndex]
      if (!targetEx || !targetEx.sets[setIndex]) return prev

      const currentStatus = targetEx.sets[setIndex].isCompleted
      completedNow = !currentStatus

      const sets = [...targetEx.sets]
      sets[setIndex] = {
        ...sets[setIndex],
        isCompleted: completedNow,
      }

      exercises[exerciseIndex] = { ...targetEx, sets }
      return { ...prev, exercises }
    })
    return completedNow
  }, [])

  const updateExerciseNotes = useCallback((exerciseIndex, notes) => {
    setWorkout((prev) => {
      const exercises = [...prev.exercises]
      if (!exercises[exerciseIndex]) return prev
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], notes }
      return { ...prev, exercises }
    })
  }, [])

  const updateWorkoutNotes = useCallback((notes) => {
    setWorkout((prev) => ({ ...prev, notes }))
  }, [])

  const discardWorkout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setWorkout(defaultState)
    setElapsedSeconds(0)
  }, [])

  return {
    workout,
    isActive: !!workout.startTime,
    duration: elapsedSeconds,
    startWorkout,
    updateTitle,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    toggleSetComplete,
    updateExerciseNotes,
    updateWorkoutNotes,
    discardWorkout,
  }
}

export default useActiveWorkout

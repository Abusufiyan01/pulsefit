import { useState, useEffect, useCallback } from 'react'
import workoutService from '../services/workoutService'
import toast from 'react-hot-toast'

export function useWorkout(params = {}) {
  const [workouts, setWorkouts] = useState([])
  const [stats, setStats] = useState(null)
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await workoutService.getWorkouts(params)
      setWorkouts(res.data?.workouts || res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load workouts:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch workouts')
    } finally {
      setIsLoading(false)
    }
  }, [JSON.stringify(params)])

  const fetchStats = useCallback(async () => {
    try {
      const res = await workoutService.getStats()
      setStats(res.data?.stats || res.data?.data || res.data || null)
    } catch (err) {
      console.warn('Failed to load workout stats:', err)
    }
  }, [])

  const fetchRecords = useCallback(async () => {
    try {
      const res = await workoutService.getPersonalRecords()
      setRecords(res.data?.records || res.data?.data || res.data || [])
    } catch (err) {
      console.warn('Failed to load personal records:', err)
    }
  }, [])

  useEffect(() => {
    fetchWorkouts()
    fetchStats()
    fetchRecords()
  }, [fetchWorkouts, fetchStats, fetchRecords])

  const createWorkout = async (workoutData) => {
    try {
      const res = await workoutService.createWorkout(workoutData)
      toast.success('Workout saved successfully! 💪')
      fetchWorkouts()
      fetchStats()
      fetchRecords()
      return res.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save workout'
      toast.error(msg)
      throw err
    }
  }

  const deleteWorkout = async (id) => {
    try {
      await workoutService.deleteWorkout(id)
      toast.success('Workout deleted')
      setWorkouts((prev) => prev.filter((w) => (w._id || w.id) !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete workout')
      throw err
    }
  }

  return {
    workouts,
    stats,
    records,
    isLoading,
    error,
    refetch: fetchWorkouts,
    createWorkout,
    deleteWorkout,
  }
}

export default useWorkout

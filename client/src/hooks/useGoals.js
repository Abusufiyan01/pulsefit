import { useState, useEffect, useCallback } from 'react'
import goalService from '../services/goalService'
import toast from 'react-hot-toast'

export function useGoals() {
  const [goals, setGoals] = useState([])
  const [achievements, setAchievements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [goalsRes, achRes] = await Promise.allSettled([
        goalService.getGoals(),
        goalService.getAchievements(),
      ])

      if (goalsRes.status === 'fulfilled') {
        const data = goalsRes.value.data
        setGoals(data?.goals || data?.data || data || [])
      }

      if (achRes.status === 'fulfilled') {
        const aData = achRes.value.data
        setAchievements(aData?.achievements || aData?.data || aData || [])
      }
    } catch (err) {
      console.error('Error fetching goals/achievements:', err)
      setError('Failed to load goals')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createGoal = async (goalData) => {
    try {
      const res = await goalService.createGoal(goalData)
      toast.success('Goal created successfully! 🎯')
      fetchData()
      return res.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal')
      throw err
    }
  }

  const updateGoal = async (id, updates) => {
    try {
      const res = await goalService.updateGoal(id, updates)
      toast.success('Goal updated')
      fetchData()
      return res.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update goal')
      throw err
    }
  }

  const deleteGoal = async (id) => {
    try {
      await goalService.deleteGoal(id)
      toast.success('Goal deleted')
      setGoals((prev) => prev.filter((g) => (g._id || g.id) !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete goal')
      throw err
    }
  }

  return {
    goals,
    achievements,
    isLoading,
    error,
    refetch: fetchData,
    createGoal,
    updateGoal,
    deleteGoal,
  }
}

export default useGoals

import { useState, useEffect, useCallback } from 'react'
import nutritionService from '../services/nutritionService'
import { toISODateString } from '../utils/dates'
import toast from 'react-hot-toast'

export function useNutrition(initialDate = new Date()) {
  const [selectedDate, setSelectedDate] = useState(() => toISODateString(initialDate))
  const [foodLogs, setFoodLogs] = useState([])
  const [waterData, setWaterData] = useState({ amount: 0, target: 2500 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [logsRes, waterRes] = await Promise.allSettled([
        nutritionService.getFoodLogs(selectedDate),
        nutritionService.getWater(selectedDate),
      ])

      if (logsRes.status === 'fulfilled') {
        const data = logsRes.value.data
        setFoodLogs(data?.foodLogs || data?.logs || data?.data || [])
      } else {
        setFoodLogs([])
      }

      if (waterRes.status === 'fulfilled') {
        const data = waterRes.value.data
        setWaterData(data?.waterLog || data?.data || data || { amount: 0, target: 2500 })
      } else {
        setWaterData({ amount: 0, target: 2500 })
      }
    } catch (err) {
      console.error('Error fetching nutrition data:', err)
      setError('Failed to load nutrition data')
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const addFoodLog = async (logData) => {
    try {
      const res = await nutritionService.addFoodLog({
        ...logData,
        date: selectedDate,
      })
      toast.success('Food logged successfully!')
      fetchData()
      return res.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log food')
      throw err
    }
  }

  const removeFoodLog = async (id) => {
    try {
      await nutritionService.removeFoodLog(id)
      toast.success('Food entry removed')
      setFoodLogs((prev) => prev.filter((item) => (item._id || item.id) !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove food')
      throw err
    }
  }

  const logWater = async (amount) => {
    try {
      const res = await nutritionService.logWater({
        date: selectedDate,
        amount,
      })
      toast.success('Water intake updated 💧')
      const updated = res.data?.waterLog || res.data?.data || res.data
      setWaterData(updated)
      return updated
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log water')
      throw err
    }
  }

  return {
    selectedDate,
    setSelectedDate,
    foodLogs,
    waterData,
    isLoading,
    error,
    refetch: fetchData,
    addFoodLog,
    removeFoodLog,
    logWater,
  }
}

export default useNutrition

import { useState, useEffect, useCallback } from 'react'
import bodyService from '../services/bodyService'
import toast from 'react-hot-toast'

export function useBody(range = '1M') {
  const [metrics, setMetrics] = useState([])
  const [latestMetric, setLatestMetric] = useState(null)
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [metricsRes, photosRes] = await Promise.allSettled([
        bodyService.getMetrics({ range }),
        bodyService.getPhotos(),
      ])

      if (metricsRes.status === 'fulfilled') {
        const data = metricsRes.value.data
        const items = data?.metrics || data?.data || data || []
        setMetrics(items)
        if (items.length > 0) {
          setLatestMetric(items[items.length - 1])
        }
      }

      if (photosRes.status === 'fulfilled') {
        const pData = photosRes.value.data
        setPhotos(pData?.photos || pData?.data || pData || [])
      }
    } catch (err) {
      console.error('Error fetching body data:', err)
      setError('Failed to load body metrics')
    } finally {
      setIsLoading(false)
    }
  }, [range])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const logMetric = async (metricData) => {
    try {
      const res = await bodyService.logMetric(metricData)
      toast.success('Body metrics updated successfully! 📊')
      fetchData()
      return res.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save body metrics')
      throw err
    }
  }

  const deleteMetric = async (id) => {
    try {
      await bodyService.deleteMetric(id)
      toast.success('Metric entry removed')
      setMetrics((prev) => prev.filter((m) => (m._id || m.id) !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete metric')
      throw err
    }
  }

  const uploadPhoto = async (formData) => {
    try {
      const res = await bodyService.uploadPhoto(formData)
      toast.success('Progress photo uploaded! 📸')
      fetchData()
      return res.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo')
      throw err
    }
  }

  const deletePhoto = async (id) => {
    try {
      await bodyService.deletePhoto(id)
      toast.success('Photo removed')
      setPhotos((prev) => prev.filter((p) => (p._id || p.id) !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete photo')
      throw err
    }
  }

  return {
    metrics,
    latestMetric,
    photos,
    isLoading,
    error,
    refetch: fetchData,
    logMetric,
    deleteMetric,
    uploadPhoto,
    deletePhoto,
  }
}

export default useBody

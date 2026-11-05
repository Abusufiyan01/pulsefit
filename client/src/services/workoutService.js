import api from '../lib/api'

export const workoutService = {
  getWorkouts: (params) => api.get('/workouts', { params }),
  getWorkout: (id) => api.get(`/workouts/${id}`),
  createWorkout: (data) => api.post('/workouts', data),
  updateWorkout: (id, data) => api.put(`/workouts/${id}`, data),
  deleteWorkout: (id) => api.delete(`/workouts/${id}`),
  getStats: () => api.get('/workouts/stats'),
  getPersonalRecords: (params) => api.get('/personal-records', { params }),
  getPersonalRecordHistory: (exerciseId) => api.get(`/personal-records/history/${exerciseId}`),
}

export default workoutService

import api from '../lib/api'

export const exerciseService = {
  getExercises: (params) => api.get('/exercises', { params }),
  getExercise: (id) => api.get(`/exercises/${id}`),
  createExercise: (data) => api.post('/exercises', data),
  toggleFavorite: (id) => api.post(`/exercises/${id}/favorite`),
}

export default exerciseService

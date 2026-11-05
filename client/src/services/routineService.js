import api from '../lib/api'

export const routineService = {
  getRoutines: (params) => api.get('/routines', { params }),
  getRoutine: (id) => api.get(`/routines/${id}`),
  createRoutine: (data) => api.post('/routines', data),
  updateRoutine: (id, data) => api.put(`/routines/${id}`, data),
  deleteRoutine: (id) => api.delete(`/routines/${id}`),
}

export default routineService

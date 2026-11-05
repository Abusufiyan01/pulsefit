import api from '../lib/api'

export const bodyService = {
  getMetrics: (params) => api.get('/body/metrics', { params }),
  getLatestMetric: () => api.get('/body/metrics/latest'),
  logMetric: (data) => api.post('/body/metrics', data),
  deleteMetric: (id) => api.delete(`/body/metrics/${id}`),
  getPhotos: (params) => api.get('/body/photos', { params }),
  uploadPhoto: (formData) =>
    api.post('/body/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deletePhoto: (id) => api.delete(`/body/photos/${id}`),
}

export default bodyService

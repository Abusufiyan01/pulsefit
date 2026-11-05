import api from '../lib/api'

export const nutritionService = {
  getFoodLogs: (date) => api.get(`/nutrition/food-logs/date/${date}`),
  addFoodLog: (data) => api.post('/nutrition/food-logs', data),
  updateFoodLog: (id, data) => api.put(`/nutrition/food-logs/${id}`, data),
  removeFoodLog: (id) => api.delete(`/nutrition/food-logs/${id}`),
  searchFoods: (query) => api.get('/nutrition/foods/search', { params: { q: query } }),
  getFoods: (params) => api.get('/nutrition/foods', { params }),
  createFood: (data) => api.post('/nutrition/foods', data),
  getWater: (date) => api.get(`/water/date/${date}`),
  logWater: (data) => api.post('/water', data),
  getNutritionSummary: (params) => api.get('/nutrition/summary', { params }),
}

export default nutritionService

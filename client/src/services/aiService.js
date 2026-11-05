import api from '../lib/api'

export const aiService = {
  getQuote: () => api.get('/ai/quote'),
  getWorkoutPlan: (preferences) => api.post('/ai/workout-plan', preferences),
  getMealSuggestions: (preferences) => api.post('/ai/meal-suggestions', preferences),
  getProgressInsights: () => api.get('/ai/progress-insights'),
}

export default aiService

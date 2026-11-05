/**
 * AI Assistant Routes
 */
const express = require('express');
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/workout-plan', aiController.generateWorkoutPlan);
router.post('/meal-suggestions', aiController.generateMealSuggestions);
router.get('/progress-insights', aiController.getProgressInsights);
router.get('/quote', aiController.getQuote);

module.exports = router;

/**
 * Nutrition Routes
 */
const express = require('express');
const { body } = require('express-validator');
const nutritionController = require('../controllers/nutritionController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

// Food item catalog endpoints
router.get('/foods/search', nutritionController.searchFoods);
router.get('/foods', nutritionController.getFoods);

router.post(
  '/foods',
  [
    body('name').trim().notEmpty().withMessage('Food name is required'),
    body('calories').isNumeric().withMessage('Calories must be a number'),
    body('protein').isNumeric().withMessage('Protein must be a number'),
    body('carbs').isNumeric().withMessage('Carbohydrates must be a number'),
    body('fat').isNumeric().withMessage('Fat must be a number'),
  ],
  validate,
  nutritionController.createFood
);

// Food logging endpoints (date/:date must precede :id)
router.get('/food-logs/date/:date', nutritionController.getDailyFoodLogs);
router.get('/food-logs', nutritionController.getFoodLogs);

router.post(
  '/food-logs',
  [
    body('meal').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
    body('foods').isArray({ min: 1 }).withMessage('At least one food item must be included'),
  ],
  validate,
  nutritionController.createFoodLog
);

router.get('/food-logs/:id', nutritionController.getFoodLogById);
router.put('/food-logs/:id', nutritionController.updateFoodLog);
router.delete('/food-logs/:id', nutritionController.deleteFoodLog);

module.exports = router;

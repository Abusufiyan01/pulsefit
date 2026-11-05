/**
 * Workout Routes
 */
const express = require('express');
const { body } = require('express-validator');
const workoutController = require('../controllers/workoutController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

// /stats must come before /:id
router.get('/stats', workoutController.getStats);
router.get('/', workoutController.getWorkouts);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Workout title is required'),
    body('exercises').isArray({ min: 1 }).withMessage('Workout must have at least one exercise'),
  ],
  validate,
  workoutController.createWorkout
);

router.get('/:id', workoutController.getWorkoutById);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

module.exports = router;

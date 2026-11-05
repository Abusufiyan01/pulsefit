/**
 * Exercise Routes
 */
const express = require('express');
const { body } = require('express-validator');
const exerciseController = require('../controllers/exerciseController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

// Search must precede :id
router.get('/search', exerciseController.searchExercises);
router.get('/', exerciseController.getExercises);
router.get('/:id', exerciseController.getExerciseById);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Exercise name is required'),
    body('muscleGroup').notEmpty().withMessage('Muscle group is required'),
  ],
  validate,
  exerciseController.createExercise
);

router.put('/:id', exerciseController.updateExercise);
router.delete('/:id', exerciseController.deleteExercise);

module.exports = router;

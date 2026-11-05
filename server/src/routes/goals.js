/**
 * Goal Routes
 */
const express = require('express');
const { body } = require('express-validator');
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

router.get('/', goalController.getGoals);

router.post(
  '/',
  [
    body('type').notEmpty().withMessage('Goal type is required'),
    body('title').trim().notEmpty().withMessage('Goal title is required'),
    body('targetValue').isNumeric().withMessage('Target value must be a number'),
  ],
  validate,
  goalController.createGoal
);

router.get('/:id', goalController.getGoalById);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;

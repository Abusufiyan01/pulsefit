/**
 * Routine Routes
 */
const express = require('express');
const { body } = require('express-validator');
const routineController = require('../controllers/routineController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

router.get('/', routineController.getRoutines);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Routine name is required'),
    body('exercises').isArray({ min: 1 }).withMessage('At least one exercise is required'),
  ],
  validate,
  routineController.createRoutine
);

router.get('/:id', routineController.getRoutineById);
router.put('/:id', routineController.updateRoutine);
router.delete('/:id', routineController.deleteRoutine);
router.post('/:id/duplicate', routineController.duplicateRoutine);

module.exports = router;

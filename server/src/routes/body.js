/**
 * Body Metrics Routes
 */
const express = require('express');
const { body } = require('express-validator');
const bodyController = require('../controllers/bodyController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

// /stats must come before /:id
router.get('/stats', bodyController.getStats);
router.get('/', bodyController.getBodyMetrics);

router.post(
  '/',
  [body('weight').isNumeric().withMessage('Weight must be a valid number')],
  validate,
  bodyController.createBodyMetric
);

router.get('/:id', bodyController.getBodyMetricById);
router.delete('/:id', bodyController.deleteBodyMetric);

module.exports = router;

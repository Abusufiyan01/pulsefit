/**
 * Water Routes
 */
const express = require('express');
const waterController = require('../controllers/waterController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/date/:date', waterController.getWaterByDate);
router.get('/', waterController.getWaterLogs);
router.post('/', waterController.logWater);

module.exports = router;

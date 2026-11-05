/**
 * Achievement Routes
 */
const express = require('express');
const achievementController = require('../controllers/achievementController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', achievementController.getAchievements);

module.exports = router;

/**
 * Personal Records Routes
 */
const express = require('express');
const personalRecordController = require('../controllers/personalRecordController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', personalRecordController.getPersonalRecords);
router.get('/:exerciseId', personalRecordController.getPersonalRecordsByExercise);

module.exports = router;

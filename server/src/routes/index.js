/**
 * API v1 Root Router
 * Mounts all sub-routers under /api/v1
 */
const express = require('express');

const authRoutes = require('./auth');
const userRoutes = require('./users');
const exerciseRoutes = require('./exercises');
const workoutRoutes = require('./workouts');
const routineRoutes = require('./routines');
const nutritionRoutes = require('./nutrition');
const waterRoutes = require('./water');
const bodyRoutes = require('./body');
const goalRoutes = require('./goals');
const achievementRoutes = require('./achievements');
const progressPhotoRoutes = require('./progressPhotos');
const personalRecordRoutes = require('./personalRecords');
const aiRoutes = require('./ai');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/workouts', workoutRoutes);
router.use('/routines', routineRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/water', waterRoutes);
router.use('/body', bodyRoutes);
router.use('/goals', goalRoutes);
router.use('/achievements', achievementRoutes);
router.use('/progress-photos', progressPhotoRoutes);
router.use('/personal-records', personalRecordRoutes);
router.use('/ai', aiRoutes);

module.exports = router;

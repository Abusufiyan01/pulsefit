/**
 * Progress Photos Routes
 */
const express = require('express');
const progressPhotoController = require('../controllers/progressPhotoController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(auth);

router.get('/', progressPhotoController.getProgressPhotos);
router.post('/', upload.single('photo'), progressPhotoController.createProgressPhoto);
router.delete('/:id', progressPhotoController.deleteProgressPhoto);

module.exports = router;

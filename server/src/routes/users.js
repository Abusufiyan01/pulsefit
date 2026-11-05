/**
 * User Routes
 */
const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

// All user routes require authentication
router.use(auth);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

router.post(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  ],
  validate,
  userController.changePassword
);

router.post('/avatar', upload.single('avatar'), userController.updateAvatar);
router.get('/export', userController.exportData);
router.delete('/account', userController.deleteAccount);

module.exports = router;

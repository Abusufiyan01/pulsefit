/**
 * Progress Photo Controller
 */
const fs = require('fs');
const path = require('path');
const ProgressPhoto = require('../models/ProgressPhoto');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get all progress photos for user
 */
const getProgressPhotos = async (req, res, next) => {
  try {
    const photos = await ProgressPhoto.find({ user: req.user._id }).sort({ date: -1 });
    return successResponse(res, photos, 'Progress photos retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Upload progress photo
 */
const createProgressPhoto = async (req, res, next) => {
  try {
    let photoUrl = req.body.photoUrl;

    if (req.file) {
      photoUrl = `/uploads/progress-photos/${req.file.filename}`;
    }

    if (!photoUrl) {
      return errorResponse(res, 'Photo file or photoUrl is required.', 400);
    }

    const { date = new Date(), weight, notes = '', tags } = req.body;

    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags;
    } else if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (_e) {
        parsedTags = tags.split(',').map((t) => t.trim());
      }
    }

    const photo = await ProgressPhoto.create({
      user: req.user._id,
      date: new Date(date),
      photoUrl,
      weight: weight ? Number(weight) : req.user.weight,
      notes,
      tags: parsedTags,
    });

    return successResponse(res, photo, 'Progress photo uploaded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete progress photo
 */
const deleteProgressPhoto = async (req, res, next) => {
  try {
    const photo = await ProgressPhoto.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!photo) {
      return errorResponse(res, 'Progress photo not found.', 404);
    }

    // Attempt to remove local file if it is in uploads
    if (photo.photoUrl && photo.photoUrl.startsWith('/uploads/')) {
      const relPath = photo.photoUrl.replace(/^\/uploads\//, '');
      const localPath = path.resolve(__dirname, '../../uploads', relPath);
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (_err) {
          // Ignore file deletion error
        }
      }
    }

    return successResponse(res, null, 'Progress photo deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProgressPhotos,
  createProgressPhoto,
  deleteProgressPhoto,
};

/**
 * Multer File Upload Middleware
 * Supports progress photos and user avatars with automatic directory creation,
 * strict mimetype checks, and 5MB size limits.
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination directories exist inside server/uploads
const uploadBaseDir = path.resolve(__dirname, '../../uploads');
const progressPhotosDir = path.join(uploadBaseDir, 'progress-photos');
const avatarsDir = path.join(uploadBaseDir, 'avatars');

[uploadBaseDir, progressPhotosDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'avatar') {
      cb(null, avatarsDir);
    } else {
      cb(null, progressPhotosDir);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedOriginalName}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

module.exports = upload;

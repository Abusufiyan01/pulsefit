/**
 * Progress Photos & Avatar Integration Tests
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const app = require('../src/index');
const User = require('../src/models/User');
const ProgressPhoto = require('../src/models/ProgressPhoto');

jest.mock('../src/models/User');
jest.mock('../src/models/ProgressPhoto');

describe('Progress Photos & Avatar API', () => {
  const userId = '507f1f77bcf86cd799439011';
  let token;

  beforeAll(() => {
    const secret = process.env.JWT_ACCESS_SECRET || 'pulsefit_access_secret_fallback';
    token = jwt.sign({ id: userId }, secret, { expiresIn: '15m' });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    User.findById.mockResolvedValue({
      _id: userId,
      name: 'Photo Tester',
      email: 'photo@test.com',
      avatar: null,
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnValue({ _id: userId, name: 'Photo Tester' }),
    });
  });

  describe('GET /api/v1/progress-photos', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/v1/progress-photos');
      expect(res.statusCode).toBe(401);
    });

    it('should retrieve list of progress photos', async () => {
      const mockPhotos = [
        { _id: 'photo-1', photoUrl: '/uploads/progress-photos/test1.jpg', weight: 75 },
        { _id: 'photo-2', photoUrl: '/uploads/progress-photos/test2.jpg', weight: 74.5 },
      ];

      ProgressPhoto.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPhotos),
      });

      const res = await request(app)
        .get('/api/v1/progress-photos')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('POST /api/v1/progress-photos', () => {
    it('should upload image file and return 201', async () => {
      const createdRecord = {
        _id: 'photo-new-123',
        user: userId,
        photoUrl: '/uploads/progress-photos/mock-photo.jpg',
        weight: 76,
        date: new Date(),
      };

      ProgressPhoto.create.mockResolvedValue(createdRecord);

      // Create a temporary 1x1 png file to upload
      const tempPath = path.join(__dirname, 'temp-test-image.png');
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64'
      );
      fs.writeFileSync(tempPath, pngBuffer);

      try {
        const res = await request(app)
          .post('/api/v1/progress-photos')
          .set('Authorization', `Bearer ${token}`)
          .attach('photo', tempPath)
          .field('weight', '76')
          .field('notes', 'Great progress');

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(ProgressPhoto.create).toHaveBeenCalled();
      } finally {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    });

    it('should reject upload without file or photoUrl', async () => {
      const res = await request(app)
        .post('/api/v1/progress-photos')
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'no photo provided' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/progress-photos/:id', () => {
    it('should return 404 if photo not found or belongs to another user', async () => {
      ProgressPhoto.findOneAndDelete.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/v1/progress-photos/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should successfully delete photo record and remove file', async () => {
      // Create mock photo file in server/uploads
      const uploadsDir = path.resolve(__dirname, '../uploads/progress-photos');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const testFile = path.join(uploadsDir, 'delete-me-test.jpg');
      fs.writeFileSync(testFile, 'dummy content');

      ProgressPhoto.findOneAndDelete.mockResolvedValue({
        _id: 'photo-delete-123',
        photoUrl: '/uploads/progress-photos/delete-me-test.jpg',
      });

      const res = await request(app)
        .delete('/api/v1/progress-photos/photo-delete-123')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(fs.existsSync(testFile)).toBe(false);
    });
  });

  describe('POST /api/v1/users/avatar', () => {
    it('should upload user avatar successfully', async () => {
      const tempPath = path.join(__dirname, 'temp-avatar.png');
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64'
      );
      fs.writeFileSync(tempPath, pngBuffer);

      try {
        const res = await request(app)
          .post('/api/v1/users/avatar')
          .set('Authorization', `Bearer ${token}`)
          .attach('avatar', tempPath);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.avatar).toContain('/uploads/avatars/');
      } finally {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    });
  });
});

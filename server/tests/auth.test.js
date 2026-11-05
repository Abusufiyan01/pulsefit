/**
 * Auth Integration Tests
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const User = require('../src/models/User');

jest.mock('../src/models/User');

describe('Auth API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should validate missing email or password and return 400', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test User',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 if user email already exists', async () => {
      User.findOne.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        email: 'exists@example.com',
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Existing User',
        email: 'exists@example.com',
        password: 'Password123!',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should register a new user successfully and return access token', async () => {
      User.findOne.mockResolvedValue(null);

      const fakeUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'New Athlete',
        email: 'athlete@example.com',
        weight: 75,
        height: 180,
        age: 26,
        goal: 'build_muscle',
        workoutDaysPerWeek: 4,
        recalculateFitnessMetrics: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
        toObject: () => ({
          _id: '507f1f77bcf86cd799439011',
          name: 'New Athlete',
          email: 'athlete@example.com',
          bmi: 23.15,
          bmr: 1775,
        }),
      };

      // When new User(...) is instantiated
      User.mockImplementation(() => fakeUser);

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'New Athlete',
        email: 'athlete@example.com',
        password: 'Password123!',
        height: 180,
        weight: 75,
        goal: 'build_muscle',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('athlete@example.com');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should reject invalid password', async () => {
      const fakeUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'user@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'user@example.com',
        password: 'WrongPassword!',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should login valid user and return tokens', async () => {
      const fakeUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'user@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        toObject: () => ({
          _id: '507f1f77bcf86cd799439011',
          name: 'Valid User',
          email: 'user@example.com',
        }),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'user@example.com',
        password: 'CorrectPassword!',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should reject request without bearer token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return user info when valid token is provided', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const secret = process.env.JWT_ACCESS_SECRET || 'pulsefit_access_secret_fallback';
      const token = jwt.sign({ id: userId }, secret, { expiresIn: '15m' });

      User.findById.mockResolvedValue({
        _id: userId,
        name: 'Auth User',
        email: 'auth@example.com',
        toObject: () => ({
          _id: userId,
          name: 'Auth User',
          email: 'auth@example.com',
        }),
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('auth@example.com');
    });
  });
});

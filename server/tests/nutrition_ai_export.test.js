/**
 * Nutrition, Water, AI & Export Integration Tests
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');

const User = require('../src/models/User');
const FoodLog = require('../src/models/FoodLog');
const WaterLog = require('../src/models/WaterLog');
const Workout = require('../src/models/Workout');
const Routine = require('../src/models/Routine');
const Exercise = require('../src/models/Exercise');
const Food = require('../src/models/Food');
const BodyMetric = require('../src/models/BodyMetric');
const Goal = require('../src/models/Goal');
const Achievement = require('../src/models/Achievement');
const ProgressPhoto = require('../src/models/ProgressPhoto');
const PersonalRecord = require('../src/models/PersonalRecord');

jest.mock('../src/models/User');
jest.mock('../src/models/FoodLog');
jest.mock('../src/models/WaterLog');
jest.mock('../src/models/Workout');
jest.mock('../src/models/Routine');
jest.mock('../src/models/Exercise');
jest.mock('../src/models/Food');
jest.mock('../src/models/BodyMetric');
jest.mock('../src/models/Goal');
jest.mock('../src/models/Achievement');
jest.mock('../src/models/ProgressPhoto');
jest.mock('../src/models/PersonalRecord');

describe('Nutrition, Water, AI & Export API', () => {
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
      name: 'Nutrition Tester',
      email: 'nutri@test.com',
      calorieTarget: 2200,
      proteinTarget: 160,
      carbTarget: 240,
      fatTarget: 65,
      waterTarget: 2500,
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnValue({ _id: userId, name: 'Nutrition Tester', email: 'nutri@test.com' }),
    });

    // Default mocks for Exercise and Food models
    Exercise.find.mockReturnValue({
      limit: jest.fn().mockResolvedValue([
        { name: 'Barbell Bench Press', muscleGroup: { primary: 'chest' } },
        { name: 'Barbell Back Squat', muscleGroup: { primary: 'quads' } },
        { name: 'Lat Pulldown', muscleGroup: { primary: 'back' } },
      ]),
    });

    Food.find.mockResolvedValue([
      { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    ]);
  });

  describe('Nutrition Food Logging', () => {
    it('should log meal with foods array and calculate total calories', async () => {
      FoodLog.mockImplementation((data) => ({
        ...data,
        totalCalories: 330,
        totalProtein: 62,
        totalCarbs: 0,
        totalFat: 7,
        save: jest.fn().mockResolvedValue(true),
      }));

      const res = await request(app)
        .post('/api/v1/nutrition/food-logs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          meal: 'lunch',
          foods: [
            {
              name: 'Grilled Chicken Breast',
              calories: 330,
              protein: 62,
              carbs: 0,
              fat: 7,
              servingSize: '200g',
            },
          ],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCalories).toBe(330);
    });

    it('should reject food log without meal or foods array', async () => {
      const res = await request(app)
        .post('/api/v1/nutrition/food-logs')
        .set('Authorization', `Bearer ${token}`)
        .send({ calories: 500 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Water Logging', () => {
    it('should add water amount and return total intake for day', async () => {
      WaterLog.findOne.mockResolvedValue({
        glasses: 4,
        mlPerGlass: 250,
        totalMl: 1000,
        save: jest.fn().mockResolvedValue(true),
      });

      const res = await request(app)
        .post('/api/v1/water')
        .set('Authorization', `Bearer ${token}`)
        .send({ incrementGlasses: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.log.totalMl).toBe(1500);
    });
  });

  describe('AI Endpoints (with rule-based fallback)', () => {
    it('should return daily motivational quote', async () => {
      const res = await request(app)
        .get('/api/v1/ai/quote')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('quote');
      expect(res.body.data).toHaveProperty('author');
    });

    it('should generate structured workout plan fallback when no API key configured', async () => {
      const res = await request(app)
        .post('/api/v1/ai/workout-plan')
        .set('Authorization', `Bearer ${token}`)
        .send({ goal: 'build_muscle', experienceLevel: 'intermediate', availableEquipment: ['barbell'] });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('title');
      expect(res.body.data).toHaveProperty('weeklySchedule');
      expect(Array.isArray(res.body.data.weeklySchedule)).toBe(true);
    });
  });

  describe('Data Export', () => {
    it('should export all user data as complete JSON object', async () => {
      Workout.find.mockResolvedValue([]);
      Routine.find.mockResolvedValue([]);
      FoodLog.find.mockResolvedValue([]);
      WaterLog.find.mockResolvedValue([]);
      BodyMetric.find.mockResolvedValue([]);
      Goal.find.mockResolvedValue([]);
      Achievement.find.mockResolvedValue([]);
      ProgressPhoto.find.mockResolvedValue([]);
      PersonalRecord.find.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/users/export')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('profile');
      expect(res.body.data).toHaveProperty('workouts');
      expect(res.body.data).toHaveProperty('foodLogs');
    });
  });
});

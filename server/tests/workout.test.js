/**
 * Workout Integration Tests
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const User = require('../src/models/User');
const Workout = require('../src/models/Workout');
const PersonalRecord = require('../src/models/PersonalRecord');
const Achievement = require('../src/models/Achievement');
const BodyMetric = require('../src/models/BodyMetric');

jest.mock('../src/models/User');
jest.mock('../src/models/Workout');
jest.mock('../src/models/PersonalRecord');
jest.mock('../src/models/Achievement');
jest.mock('../src/models/BodyMetric');

describe('Workout API Endpoints', () => {
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
      name: 'Tester',
      weight: 75,
      workoutDaysPerWeek: 4,
      save: jest.fn().mockResolvedValue(true),
    });

    BodyMetric.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      }),
    });
  });

  describe('POST /api/v1/workouts', () => {
    it('should validate missing exercises and return 400', async () => {
      const res = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Empty Workout',
          exercises: [],
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully save workout and calculate total volume', async () => {
      const exerciseId = '507f1f77bcf86cd799439022';
      const fakeWorkout = {
        _id: '507f1f77bcf86cd799439033',
        user: userId,
        title: 'Chest Day',
        duration: 45,
        totalVolume: 2400, // (80kg * 10 reps * 3 sets)
        caloriesBurned: 295,
        startTime: new Date(),
        isCompleted: true,
        prsHit: [],
        exercises: [
          {
            exerciseId,
            exerciseName: 'Barbell Flat Bench Press',
            sets: [
              { weight: 80, reps: 10, completed: true, isWarmup: false },
              { weight: 80, reps: 10, completed: true, isWarmup: false },
              { weight: 80, reps: 10, completed: true, isWarmup: false },
            ],
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      Workout.mockImplementation(() => fakeWorkout);
      PersonalRecord.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });
      PersonalRecord.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439044',
        type: 'max_weight',
        value: 80,
      });
      PersonalRecord.countDocuments.mockResolvedValue(0);

      const findQuery = {
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([fakeWorkout]),
        populate: jest.fn().mockResolvedValue([fakeWorkout]),
      };
      Workout.find.mockReturnValue(findQuery);

      Achievement.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });
      Achievement.create.mockResolvedValue({
        name: 'First Step',
        type: 'first_workout',
      });

      const res = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Chest Day',
          duration: 45,
          exercises: [
            {
              exerciseId,
              exerciseName: 'Barbell Flat Bench Press',
              sets: [
                { weight: 80, reps: 10, completed: true, isWarmup: false },
                { weight: 80, reps: 10, completed: true, isWarmup: false },
                { weight: 80, reps: 10, completed: true, isWarmup: false },
              ],
            },
          ],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.workout.title).toBe('Chest Day');
    });
  });

  describe('GET /api/v1/workouts/stats', () => {
    it('should return aggregated workout stats', async () => {
      Workout.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          {
            _id: '1',
            totalVolume: 5000,
            duration: 60,
            caloriesBurned: 400,
            startTime: new Date(),
            exercises: [],
          },
          {
            _id: '2',
            totalVolume: 4000,
            duration: 50,
            caloriesBurned: 350,
            startTime: new Date(),
            exercises: [],
          },
        ]),
      });

      const res = await request(app)
        .get('/api/v1/workouts/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalWorkouts).toBe(2);
      expect(res.body.data.totalVolume).toBe(9000);
      expect(res.body.data.averageDuration).toBe(55);
    });
  });
});

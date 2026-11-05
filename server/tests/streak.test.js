/**
 * Streak Service Unit Tests
 */
const { calculateUserStreak, toDateString, getDayDiff } = require('../src/services/streakService');
const Workout = require('../src/models/Workout');

jest.mock('../src/models/Workout');

describe('Streak Service', () => {
  const userId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Utility Functions', () => {
    it('toDateString should format date accurately to YYYY-MM-DD', () => {
      const d = new Date('2026-05-15T10:30:00Z');
      expect(toDateString(d)).toBe('2026-05-15');
    });

    it('getDayDiff should calculate calendar day difference correctly', () => {
      expect(getDayDiff('2026-05-15', '2026-05-12')).toBe(3);
      expect(getDayDiff('2026-05-15', '2026-05-15')).toBe(0);
      expect(getDayDiff('2026-05-10', '2026-05-11')).toBe(1);
    });
  });

  describe('calculateUserStreak', () => {
    it('should return 0 streak for user with no workouts', async () => {
      Workout.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue([]),
        }),
      });

      const stats = await calculateUserStreak(userId, 4);

      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.totalWorkouts).toBe(0);
      expect(stats.lastWorkoutDate).toBeNull();
    });

    it('should calculate streak for consecutive daily workouts', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date(today);
      dayBefore.setDate(dayBefore.getDate() - 2);

      Workout.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue([
            { startTime: today },
            { startTime: yesterday },
            { startTime: dayBefore },
          ]),
        }),
      });

      const stats = await calculateUserStreak(userId, 4);

      expect(stats.currentStreak).toBe(3);
      expect(stats.longestStreak).toBe(3);
      expect(stats.totalWorkouts).toBe(3);
    });

    it('should maintain streak through scheduled rest days within threshold', async () => {
      const today = new Date();
      // Workout 2 days ago (1 rest day in between)
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      Workout.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue([
            { startTime: today },
            { startTime: twoDaysAgo },
          ]),
        }),
      });

      // With 4 workout days per week, a 1-day rest gap is permitted
      const stats = await calculateUserStreak(userId, 4);

      expect(stats.currentStreak).toBe(2);
      expect(stats.totalWorkouts).toBe(2);
    });

    it('should break streak when inactivity exceeds allowed rest interval', async () => {
      const today = new Date();
      // Workout was 10 days ago (well beyond allowed gap)
      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const elevenDaysAgo = new Date(today);
      elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);

      Workout.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue([
            { startTime: tenDaysAgo },
            { startTime: elevenDaysAgo },
          ]),
        }),
      });

      const stats = await calculateUserStreak(userId, 4);

      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(2);
      expect(stats.totalWorkouts).toBe(2);
    });
  });
});

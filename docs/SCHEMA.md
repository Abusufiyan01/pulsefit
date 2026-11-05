# PulseFit Database Schema & ER Diagram

## Overview

PulseFit uses MongoDB (NoSQL document database) with Mongoose ODM. The schema is designed for performance with appropriate indexes on frequently queried fields.

## Entity Relationships

```
User (1) ──────────────── (many) Workout
User (1) ──────────────── (many) Routine
User (1) ──────────────── (many) FoodLog
User (1) ──────────────── (many) WaterLog
User (1) ──────────────── (many) BodyMetric
User (1) ──────────────── (many) Goal
User (1) ──────────────── (many) Achievement
User (1) ──────────────── (many) ProgressPhoto
User (1) ──────────────── (many) PersonalRecord
Exercise (global) ───────── (embedded in) Workout.exercises
Exercise (global) ───────── (embedded in) Routine.exercises
Food (global) ────────────── (embedded in) FoodLog.foods
Workout (1) ─────────────── (many) PersonalRecord
Exercise (1) ────────────── (many) PersonalRecord
```

## Schema Descriptions

### User
Primary entity. Stores auth credentials, profile data, calculated fitness metrics, preferences, and aggregated stats.

**Key fields:**
- `email` — unique identifier for auth
- `password` — bcrypt hashed, never returned in API responses
- `bmi`, `bmr`, `tdee` — auto-calculated on registration/profile update
- `dailyCalorieTarget`, `macroTargets` — from goal calculation, user-editable
- `currentStreak`, `longestStreak` — maintained by streak service
- `isOnboardingComplete` — gate for onboarding redirect
- `refreshToken` — stored server-side for refresh token rotation

**Indexes:** `email` (unique)

### Exercise
Global exercise library. Seeded with 120+ exercises. Users can also create custom exercises.

**Key fields:**
- `muscleGroup.primary` — main muscle targeted (chest, back, shoulders, etc.)
- `muscleGroup.secondary` — array of secondary muscles
- `equipment` — required equipment
- `category` — strength, cardio, flexibility, calisthenics
- `isCustom` — differentiates seeded vs user-created
- `createdBy` — null for global exercises, user ID for custom

**Indexes:** `name` (text), `muscleGroup.primary`, `equipment`, `difficulty`, `createdBy`

### Workout
Logged workout sessions. Each workout contains an array of exercises, each with sets.

**Key fields:**
- `exercises[].sets[]` — set details: weight, reps, RPE, completed status
- `totalVolume` — sum of (weight × reps) across all sets
- `caloriesBurned` — estimated from MET values
- `prsHit` — array of exercise IDs where PRs were achieved this session
- `fromTemplate` — reference to Routine if started from template

**Indexes:** `user`, `startTime` (desc), compound (`user`, `startTime`)

### Routine
Workout templates. 6 prebuilt + user-created. Exercises have target (not actual) values.

**Key fields:**
- `exercises[].sets[].targetWeight`, `targetReps`, `targetRpe`
- `exercises[].restSeconds` — rest time between sets
- `isPrebuilt` — prevents deletion of system routines

### FoodLog
Daily food diary entries. One document per meal per day per user.

**Key fields:**
- `date` — date only (no time), indexed for fast daily queries
- `meal` — breakfast, lunch, dinner, snack
- `foods[]` — array of food items with quantities and computed macros
- `totalCalories`, `totalProtein`, `totalCarbs`, `totalFat` — pre-computed aggregates

**Indexes:** compound (`user`, `date`), `date`

### WaterLog
Daily water intake. One document per day per user (upserted).

**Indexes:** compound (`user`, `date`)

### BodyMetric
Body measurements and composition. One entry per logging session.

**Key fields:**
- `measurements` — chest, waist, hips, leftArm, rightArm, leftThigh, rightThigh (all in cm or inches per user preference)
- `weight` — in kg (converted for display if imperial)
- `bodyFat` — percentage

**Indexes:** compound (`user`, `date`)

### Goal
User-defined fitness goals with progress tracking.

**Key fields:**
- `type` — weight, workout_frequency, lift_target, daily_steps, water_intake
- `targetValue`, `currentValue`, `unit`
- `exerciseId` — for lift target goals (links to exercise)
- `isCompleted`, `completedDate`

### Achievement
Unlocked badges/achievements. Created when achievement service detects the condition is met.

**Badge Types:**
| Type | Trigger |
|------|---------|
| first_workout | Complete first workout |
| week_streak_7 | 7-day workout streak |
| month_streak_30 | 30-day workout streak |
| hundred_sets | Complete 100 total sets |
| first_pr | Set first personal record |
| early_bird | Complete workout before 7 AM |
| night_owl | Complete workout after 10 PM |
| beast_mode | 5+ workouts in one week |
| consistent | 12 workouts in one month |
| weightloss_5 | Lose 5kg from starting weight |
| strength_milestone | Lift 100kg+ on any exercise |

### ProgressPhoto
Body progress photos with metadata.

**Key fields:**
- `photoUrl` — stored path on server (uploaded via multer)
- `tags` — front, side, back
- `weight` — weight at time of photo for correlation

### PersonalRecord
Best performances per exercise. Auto-detected when a workout is saved.

**Key fields:**
- `type` — max_weight, max_reps, estimated_1rm
- `value` — the record value
- `weight`, `reps` — for 1RM: weight × (1 + reps/30) [Epley formula]

**Indexes:** compound (`user`, `exerciseId`, `type`)

## Performance Considerations

1. **FoodLog & WaterLog** queries always filter by `user + date` → compound index
2. **Workout** list queries filter by `user` with date sort → compound index
3. **Exercise** search uses MongoDB text index on name, plus field indexes
4. **PersonalRecord** lookup by exercise uses compound index
5. **Pagination** implemented server-side with skip/limit + count query
6. **Aggregation pipelines** used for stats (weekly volume, monthly summaries)

## Data Validation

All models include Mongoose schema validation:
- Required fields enforced at model level
- Enum values validated (goal types, equipment, etc.)
- Number ranges validated (age: 10-100, sets: 1-20, etc.)
- Additional validation via express-validator on API routes


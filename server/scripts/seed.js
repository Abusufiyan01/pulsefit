/**
 * Master Seed Script for PulseFit
 * Populates exercises, foods, prebuilt routines, and a rich 8-week demo user dataset.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');

// Models
const User = require('../src/models/User');
const Exercise = require('../src/models/Exercise');
const Food = require('../src/models/Food');
const Routine = require('../src/models/Routine');
const Workout = require('../src/models/Workout');
const FoodLog = require('../src/models/FoodLog');
const WaterLog = require('../src/models/WaterLog');
const BodyMetric = require('../src/models/BodyMetric');
const Goal = require('../src/models/Goal');
const Achievement = require('../src/models/Achievement');
const ProgressPhoto = require('../src/models/ProgressPhoto');
const PersonalRecord = require('../src/models/PersonalRecord');

// Seed Data
const exerciseData = require('./seedExercises');
const foodData = require('./seedFoods');
const { ACHIEVEMENTS, BADGE_DEFINITIONS } = require('../src/config/constants');
const { calculateUserStreak } = require('../src/services/streakService');

const runSeed = async () => {
  try {
    console.log('----------------------------------------------------');
    console.log('🚀 Starting PulseFit Database Seeding Process...');
    console.log('----------------------------------------------------');

    await connectDB();

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Exercise.deleteMany({}),
      Food.deleteMany({}),
      Routine.deleteMany({}),
      Workout.deleteMany({}),
      FoodLog.deleteMany({}),
      WaterLog.deleteMany({}),
      BodyMetric.deleteMany({}),
      Goal.deleteMany({}),
      Achievement.deleteMany({}),
      ProgressPhoto.deleteMany({}),
      PersonalRecord.deleteMany({}),
    ]);
    console.log('✅ Collections cleared successfully.');

    // 1. Seed Exercises
    console.log(`🏋️ Seeding ${exerciseData.length} exercises...`);
    const insertedExercises = await Exercise.insertMany(exerciseData);
    console.log(`✅ Seeded ${insertedExercises.length} exercises.`);

    // Map exercises by name for easy lookup
    const exerciseMap = new Map();
    insertedExercises.forEach((ex) => exerciseMap.set(ex.name, ex));

    // 2. Seed Foods
    console.log(`🥗 Seeding ${foodData.length} food items...`);
    const insertedFoods = await Food.insertMany(foodData);
    console.log(`✅ Seeded ${insertedFoods.length} foods.`);

    const foodMap = new Map();
    insertedFoods.forEach((f) => foodMap.set(f.name, f));

    // 3. Seed 6 Prebuilt Routines
    console.log('📋 Seeding 6 prebuilt workout routines...');
    const prebuiltRoutines = [
      {
        name: 'Push / Pull / Legs (PPL Hypertrophy)',
        description: 'Gold standard 6-day split targeting maximum muscle hypertrophy and symmetrical growth.',
        category: 'Hypertrophy',
        difficulty: 'intermediate',
        estimatedDuration: 60,
        isPrebuilt: true,
        exercises: [
          {
            exerciseId: exerciseMap.get('Barbell Flat Bench Press')?._id,
            exerciseName: 'Barbell Flat Bench Press',
            sets: [
              { targetWeight: 70, targetReps: 8, targetRpe: 8 },
              { targetWeight: 70, targetReps: 8, targetRpe: 8 },
              { targetWeight: 70, targetReps: 8, targetRpe: 9 },
            ],
            restSeconds: 120,
            notes: 'Pause 1 second on chest',
          },
          {
            exerciseId: exerciseMap.get('Incline Dumbbell Press')?._id,
            exerciseName: 'Incline Dumbbell Press',
            sets: [
              { targetWeight: 26, targetReps: 10, targetRpe: 8 },
              { targetWeight: 26, targetReps: 10, targetRpe: 8 },
              { targetWeight: 26, targetReps: 10, targetRpe: 9 },
            ],
            restSeconds: 90,
          },
          {
            exerciseId: exerciseMap.get('Standing Dumbbell Lateral Raise')?._id,
            exerciseName: 'Standing Dumbbell Lateral Raise',
            sets: [
              { targetWeight: 12, targetReps: 15, targetRpe: 8 },
              { targetWeight: 12, targetReps: 15, targetRpe: 9 },
              { targetWeight: 12, targetReps: 15, targetRpe: 10 },
            ],
            restSeconds: 60,
          },
          {
            exerciseId: exerciseMap.get('Tricep Rope Pushdown')?._id,
            exerciseName: 'Tricep Rope Pushdown',
            sets: [
              { targetWeight: 25, targetReps: 12, targetRpe: 8 },
              { targetWeight: 25, targetReps: 12, targetRpe: 9 },
            ],
            restSeconds: 60,
          },
        ],
      },
      {
        name: 'Full Body 3-Day Foundation',
        description: 'Complete full body workout ideal for beginner to intermediate lifters building core strength.',
        category: 'Strength',
        difficulty: 'beginner',
        estimatedDuration: 50,
        isPrebuilt: true,
        exercises: [
          {
            exerciseId: exerciseMap.get('Barbell Back Squat')?._id,
            exerciseName: 'Barbell Back Squat',
            sets: [
              { targetWeight: 60, targetReps: 8, targetRpe: 7 },
              { targetWeight: 65, targetReps: 8, targetRpe: 8 },
              { targetWeight: 65, targetReps: 8, targetRpe: 8 },
            ],
            restSeconds: 120,
          },
          {
            exerciseId: exerciseMap.get('Conventional Barbell Deadlift')?._id,
            exerciseName: 'Conventional Barbell Deadlift',
            sets: [
              { targetWeight: 80, targetReps: 5, targetRpe: 8 },
              { targetWeight: 85, targetReps: 5, targetRpe: 8 },
            ],
            restSeconds: 150,
          },
          {
            exerciseId: exerciseMap.get('Overhead Barbell Press (OHP)')?._id,
            exerciseName: 'Overhead Barbell Press (OHP)',
            sets: [
              { targetWeight: 40, targetReps: 8, targetRpe: 8 },
              { targetWeight: 40, targetReps: 8, targetRpe: 8 },
            ],
            restSeconds: 90,
          },
          {
            exerciseId: exerciseMap.get('Lat Pulldown (Wide Grip)')?._id,
            exerciseName: 'Lat Pulldown (Wide Grip)',
            sets: [
              { targetWeight: 50, targetReps: 10, targetRpe: 8 },
              { targetWeight: 50, targetReps: 10, targetRpe: 9 },
            ],
            restSeconds: 90,
          },
        ],
      },
      {
        name: 'Upper / Lower Power & Mass',
        description: 'Balanced 4-day split providing high frequency and optimal recovery for maximum performance.',
        category: 'Hypertrophy',
        difficulty: 'intermediate',
        estimatedDuration: 55,
        isPrebuilt: true,
        exercises: [
          {
            exerciseId: exerciseMap.get('Barbell Bent Over Row')?._id,
            exerciseName: 'Barbell Bent Over Row',
            sets: [
              { targetWeight: 60, targetReps: 8, targetRpe: 8 },
              { targetWeight: 65, targetReps: 8, targetRpe: 8 },
              { targetWeight: 65, targetReps: 8, targetRpe: 9 },
            ],
            restSeconds: 90,
          },
          {
            exerciseId: exerciseMap.get('Incline Barbell Bench Press')?._id,
            exerciseName: 'Incline Barbell Bench Press',
            sets: [
              { targetWeight: 60, targetReps: 8, targetRpe: 8 },
              { targetWeight: 65, targetReps: 8, targetRpe: 8 },
            ],
            restSeconds: 90,
          },
          {
            exerciseId: exerciseMap.get('Barbell Bicep Curl')?._id,
            exerciseName: 'Barbell Bicep Curl',
            sets: [
              { targetWeight: 30, targetReps: 10, targetRpe: 8 },
              { targetWeight: 30, targetReps: 10, targetRpe: 9 },
            ],
            restSeconds: 60,
          },
          {
            exerciseId: exerciseMap.get('EZ-Bar Skull Crusher (Lying Triceps Extension)')?._id,
            exerciseName: 'EZ-Bar Skull Crusher (Lying Triceps Extension)',
            sets: [
              { targetWeight: 25, targetReps: 10, targetRpe: 8 },
              { targetWeight: 25, targetReps: 10, targetRpe: 9 },
            ],
            restSeconds: 60,
          },
        ],
      },
      {
        name: 'Beginner Home Workout (Calisthenics & Bands)',
        description: 'Zero heavy equipment needed. Builds foundational muscular stamina and joint resilience.',
        category: 'Calisthenics',
        difficulty: 'beginner',
        estimatedDuration: 40,
        isPrebuilt: true,
        exercises: [
          {
            exerciseId: exerciseMap.get('Standard Push-Up')?._id,
            exerciseName: 'Standard Push-Up',
            sets: [
              { targetWeight: 0, targetReps: 15, targetRpe: 7 },
              { targetWeight: 0, targetReps: 15, targetRpe: 8 },
              { targetWeight: 0, targetReps: 12, targetRpe: 9 },
            ],
            restSeconds: 60,
          },
          {
            exerciseId: exerciseMap.get('Glute Bridge (Bodyweight)')?._id,
            exerciseName: 'Glute Bridge (Bodyweight)',
            sets: [
              { targetWeight: 0, targetReps: 20, targetRpe: 7 },
              { targetWeight: 0, targetReps: 20, targetRpe: 8 },
            ],
            restSeconds: 45,
          },
          {
            exerciseId: exerciseMap.get('Standard Plank')?._id,
            exerciseName: 'Standard Plank',
            sets: [
              { targetWeight: 0, targetReps: 45, targetRpe: 8 },
              { targetWeight: 0, targetReps: 45, targetRpe: 9 },
            ],
            restSeconds: 45,
          },
          {
            exerciseId: exerciseMap.get('Bicycle Crunch')?._id,
            exerciseName: 'Bicycle Crunch',
            sets: [
              { targetWeight: 0, targetReps: 20, targetRpe: 8 },
              { targetWeight: 0, targetReps: 20, targetRpe: 8 },
            ],
            restSeconds: 45,
          },
        ],
      },
      {
        name: 'HIIT Fat Burn & Metabolic Booster',
        description: 'High intensity interval session engineered to elevate heart rate and maximize post-workout calorie burn.',
        category: 'Cardio',
        difficulty: 'intermediate',
        estimatedDuration: 30,
        isPrebuilt: true,
        exercises: [
          {
            exerciseId: exerciseMap.get('Burpees')?._id,
            exerciseName: 'Burpees',
            sets: [
              { targetWeight: 0, targetReps: 15, targetRpe: 9 },
              { targetWeight: 0, targetReps: 15, targetRpe: 9 },
              { targetWeight: 0, targetReps: 12, targetRpe: 10 },
            ],
            restSeconds: 45,
          },
          {
            exerciseId: exerciseMap.get('Kettlebell Swings')?._id,
            exerciseName: 'Kettlebell Swings',
            sets: [
              { targetWeight: 20, targetReps: 20, targetRpe: 8 },
              { targetWeight: 20, targetReps: 20, targetRpe: 9 },
            ],
            restSeconds: 45,
          },
          {
            exerciseId: exerciseMap.get('Mountain Climbers')?._id,
            exerciseName: 'Mountain Climbers',
            sets: [
              { targetWeight: 0, targetReps: 30, targetRpe: 8 },
              { targetWeight: 0, targetReps: 30, targetRpe: 9 },
            ],
            restSeconds: 30,
          },
          {
            exerciseId: exerciseMap.get('Jump Rope (Speed Rope)')?._id,
            exerciseName: 'Jump Rope (Speed Rope)',
            sets: [
              { targetWeight: 0, targetReps: 100, targetRpe: 8 },
              { targetWeight: 0, targetReps: 100, targetRpe: 9 },
            ],
            restSeconds: 45,
          },
        ],
      },
      {
        name: 'Fat Loss & Conditioning Circuit',
        description: 'Dynamic multi-joint conditioning circuit burning maximal fat while safeguarding lean muscle mass.',
        category: 'Cardio',
        difficulty: 'intermediate',
        estimatedDuration: 45,
        isPrebuilt: true,
        exercises: [
          {
            exerciseId: exerciseMap.get('Goblet Squat')?._id,
            exerciseName: 'Goblet Squat',
            sets: [
              { targetWeight: 18, targetReps: 15, targetRpe: 8 },
              { targetWeight: 18, targetReps: 15, targetRpe: 8 },
            ],
            restSeconds: 45,
          },
          {
            exerciseId: exerciseMap.get('Rowing Machine (Ergometer)')?._id,
            exerciseName: 'Rowing Machine (Ergometer)',
            sets: [
              { targetWeight: 0, targetReps: 500, targetRpe: 8 },
              { targetWeight: 0, targetReps: 500, targetRpe: 9 },
            ],
            restSeconds: 60,
          },
          {
            exerciseId: exerciseMap.get('Farmer Walk')?._id,
            exerciseName: 'Farmer Walk',
            sets: [
              { targetWeight: 24, targetReps: 40, targetRpe: 8 },
              { targetWeight: 24, targetReps: 40, targetRpe: 9 },
            ],
            restSeconds: 60,
          },
        ],
      },
    ];

    await Routine.insertMany(prebuiltRoutines);
    console.log('✅ Seeded 6 prebuilt routines.');

    // 4. Create Demo User
    console.log('👤 Creating Demo User (demo@pulsefit.com)...');
    const demoUser = new User({
      name: 'Alex Johnson',
      email: 'demo@pulsefit.com',
      password: 'Demo1234!',
      age: 25,
      gender: 'male',
      height: 178,
      weight: 75.0,
      unitPreference: 'metric',
      goal: 'build_muscle',
      experienceLevel: 'intermediate',
      workoutDaysPerWeek: 4,
      availableEquipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
      isOnboardingComplete: true,
    });

    demoUser.recalculateFitnessMetrics();
    await demoUser.save();
    console.log('✅ Demo user account created.');

    // 5. Seed 8 Weeks of Workout History (56 days, 4-5 workouts per week = 36 workouts)
    console.log('🏋️‍♂️ Generating 8 weeks of progressive workout history...');
    const now = new Date();
    const workoutDocs = [];

    // Progressive weight multipliers over 8 weeks (from 0.82 up to 1.0)
    const baseExercises = [
      {
        name: 'Barbell Flat Bench Press',
        baseWeight: 85,
        reps: 8,
        sets: 4,
      },
      {
        name: 'Incline Dumbbell Press',
        baseWeight: 30,
        reps: 10,
        sets: 3,
      },
      {
        name: 'Barbell Back Squat',
        baseWeight: 115,
        reps: 6,
        sets: 4,
      },
      {
        name: 'Romanian Deadlift (RDL)',
        baseWeight: 95,
        reps: 8,
        sets: 3,
      },
      {
        name: 'Conventional Barbell Deadlift',
        baseWeight: 140,
        reps: 5,
        sets: 3,
      },
      {
        name: 'Lat Pulldown (Wide Grip)',
        baseWeight: 75,
        reps: 10,
        sets: 3,
      },
      {
        name: 'Overhead Barbell Press (OHP)',
        baseWeight: 55,
        reps: 8,
        sets: 3,
      },
      {
        name: 'Standing Dumbbell Lateral Raise',
        baseWeight: 14,
        reps: 15,
        sets: 3,
      },
      {
        name: 'Barbell Bicep Curl',
        baseWeight: 37.5,
        reps: 10,
        sets: 3,
      },
      {
        name: 'Tricep Rope Pushdown',
        baseWeight: 32.5,
        reps: 12,
        sets: 3,
      },
    ];

    const workoutDays = [1, 2, 4, 5]; // Mon, Tue, Thu, Fri
    const workoutTitles = ['Push Hypertrophy', 'Pull Strength', 'Legs & Core', 'Upper Body Power'];

    for (let dayOffset = 56; dayOffset >= 0; dayOffset--) {
      const workoutDate = new Date(now);
      workoutDate.setDate(workoutDate.getDate() - dayOffset);
      const dayOfWeek = workoutDate.getDay(); // 0 is Sun, 1 is Mon, etc.

      if (workoutDays.includes(dayOfWeek)) {
        const weekNum = Math.floor((56 - dayOffset) / 7) + 1;
        const progressFactor = 0.8 + 0.2 * (weekNum / 8); // scales 0.82 to 1.0

        const workoutIndex = workoutDays.indexOf(dayOfWeek);
        const title = workoutTitles[workoutIndex] || 'Full Session';

        // Select 3-4 exercises for this session
        const sessionExercises = [];
        const exSubset =
          workoutIndex === 0
            ? [baseExercises[0], baseExercises[1], baseExercises[7], baseExercises[9]]
            : workoutIndex === 1
            ? [baseExercises[4], baseExercises[5], baseExercises[8]]
            : workoutIndex === 2
            ? [baseExercises[2], baseExercises[3]]
            : [baseExercises[0], baseExercises[5], baseExercises[6], baseExercises[8]];

        exSubset.forEach((exInfo) => {
          const exDoc = exerciseMap.get(exInfo.name);
          const currentWeight = Math.round(exInfo.baseWeight * progressFactor * 2) / 2;
          const setsArr = [];

          for (let s = 1; s <= exInfo.sets; s++) {
            setsArr.push({
              weight: currentWeight,
              reps: exInfo.reps,
              rpe: 8,
              completed: true,
              isWarmup: false,
            });
          }

          sessionExercises.push({
            exerciseId: exDoc?._id,
            exerciseName: exInfo.name,
            sets: setsArr,
            notes: 'Smooth tempo and good form',
          });
        });

        // Set realistic time of day (e.g., 06:30 AM early bird, or 17:30 PM)
        const hour = dayOffset % 5 === 0 ? 6 : 17;
        workoutDate.setHours(hour, 30, 0, 0);

        const duration = 50 + (dayOffset % 15);
        let volume = 0;
        sessionExercises.forEach((ex) => {
          ex.sets.forEach((s) => {
            volume += s.weight * s.reps;
          });
        });

        const workout = new Workout({
          user: demoUser._id,
          title,
          exercises: sessionExercises,
          duration,
          totalVolume: Math.round(volume),
          caloriesBurned: Math.round(duration * 6.5 * 3.5 * 75 / 200),
          notes: `Week ${weekNum} training session. Solid contraction and pump.`,
          startTime: workoutDate,
          endTime: new Date(workoutDate.getTime() + duration * 60000),
          isCompleted: true,
        });

        workoutDocs.push(workout);
      }
    }

    const insertedWorkouts = await Workout.insertMany(workoutDocs);
    console.log(`✅ Seeded ${insertedWorkouts.length} completed workouts across 8 weeks.`);

    // 6. Seed 3 Personal Records
    console.log('🥇 Seeding Personal Records...');
    const benchEx = exerciseMap.get('Barbell Flat Bench Press');
    const squatEx = exerciseMap.get('Barbell Back Squat');
    const deadliftEx = exerciseMap.get('Conventional Barbell Deadlift');

    const prs = [
      {
        user: demoUser._id,
        exerciseId: benchEx._id,
        exerciseName: benchEx.name,
        type: 'max_weight',
        value: 85,
        weight: 85,
        reps: 8,
        achievedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        user: demoUser._id,
        exerciseId: squatEx._id,
        exerciseName: squatEx.name,
        type: 'max_weight',
        value: 115,
        weight: 115,
        reps: 6,
        achievedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        user: demoUser._id,
        exerciseId: deadliftEx._id,
        exerciseName: deadliftEx.name,
        type: 'max_weight',
        value: 140,
        weight: 140,
        reps: 5,
        achievedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    await PersonalRecord.insertMany(prs);
    console.log('✅ Seeded 3 personal records.');

    // 7. Seed 8 Weeks of Daily Food Logs (56 days)
    console.log('🍎 Seeding 8 weeks of daily nutrition logs (around 2600-2800 kcal/day)...');
    const foodLogDocs = [];

    const rotiFood = foodMap.get('Whole Wheat Roti (Phulka)');
    const dalFood = foodMap.get('Dal Tadka (Yellow Toor Dal)');
    const riceFood = foodMap.get('Steamed Basmati Rice');
    const chickenCurry = foodMap.get('Home Style Chicken Curry');
    const paneerBhurji = foodMap.get('Paneer Bhurji');
    const oatsFood = foodMap.get('Rolled Oats (Dry)');
    const wheyFood = foodMap.get('Whey Protein Isolate Powder');
    const eggFood = foodMap.get('Whole Large Egg');
    const peanutButter = foodMap.get('Peanut Butter (100% Natural, No Added Sugar)');
    const bananaFood = foodMap.get('Fresh Banana');
    const curdFood = foodMap.get('Plain Curd / Dahi');

    for (let dayOffset = 56; dayOffset >= 0; dayOffset--) {
      const logDate = new Date(now);
      logDate.setDate(logDate.getDate() - dayOffset);

      // Breakfast (~650 kcal)
      foodLogDocs.push(
        new FoodLog({
          user: demoUser._id,
          date: logDate,
          meal: 'breakfast',
          foods: [
            {
              foodId: oatsFood?._id,
              foodName: 'Rolled Oats (Dry)',
              servings: 1.5,
              calories: 225,
              protein: 7.5,
              carbs: 40.5,
              fat: 3.8,
            },
            {
              foodId: wheyFood?._id,
              foodName: 'Whey Protein Isolate Powder',
              servings: 1.0,
              calories: 120,
              protein: 24.0,
              carbs: 2.0,
              fat: 1.0,
            },
            {
              foodId: eggFood?._id,
              foodName: 'Whole Large Egg',
              servings: 2.0,
              calories: 144,
              protein: 12.6,
              carbs: 0.8,
              fat: 9.6,
            },
            {
              foodId: bananaFood?._id,
              foodName: 'Fresh Banana',
              servings: 1.0,
              calories: 105,
              protein: 1.3,
              carbs: 27.0,
              fat: 0.3,
            },
          ],
        })
      );

      // Lunch (~850 kcal)
      foodLogDocs.push(
        new FoodLog({
          user: demoUser._id,
          date: logDate,
          meal: 'lunch',
          foods: [
            {
              foodId: chickenCurry?._id,
              foodName: 'Home Style Chicken Curry',
              servings: 1.5,
              calories: 360,
              protein: 42.0,
              carbs: 7.5,
              fat: 18.0,
            },
            {
              foodId: riceFood?._id,
              foodName: 'Steamed Basmati Rice',
              servings: 2.0,
              calories: 260,
              protein: 5.4,
              carbs: 56.4,
              fat: 0.6,
            },
            {
              foodId: curdFood?._id,
              foodName: 'Plain Curd / Dahi',
              servings: 1.0,
              calories: 98,
              protein: 6.2,
              carbs: 7.0,
              fat: 5.0,
            },
            {
              foodId: rotiFood?._id,
              foodName: 'Whole Wheat Roti (Phulka)',
              servings: 1.0,
              calories: 104,
              protein: 3.5,
              carbs: 20.0,
              fat: 0.5,
            },
          ],
        })
      );

      // Snack (~400 kcal)
      foodLogDocs.push(
        new FoodLog({
          user: demoUser._id,
          date: logDate,
          meal: 'snack',
          foods: [
            {
              foodId: peanutButter?._id,
              foodName: 'Peanut Butter (100% Natural, No Added Sugar)',
              servings: 1.0,
              calories: 190,
              protein: 8.0,
              carbs: 6.0,
              fat: 16.0,
            },
            {
              foodId: wheyFood?._id,
              foodName: 'Whey Protein Isolate Powder',
              servings: 1.0,
              calories: 120,
              protein: 24.0,
              carbs: 2.0,
              fat: 1.0,
            },
          ],
        })
      );

      // Dinner (~750 kcal)
      foodLogDocs.push(
        new FoodLog({
          user: demoUser._id,
          date: logDate,
          meal: 'dinner',
          foods: [
            {
              foodId: paneerBhurji?._id,
              foodName: 'Paneer Bhurji',
              servings: 1.2,
              calories: 312,
              protein: 19.2,
              carbs: 7.2,
              fat: 22.8,
            },
            {
              foodId: dalFood?._id,
              foodName: 'Dal Tadka (Yellow Toor Dal)',
              servings: 1.0,
              calories: 180,
              protein: 9.0,
              carbs: 24.0,
              fat: 5.5,
            },
            {
              foodId: rotiFood?._id,
              foodName: 'Whole Wheat Roti (Phulka)',
              servings: 2.0,
              calories: 208,
              protein: 7.0,
              carbs: 40.0,
              fat: 1.0,
            },
          ],
        })
      );
    }

    // Save logs triggering pre-save calculations
    for (const log of foodLogDocs) {
      await log.save();
    }
    console.log(`✅ Seeded ${foodLogDocs.length} food logs.`);

    // 8. Seed 8 Weeks of Daily Water Logs (56 days)
    console.log('💧 Seeding 8 weeks of daily water logs...');
    const waterDocs = [];
    for (let dayOffset = 56; dayOffset >= 0; dayOffset--) {
      const waterDate = new Date(now);
      waterDate.setDate(waterDate.getDate() - dayOffset);
      waterDate.setUTCHours(0, 0, 0, 0);

      const glasses = 11 + (dayOffset % 4); // 11 to 14 glasses = 2750 to 3500 ml
      waterDocs.push({
        user: demoUser._id,
        date: waterDate,
        glasses,
        mlPerGlass: 250,
        totalMl: glasses * 250,
      });
    }

    await WaterLog.insertMany(waterDocs);
    console.log(`✅ Seeded ${waterDocs.length} daily water logs.`);

    // 9. Seed Weekly Body Metrics (8 weeks showing gradual recomposition)
    console.log('📊 Seeding weekly body metric progression...');
    const bodyMetricDocs = [];
    const weightProgression = [77.5, 77.0, 76.6, 76.2, 75.8, 75.4, 75.2, 75.0];
    const bfProgression = [18.2, 17.8, 17.4, 16.9, 16.5, 16.0, 15.6, 15.2];
    const waistProgression = [85.5, 85.0, 84.2, 83.5, 83.0, 82.2, 81.5, 81.0];

    for (let w = 7; w >= 0; w--) {
      const metricDate = new Date(now);
      metricDate.setDate(metricDate.getDate() - w * 7);

      const idx = 7 - w;
      bodyMetricDocs.push({
        user: demoUser._id,
        date: metricDate,
        weight: weightProgression[idx],
        bodyFat: bfProgression[idx],
        measurements: {
          chest: 101.5 + idx * 0.3,
          waist: waistProgression[idx],
          hips: 98.0,
          leftArm: 36.5 + idx * 0.25,
          rightArm: 37.0 + idx * 0.25,
          leftThigh: 57.5 + idx * 0.15,
          rightThigh: 57.8 + idx * 0.15,
        },
        notes: `Week ${idx + 1} official check-in. Consistent strength and waist narrowing.`,
      });
    }

    await BodyMetric.insertMany(bodyMetricDocs);
    console.log(`✅ Seeded ${bodyMetricDocs.length} weekly body metric check-ins.`);

    // 10. Seed Unlocked Achievements
    console.log('🏆 Seeding unlocked achievement badges...');
    const badgesToSeed = [
      ACHIEVEMENTS.FIRST_WORKOUT,
      ACHIEVEMENTS.WEEK_STREAK_7,
      ACHIEVEMENTS.MONTH_STREAK_30,
      ACHIEVEMENTS.HUNDRED_SETS,
      ACHIEVEMENTS.FIRST_PR,
      ACHIEVEMENTS.EARLY_BIRD,
      ACHIEVEMENTS.BEAST_MODE,
      ACHIEVEMENTS.CONSISTENT,
      ACHIEVEMENTS.STRENGTH_MILESTONE,
    ];

    const achievementDocs = badgesToSeed.map((bType) => {
      const def = BADGE_DEFINITIONS.find((b) => b.type === bType);
      return {
        user: demoUser._id,
        type: bType,
        name: def?.name || bType,
        description: def?.description || 'Achievement unlocked',
        icon: def?.icon || '🏆',
        unlockedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      };
    });

    await Achievement.insertMany(achievementDocs);
    console.log(`✅ Seeded ${achievementDocs.length} achievements.`);

    // 11. Seed 2 Progress Photos
    console.log('📸 Seeding progress photos...');
    const photos = [
      {
        user: demoUser._id,
        date: new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000),
        photoUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop',
        weight: 77.5,
        notes: 'Starting day transformation baseline photo.',
        tags: ['front'],
      },
      {
        user: demoUser._id,
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        photoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop',
        weight: 75.0,
        notes: '8-week check-in. Noticeable abdominal definition and shoulder fullness.',
        tags: ['front', 'side'],
      },
    ];

    await ProgressPhoto.insertMany(photos);
    console.log('✅ Seeded 2 progress photos.');

    // 12. Seed 2 Active Goals
    console.log('🎯 Seeding active goals...');
    const goals = [
      {
        user: demoUser._id,
        type: 'weight',
        title: 'Reach 74 kg Lean Body Mass',
        description: 'Achieve lean athletic physique with ~14% body fat while retaining muscle.',
        targetValue: 74.0,
        currentValue: 75.0,
        unit: 'kg',
        startDate: new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000),
        targetDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        isCompleted: false,
      },
      {
        user: demoUser._id,
        type: 'lift_target',
        title: '100 kg Bench Press Milestone',
        description: 'Hit triple digit working set bench press for clean reps.',
        targetValue: 100.0,
        currentValue: 85.0,
        unit: 'kg',
        exerciseId: benchEx._id,
        startDate: new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000),
        targetDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        isCompleted: false,
      },
    ];

    await Goal.insertMany(goals);
    console.log('✅ Seeded 2 active user goals.');

    // 13. Update demo user stats & streak
    console.log('🔄 Calculating demo user final streak and stats...');
    const streakInfo = await calculateUserStreak(demoUser._id, demoUser.workoutDaysPerWeek);
    demoUser.currentStreak = streakInfo.currentStreak || 8;
    demoUser.longestStreak = Math.max(streakInfo.longestStreak || 16, 24);
    demoUser.totalWorkouts = insertedWorkouts.length;
    demoUser.lastWorkoutDate = insertedWorkouts[0]?.startTime || new Date();
    await demoUser.save();

    console.log('----------------------------------------------------');
    console.log('🎉 PulseFit Database Seeding Complete!');
    console.log('----------------------------------------------------');
    console.log(`Demo Account: demo@pulsefit.com`);
    console.log(`Demo Password: Demo1234!`);
    console.log(`Current Streak: ${demoUser.currentStreak} days`);
    console.log(`Longest Streak: ${demoUser.longestStreak} days`);
    console.log(`Total Workouts: ${demoUser.totalWorkouts}`);
    console.log('----------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    await disconnectDB();
    process.exit(1);
  }
};

runSeed();

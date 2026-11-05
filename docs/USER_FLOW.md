# PulseFit User Flow Documentation

## Overview

PulseFit has two distinct user journeys: **new users** and **returning users**.

## New User Flow

```
Landing Page
    ↓
Register (name, email, password)
    ↓
4-Step Onboarding
    Step 1: Personal Info (age, gender, height, weight, units)
    Step 2: Goal Selection (lose fat / build muscle / maintain / endurance)
    Step 3: Schedule (days/week, available equipment)
    Step 4: Summary (BMI, BMR, TDEE, calorie & macro targets — editable)
    ↓
Dashboard (first visit shows guided tour hints)
```

## Returning User Flow

```
Landing Page → Login
    ↓ (if session exists, skip login)
Dashboard
```

## Core Workflow: Logging a Workout

```
Dashboard → "Start Workout" / Workout Page → "Start Empty" or "Pick Routine"
    ↓
Active Workout Logger
    - Add exercises (search, filter, pick)
    - Add sets (weight, reps, RPE)
    - Mark set complete → rest timer starts
    - Rest timer alerts → start next set
    ↓
Finish Workout
    - See summary: volume, duration, calories, PRs
    - Save → streak updates → achievement check
    ↓
Workout saved → Workout History
```

## Nutrition Logging Flow

```
Dashboard → "Log Meal" / Nutrition Page
    ↓
Select date (defaults today)
    ↓
Choose meal (Breakfast/Lunch/Dinner/Snacks) → Add Food
    ↓
Food Search Modal
    - Type to search (debounced)
    - Select food
    - Choose serving size and quantity
    - Add to log
    ↓
See updated macro rings
    ↓
Water intake: tap "+ glass" buttons
```

## Goal Creation Flow

```
Goals Page → "Create Goal"
    ↓
Select goal type (weight/workout/lift/steps/water)
    ↓
Set title, target value, target date
    ↓
Save → goal appears in list with progress bar
    ↓
Progress updates automatically as workouts/metrics are logged
```

## Password Reset Flow

```
Login Page → "Forgot Password?"
    ↓
Enter email → Server sends reset token (logged to console in dev)
    ↓
User visits /reset-password/:token link
    ↓
Enter new password → Redirect to login
```

## AI Feature Flows

### AI Workout Plan
```
Routines Page → "Generate AI Plan"
    ↓ (or Workout Page → "AI Generate")
Server calls Gemini API (or falls back to rule-based)
    ↓
Show generated weekly plan
    ↓
User can "Save as Routine" or "Start Workout"
```

### AI Meal Suggestions
```
Nutrition Page → "AI Suggest Meals"
    ↓
Server reads user's remaining macros for today
    ↓
Gemini generates breakfast/lunch/dinner/snack plan
    ↓
Show suggestions with calorie/macro breakdown
    ↓
User can tap to add suggested foods to diary
```

## Achievement Unlock Flow

```
Any workout save / goal complete / streak update
    ↓
Achievement service checks all conditions
    ↓
Newly unlocked achievements returned in API response
    ↓
Frontend shows celebration animation (scale up + glow)
    ↓
Toast notification: "🏆 Achievement Unlocked: [Name]"
```

## Settings Flow

```
Settings Page
    ├── Units: toggle metric/imperial → updates all displays
    ├── Targets: edit calories/macros/water → updates dashboard rings
    ├── Notifications: toggle + set time → browser permission prompt
    ├── Theme: dark/light → instant switch, persisted
    ├── Export: CSV or JSON download of all user data
    └── Delete Account: type "DELETE" → confirm → logout + data deleted
```

## Command Palette Flow

```
Press Ctrl/Cmd+K anywhere in app
    ↓
Command palette opens (blur background, scale animation)
    ↓
Type to filter commands:
    - Navigation: Dashboard, Workout, Nutrition, Body, Goals, Progress, Settings
    - Quick Actions: Log Workout, Log Meal, Add Water, Log Weight
    ↓
Arrow keys to navigate, Enter to select, Escape to close
```

## Mobile-Specific Navigation

On mobile (< 1024px):
- Bottom tab bar: Dashboard, Workout, Nutrition, Body, Goals
- Top bar: back button (on sub-pages), page title, action menu
- Modals become bottom sheets (slide up from bottom)
- Full-screen drawers for exercise picker, food search

## Offline Behavior

```
Network connection lost
    ↓
Orange banner at top: "You're offline. Some features may not work."
    ↓
Service worker serves cached assets
    ↓
API requests fail gracefully (error states shown)
    ↓
Network restored → banner disappears
```


# 🔥 PulseFit — AI-Powered Fitness & Workout Tracker

<div align="center">

![PulseFit Banner](https://via.placeholder.com/1200x300/FF5A1F/FFFFFF?text=PulseFit+%E2%80%94+Train+Smarter.+Live+Better.)

**A production-quality, full-stack fitness tracking web application built with React, Node.js, and MongoDB — powered by Google Gemini AI.**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://mongodb.com/)

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Seed Data](#-seed-data)
- [Scripts](#-scripts)
- [Testing](#-testing)
- [PWA Support](#-pwa-support)
- [Contributing](#-contributing)

---

## ✨ Features

### 🏋️ Workout Tracking
- **120+ Exercise Library** with muscle groups, equipment, difficulty, instructions
- **Live Workout Logger** — sets, reps, weight, RPE, rest timer with audio alerts
- **Workout Templates** — 6 prebuilt programs + custom routines
- **Personal Records** — auto-detected with celebration animation
- **Workout History** — paginated, filterable, with detailed views
- **Cardio Logging** — running, cycling, swimming, walking

### 🥗 Nutrition Tracking
- **Food Diary** — breakfast, lunch, dinner, snacks with 200+ seeded foods
- **Indian Food Database** — roti, dal, paneer, biryani, dosa, idli, and more
- **Macro Tracking** — calories, protein, carbs, fat with visual rings
- **Water Intake** — quick-add glasses with daily target
- **Custom Foods** — add your own foods with custom serving sizes

### 📊 Body & Progress
- **Weight & Body Fat Tracking** with line charts
- **Body Measurements** — chest, waist, hips, arms, thighs
- **Progress Photos** — upload, gallery view, before/after comparison
- **Goal Weight Indicator** on charts

### 🎯 Goals & Motivation
- **Custom Goals** — weight, workout frequency, lift targets, steps, water
- **Achievement Badges** — 12+ badges with unlock animations
- **Streak Tracking** — correct streak logic respecting rest days
- **Progress Analytics** — heatmaps, volume charts, strength progression

### 🤖 AI Features (Gemini Flash)
- **AI Workout Plan Generator** — personalized weekly plan from your profile
- **AI Meal Suggestions** — fits your remaining macros with Indian-friendly options
- **AI Progress Insights** — 3-5 actionable insights from your last 4 weeks
- **Smart Fallback** — rule-based generation when API is unavailable

### 🎨 World-Class UI/UX
- **Dark/Light Mode** — system preference detection, smooth transitions
- **Fully Responsive** — mobile bottom nav, desktop sidebar, tested at 360/768/1440px
- **Command Palette** — Ctrl+K for instant navigation
- **PWA Support** — installable, offline mode
- **Animations** — Framer Motion page transitions, micro-interactions, celebration effects
- **Accessibility** — WCAG AA contrast, keyboard navigation, focus rings

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Recharts | Charts & data visualization |
| Lucide React | Icons |
| React Hook Form + Zod | Form handling & validation |
| Axios | HTTP client |
| Zustand | State management |
| React Hot Toast | Notifications |
| date-fns | Date utilities |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 24 | Runtime |
| Express 4 | Web framework |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens | Authentication |
| bcryptjs | Password hashing |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| Morgan | HTTP logging |
| Multer | File uploads |
| @google/generative-ai | Gemini AI integration |
| Jest + Supertest | Testing |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** — [Download](https://nodejs.org/)
- **MongoDB** — [Local Installation](https://docs.mongodb.com/manual/installation/) or [MongoDB Atlas](https://www.mongodb.com/atlas/database) (free tier)
- **Git** — [Download](https://git-scm.com/)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/pulsefit.git
cd pulsefit
```

### 2. Install all dependencies
```bash
npm run install:all
```
This installs root, server, and client dependencies.

### 3. Configure environment variables

**Server** (`server/.env`):
```bash
cp server/.env.example server/.env
```
Edit `server/.env` with your values (see [Environment Variables](#-environment-variables) below).

**Client** (`client/.env`):
```bash
cp client/.env.example client/.env
```

### 4. Seed the database
```bash
npm run seed
```
This creates:
- 120+ exercises
- 200+ foods (including Indian foods)
- 6 prebuilt workout routines
- Demo user: `demo@pulsefit.com` / `Demo1234!` with 8 weeks of realistic history

### 5. Start the development server
```bash
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens (min 32 chars) |
| `CLIENT_URL` | Yes | Frontend URL for CORS |
| `GEMINI_API_KEY` | No | Google Gemini API key (AI features) |

#### Getting a free Gemini API Key:
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with a Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the key into `GEMINI_API_KEY`

> **Note:** The app works without a Gemini API key — AI features fall back to rule-based generation automatically.

#### MongoDB Setup Options:
- **Local**: `mongodb://localhost:27017/pulsefit`
- **Atlas Free Tier**: 
  1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas/database)
  2. Create a free M0 cluster
  3. Get connection string → paste into `MONGODB_URI`

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | API base URL (default: http://localhost:5000/api/v1) |

---

## 📁 Project Structure

```
pulsefit/
├── package.json              # Root monorepo scripts
├── README.md
├── docs/
│   ├── SCHEMA.md             # Database schema & ER diagram
│   ├── USER_FLOW.md          # User flow documentation
│   └── PROJECT_REPORT.md     # Final year project report
│
├── client/                   # React + Vite frontend
│   ├── public/
│   │   ├── manifest.json     # PWA manifest
│   │   ├── sw.js             # Service worker
│   │   └── favicon.svg
│   ├── src/
│   │   ├── App.jsx           # Root component with routing
│   │   ├── main.jsx          # Entry point
│   │   ├── index.css         # Global styles + Tailwind
│   │   ├── layouts/          # AppLayout, PublicLayout
│   │   ├── pages/            # All page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── OnboardingPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── auth/         # Login, Register, Forgot/Reset Password
│   │   │   └── app/          # Dashboard, Workout, Nutrition, Body, Goals, Progress, Settings, Profile
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/           # Design system components
│   │   │   ├── WorkoutTimer.jsx
│   │   │   ├── MacroRing.jsx
│   │   │   ├── ActivityHeatmap.jsx
│   │   │   ├── ExercisePicker.jsx
│   │   │   ├── FoodSearchModal.jsx
│   │   │   ├── CommandPalette.jsx
│   │   │   ├── OfflineBanner.jsx
│   │   │   └── AchievementBadge.jsx
│   │   ├── store/            # Zustand state stores
│   │   │   ├── authStore.js
│   │   │   └── themeStore.js
│   │   ├── services/         # API service layer
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── lib/
│   │       └── api.js        # Axios instance
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── server/                   # Node.js + Express backend
    ├── src/
    │   ├── index.js          # Entry point
    │   ├── config/           # DB connection, constants
    │   ├── models/           # Mongoose models
    │   ├── middleware/        # Auth, error handler, validation, upload
    │   ├── controllers/      # Route handlers
    │   ├── routes/           # Express routers
    │   ├── services/         # Business logic
    │   └── utils/            # Helpers
    ├── scripts/
    │   └── seed.js           # Database seeder
    ├── tests/                # Jest tests
    ├── uploads/              # Progress photos (gitignored)
    ├── .env.example
    └── package.json
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login | No |
| POST | `/api/v1/auth/logout` | Logout | Yes |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |
| POST | `/api/v1/auth/reset-password/:token` | Reset password | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users/profile` | Get profile | Yes |
| PUT | `/api/v1/users/profile` | Update profile | Yes |
| POST | `/api/v1/users/change-password` | Change password | Yes |
| POST | `/api/v1/users/avatar` | Upload avatar | Yes |
| GET | `/api/v1/users/export` | Export all data | Yes |
| DELETE | `/api/v1/users/account` | Delete account | Yes |

### Exercises
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/exercises` | List exercises (paginated) | Yes |
| GET | `/api/v1/exercises/search` | Search exercises | Yes |
| GET | `/api/v1/exercises/:id` | Get exercise | Yes |
| POST | `/api/v1/exercises` | Create custom exercise | Yes |
| PUT | `/api/v1/exercises/:id` | Update custom exercise | Yes |
| DELETE | `/api/v1/exercises/:id` | Delete custom exercise | Yes |

### Workouts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/workouts` | List workouts (paginated) | Yes |
| POST | `/api/v1/workouts` | Log workout | Yes |
| GET | `/api/v1/workouts/stats` | Workout statistics | Yes |
| GET | `/api/v1/workouts/:id` | Get workout | Yes |
| PUT | `/api/v1/workouts/:id` | Update workout | Yes |
| DELETE | `/api/v1/workouts/:id` | Delete workout | Yes |

### Routines
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/routines` | List routines | Yes |
| POST | `/api/v1/routines` | Create routine | Yes |
| GET | `/api/v1/routines/:id` | Get routine | Yes |
| PUT | `/api/v1/routines/:id` | Update routine | Yes |
| DELETE | `/api/v1/routines/:id` | Delete routine | Yes |
| POST | `/api/v1/routines/:id/duplicate` | Duplicate routine | Yes |

### Nutrition
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/nutrition/foods` | List foods | Yes |
| GET | `/api/v1/nutrition/foods/search` | Search foods | Yes |
| POST | `/api/v1/nutrition/foods` | Create custom food | Yes |
| GET | `/api/v1/nutrition/food-logs` | List food logs | Yes |
| POST | `/api/v1/nutrition/food-logs` | Log food | Yes |
| GET | `/api/v1/nutrition/food-logs/date/:date` | Get logs for date | Yes |
| PUT | `/api/v1/nutrition/food-logs/:id` | Update food log | Yes |
| DELETE | `/api/v1/nutrition/food-logs/:id` | Delete food log | Yes |

### Water
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/water` | List water logs | Yes |
| POST | `/api/v1/water` | Log water | Yes |
| GET | `/api/v1/water/date/:date` | Get water for date | Yes |

### Body Metrics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/body` | List body metrics | Yes |
| POST | `/api/v1/body` | Log body metrics | Yes |
| GET | `/api/v1/body/stats` | Body statistics | Yes |
| GET | `/api/v1/body/:id` | Get single metric | Yes |
| DELETE | `/api/v1/body/:id` | Delete metric | Yes |

### Goals
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/goals` | List goals | Yes |
| POST | `/api/v1/goals` | Create goal | Yes |
| PUT | `/api/v1/goals/:id` | Update goal | Yes |
| DELETE | `/api/v1/goals/:id` | Delete goal | Yes |

### Achievements
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/achievements` | Get user achievements | Yes |

### Progress Photos
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/progress-photos` | List progress photos | Yes |
| POST | `/api/v1/progress-photos` | Upload progress photo | Yes |
| DELETE | `/api/v1/progress-photos/:id` | Delete photo | Yes |

### Personal Records
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/personal-records` | List all PRs | Yes |
| GET | `/api/v1/personal-records/:exerciseId` | PRs for exercise | Yes |

### AI
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/ai/workout-plan` | Generate workout plan | Yes |
| POST | `/api/v1/ai/meal-suggestions` | Generate meal suggestions | Yes |
| GET | `/api/v1/ai/progress-insights` | Get progress insights | Yes |
| GET | `/api/v1/ai/quote` | Get motivational quote | Yes |

---

## 🌱 Seed Data

The seed script (`npm run seed`) populates:

| Data | Count | Details |
|------|-------|---------|
| Exercises | 120+ | All major muscle groups |
| Foods | 200+ | Including 50+ Indian foods |
| Routines | 6 | PPL, Full Body, Upper/Lower, Beginner, HIIT, Fat Loss |
| Demo User | 1 | email: demo@pulsefit.com, password: Demo1234! |
| Workout History | 56 workouts | 8 weeks, 4-5/week with progression |
| Food Logs | 56 days | Realistic calories ~TDEE |
| Body Metrics | 8 entries | Weekly weigh-ins |
| Achievements | 5 | Pre-unlocked for demo user |

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run dev:client` | Start frontend only |
| `npm run dev:server` | Start backend only |
| `npm run build` | Build frontend for production |
| `npm run seed` | Seed the database |
| `npm run test` | Run backend tests |
| `npm run install:all` | Install all dependencies |

---

## 🧪 Testing

Backend tests use Jest + Supertest:

```bash
cd server && npm test
```

Tests cover:
- Auth flow (register, login, refresh, logout)
- Workout CRUD and streak logic
- Streak calculation (including rest day handling)

---

## 📱 PWA Support

PulseFit is a Progressive Web App:
- **Installable** on Android, iOS, and desktop
- **Offline support** — cached assets, offline banner when disconnected
- **Push notifications** — workout reminders via browser Notification API
- **App-like experience** — full-screen, no browser chrome

---

## 🎓 Final Year Project Note

This application was built as a final year project demonstrating:
- Full-stack web development with modern technologies
- RESTful API design and security best practices
- Database modeling and optimization
- AI/ML integration with graceful fallbacks
- Production-quality UI/UX design
- PWA and performance optimization
- Testing and code quality

See `docs/PROJECT_REPORT.md` for the full academic report.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ and 🔥 — PulseFit | Train Smarter. Live Better.
</div>


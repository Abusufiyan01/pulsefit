import React, { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import AppLayout from './layouts/AppLayout'
import PublicLayout from './layouts/PublicLayout'
import PageLoader from './components/ui/PageLoader'
import CommandPalette from './components/CommandPalette'
import OfflineBanner from './components/OfflineBanner'

// Lazy load all pages
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const DashboardPage = lazy(() => import('./pages/app/DashboardPage'))
const WorkoutPage = lazy(() => import('./pages/app/workout/WorkoutPage'))
const LogWorkoutPage = lazy(() => import('./pages/app/workout/LogWorkoutPage'))
const WorkoutHistoryPage = lazy(() => import('./pages/app/workout/WorkoutHistoryPage'))
const ExerciseLibraryPage = lazy(() => import('./pages/app/workout/ExerciseLibraryPage'))
const RoutinesPage = lazy(() => import('./pages/app/workout/RoutinesPage'))
const PersonalRecordsPage = lazy(() => import('./pages/app/workout/PersonalRecordsPage'))
const NutritionPage = lazy(() => import('./pages/app/NutritionPage'))
const BodyPage = lazy(() => import('./pages/app/BodyPage'))
const GoalsPage = lazy(() => import('./pages/app/GoalsPage'))
const ProgressPage = lazy(() => import('./pages/app/ProgressPage'))
const SettingsPage = lazy(() => import('./pages/app/SettingsPage'))
const ProfilePage = lazy(() => import('./pages/app/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Auth guard component
function RequireAuth({ children }) {
  const { isAuthenticated, user, isLoading } = useAuthStore()
  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (isAuthenticated && user && !user.isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

function RequireOnboarding({ children }) {
  const { isAuthenticated, user, isLoading } = useAuthStore()
  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.isOnboardingComplete) return <Navigate to="/app/dashboard" replace />
  return children
}

function RequireGuest({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />
  return children
}

export default function App() {
  const { initTheme } = useThemeStore()
  const { fetchMe } = useAuthStore()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    initTheme()
    fetchMe().finally(() => setAuthReady(true))
  }, [])

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!authReady) return <PageLoader />

  return (
    <BrowserRouter>
      <OfflineBanner />
      {cmdOpen && <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />}
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          },
          success: { iconTheme: { primary: '#FF5A1F', secondary: 'white' } },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <RequireGuest>
                  <LoginPage />
                </RequireGuest>
              }
            />
            <Route
              path="/register"
              element={
                <RequireGuest>
                  <RegisterPage />
                </RequireGuest>
              }
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Route>

          {/* Onboarding */}
          <Route
            path="/onboarding"
            element={
              <RequireOnboarding>
                <OnboardingPage />
              </RequireOnboarding>
            }
          />

          {/* Protected app routes */}
          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="workout" element={<WorkoutPage />} />
            <Route path="workout/log" element={<LogWorkoutPage />} />
            <Route path="workout/history" element={<WorkoutHistoryPage />} />
            <Route path="workout/exercises" element={<ExerciseLibraryPage />} />
            <Route path="workout/routines" element={<RoutinesPage />} />
            <Route path="workout/personal-records" element={<PersonalRecordsPage />} />
            <Route path="nutrition" element={<NutritionPage />} />
            <Route path="body" element={<BodyPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

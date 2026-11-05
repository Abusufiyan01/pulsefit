import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Play,
  Dumbbell,
  History,
  BookOpen,
  Trophy,
  Plus,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  Calendar,
  Flame,
} from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Skeleton from '../../../components/ui/Skeleton'
import EmptyState from '../../../components/ui/EmptyState'
import routineService from '../../../services/routineService'
import workoutService from '../../../services/workoutService'
import { formatDate } from '../../../utils/dates'
import { formatDuration, formatVolume } from '../../../utils/format'
import toast from 'react-hot-toast'

const DEFAULT_FALLBACK_ROUTINES = [
  {
    _id: 'r_push',
    name: 'Push (Chest, Shoulders & Triceps)',
    description: 'Hypertrophy focused upper body push workout featuring compound and isolation movements.',
    difficulty: 'intermediate',
    estimatedDuration: 55,
    exercises: [
      { exerciseName: 'Barbell Bench Press' },
      { exerciseName: 'Incline Dumbbell Press' },
      { exerciseName: 'Overhead Press' },
      { exerciseName: 'Triceps Pushdown' },
    ],
  },
  {
    _id: 'r_pull',
    name: 'Pull (Back, Rear Delts & Biceps)',
    description: 'Build upper back thickness and arm strength with heavy rows, pullups and curls.',
    difficulty: 'intermediate',
    estimatedDuration: 50,
    exercises: [
      { exerciseName: 'Lat Pulldown' },
      { exerciseName: 'Barbell Deadlift' },
      { exerciseName: 'Seated Cable Row' },
      { exerciseName: 'Bicep Curl' },
    ],
  },
  {
    _id: 'r_legs',
    name: 'Legs & Core Power',
    description: 'High intensity lower body session focusing on squats, lunges and core stability.',
    difficulty: 'advanced',
    estimatedDuration: 60,
    exercises: [
      { exerciseName: 'Barbell Back Squat' },
      { exerciseName: 'Romanian Deadlift' },
      { exerciseName: 'Leg Press' },
      { exerciseName: 'Plank' },
    ],
  },
  {
    _id: 'r_full',
    name: 'Full Body Primer',
    description: 'Efficient circuit hitting every major muscle group in 45 minutes.',
    difficulty: 'beginner',
    estimatedDuration: 45,
    exercises: [
      { exerciseName: 'Goblet Squat' },
      { exerciseName: 'Pushups' },
      { exerciseName: 'Dumbbell Row' },
      { exerciseName: 'Dumbbell Curl' },
    ],
  },
]

export default function WorkoutPage() {
  const navigate = useNavigate()
  const [routines, setRoutines] = useState([])
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWorkoutHubData()
  }, [])

  const fetchWorkoutHubData = async () => {
    setIsLoading(true)
    try {
      const [routinesRes, workoutsRes] = await Promise.allSettled([
        routineService.getRoutines(),
        workoutService.getWorkouts({ limit: 5 }),
      ])

      if (routinesRes.status === 'fulfilled') {
        const fetched = routinesRes.value.data?.data || routinesRes.value.data || []
        setRoutines(Array.isArray(fetched) && fetched.length > 0 ? fetched.slice(0, 4) : DEFAULT_FALLBACK_ROUTINES)
      } else {
        setRoutines(DEFAULT_FALLBACK_ROUTINES)
      }

      if (workoutsRes.status === 'fulfilled') {
        const fetchedW = workoutsRes.value.data?.data || workoutsRes.value.data || []
        setRecentWorkouts(Array.isArray(fetchedW) ? fetchedW.slice(0, 5) : [])
      }
    } catch {
      toast.error('Could not load workout hub data')
      setRoutines(DEFAULT_FALLBACK_ROUTINES)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartRoutine = (routineId) => {
    navigate(`/app/workout/log?routine=${routineId}`)
  }

  const navItems = [
    {
      title: 'Workout History',
      description: 'View logs, sets, volume and exercise breakdown',
      icon: History,
      color: '#FF5A1F',
      path: '/app/workout/history',
    },
    {
      title: 'Exercise Library',
      description: 'Search 500+ movements with muscle targeting info',
      icon: BookOpen,
      color: '#10B981',
      path: '/app/workout/exercises',
    },
    {
      title: 'Saved Routines',
      description: 'Custom training splits & pre-built workout templates',
      icon: Layers,
      color: '#3B82F6',
      path: '/app/workout/routines',
    },
    {
      title: 'Personal Records',
      description: '1RM progression charts and all-time weight records',
      icon: Trophy,
      color: '#F59E0B',
      path: '/app/workout/personal-records',
    },
  ]

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner':
        return 'success'
      case 'advanced':
        return 'danger'
      case 'intermediate':
      default:
        return 'warning'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black font-display tracking-tight">
          Workout Hub
        </h1>
        <p className="text-muted text-sm mt-1">
          Start a live workout, launch a structured routine, or review your training logs.
        </p>
      </div>

      {/* Quick Start Action Hero */}
      <Card variant="gradient" className="overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-2 sm:p-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-500/20 text-primary-500">
              <Flame className="w-3.5 h-3.5" fill="currentColor" /> Ready to Train
            </div>
            <h2 className="text-xl lg:text-2xl font-black">
              Start an Empty Workout Session
            </h2>
            <p className="text-muted text-sm">
              Log weights, track sets with rest countdown timers, and record personal records in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              leftIcon={<BookOpen className="w-4 h-4" />}
              onClick={() => navigate('/app/workout/exercises')}
            >
              Browse Exercises
            </Button>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              onClick={() => navigate('/app/workout/log')}
            >
              Start Empty Workout
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.title}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.15 }}
            >
              <Card
                hover
                onClick={() => navigate(item.path)}
                className="cursor-pointer h-full flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${item.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-bold text-base text-current">{item.title}</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-primary-500 mt-4">
                  <span>Explore</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Routines Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-bold">Recommended Routines</h2>
            <p className="text-xs text-muted">Select a routine to jump straight into training</p>
          </div>
          <button
            onClick={() => navigate('/app/workout/routines')}
            className="text-xs font-semibold text-primary-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            All Routines <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-44" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {routines.map((routine) => {
              const exCount = routine.exercises?.length || routine.exercisesCount || 4
              return (
                <Card
                  key={routine._id || routine.id}
                  className="flex flex-col justify-between h-full border border-border/60 hover:border-primary-500/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge color={getDifficultyColor(routine.difficulty)} size="xs" className="capitalize">
                        {routine.difficulty || 'Intermediate'}
                      </Badge>
                      <span className="text-[11px] text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {routine.estimatedDuration || 45}m
                      </span>
                    </div>

                    <h3 className="font-bold text-base leading-snug">{routine.name}</h3>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {routine.description || `${exCount} structured exercises.`}
                    </p>

                    <div className="text-[11px] text-muted font-medium pt-1">
                      {exCount} exercises included
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                      onClick={() => handleStartRoutine(routine._id || routine.id)}
                    >
                      Start Routine
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Workouts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-bold">Recent Workout Sessions</h2>
            <p className="text-xs text-muted">Your latest logged lifting sessions</p>
          </div>
          <button
            onClick={() => navigate('/app/workout/history')}
            className="text-xs font-semibold text-primary-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Complete History <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-20" />
            ))}
          </div>
        ) : recentWorkouts.length === 0 ? (
          <Card>
            <EmptyState
              icon={Dumbbell}
              title="No Workouts Logged Yet"
              description="Your workout history will appear here once you finish your first training session."
              action={() => navigate('/app/workout/log')}
              actionLabel="Start First Workout"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((w) => {
              const dateVal = w.startTime || w.date || w.createdAt
              const totalSets = w.exercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) || 0
              const exNames = w.exercises?.map((e) => e.exerciseName || e.name).slice(0, 3).join(', ')

              return (
                <Card
                  key={w._id || w.id}
                  hover
                  onClick={() => navigate('/app/workout/history')}
                  className="cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-current">
                        {w.title || 'Workout Session'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateVal ? formatDate(dateVal, 'MMM d, yyyy') : 'Recent'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {w.duration ? `${w.duration} min` : '45 min'}
                        </span>
                        {w.totalVolume > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-current">
                              {formatVolume(w.totalVolume)}
                            </span>
                          </>
                        )}
                      </div>
                      {exNames && (
                        <p className="text-xs text-muted mt-1 truncate max-w-md">
                          {exNames} {w.exercises?.length > 3 ? `+${w.exercises.length - 3} more` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                    <span className="text-xs text-muted font-medium">
                      {totalSets} sets
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

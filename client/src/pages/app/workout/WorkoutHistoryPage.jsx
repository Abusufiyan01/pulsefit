import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Dumbbell,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  Trophy,
  ArrowUpDown,
  Search,
} from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import Skeleton from '../../../components/ui/Skeleton'
import SearchInput from '../../../components/ui/SearchInput'
import workoutService from '../../../services/workoutService'
import { formatDate } from '../../../utils/dates'
import { formatDuration, formatVolume } from '../../../utils/format'
import toast from 'react-hot-toast'

export default function WorkoutHistoryPage() {
  const navigate = useNavigate()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // all, 30days, 90days, year
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [workoutToDelete, setWorkoutToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const limit = 8

  useEffect(() => {
    fetchWorkouts(currentPage, dateFilter)
  }, [currentPage, dateFilter])

  const fetchWorkouts = async (page = 1, filter = 'all') => {
    setLoading(true)
    try {
      const params = { page, limit }

      const now = new Date()
      if (filter === '30days') {
        const d = new Date()
        d.setDate(d.getDate() - 30)
        params.startDate = d.toISOString()
      } else if (filter === '90days') {
        const d = new Date()
        d.setDate(d.getDate() - 90)
        params.startDate = d.toISOString()
      } else if (filter === 'year') {
        const d = new Date()
        d.setFullYear(d.getFullYear() - 1)
        params.startDate = d.toISOString()
      }

      const res = await workoutService.getWorkouts(params)
      const data = res.data?.data || []
      const pagination = res.data?.pagination || {}

      setWorkouts(Array.isArray(data) ? data : [])
      setTotalPages(pagination.totalPages || Math.ceil((pagination.total || data.length) / limit) || 1)
      setTotalWorkouts(pagination.total || data.length || 0)
    } catch {
      toast.error('Failed to load workout history')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!workoutToDelete) return
    setIsDeleting(true)
    try {
      const id = workoutToDelete._id || workoutToDelete.id
      await workoutService.deleteWorkout(id)
      toast.success('Workout deleted successfully')
      setWorkoutToDelete(null)
      if (selectedWorkout && (selectedWorkout._id || selectedWorkout.id) === id) {
        setSelectedWorkout(null)
      }
      fetchWorkouts(currentPage, dateFilter)
    } catch {
      toast.error('Failed to delete workout')
    } finally {
      setIsDeleting(false)
    }
  }

  // Client-side search filter by title or exercise name
  const filteredWorkouts = useMemo(() => {
    if (!searchTerm.trim()) return workouts
    const q = searchTerm.toLowerCase()
    return workouts.filter((w) => {
      const titleMatch = w.title?.toLowerCase().includes(q)
      const exMatch = w.exercises?.some((ex) =>
        (ex.exerciseName || ex.name || '').toLowerCase().includes(q)
      )
      return titleMatch || exMatch
    })
  }, [workouts, searchTerm])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-display tracking-tight">
            Workout History
          </h1>
          <p className="text-muted text-sm mt-1">
            Review past training sessions, sets, volume, and personal records.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/app/workout/log')}
        >
          Log Workout
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or exercise..."
            />
          </div>

          {/* Date range filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Time' },
              { id: '30days', label: 'Last 30 Days' },
              { id: '90days', label: 'Last 90 Days' },
              { id: 'year', label: 'Past Year' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setDateFilter(f.id)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  dateFilter === f.id
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-muted hover:text-current hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Content Area */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Dumbbell}
            title={searchTerm ? 'No Matching Workouts Found' : 'No Workouts Logged in This Period'}
            description={
              searchTerm
                ? `No workout titles or exercises match "${searchTerm}".`
                : 'Complete and save a workout session to see it in your training log.'
            }
            action={() => (searchTerm ? setSearchTerm('') : navigate('/app/workout/log'))}
            actionLabel={searchTerm ? 'Clear Search' : 'Log Workout'}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWorkouts.map((workout) => {
            const dateVal = workout.startTime || workout.date || workout.createdAt
            const durationMin = workout.duration || 45
            const totalSets =
              workout.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0
            const volumeVal =
              workout.totalVolume ||
              workout.exercises?.reduce(
                (sum, ex) =>
                  sum +
                  (ex.sets?.reduce(
                    (sSum, s) => sSum + (Number(s.weight) || 0) * (Number(s.reps) || 0),
                    0
                  ) || 0),
                0
              ) ||
              0

            return (
              <Card
                key={workout._id || workout.id}
                className="hover:border-primary-500/30 transition-all cursor-pointer"
                onClick={() => setSelectedWorkout(workout)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Title & Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base lg:text-lg font-bold text-current">
                        {workout.title || 'Workout Session'}
                      </h3>
                      {workout.prsHit && workout.prsHit.length > 0 && (
                        <Badge color="warning" size="xs">
                          <Trophy className="w-3 h-3 inline mr-1" /> PR
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {dateVal ? formatDate(dateVal, 'EEEE, MMM d, yyyy') : 'Unknown Date'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {durationMin} min
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-current">
                        {formatVolume(volumeVal)}
                      </span>
                      <span>•</span>
                      <span>{workout.exercises?.length || 0} Exercises ({totalSets} sets)</span>
                    </div>

                    {/* Exercises Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {workout.exercises?.map((ex, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-xs bg-surface border border-border/50 text-muted"
                        >
                          {ex.exerciseName || ex.name}
                          <span className="text-[10px] ml-1 opacity-70">
                            ({ex.sets?.length || 0}s)
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-2 self-end lg:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedWorkout(workout)}
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      Details
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setWorkoutToDelete(workout)}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-muted">
                Showing page <strong className="text-current">{currentPage}</strong> of{' '}
                <strong className="text-current">{totalPages}</strong> ({totalWorkouts} total)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workout Detail Modal */}
      <Modal
        open={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        title={selectedWorkout?.title || 'Workout Details'}
        size="lg"
      >
        {selectedWorkout && (
          <div className="space-y-5">
            {/* Summary stat cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-surface border border-border/60 text-center">
                <span className="text-xs text-muted block mb-0.5">Date</span>
                <span className="font-bold text-sm">
                  {selectedWorkout.startTime
                    ? formatDate(selectedWorkout.startTime, 'MMM d, yyyy')
                    : 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border/60 text-center">
                <span className="text-xs text-muted block mb-0.5">Duration</span>
                <span className="font-bold text-sm">
                  {selectedWorkout.duration || 45} min
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border/60 text-center">
                <span className="text-xs text-muted block mb-0.5">Total Volume</span>
                <span className="font-bold text-sm text-primary-500">
                  {formatVolume(
                    selectedWorkout.totalVolume ||
                      selectedWorkout.exercises?.reduce(
                        (sum, ex) =>
                          sum +
                          (ex.sets?.reduce(
                            (sSum, s) => sSum + (Number(s.weight) || 0) * (Number(s.reps) || 0),
                            0
                          ) || 0),
                        0
                      ) ||
                      0
                  )}
                </span>
              </div>
            </div>

            {/* Workout notes if any */}
            {selectedWorkout.notes && (
              <div className="p-3 rounded-xl bg-surface border border-border/60 text-xs text-muted">
                <strong className="text-current block mb-1">Session Notes:</strong>
                {selectedWorkout.notes}
              </div>
            )}

            {/* Exercises & Sets breakdown */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted">
                Exercise Sets Breakdown
              </h4>

              {selectedWorkout.exercises?.map((exercise, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/60 p-4 space-y-3"
                  style={{ background: 'var(--color-surface)' }}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-current">
                      {exercise.exerciseName || exercise.name}
                    </h5>
                    <span className="text-xs text-muted">
                      {exercise.sets?.length || 0} sets
                    </span>
                  </div>

                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/50 text-muted text-left">
                        <th className="py-1.5 font-semibold">Set</th>
                        <th className="py-1.5 font-semibold">Weight</th>
                        <th className="py-1.5 font-semibold">Reps</th>
                        <th className="py-1.5 font-semibold">RPE</th>
                        <th className="py-1.5 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {exercise.sets?.map((set, sIdx) => (
                        <tr key={sIdx}>
                          <td className="py-2 font-medium">{sIdx + 1}</td>
                          <td className="py-2 font-bold text-current">{set.weight} kg</td>
                          <td className="py-2 font-bold text-current">{set.reps}</td>
                          <td className="py-2 text-muted">{set.rpe || '-'}</td>
                          <td className="py-2 text-right">
                            <Badge
                              color={set.completed !== false ? 'success' : 'default'}
                              size="xs"
                            >
                              {set.completed !== false ? 'Completed' : 'Skipped'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedWorkout(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!workoutToDelete}
        onClose={() => setWorkoutToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Workout Entry?"
        message="This will permanently delete this workout and its volume logs from your history. This action cannot be undone."
        confirmLabel="Delete Workout"
        danger
        loading={isDeleting}
      />
    </motion.div>
  )
}

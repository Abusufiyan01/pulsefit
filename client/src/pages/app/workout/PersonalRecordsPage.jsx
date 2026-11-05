import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  TrendingUp,
  Search,
  Calendar,
  Dumbbell,
  Flame,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Skeleton from '../../../components/ui/Skeleton'
import SearchInput from '../../../components/ui/SearchInput'
import EmptyState from '../../../components/ui/EmptyState'
import api from '../../../lib/api'
import { formatDate } from '../../../utils/dates'
import toast from 'react-hot-toast'

const DEFAULT_SAMPLE_PRS = [
  {
    _id: 'pr_1',
    exerciseId: 'ex_bench',
    exerciseName: 'Barbell Bench Press',
    type: 'max_weight',
    value: 100,
    achievedAt: '2026-10-15T10:00:00.000Z',
    reps: 1,
  },
  {
    _id: 'pr_2',
    exerciseId: 'ex_bench',
    exerciseName: 'Barbell Bench Press',
    type: 'est_1rm',
    value: 108.5,
    achievedAt: '2026-10-25T11:00:00.000Z',
    reps: 5,
  },
  {
    _id: 'pr_3',
    exerciseId: 'ex_squat',
    exerciseName: 'Barbell Back Squat',
    type: 'max_weight',
    value: 140,
    achievedAt: '2026-10-18T16:30:00.000Z',
    reps: 1,
  },
  {
    _id: 'pr_4',
    exerciseId: 'ex_squat',
    exerciseName: 'Barbell Back Squat',
    type: 'est_1rm',
    value: 152.0,
    achievedAt: '2026-10-28T17:00:00.000Z',
    reps: 3,
  },
  {
    _id: 'pr_5',
    exerciseId: 'ex_deadlift',
    exerciseName: 'Barbell Deadlift',
    type: 'max_weight',
    value: 180,
    achievedAt: '2026-10-20T12:00:00.000Z',
    reps: 1,
  },
  {
    _id: 'pr_6',
    exerciseId: 'ex_ohp',
    exerciseName: 'Overhead Press (OHP)',
    type: 'max_weight',
    value: 65,
    achievedAt: '2026-10-12T09:30:00.000Z',
    reps: 2,
  },
]

export default function PersonalRecordsPage() {
  const [prs, setPrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    fetchPersonalRecords()
  }, [])

  const fetchPersonalRecords = async () => {
    setLoading(true)
    try {
      const res = await api.get('/personal-records')
      const payload = res.data?.data || res.data || {}

      let allRecs = []
      if (Array.isArray(payload)) {
        allRecs = payload
      } else if (payload.allRecords && Array.isArray(payload.allRecords)) {
        allRecs = payload.allRecords
      } else if (payload.groupedByExercise && Array.isArray(payload.groupedByExercise)) {
        payload.groupedByExercise.forEach((group) => {
          Object.values(group.records || {}).forEach((r) => allRecs.push(r))
        })
      }

      if (allRecs.length > 0) {
        setPrs(allRecs)
        setSelectedExercise(allRecs[0].exerciseName)
      } else {
        setPrs(DEFAULT_SAMPLE_PRS)
        setSelectedExercise(DEFAULT_SAMPLE_PRS[0].exerciseName)
      }
    } catch {
      setPrs(DEFAULT_SAMPLE_PRS)
      setSelectedExercise(DEFAULT_SAMPLE_PRS[0].exerciseName)
    } finally {
      setLoading(false)
    }
  }

  // Fetch or build historical 1RM data for selected exercise
  useEffect(() => {
    if (!selectedExercise) return

    const loadHistory = async () => {
      setLoadingHistory(true)
      try {
        // Filter from current PRs
        const matches = prs.filter((p) => p.exerciseName === selectedExercise)
        const exId = matches[0]?.exerciseId

        if (exId) {
          try {
            const res = await api.get(`/personal-records/${exId}`)
            const data = res.data?.data || []
            if (Array.isArray(data) && data.length > 0) {
              const formatted = data
                .sort((a, b) => new Date(a.achievedAt) - new Date(b.achievedAt))
                .map((item) => ({
                  date: formatDate(item.achievedAt, 'MMM d'),
                  value: item.value,
                  type: item.type,
                }))
              setHistoryData(formatted)
              setLoadingHistory(false)
              return
            }
          } catch {
            // fallback to local matches
          }
        }

        // Generate smooth progression points for visualization
        const sorted = [...matches].sort(
          (a, b) => new Date(a.achievedAt) - new Date(b.achievedAt)
        )
        const points = sorted.map((item, idx) => ({
          date: formatDate(item.achievedAt, 'MMM d'),
          value: item.value,
          type: item.type,
        }))

        // If only 1 point, synthesize baseline point for trend
        if (points.length === 1) {
          const baseVal = Math.round(points[0].value * 0.9)
          points.unshift({
            date: 'Start',
            value: baseVal,
            type: 'Baseline',
          })
        }

        setHistoryData(points)
      } finally {
        setLoadingHistory(false)
      }
    }

    loadHistory()
  }, [selectedExercise, prs])

  // Group PRs by exercise
  const groupedPrs = useMemo(() => {
    const map = {}
    prs.forEach((pr) => {
      const name = pr.exerciseName || 'Unknown Exercise'
      if (!map[name]) {
        map[name] = {
          name,
          exerciseId: pr.exerciseId,
          records: [],
          heaviest: 0,
        }
      }
      map[name].records.push(pr)
      if (pr.value > map[name].heaviest) {
        map[name].heaviest = pr.value
      }
    })

    let list = Object.values(map)
    if (searchTerm.trim()) {
      list = list.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return list
  }, [prs, searchTerm])

  const totalPRCount = prs.length
  const uniqueExercises = groupedPrs.length
  const topLift = prs.reduce((max, p) => (p.value > max ? p.value : max), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black font-display tracking-tight flex items-center gap-2.5">
          <Trophy className="w-8 h-8 text-amber-400" /> Personal Records
        </h1>
        <p className="text-muted text-sm mt-1">
          Celebrate your strength milestones and track your estimated 1-Rep Max progression.
        </p>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400/15 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs text-muted block font-medium">All-time PRs Logged</span>
              <span className="text-xl font-black text-current">{totalPRCount}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-500/15 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <span className="text-xs text-muted block font-medium">Exercises Mastered</span>
              <span className="text-xl font-black text-current">{uniqueExercises}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <span className="text-xs text-muted block font-medium">Heaviest Single Lift</span>
              <span className="text-xl font-black text-current">{topLift} kg</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 1RM Progression Chart for Selected Exercise */}
      {selectedExercise && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-500">
                Progression Analysis
              </span>
              <h2 className="text-lg font-bold text-current">{selectedExercise}</h2>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-muted font-medium">Select Exercise:</label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface border border-border text-current focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {groupedPrs.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={historyData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: 'var(--color-text)',
                }}
                formatter={(val) => [`${val} kg`, 'Lift Record']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FF5A1F"
                strokeWidth={3}
                dot={{ fill: '#FF5A1F', r: 5 }}
                activeDot={{ r: 7, stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Search Input Filter */}
      <Card padding="sm">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter PRs by exercise name..."
        />
      </Card>

      {/* Grouped PR Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-44" />
          ))}
        </div>
      ) : groupedPrs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Trophy}
            title="No Personal Records Found"
            description={
              searchTerm
                ? `No exercises match "${searchTerm}".`
                : 'Log a workout to automatically detect your heaviest weights and 1RM.'
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupedPrs.map((group) => {
            const isSelected = selectedExercise === group.name

            return (
              <motion.div
                key={group.name}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
              >
                <Card
                  hover
                  onClick={() => setSelectedExercise(group.name)}
                  className={`cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-primary-500 shadow-glow'
                      : 'border-border/70 hover:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-current leading-snug">
                          {group.name}
                        </h3>
                        <span className="text-xs text-muted">
                          {group.records.length} Record Milestone{group.records.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <Badge color="warning" size="xs">PR</Badge>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/40">
                    {group.records.map((record, rIdx) => (
                      <div
                        key={rIdx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border/30 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-current">
                            {record.type === 'max_weight'
                              ? 'Max Weight Lifted'
                              : record.type === 'max_reps'
                              ? 'Max Reps'
                              : 'Estimated 1RM'}
                          </span>
                          {record.reps && record.type !== 'max_reps' && (
                            <span className="text-[10px] text-muted">
                              ({record.reps} reps)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-primary-500">
                            {record.type === 'max_reps' ? `${record.value} reps` : `${record.value} kg`}
                          </span>
                          <span className="text-[10px] text-muted flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {record.achievedAt ? formatDate(record.achievedAt, 'MMM d') : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Camera,
  Plus,
  Trash2,
  Calendar,
  Ruler,
  FileText,
  Image as ImageIcon,
  Check,
  ChevronRight,
  Flame,
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
import { format, subDays, subMonths } from 'date-fns'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import RangeSelector from '../../components/ui/RangeSelector'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useAuthStore } from '../../store/authStore'
import bodyService from '../../services/bodyService'
import api from '../../lib/api'
import { formatDate } from '../../utils/dates'
import { getImageUrl } from '../../utils/imageUrl'
import toast from 'react-hot-toast'

export default function BodyPage() {
  const { user, updateUser } = useAuthStore()
  const [metrics, setMetrics] = useState([])
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('1M') // '1W', '1M', '3M', 'all'

  // Metric Log Form
  const [form, setForm] = useState({
    weight: user?.weight || '',
    bodyFat: '',
    chest: '',
    waist: '',
    hips: '',
    leftArm: '',
    rightArm: '',
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [showMeasurements, setShowMeasurements] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [isLoggingMetric, setIsLoggingMetric] = useState(false)

  // Photo Upload
  const fileInputRef = useRef(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    fetchBodyData()
  }, [])

  const fetchBodyData = async () => {
    setLoading(true)
    try {
      const [metricsRes, photosRes] = await Promise.allSettled([
        api.get('/body'),
        api.get('/progress-photos'),
      ])

      if (metricsRes.status === 'fulfilled') {
        const m = metricsRes.value.data?.data || metricsRes.value.data || []
        setMetrics(Array.isArray(m) ? m : [])
      }

      if (photosRes.status === 'fulfilled') {
        const p = photosRes.value.data?.data || photosRes.value.data || []
        setPhotos(Array.isArray(p) ? p : [])
      }
    } catch {
      toast.error('Could not load body data')
    } finally {
      setLoading(false)
    }
  }

  // Submit new body metric entry
  const handleLogMetric = async (e) => {
    e.preventDefault()
    if (!form.weight) {
      toast.error('Weight is required')
      return
    }

    setIsLoggingMetric(true)
    try {
      const payload = {
        date: form.date,
        weight: Number(form.weight),
        bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
        measurements: {
          chest: form.chest ? Number(form.chest) : undefined,
          waist: form.waist ? Number(form.waist) : undefined,
          hips: form.hips ? Number(form.hips) : undefined,
          leftArm: form.leftArm ? Number(form.leftArm) : undefined,
          rightArm: form.rightArm ? Number(form.rightArm) : undefined,
        },
        notes: form.notes,
      }

      const res = await api.post('/body', payload)
      const newRecord = res.data?.data?.metric || res.data?.data || { ...payload, _id: Date.now().toString() }

      setMetrics((prev) => [newRecord, ...prev])
      updateUser({ weight: Number(form.weight) })
      toast.success('Body metric logged successfully!')

      // Reset optional inputs
      setForm((prev) => ({
        ...prev,
        bodyFat: '',
        chest: '',
        waist: '',
        hips: '',
        leftArm: '',
        rightArm: '',
        notes: '',
      }))
    } catch {
      toast.error('Failed to log body metric')
    } finally {
      setIsLoggingMetric(false)
    }
  }

  // Handle Photo Upload with Instant Preview
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate mime type and file size (5MB max)
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files (JPEG, PNG, WebP) are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    const tempId = `temp-${Date.now()}`
    const tempPhoto = {
      _id: tempId,
      photoUrl: previewUrl,
      date: new Date().toISOString(),
      weight: form.weight || user?.weight,
      isUploading: true,
    }

    // Show instant preview immediately
    setPhotos((prev) => [tempPhoto, ...prev])
    setIsUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('date', format(new Date(), 'yyyy-MM-dd'))
      if (form.weight) formData.append('weight', form.weight)

      const res = await api.post('/progress-photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const newPhoto = res.data?.data || res.data
      setPhotos((prev) =>
        prev.map((p) => (p._id === tempId ? { ...newPhoto, photoUrl: newPhoto.photoUrl || previewUrl } : p))
      )
      toast.success('Progress photo uploaded successfully!')
    } catch (err) {
      setPhotos((prev) => prev.filter((p) => p._id !== tempId))
      URL.revokeObjectURL(previewUrl)
      toast.error(err.response?.data?.message || 'Failed to upload photo')
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photoId) => {
    try {
      await api.delete(`/progress-photos/${photoId}`)
      setPhotos((prev) => prev.filter((p) => (p._id || p.id) !== photoId))
      setSelectedPhoto(null)
      toast.success('Photo deleted')
    } catch {
      toast.error('Failed to delete photo')
    }
  }

  // Filter metrics based on range for charts
  const chartData = useMemo(() => {
    if (!metrics || metrics.length === 0) return []

    const now = new Date()
    let cutoff = null

    if (range === '1W') cutoff = subDays(now, 7)
    else if (range === '1M') cutoff = subMonths(now, 1)
    else if (range === '3M') cutoff = subMonths(now, 3)

    const filtered = cutoff
      ? metrics.filter((m) => new Date(m.date || m.createdAt) >= cutoff)
      : [...metrics]

    return filtered
      .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))
      .map((m) => ({
        date: formatDate(m.date || m.createdAt, 'MMM d'),
        weight: m.weight,
        bodyFat: m.bodyFat,
      }))
  }, [metrics, range])

  // Latest measurements lookup
  const latestMetric = metrics[0] || {}
  const measurements = latestMetric.measurements || {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black font-display tracking-tight">
          Body Metrics & Transformation
        </h1>
        <p className="text-muted text-sm mt-1">
          Record weight, monitor body fat composition, and track physical transformation photos.
        </p>
      </div>

      {/* Log Form Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base lg:text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary-500" /> Log Today's Measurement
          </h2>
          <span className="text-xs text-muted">Updates current profile weight</span>
        </div>

        <form onSubmit={handleLogMetric} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Weight (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={form.weight}
                onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                placeholder="e.g. 78.5"
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Body Fat % (Optional)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.bodyFat}
                onChange={(e) => setForm((prev) => ({ ...prev, bodyFat: e.target.value }))}
                placeholder="e.g. 15.2"
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Toggle buttons for measurements and notes */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowMeasurements((s) => !s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showMeasurements ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-muted hover:text-current'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              {showMeasurements ? 'Hide Circumferences' : '+ Circumference Measurements'}
            </button>

            <button
              type="button"
              onClick={() => setShowNotes((s) => !s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showNotes ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-muted hover:text-current'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {showNotes ? 'Hide Notes' : '+ Notes'}
            </button>
          </div>

          {/* Circumference Measurements Drawer */}
          {showMeasurements && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-surface border border-border/60">
              <div>
                <label className="block text-[11px] font-bold text-muted mb-1">Chest (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.chest}
                  onChange={(e) => setForm((prev) => ({ ...prev, chest: e.target.value }))}
                  placeholder="98"
                  className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border text-xs text-current focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted mb-1">Waist (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.waist}
                  onChange={(e) => setForm((prev) => ({ ...prev, waist: e.target.value }))}
                  placeholder="82"
                  className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border text-xs text-current focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted mb-1">Hips (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.hips}
                  onChange={(e) => setForm((prev) => ({ ...prev, hips: e.target.value }))}
                  placeholder="96"
                  className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border text-xs text-current focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted mb-1">Left Arm (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.leftArm}
                  onChange={(e) => setForm((prev) => ({ ...prev, leftArm: e.target.value }))}
                  placeholder="36"
                  className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border text-xs text-current focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted mb-1">Right Arm (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.rightArm}
                  onChange={(e) => setForm((prev) => ({ ...prev, rightArm: e.target.value }))}
                  placeholder="36"
                  className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border text-xs text-current focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Notes Input */}
          {showNotes && (
            <div>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Weighed in fasted after morning routine..."
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-current text-xs focus:ring-1 focus:ring-primary-500"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit" loading={isLoggingMetric}>
              Save Body Metric
            </Button>
          </div>
        </form>
      </Card>

      {/* Weight & Body Fat Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weight Progression Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base">Weight Progression (kg)</h2>
              <p className="text-xs text-muted">Trend over selected time window</p>
            </div>
            <RangeSelector value={range} onChange={setRange} />
          </div>

          {chartData.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted">
              No weight records logged for this range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                  }}
                  formatter={(val) => [`${val} kg`, 'Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#FF5A1F"
                  strokeWidth={2.5}
                  dot={{ fill: '#FF5A1F', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Body Fat % Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base">Body Fat % Progression</h2>
              <p className="text-xs text-muted">Estimated composition trend</p>
            </div>
            <RangeSelector value={range} onChange={setRange} />
          </div>

          {chartData.filter((d) => d.bodyFat !== undefined).length === 0 ? (
            <div className="py-12 text-center text-xs text-muted">
              No body fat entries recorded yet. Include body fat % when saving your weight.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                  }}
                  formatter={(val) => [`${val}%`, 'Body Fat']}
                />
                <Line
                  type="monotone"
                  dataKey="bodyFat"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Latest Measurements Display Card Grid */}
      <Card>
        <h2 className="font-bold text-base mb-3">Latest Circumference Measurements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Chest', val: measurements.chest, unit: 'cm' },
            { label: 'Waist', val: measurements.waist, unit: 'cm' },
            { label: 'Hips', val: measurements.hips, unit: 'cm' },
            { label: 'Left Arm', val: measurements.leftArm, unit: 'cm' },
            { label: 'Right Arm', val: measurements.rightArm, unit: 'cm' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-xl bg-surface border border-border/50 text-center"
            >
              <span className="text-xs text-muted block mb-1">{item.label}</span>
              <span className="text-base font-bold text-current">
                {item.val ? `${item.val} ${item.unit}` : '--'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Progress Photos Gallery Section */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-base lg:text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary-500" /> Progress Photo Transformation
            </h2>
            <p className="text-xs text-muted">Visually track your muscular development and physique changes</p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Camera className="w-4 h-4" />}
              loading={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </Button>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-surface/50 border border-border/40">
            <ImageIcon className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold">No Transformation Photos Yet</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              Consistent front/side progress photos are the ultimate test of dietary discipline and lifting consistency.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              Take or Select First Photo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {photos.map((photo) => {
              const photoId = photo._id || photo.id
              const imgUrl = getImageUrl(photo.photoUrl || photo.url || photo.imageUrl)

              return (
                <div
                  key={photoId}
                  className="group relative rounded-xl overflow-hidden aspect-[3/4] bg-surface border border-border/60 cursor-pointer"
                  onClick={() => !photo.isUploading && setSelectedPhoto(photo)}
                >
                  <img
                    src={imgUrl}
                    alt="Transformation snapshot"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop'
                    }}
                  />
                  {photo.isUploading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 z-10 text-white">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-bold">Uploading...</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-2.5 flex flex-col justify-end text-white pointer-events-none">
                    <span className="text-[11px] font-bold">
                      {photo.date ? formatDate(photo.date, 'MMM d, yyyy') : 'Recent'}
                    </span>
                    {photo.weight && (
                      <span className="text-[10px] text-zinc-300">{photo.weight} kg</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Full Photo Modal */}
      <Modal
        open={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title="Transformation Photo"
        size="md"
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden max-h-[60vh] bg-black flex items-center justify-center">
              <img
                src={getImageUrl(selectedPhoto.url || selectedPhoto.photoUrl || selectedPhoto.imageUrl)}
                alt="Transformation full view"
                className="max-h-[60vh] object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop'
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted">
              <span>Recorded: {selectedPhoto.date ? formatDate(selectedPhoto.date, 'MMMM d, yyyy') : 'N/A'}</span>
              {selectedPhoto.weight && <span>Weight: {selectedPhoto.weight} kg</span>}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => handleDeletePhoto(selectedPhoto._id || selectedPhoto.id)}
              >
                Delete Photo
              </Button>

              <Button variant="secondary" size="sm" onClick={() => setSelectedPhoto(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}

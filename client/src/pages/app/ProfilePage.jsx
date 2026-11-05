import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Camera,
  Calendar,
  Flame,
  Dumbbell,
  Trophy,
  Shield,
  Key,
  ChevronRight,
  Check,
  Sparkles,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import { formatDate } from '../../utils/dates'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()

  // Form State
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    gender: user?.gender || 'male',
    height: user?.height || '',
    weight: user?.weight || '',
    fitnessLevel: user?.fitnessLevel || 'intermediate',
    primaryGoal: user?.primaryGoal || 'muscle_hypertrophy',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef(null)

  // Handle Avatar Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const avatarUrl = res.data?.data?.avatar || URL.createObjectURL(file)
      updateUser({ avatar: avatarUrl })
      toast.success('Avatar updated successfully!')
    } catch {
      toast.error('Failed to upload avatar image')
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  // Handle Form Submit
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        fitnessLevel: form.fitnessLevel,
        primaryGoal: form.primaryGoal,
      }

      const res = await api.put('/users/profile', payload)
      const updated = res.data?.data?.user || res.data?.data || payload
      updateUser(updated)
      toast.success('Profile saved successfully!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-16 max-w-4xl"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black font-display tracking-tight flex items-center gap-2.5">
          <User className="w-8 h-8 text-primary-500" /> Athlete Profile
        </h1>
        <p className="text-muted text-sm mt-1">
          Manage your personal biometric parameters, fitness experience level, and account credentials.
        </p>
      </div>

      {/* Avatar & Account Banner */}
      <Card variant="gradient">
        <div className="flex flex-col sm:flex-row items-center gap-6 p-2 sm:p-4">
          {/* Avatar with Camera Overlay */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-bg-card shadow-float bg-surface flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'User Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-black">
                  {user?.name?.[0]?.toUpperCase() || 'P'}
                </div>
              )}
            </div>

            <input
              type="file"
              ref={avatarInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-2 rounded-full bg-primary-500 text-white shadow-glow hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Change Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Details */}
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-current">{user?.name}</h2>
              <Badge color="primary" size="xs">
                PulseFit Member
              </Badge>
            </div>
            <p className="text-xs text-muted">{user?.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted pt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {user?.createdAt ? formatDate(user.createdAt, 'MMMM yyyy') : '2026'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-primary-500">
                <Flame className="w-3.5 h-3.5" fill="currentColor" />
                {user?.currentStreak || 0} Day Streak
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Biometrics & Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <span className="text-xs text-muted block mb-1">Total Workouts</span>
          <span className="text-2xl font-black text-current">
            {user?.totalWorkouts || 18}
          </span>
        </Card>

        <Card className="text-center p-4">
          <span className="text-xs text-muted block mb-1">Longest Streak</span>
          <span className="text-2xl font-black text-primary-500">
            {user?.longestStreak || user?.currentStreak || 7} Days
          </span>
        </Card>

        <Card className="text-center p-4">
          <span className="text-xs text-muted block mb-1">Current Weight</span>
          <span className="text-2xl font-black text-current">
            {user?.weight ? `${user.weight} kg` : '--'}
          </span>
        </Card>

        <Card className="text-center p-4">
          <span className="text-xs text-muted block mb-1">Height</span>
          <span className="text-2xl font-black text-current">
            {user?.height ? `${user.height} cm` : '--'}
          </span>
        </Card>
      </div>

      {/* Profile Edit Form */}
      <Card>
        <h2 className="font-bold text-base lg:text-lg mb-4">Edit Profile & Biometrics</h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={form.email}
                className="w-full px-4 py-2.5 rounded-xl bg-surface/50 border border-border text-muted text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
                placeholder="26"
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                value={form.height}
                onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
                placeholder="178"
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                placeholder="78.5"
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Fitness Experience Level
              </label>
              <select
                value={form.fitnessLevel}
                onChange={(e) => setForm((prev) => ({ ...prev, fitnessLevel: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="beginner">Beginner (Starting fresh)</option>
                <option value="intermediate">Intermediate (1-3 years consistency)</option>
                <option value="advanced">Advanced (3+ years serious lifting)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Primary Fitness Objective
              </label>
              <select
                value={form.primaryGoal}
                onChange={(e) => setForm((prev) => ({ ...prev, primaryGoal: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="muscle_hypertrophy">Muscle Hypertrophy & Size</option>
                <option value="strength">Maximum Raw Strength</option>
                <option value="fat_loss">Body Fat Loss & Definition</option>
                <option value="athletic_performance">Athletic Performance & Speed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => navigate('/app/settings')}
              className="text-xs text-primary-500 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" /> Change Password in Settings
            </button>

            <Button variant="primary" type="submit" loading={isSaving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}

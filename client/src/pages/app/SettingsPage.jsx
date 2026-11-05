import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Download,
  Lock,
  Trash2,
  Check,
  Target,
  Ruler,
  AlertTriangle,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  // Units
  const [unitSystem, setUnitSystem] = useState(user?.unitPreference || 'metric') // 'metric' or 'imperial'

  // Daily Targets Form
  const [targets, setTargets] = useState({
    dailyCalorieTarget: user?.dailyCalorieTarget || 2200,
    protein: user?.macroTargets?.protein || 160,
    carbs: user?.macroTargets?.carbs || 220,
    fat: user?.macroTargets?.fat || 65,
    waterTarget: user?.waterTarget ? Math.round(user.waterTarget / 250) : 10,
  })
  const [isSavingTargets, setIsSavingTargets] = useState(false)

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    Notification?.permission === 'granted'
  )
  const [reminderTime, setReminderTime] = useState('18:00')

  // Password Change
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Data Export
  const [isExporting, setIsExporting] = useState(false)

  // Account Deletion
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // Handle Saving Targets & Units
  const handleSaveProfileTargets = async (e) => {
    e.preventDefault()
    setIsSavingTargets(true)
    try {
      const payload = {
        unitPreference: unitSystem,
        dailyCalorieTarget: Number(targets.dailyCalorieTarget),
        macroTargets: {
          protein: Number(targets.protein),
          carbs: Number(targets.carbs),
          fat: Number(targets.fat),
        },
        waterTarget: Number(targets.waterTarget) * 250,
      }

      await api.put('/users/profile', payload)
      updateUser(payload)
      toast.success('Targets and unit preferences updated!')
    } catch {
      toast.error('Failed to update targets')
    } finally {
      setIsSavingTargets(false)
    }
  }

  // Handle Notifications Permission
  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser does not support notifications')
      return
    }

    if (!notificationsEnabled) {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        setNotificationsEnabled(true)
        toast.success(`Workout reminders set for ${reminderTime}`)
      } else {
        toast.error('Notifications permission denied')
      }
    } else {
      setNotificationsEnabled(false)
      toast.success('Reminders disabled')
    }
  }

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsChangingPassword(true)
    try {
      await api.post('/users/change-password', {
        currentPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password updated successfully')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Data Export (JSON / CSV)
  const handleExportData = async (formatType = 'json') => {
    setIsExporting(true)
    try {
      const res = await api.get('/users/export')
      const exportObj = res.data?.data || res.data

      let blob
      let filename = `pulsefit-export-${format(new Date(), 'yyyy-MM-dd')}`

      if (formatType === 'json') {
        blob = new Blob([JSON.stringify(exportObj, null, 2)], {
          type: 'application/json',
        })
        filename += '.json'
      } else {
        // Convert profile and basic workouts to CSV
        const rows = [
          ['Type', 'Name / Title', 'Value / Date', 'Notes'],
          ['Profile', exportObj.profile?.name || '', exportObj.profile?.email || '', ''],
          ...(exportObj.workouts || []).map((w) => [
            'Workout',
            w.title || 'Session',
            w.startTime || '',
            `Duration: ${w.duration || 45}m, Volume: ${w.totalVolume || 0}kg`,
          ]),
        ]
        const csvContent = rows.map((e) => e.join(',')).join('\n')
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        filename += '.csv'
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Data exported as ${formatType.toUpperCase()}`)
    } catch {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  // Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      toast.error('Type "DELETE" exactly to confirm')
      return
    }

    setIsDeletingAccount(true)
    try {
      await api.delete('/users/account')
      toast.success('Account permanently deleted')
      logout()
    } catch {
      toast.error('Failed to delete account')
    } finally {
      setIsDeletingAccount(false)
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
          <Settings className="w-8 h-8 text-primary-500" /> Account Settings
        </h1>
        <p className="text-muted text-sm mt-1">
          Manage system preferences, calorie targets, appearance, security, and personal data.
        </p>
      </div>

      {/* Units & Display Section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-base lg:text-lg">Units & Standards</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-border/50">
            <div>
              <h3 className="font-bold text-sm text-current">Unit System</h3>
              <p className="text-xs text-muted mt-0.5">
                Metric uses kg & cm; Imperial uses lbs & inches
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-card border border-border">
              <button
                type="button"
                onClick={() => setUnitSystem('metric')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  unitSystem === 'metric'
                    ? 'bg-primary-500 text-white'
                    : 'text-muted hover:text-current'
                }`}
              >
                Metric (kg / cm)
              </button>
              <button
                type="button"
                onClick={() => setUnitSystem('imperial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  unitSystem === 'imperial'
                    ? 'bg-primary-500 text-white'
                    : 'text-muted hover:text-current'
                }`}
              >
                Imperial (lbs / in)
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Daily Nutrition & Hydration Targets Form */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-base lg:text-lg">Daily Nutritional Targets</h2>
        </div>

        <form onSubmit={handleSaveProfileTargets} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Daily Calories (kcal)
              </label>
              <input
                type="number"
                value={targets.dailyCalorieTarget}
                onChange={(e) =>
                  setTargets((prev) => ({ ...prev, dailyCalorieTarget: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Protein Target (g)
              </label>
              <input
                type="number"
                value={targets.protein}
                onChange={(e) =>
                  setTargets((prev) => ({ ...prev, protein: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Carbohydrates Target (g)
              </label>
              <input
                type="number"
                value={targets.carbs}
                onChange={(e) =>
                  setTargets((prev) => ({ ...prev, carbs: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Dietary Fat Target (g)
              </label>
              <input
                type="number"
                value={targets.fat}
                onChange={(e) =>
                  setTargets((prev) => ({ ...prev, fat: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                Water Target (glasses)
              </label>
              <input
                type="number"
                value={targets.waterTarget}
                onChange={(e) =>
                  setTargets((prev) => ({ ...prev, waterTarget: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit" loading={isSavingTargets}>
              Save Target Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* Theme & Appearance */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-current">Application Theme</h3>
              <p className="text-xs text-muted mt-0.5">Toggle between Dark Gym Aesthetic or Crisp Light Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-surface border border-border">
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === 'dark' ? 'bg-primary-500 text-white' : 'text-muted hover:text-current'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === 'light' ? 'bg-primary-500 text-white' : 'text-muted hover:text-current'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
          </div>
        </div>
      </Card>

      {/* Notifications & Reminders */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-current">Workout & Hydration Reminders</h3>
              <p className="text-xs text-muted mt-0.5">
                Send browser push notifications for daily training consistency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-surface border border-border text-xs text-current focus:ring-1 focus:ring-primary-500"
            />
            <Button
              variant={notificationsEnabled ? 'outline' : 'primary'}
              size="sm"
              onClick={handleToggleNotifications}
            >
              {notificationsEnabled ? 'Disable' : 'Enable Notifications'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Export */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-current">Export Your Fitness Data</h3>
              <p className="text-xs text-muted mt-0.5">
                Download all your logged workouts, food diaries, body weights, and PR records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileCode className="w-4 h-4 text-primary-500" />}
              loading={isExporting}
              onClick={() => handleExportData('json')}
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
              loading={isExporting}
              onClick={() => handleExportData('csv')}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Security & Password Change */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-base lg:text-lg">Security & Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))
              }
              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-current text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" size="sm" type="submit" loading={isChangingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card className="border-red-500/40">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="font-bold text-base lg:text-lg text-red-500">Danger Zone</h2>
        </div>

        <p className="text-xs text-muted mb-4 max-w-xl leading-relaxed">
          Deleting your account will immediately remove all your logged workouts, personalized PR records, custom routines, body metrics, and progress photos. This action is irreversible.
        </p>

        <div className="space-y-3 max-w-md">
          <label className="block text-xs font-bold text-muted">
            Type <strong className="text-red-500">DELETE</strong> to confirm permanent deletion:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="DELETE"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-surface border border-red-500/50 text-red-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
            />
            <Button
              variant="danger"
              disabled={deleteConfirmationText !== 'DELETE'}
              loading={isDeletingAccount}
              onClick={handleDeleteAccount}
            >
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

import React, { useState, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Lock, Zap, ArrowRight, ArrowLeft, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[0-9]/, 'Must include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must include at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  })

  const watchedPassword = watch('password', '')

  // Password strength evaluation
  const strengthChecks = useMemo(() => {
    return [
      { id: 'length', label: '8+ chars', pass: watchedPassword.length >= 8 },
      { id: 'upper', label: 'Uppercase', pass: /[A-Z]/.test(watchedPassword) },
      { id: 'number', label: 'Number', pass: /[0-9]/.test(watchedPassword) },
      { id: 'special', label: 'Special char', pass: /[^A-Za-z0-9]/.test(watchedPassword) },
    ]
  }, [watchedPassword])

  const passedCount = strengthChecks.filter((c) => c.pass).length

  const strengthInfo = useMemo(() => {
    if (!watchedPassword) return { label: '', color: 'bg-dark-600', text: '' }
    if (passedCount <= 1) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500' }
    if (passedCount === 2) return { label: 'Fair', color: 'bg-orange-500', text: 'text-orange-500' }
    if (passedCount === 3) return { label: 'Good', color: 'bg-yellow-400', text: 'text-yellow-400' }
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' }
  }, [passedCount, watchedPassword])

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Missing reset token. Please request a new password reset link.')
      return
    }

    setIsLoading(true)
    setServerError('')
    try {
      await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
      })
      toast.success('Password successfully reset! Please sign in with your new password.')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed. The link may have expired or is invalid.'
      setServerError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: '#FF5A1F' }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: '#F0261B' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Brand header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-display font-black text-2xl gradient-text">PulseFit</span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black font-display mb-2">Reset Password</h1>
          <p className="text-sm text-muted">Create a strong, unique password for your account</p>
        </div>

        {!token ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted">
              The reset link is invalid or incomplete. Please request a new password reset link.
            </p>
            <Link to="/forgot-password" className="btn-primary btn-md inline-flex items-center gap-2">
              Request New Link
            </Link>
          </div>
        ) : (
          <>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{serverError}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-current transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {watchedPassword.length > 0 && (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Password strength:</span>
                      <span className={`font-bold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full rounded-full transition-all duration-300 ${
                            passedCount >= step ? strengthInfo.color : 'bg-zinc-700/40'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {strengthChecks.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                            item.pass ? 'text-emerald-500' : 'text-muted'
                          }`}
                        >
                          {item.pass ? (
                            <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 ml-0.5 mr-1" />
                          )}
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-current transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="btn-primary btn-lg w-full mt-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Reset Password <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          </>
        )}

        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-current transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

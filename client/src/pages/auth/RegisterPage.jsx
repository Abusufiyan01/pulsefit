import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Zap, ArrowRight, Eye, EyeOff, Check, X, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[0-9]/, 'Must include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must include at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Service' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerAuth } = useAuthStore()
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
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
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
    setIsLoading(true)
    setServerError('')
    try {
      await registerAuth({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      })
      toast.success('Account created! Let’s personalize your plan 🚀')
      navigate('/onboarding')
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.'
      setServerError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      {/* Left side - branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-5/12 bg-gradient-primary relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-white text-center px-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Zap className="w-9 h-9 text-white" fill="white" />
          </div>
          <h1 className="text-4xl font-black font-display mb-4">PulseFit</h1>
          <p className="text-white/80 text-lg">
            Start your fitness transformation today. Personalized workouts, macro tracking, and real progress.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            {[
              'Custom AI Workouts',
              'Macro & Food Database',
              'Smart PR Detection',
              '100% Free Forever',
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm"
              >
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 p-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center gap-3 text-left">
            <ShieldCheck className="w-8 h-8 text-white flex-shrink-0" />
            <div className="text-xs text-white/90">
              <span className="font-bold block">Privacy Guaranteed</span>
              Your health data is encrypted and securely stored. We never sell your personal information.
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">PulseFit</span>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-black font-display mb-2">Create account</h2>
            <p className="text-muted">Join PulseFit to start tracking your fitness goals</p>
          </div>

          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Alex Mercer"
                  className={`input pl-10 ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="alex@example.com"
                  className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
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

                  {/* 4-bar meter */}
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

                  {/* Criteria checklist */}
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
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
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

            {/* Terms of Service Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('agreeTerms')}
                  className="w-4 h-4 mt-0.5 rounded accent-primary-500 flex-shrink-0 cursor-pointer"
                />
                <span className="text-xs text-muted leading-relaxed">
                  I agree to the{' '}
                  <span className="text-primary-500 font-semibold underline underline-offset-2">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="text-primary-500 font-semibold underline underline-offset-2">
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-red-500 text-xs mt-1">{errors.agreeTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
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
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-500 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

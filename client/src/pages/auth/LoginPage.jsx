import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Welcome back! 💪')
      navigate('/app/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemo = () => {
    setValue('email', 'demo@pulsefit.com')
    setValue('password', 'Demo1234!')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      {/* Left side - branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-5/12 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
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
          <p className="text-white/80 text-lg">Your AI-powered fitness companion. Track workouts, nutrition, and reach your goals.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            {['AI Workout Plans', 'Nutrition Tracking', 'Body Progress', 'Achievement Badges'].map((f) => (
              <div key={f} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">PulseFit</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black font-display mb-2">Welcome back</h2>
            <p className="text-muted">Sign in to continue your fitness journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-current transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('rememberMe')} className="w-4 h-4 rounded accent-primary-500" />
                <span className="text-sm text-muted">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-primary-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary btn-lg w-full mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div className="relative flex justify-center text-xs text-muted">
              <span className="px-2" style={{ background: 'var(--color-bg)' }}>or try demo</span>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={fillDemo}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary btn-lg w-full"
          >
            🎯 Fill Demo Credentials
          </motion.button>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-500 hover:underline">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

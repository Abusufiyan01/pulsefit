import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Zap, Terminal, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [devResetUrl, setDevResetUrl] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/forgot-password', {
        email: data.email.trim().toLowerCase(),
      })
      setSubmittedEmail(data.email)
      const devUrl = response.data?.data?.resetUrl
      if (devUrl) {
        setDevResetUrl(devUrl)
      }
      setIsSuccess(true)
      toast.success('Reset link dispatched! Check your inbox.')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request password reset. Please try again.'
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

        {!isSuccess ? (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black font-display mb-2">Forgot Password?</h1>
              <p className="text-sm text-muted leading-relaxed">
                Enter the email associated with your account and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    autoFocus
                    className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
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
                  <>
                    Send Reset Link <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-current transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-display mb-3">Check your email!</h2>
            <p className="text-sm text-muted leading-relaxed mb-6">
              We've sent a password reset link to{' '}
              <span className="font-semibold text-current">{submittedEmail}</span>. Please click the link in
              the email to choose a new password.
            </p>

            {/* Dev mode notice */}
            <div
              className="p-4 rounded-2xl text-left mb-6 text-xs leading-relaxed"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-2 font-bold text-amber-500 mb-1.5">
                <Terminal className="w-4 h-4" />
                <span>Development Note</span>
              </div>
              <p className="text-muted">
                Since local email transport is simulated, check your server terminal or console to view the
                generated reset link.
              </p>

              {devResetUrl && (
                <div className="mt-3 pt-3 border-t border-border">
                  <a
                    href={devResetUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:underline"
                  >
                    Quick Dev Link: Open Reset Page <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="btn-secondary btn-md w-full"
              >
                Didn't receive the email? Try again
              </button>

              <Link to="/login" className="btn-ghost btn-md w-full inline-flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

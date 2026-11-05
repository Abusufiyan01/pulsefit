import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell, Home, LayoutDashboard, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[300px] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF5A1F] to-[#F0261B] text-white flex items-center justify-center mx-auto shadow-glow">
          <Dumbbell className="w-8 h-8" />
        </div>

        <div>
          <h1 className="font-display text-7xl font-black gradient-text tracking-tight">
            404
          </h1>
          <h2 className="text-xl font-bold text-current mt-2">Page Not Found</h2>
          <p className="text-xs sm:text-sm text-muted mt-2">
            The page you were looking for doesn't exist, was moved, or requires higher clearance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>

          <Link to="/app/dashboard">
            <Button leftIcon={<LayoutDashboard className="w-4 h-4" />}>
              Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFoundPage

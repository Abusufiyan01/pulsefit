import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    let timer = null
    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      timer = setTimeout(() => setShowReconnected(false), 3000)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (timer) clearTimeout(timer)
    }
  }, [])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, #FF5A1F, #F0261B)' }}
        >
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>You're offline. Some features may not work.</span>
        </motion.div>
      )}
      {showReconnected && isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-white shadow-md"
          style={{ background: '#10B981' }}
        >
          <Wifi className="w-4 h-4 flex-shrink-0" />
          <span>Back online!</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { OfflineBanner }

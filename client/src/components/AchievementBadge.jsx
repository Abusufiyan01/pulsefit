import React from 'react'
import { motion } from 'framer-motion'
import { Lock, Award } from 'lucide-react'
import { formatDate } from '../utils/dates'

export function AchievementBadge({
  name,
  description,
  icon,
  isUnlocked = false,
  unlockedAt,
  isNew = false,
  onClick,
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      initial={isNew ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      onClick={onClick}
      className={`relative p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
        isUnlocked
          ? 'bg-bg-card border-primary-500/30 shadow-card hover:shadow-glow'
          : 'bg-surface/50 border-border opacity-60 grayscale'
      }`}
    >
      {/* Icon Bubble */}
      <div
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-sm ${
          isUnlocked
            ? 'bg-gradient-to-tr from-[#FF5A1F] to-[#F0261B] text-white shadow-glow'
            : 'bg-surface text-muted border border-border'
        }`}
      >
        {icon ? (
          <span>{icon}</span>
        ) : (
          <Award className={`w-7 h-7 ${isUnlocked ? 'text-white' : 'text-muted'}`} />
        )}

        {!isUnlocked && (
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-bg-card border border-border text-muted">
            <Lock className="w-3 h-3" />
          </div>
        )}
      </div>

      <h4 className="text-sm font-bold text-current line-clamp-1">{name}</h4>
      <p className="text-xs text-muted mt-1 line-clamp-2">{description}</p>

      {isUnlocked && unlockedAt && (
        <span className="mt-3 text-[10px] font-semibold text-primary-500">
          Earned {formatDate(unlockedAt, 'MMM d, yyyy')}
        </span>
      )}
    </motion.div>
  )
}

export default AchievementBadge

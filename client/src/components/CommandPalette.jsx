import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, LayoutDashboard, Dumbbell, Apple, TrendingUp, Target, BarChart2, Settings, User, Plus, X } from 'lucide-react'

const COMMANDS = [
  {
    section: 'Navigate',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/app/dashboard' },
      { label: 'Workout', icon: Dumbbell, to: '/app/workout' },
      { label: 'Nutrition', icon: Apple, to: '/app/nutrition' },
      { label: 'Body & Metrics', icon: TrendingUp, to: '/app/body' },
      { label: 'Goals', icon: Target, to: '/app/goals' },
      { label: 'Progress Analytics', icon: BarChart2, to: '/app/progress' },
      { label: 'Settings', icon: Settings, to: '/app/settings' },
      { label: 'Profile', icon: User, to: '/app/profile' },
    ],
  },
  {
    section: 'Quick Actions',
    items: [
      { label: 'Log Workout', icon: Plus, to: '/app/workout/log' },
      { label: 'Browse Exercises', icon: Dumbbell, to: '/app/workout/exercises' },
      { label: 'View Routines', icon: BarChart2, to: '/app/workout/routines' },
      { label: 'Personal Records', icon: Target, to: '/app/workout/personal-records' },
    ],
  },
]

export default function CommandPalette({ open = false, onClose }) {
  if (!open) return null

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const allItems = COMMANDS.flatMap((s) => s.items)
  const filtered = query
    ? allItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : allItems

  const filteredSections = query
    ? [{ section: 'Results', items: filtered }]
    : COMMANDS

  useEffect(() => {
    setSelected(0)
  }, [query])

  const handleSelect = (item) => {
    if (!item) return
    navigate(item.to)
    onClose()
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, Math.max(0, filtered.length - 1)))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      }
      if (e.key === 'Enter' && filtered[selected]) {
        e.preventDefault()
        handleSelect(filtered[selected])
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [filtered, selected])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" role="dialog" aria-modal="true">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="relative w-full max-w-lg rounded-2xl shadow-float overflow-hidden"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Search className="w-5 h-5 text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages or actions..."
            className="flex-1 py-4 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--color-text)' }}
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 cursor-pointer text-muted hover:text-current transition-colors"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filteredSections.map((section) => (
            <div key={section.section}>
              <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider">
                {section.section}
              </div>
              {section.items.map((item) => {
                const isSelected = filtered[selected] === item
                return (
                  <button
                    key={`${section.section}-${item.to}-${item.label}`}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-all cursor-pointer text-left ${
                      isSelected ? 'bg-primary-500/15 text-primary-500 font-semibold' : 'text-current hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-muted text-sm">No results found</div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t text-xs text-muted" style={{ borderColor: 'var(--color-border)' }}>
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </motion.div>
    </div>
  )
}

export { CommandPalette }

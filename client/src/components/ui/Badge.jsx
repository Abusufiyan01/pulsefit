import React from 'react'

const COLORS = {
  primary: { bg: 'rgba(255,90,31,0.15)', text: '#FF5A1F' },
  success: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  warning: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  danger: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  info: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  default: { bg: 'var(--color-surface)', text: 'var(--color-text-muted)' },
  purple: { bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6' },
}

export default function Badge({ children, color = 'default', dot = false, size = 'sm', className = '' }) {
  const c = COLORS[color] || COLORS.default
  const sizes = { xs: 'text-xs px-1.5 py-0.5', sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1' }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizes[size] || sizes.sm} ${className}`}
      style={{ background: c.bg, color: c.text }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.text }} />}
      {children}
    </span>
  )
}

export { Badge }

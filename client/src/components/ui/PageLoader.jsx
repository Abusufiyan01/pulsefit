import React from 'react'

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: 'var(--color-surface)' }} />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
        </div>
        <span className="text-sm font-medium font-display text-muted">Loading...</span>
      </div>
    </div>
  )
}

export { PageLoader }

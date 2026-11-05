import React from 'react'

function SkeletonItem({ className = '' }) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{
        background: 'linear-gradient(90deg, var(--color-surface) 25%, var(--color-border) 50%, var(--color-surface) 75%)',
        backgroundSize: '200% 100%',
      }}
    />
  )
}

export default function Skeleton({ variant = 'text', lines = 1, className = '' }) {
  if (variant === 'card') {
    return (
      <div className={`rounded-2xl p-5 ${className}`} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <div className="space-y-3">
          <SkeletonItem className="h-5 w-24" />
          <SkeletonItem className="h-8 w-32" />
          <SkeletonItem className="h-4 w-full" />
          <SkeletonItem className="h-4 w-3/4" />
        </div>
      </div>
    )
  }
  if (variant === 'avatar') {
    return <SkeletonItem className={`rounded-full w-10 h-10 ${className}`} />
  }
  if (variant === 'chart') {
    return <SkeletonItem className={`rounded-2xl h-48 ${className}`} />
  }
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonItem key={i} className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  )
}

export { Skeleton }

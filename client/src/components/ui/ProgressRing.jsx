import React from 'react'

export default function ProgressRing({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color = '#FF5A1F',
  trackColor,
  label,
  sublabel,
  children,
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const safeMax = max > 0 ? max : 100
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100))
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor || 'rgba(255,255,255,0.1)'}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-1">
        {children || (
          <>
            {label && <span className="font-bold text-xs leading-none truncate max-w-full">{label}</span>}
            {sublabel && <span className="text-muted truncate max-w-full" style={{ fontSize: 9 }}>{sublabel}</span>}
          </>
        )}
      </div>
    </div>
  )
}

export { ProgressRing }

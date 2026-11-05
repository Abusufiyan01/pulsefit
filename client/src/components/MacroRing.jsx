import React from 'react'
import ProgressRing from './ui/ProgressRing'

export function MacroRing({
  label = 'Protein',
  current = 0,
  target = 150,
  unit = 'g',
  color = '#FF5A1F',
  size = 80,
  strokeWidth = 7,
  gradientStops,
}) {
  const percentage = target > 0 ? Math.round((current / target) * 100) : 0

  return (
    <div className="flex flex-col items-center text-center p-2">
      <ProgressRing
        progress={percentage}
        size={size}
        strokeWidth={strokeWidth}
        color={color}
        gradientStops={gradientStops}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm font-bold text-current">{Math.round(current)}</span>
          <span className="text-[10px] text-muted font-medium">{unit}</span>
        </div>
      </ProgressRing>

      <span className="text-xs font-bold text-current mt-2">{label}</span>
      <span className="text-[11px] text-muted">
        of {target}
        {unit}
      </span>
    </div>
  )
}

export default MacroRing

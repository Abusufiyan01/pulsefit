import React from 'react'
import { Calendar } from 'lucide-react'

export function DatePicker({
  label,
  value,
  onChange,
  min,
  max,
  className = '',
  disabled = false,
  id,
}) {
  const pickerId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={pickerId} className="block text-xs font-semibold text-current/80">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-muted pointer-events-none flex items-center">
          <Calendar className="w-4 h-4" />
        </span>

        <input
          id={pickerId}
          type="date"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-current transition-all disabled:opacity-50 cursor-pointer"
        />
      </div>
    </div>
  )
}

export default DatePicker

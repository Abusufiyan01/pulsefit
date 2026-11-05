import React from 'react'

const DEFAULT_RANGES = [
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: 'all', label: 'All' },
]

export default function RangeSelector({ value, onChange, ranges = DEFAULT_RANGES, className = '' }) {
  const items = ranges || DEFAULT_RANGES

  return (
    <div className={`flex gap-1 ${className}`}>
      {items.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onChange(r.value)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            value === r.value
              ? 'bg-primary-500/15 text-primary-500'
              : 'text-muted hover:text-current hover:bg-white/5'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}

export { RangeSelector }

import React, { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

export const Select = forwardRef(function Select(
  { label, error, helperText, options = [], className = '', id, children, ...props },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-current/80">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          className={`w-full appearance-none rounded-xl px-4 py-2.5 pr-10 text-sm font-medium transition-all duration-200 bg-surface border ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
          } outline-none text-current disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
          {...props}
        >
          {children ||
            options.map((opt) => {
              const val = typeof opt === 'object' ? opt.value : opt
              const lbl = typeof opt === 'object' ? opt.label : opt
              return (
                <option key={val} value={val} className="bg-bg-card text-current">
                  {lbl}
                </option>
              )
            })}
        </select>
        <span className="absolute right-3.5 text-muted pointer-events-none flex items-center">
          <ChevronDown className="w-4 h-4" />
        </span>
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-500">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted">{helperText}</p>
      ) : null}
    </div>
  )
})

export default Select

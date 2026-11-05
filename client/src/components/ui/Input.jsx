import React, { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  type = 'text',
  hint,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  const renderIcon = (icon) => {
    if (!icon) return null
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        className: `${icon.props.className || ''} w-4 h-4`.trim(),
      })
    }
    return icon
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center justify-center">
            {renderIcon(leftIcon)}
          </div>
        )}
        <input
          type={inputType}
          className={`input ${leftIcon ? 'pl-10' : ''} ${(rightIcon || isPassword) ? 'pr-10' : ''} ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-current transition-colors cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {rightIcon && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center justify-center">
            {renderIcon(rightIcon)}
          </div>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  )
}

export { Input }

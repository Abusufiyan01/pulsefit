import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const isBusy = loading || isLoading
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-gradient-primary text-white shadow-md hover:shadow-glow active:scale-95',
    secondary: 'border text-current hover:opacity-80 active:scale-95',
    ghost: 'bg-transparent hover:bg-white/10 active:scale-95',
    danger: 'bg-red-500/15 text-red-500 hover:bg-red-500/25 active:scale-95',
    outline: 'border border-primary-500 text-primary-500 hover:bg-primary-500/10 active:scale-95',
  }

  const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }

  const secondaryStyles = variant === 'secondary' ? {
    background: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
  } : {}

  const renderIcon = (icon) => {
    if (!icon) return null
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        className: `${icon.props.className || ''} w-4 h-4 flex-shrink-0`.trim(),
      })
    }
    return icon
  }

  return (
    <motion.button
      type={type}
      disabled={disabled || isBusy}
      onClick={onClick}
      whileTap={{ scale: disabled || isBusy ? 1 : 0.97 }}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={secondaryStyles}
      {...props}
    >
      {isBusy ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : (
        renderIcon(leftIcon)
      )}
      {children}
      {!isBusy && renderIcon(rightIcon)}
    </motion.button>
  )
}

export { Button }

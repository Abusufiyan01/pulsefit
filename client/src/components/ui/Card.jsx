import React from 'react'
import { motion } from 'framer-motion'

export default function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'default',
  className = '',
  onClick,
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-5 lg:p-6',
    lg: 'p-6 lg:p-8',
  }

  const baseStyle = {
    background: 'var(--color-bg-card)',
    border: variant === 'gradient' ? 'none' : '1px solid var(--color-border)',
  }

  if (variant === 'gradient') {
    return (
      <div className={`relative rounded-2xl ${className}`} style={{ padding: '1px', background: 'linear-gradient(135deg, #FF5A1F, #F0261B)' }}>
        <motion.div
          whileHover={hover ? { scale: 1.01 } : {}}
          onClick={onClick}
          className={`rounded-2xl h-full ${paddings[padding] || paddings.default} ${onClick ? 'cursor-pointer' : ''}`}
          style={{ background: 'var(--color-bg-card)' }}
          {...props}
        >
          {children}
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' } : {}}
      onClick={onClick}
      className={`rounded-2xl ${paddings[padding] || paddings.default} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={baseStyle}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { Card }

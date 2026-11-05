import React from 'react'
import { motion } from 'framer-motion'
import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, action, actionLabel, children }) {
  const renderIcon = () => {
    if (!Icon) return null
    if (React.isValidElement(Icon)) {
      return React.cloneElement(Icon, { className: 'w-8 h-8 text-primary-500' })
    }
    return <Icon className="w-8 h-8 text-primary-500" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
          {renderIcon()}
        </div>
      )}
      {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
      {description && <p className="text-muted text-sm mb-6 max-w-xs">{description}</p>}
      {children}
      {action && actionLabel && (
        <Button onClick={action} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}

export { EmptyState }

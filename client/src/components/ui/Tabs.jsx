import React from 'react'
import { motion } from 'framer-motion'

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  const renderTabIcon = (icon) => {
    if (!icon) return null
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        className: `${icon.props.className || ''} w-4 h-4 flex-shrink-0`.trim(),
      })
    }
    const IconComponent = icon
    return <IconComponent className="w-4 h-4 flex-shrink-0" />
  }

  return (
    <div className={`flex gap-1 p-1 rounded-xl ${className}`} style={{ background: 'var(--color-surface)' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`relative flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              isActive ? 'text-current' : 'text-muted hover:text-current'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'var(--color-bg-card)' }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {renderTabIcon(tab.icon)}
              <span>{tab.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export { Tabs }

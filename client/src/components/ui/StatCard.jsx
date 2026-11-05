import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Card from './Card'

export default function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  trendValue,
  color = '#FF5A1F',
  className = '',
}) {
  const renderIcon = () => {
    if (!Icon) return null
    if (React.isValidElement(Icon)) {
      return React.cloneElement(Icon, { className: 'w-5 h-5', style: { color } })
    }
    return <Icon className="w-5 h-5" style={{ color }} />
  }

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20` }}
        >
          {renderIcon()}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : 'text-muted'
          }`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            <span>{trendValue !== undefined ? trendValue : `${Math.abs(trend)}%`}</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold font-display">
          {value}
          {unit && <span className="text-sm font-normal text-muted ml-1">{unit}</span>}
        </div>
        <p className="text-xs text-muted mt-0.5">{label}</p>
      </div>
    </Card>
  )
}

export { StatCard }

import React, { useMemo, useState } from 'react'
import { subDays, format, startOfWeek, addDays } from 'date-fns'

export function ActivityHeatmap({ workoutLogs = [], weeksCount = 52, className = '' }) {
  const [tooltip, setTooltip] = useState(null)

  // Map workout dates to a lookup map { "yyyy-MM-dd": count }
  const activityMap = useMemo(() => {
    const map = {}
    workoutLogs.forEach((w) => {
      const rawDate = w.date || w.createdAt
      if (rawDate) {
        const dStr = format(new Date(rawDate), 'yyyy-MM-dd')
        map[dStr] = (map[dStr] || 0) + 1
      }
    })
    return map
  }, [workoutLogs])

  // Build 52 weeks grid (7 rows: Sun - Sat, columns: weeks)
  const weeks = useMemo(() => {
    const today = new Date()
    const end = today
    // Total days = weeksCount * 7
    const totalDays = weeksCount * 7
    const startDate = startOfWeek(subDays(end, totalDays - 1))

    const cols = []
    let curr = startDate

    for (let w = 0; w < weeksCount; w++) {
      const days = []
      for (let d = 0; d < 7; d++) {
        const dateStr = format(curr, 'yyyy-MM-dd')
        const count = activityMap[dateStr] || 0
        days.push({
          date: curr,
          dateStr,
          count,
        })
        curr = addDays(curr, 1)
      }
      cols.push(days)
    }

    return cols
  }, [weeksCount, activityMap])

  const getCellColor = (count) => {
    if (count === 0) return 'bg-surface hover:border-muted/50 border border-border/50'
    if (count === 1) return 'bg-[#FF5A1F]/40 border border-[#FF5A1F]/30 hover:brightness-110'
    if (count === 2) return 'bg-[#FF5A1F]/70 border border-[#FF5A1F]/60 hover:brightness-110'
    return 'bg-[#FF5A1F] border border-[#F0261B] hover:brightness-110 shadow-sm'
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={`relative overflow-x-auto p-4 bg-bg-card rounded-2xl border border-border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-current">Workout Consistency</h4>
          <p className="text-xs text-muted">Activity over the past year</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-surface border border-border" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#FF5A1F]/40" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#FF5A1F]/70" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#FF5A1F]" />
          <span>More</span>
        </div>
      </div>

      <div className="inline-flex gap-1">
        {/* Row labels */}
        <div className="flex flex-col gap-1 pr-2 text-[10px] text-muted justify-between select-none py-0.5">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>

        {/* 52 columns */}
        <div className="flex gap-1">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip({
                      text: `${day.count} workout${day.count === 1 ? '' : 's'} on ${format(
                        day.date,
                        'MMM d, yyyy'
                      )}`,
                      x: rect.left + rect.width / 2,
                      y: rect.top - 32,
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className={`w-3 h-3 rounded-[3px] cursor-pointer transition-transform hover:scale-125 ${getCellColor(
                    day.count
                  )}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1 text-[11px] font-semibold text-white bg-dark-900/90 rounded-md shadow-lg pointer-events-none transform -translate-x-1/2 whitespace-nowrap border border-white/10"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}

export default ActivityHeatmap

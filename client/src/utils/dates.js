/**
 * Date Formatting and Utility Functions using date-fns
 */
import {
  format,
  parseISO,
  isToday,
  isYesterday,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  differenceInDays,
  isValid,
} from 'date-fns'

export function toDateObj(date) {
  if (!date) return new Date()
  if (typeof date === 'string') {
    const parsed = parseISO(date)
    return isValid(parsed) ? parsed : new Date(date)
  }
  return date
}

export function formatDate(date, formatStr = 'MMM d, yyyy') {
  try {
    return format(toDateObj(date), formatStr)
  } catch {
    return ''
  }
}

export function formatTime(date) {
  try {
    return format(toDateObj(date), 'h:mm a')
  } catch {
    return ''
  }
}

export function formatRelativeDate(date) {
  try {
    const d = toDateObj(date)
    if (isToday(d)) return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'EEE, MMM d')
  } catch {
    return ''
  }
}

export function toISODateString(date) {
  try {
    return format(toDateObj(date), 'yyyy-MM-dd')
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function getLastNDays(n = 7) {
  const result = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    result.push(subDays(today, i))
  }
  return result
}

export {
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  differenceInDays,
  isToday,
}

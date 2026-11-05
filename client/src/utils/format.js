/**
 * Formatting helpers for numbers, volume, weight, time
 */

export function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val)) return '0'
  return Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatWeight(weightKg, unit = 'metric') {
  if (weightKg === null || weightKg === undefined || isNaN(weightKg)) return '--'
  if (unit === 'imperial') {
    const lbs = Math.round(Number(weightKg) * 2.20462 * 10) / 10
    return `${lbs} lbs`
  }
  return `${Number(weightKg).toFixed(1)} kg`
}

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0m'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hrs > 0) {
    return `${hrs}h ${mins}m`
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}

export function formatTimer(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function formatVolume(volumeKg, unit = 'metric') {
  if (!volumeKg) return '0 kg'
  if (unit === 'imperial') {
    const lbs = Math.round(volumeKg * 2.20462)
    return `${formatNumber(lbs)} lbs`
  }
  return `${formatNumber(volumeKg)} kg`
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

export function truncate(str, max = 30) {
  if (!str) return ''
  return str.length > max ? `${str.slice(0, max)}...` : str
}

function parseSessionDate(value) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatSessionDate(value) {
  if (!value) {
    return 'Date to be announced'
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(parseSessionDate(value))
}

// Splits a session date into the pieces shown in the calendar-style date block.
export function getSessionDateParts(value) {
  if (!value) {
    return { month: 'TBA', day: '–', weekday: '' }
  }

  const date = parseSessionDate(value)

  return {
    month: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date),
    day: String(date.getDate()),
    weekday: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
  }
}

export function formatSessionTime(value) {
  if (!value) {
    return 'Time to be announced'
  }

  const [hour, minute] = value.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12

  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`
}

// "2:00 – 4:00 PM", or "11:00 AM – 1:00 PM" when the two halves of the day differ.
export function formatSessionTimeRange(start, end) {
  if (!start || !end) {
    return formatSessionTime(start)
  }

  const startLabel = formatSessionTime(start)
  const endLabel = formatSessionTime(end)
  const samePeriod = startLabel.slice(-2) === endLabel.slice(-2)

  return `${samePeriod ? startLabel.slice(0, -3) : startLabel} – ${endLabel}`
}

// Minutes from start to end ("14:00", "15:30" -> 90), or null if either is missing.
export function minutesBetween(start, end) {
  if (!start || !end) {
    return null
  }

  const toMinutes = (value) => {
    const [hour, minute] = value.split(':').map(Number)
    return hour * 60 + minute
  }

  return toMinutes(end) - toMinutes(start)
}

// 90 -> "1 hr 30 min"
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return [hours && `${hours} hr`, rest && `${rest} min`].filter(Boolean).join(' ')
}

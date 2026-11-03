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

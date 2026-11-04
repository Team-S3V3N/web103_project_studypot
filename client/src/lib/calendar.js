import { ASSUMED_LENGTH_MINUTES, getSessionStart } from './sessionStatus.js'

function pad(value) {
  return String(value).padStart(2, '0')
}

// Local "floating" time, so the event lands at the same clock time in any calendar app.
function toIcsDate(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`
}

function escapeIcsText(value = '') {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export function buildCalendarFile(session, pageUrl) {
  const start = getSessionStart(session)

  if (!start) {
    return null
  }

  const end = new Date(start.getTime() + ASSUMED_LENGTH_MINUTES * 60 * 1000)
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const description = [session.description, `Hosted by ${session.creator_name}`, pageUrl]
    .filter(Boolean)
    .join('\n\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudyPot//Study sessions//EN',
    'BEGIN:VEVENT',
    `UID:studypot-session-${session.id}@studypot`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(session.title)}`,
    `LOCATION:${escapeIcsText(session.location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadCalendarFile(session) {
  const pageUrl = `${window.location.origin}/sessions/${session.id}`
  const contents = buildCalendarFile(session, pageUrl)

  if (!contents) {
    return false
  }

  const url = URL.createObjectURL(new Blob([contents], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${session.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'study-session'}.ics`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  return true
}

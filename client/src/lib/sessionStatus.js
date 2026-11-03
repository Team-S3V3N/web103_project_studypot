import { useEffect, useState } from 'react'
import { formatSessionTime } from './formatters.js'

// A session "opens" this many minutes before its start time.
export const OPENS_MINUTES_BEFORE = 15
// Sessions have no end time yet, so treat each one as lasting this long.
export const ASSUMED_LENGTH_MINUTES = 120

const MINUTE = 60 * 1000

export function getSessionStart(session) {
  if (!session.session_date || !session.session_time) {
    return null
  }

  const [year, month, day] = session.session_date.slice(0, 10).split('-').map(Number)
  const [hour, minute] = session.session_time.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute)
}

function describeTimeUntil(start, now) {
  const minutes = Math.round((start - now) / MINUTE)

  if (minutes < 60) {
    return `Starts in ${minutes} min`
  }

  if (minutes < 12 * 60) {
    const hours = Math.round(minutes / 60)
    return `Starts in ${hours} hr`
  }

  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((startDay - today) / (24 * 60 * MINUTE))

  if (days <= 0) {
    return 'Later today'
  }

  return days === 1 ? 'Tomorrow' : `In ${days} days`
}

// state: 'scheduled' (not open yet), 'open' (15 min before start until it ends), 'ended', or 'unknown'
export function getSessionStatus(session, now = new Date()) {
  const start = getSessionStart(session)

  if (!start) {
    return { state: 'unknown', label: 'Time to be announced' }
  }

  const opensAt = new Date(start.getTime() - OPENS_MINUTES_BEFORE * MINUTE)
  const endsAt = new Date(start.getTime() + ASSUMED_LENGTH_MINUTES * MINUTE)
  const times = {
    opensAt,
    start,
    endsAt,
    opensAtLabel: timeLabel(opensAt),
    startLabel: timeLabel(start),
    endsAtLabel: timeLabel(endsAt),
  }
  const { opensAtLabel } = times

  if (now >= endsAt) {
    return { state: 'ended', label: 'Ended', opensAtLabel, times }
  }

  if (now >= opensAt) {
    return { state: 'open', label: now >= start ? 'Happening now' : 'Open now', opensAtLabel, times }
  }

  return { state: 'scheduled', label: describeTimeUntil(start, now), opensAtLabel, times }
}

function timeLabel(date) {
  return formatSessionTime(`${date.getHours()}:${date.getMinutes()}`)
}

export function describeAttendance(count) {
  if (!count) {
    return 'No one yet — be the first'
  }

  return count === 1 ? '1 student attending' : `${count} students attending`
}

// Re-renders every 30 seconds so statuses flip from "Starts in…" to "Open now" on their own.
export function useNow(intervalMs = 30 * 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}

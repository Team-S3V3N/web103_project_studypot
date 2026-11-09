// Dates in the form are plain "YYYY-MM-DD" keys in local time, the same format the API uses.

function pad(value) {
  return String(value).padStart(2, '0')
}

export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseDateKey(key) {
  const [year, month, day] = key.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function todayKey() {
  return toDateKey(new Date())
}

export function addDays(key, days) {
  const date = parseDateKey(key)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

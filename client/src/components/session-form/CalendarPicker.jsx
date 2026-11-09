import { useEffect, useRef, useState } from 'react'
import { addDays, parseDateKey, toDateKey, todayKey } from './dateKeys.js'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const ARROW_STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

const monthFormat = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
const dayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function describeDay(key, today, busy) {
  let label = dayFormat.format(parseDateKey(key))
  if (key === today) {
    label += ' (today)'
  }
  if (busy) {
    label += `, ${busy} ${busy === 1 ? 'session' : 'sessions'} planned`
  }
  return label
}

// An always-open month calendar. Past days can't be picked (except the date a session
// already has), and days that already have sessions get a dot.
function CalendarPicker({ value, onChange, busyDates, labelId }) {
  const today = todayKey()
  const start = parseDateKey(value || today)
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() })
  const [focusKey, setFocusKey] = useState(value || today)
  const gridRef = useRef(null)
  const moveFocusAfterRender = useRef(false)

  useEffect(() => {
    if (moveFocusAfterRender.current) {
      moveFocusAfterRender.current = false
      gridRef.current?.querySelector(`[data-day="${focusKey}"]`)?.focus()
    }
  }, [focusKey, view])

  const firstOfMonth = new Date(view.year, view.month, 1)
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, index) => (
    toDateKey(new Date(view.year, view.month, index + 1))
  ))
  const tabbableKey = days.includes(focusKey) ? focusKey : days[0]
  const viewingThisMonthOrEarlier = toDateKey(firstOfMonth) <= today.slice(0, 8) + '01'

  function isDisabled(key) {
    return key < today && key !== value
  }

  function showMonth(offset) {
    const next = new Date(view.year, view.month + offset, 1)
    setView({ year: next.getFullYear(), month: next.getMonth() })
  }

  function handleKeyDown(event, key) {
    const step = ARROW_STEPS[event.key]
    if (!step) {
      return
    }

    event.preventDefault()
    const nextKey = addDays(key, step)
    const next = parseDateKey(nextKey)
    setView({ year: next.getFullYear(), month: next.getMonth() })
    setFocusKey(nextKey)
    moveFocusAfterRender.current = true
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          className="calendar-nav"
          type="button"
          aria-label="Previous month"
          disabled={viewingThisMonthOrEarlier}
          onClick={() => showMonth(-1)}
        >
          ‹
        </button>
        <p className="calendar-month" aria-live="polite">{monthFormat.format(firstOfMonth)}</p>
        <button className="calendar-nav" type="button" aria-label="Next month" onClick={() => showMonth(1)}>
          ›
        </button>
      </div>

      <div className="calendar-grid" ref={gridRef} role="group" aria-labelledby={labelId}>
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="calendar-weekday" aria-hidden="true">{weekday}</span>
        ))}
        {Array.from({ length: firstOfMonth.getDay() }, (_, index) => (
          <span key={`blank-${index}`} aria-hidden="true" />
        ))}
        {days.map((key) => {
          const disabled = isDisabled(key)
          const busy = disabled ? 0 : busyDates.get(key) ?? 0
          const classes = ['calendar-day']
          if (key === value) classes.push('is-selected')
          if (key === today) classes.push('is-today')

          return (
            <button
              key={key}
              type="button"
              data-day={key}
              className={classes.join(' ')}
              tabIndex={key === tabbableKey ? 0 : -1}
              aria-pressed={key === value}
              aria-disabled={disabled}
              aria-label={describeDay(key, today, busy)}
              onKeyDown={(event) => handleKeyDown(event, key)}
              onFocus={() => setFocusKey(key)}
              onClick={() => {
                if (!disabled) {
                  onChange(key)
                }
              }}
            >
              {Number(key.slice(8))}
              {busy > 0 && !disabled && <span className="calendar-dot" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarPicker

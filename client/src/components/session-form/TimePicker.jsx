import { useCallback, useEffect, useRef, useState } from 'react'
import { formatSessionTime } from '../../lib/formatters.js'
import { useDismiss } from '../useDismiss.js'
import ExactTimeInput from './ExactTimeInput.jsx'

// Every half hour of the day: 00:00, 00:30 … 23:30.
const TIMES = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0')
  return `${hour}:${index % 2 ? '30' : '00'}`
})
// Where the list starts scrolled to when no time is picked yet.
const DEFAULT_SCROLL_TIME = '15:00'

// "Pick a time" opens every half hour to choose from; the box beside it takes an exact time.
function TimePicker({ value, onChange, labelId }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const listRef = useRef(null)
  const close = useCallback(() => setOpen(false), [])

  useDismiss(open, close, containerRef, buttonRef)

  // Scroll the list so the picked time (or mid-afternoon) is in view when it opens.
  useEffect(() => {
    const list = listRef.current
    if (!open || !list) {
      return
    }
    const target = list.querySelector(`[data-time="${value?.slice(0, 5) || DEFAULT_SCROLL_TIME}"]`) ??
      list.querySelector(`[data-time="${DEFAULT_SCROLL_TIME}"]`)
    if (target) {
      list.scrollTop = target.parentElement.offsetTop - list.clientHeight / 2 + target.offsetHeight / 2
    }
  }, [open, value])

  return (
    <div className="time-picker" ref={containerRef}>
      <div className="time-inputs">
        <button
          ref={buttonRef}
          className="time-trigger"
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-labelledby={`${labelId} time-trigger-value`}
          onClick={() => setOpen((isOpen) => !isOpen)}
        >
          <span id="time-trigger-value" className={value ? '' : 'time-placeholder'}>
            {value ? formatSessionTime(value) : 'Pick a time'}
          </span>
          <span className="caret" aria-hidden="true" />
        </button>

        <ExactTimeInput value={value} onChange={onChange} />
      </div>

      {open && (
        <ul className="time-popover" ref={listRef} aria-labelledby={labelId}>
          {TIMES.map((time) => (
            <li key={time}>
              <button
                type="button"
                data-time={time}
                className="time-option"
                aria-pressed={time === value}
                onClick={() => {
                  onChange(time)
                  close()
                  buttonRef.current?.focus()
                }}
              >
                {formatSessionTime(time)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TimePicker

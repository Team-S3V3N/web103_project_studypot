import { useState } from 'react'

function pad(value) {
  return String(value).padStart(2, '0')
}

// "16:15" -> { text: '4:15', period: 'PM' }
function splitTime(value) {
  const [hour, minute] = value.split(':').map(Number)
  return { text: `${hour % 12 || 12}:${pad(minute)}`, period: hour >= 12 ? 'PM' : 'AM' }
}

// Reads what the student typed ("4", "4:15", "415", or 24-hour "16:15") into "HH:MM".
// Returns null if it isn't a time.
function parseTypedTime(text, period) {
  const match = text.trim().match(/^(\d{1,2})(?::?(\d{2}))?$/)
  if (!match) {
    return null
  }

  let hour = Number(match[1])
  const minute = Number(match[2] ?? 0)
  if (hour > 23 || minute > 59) {
    return null
  }

  // 1–12 uses the AM/PM switch; 0 or 13–23 is already 24-hour time.
  if (hour >= 1 && hour <= 12) {
    hour = (hour % 12) + (period === 'PM' ? 12 : 0)
  }

  return `${pad(hour)}:${pad(minute)}`
}

// A plain "4:15" box with an AM | PM switch beside it.
function ExactTimeInput({ value, onChange }) {
  const [text, setText] = useState(value ? splitTime(value).text : '')
  const [period, setPeriod] = useState(value ? splitTime(value).period : 'PM')
  const [syncedValue, setSyncedValue] = useState(value)

  // When the time is picked from the list, show it here too.
  if (value !== syncedValue) {
    setSyncedValue(value)
    if (value && parseTypedTime(text, period) !== value) {
      const parts = splitTime(value)
      setText(parts.text)
      setPeriod(parts.period)
    }
  }

  function handleTextChange(nextText) {
    setText(nextText)
    const parsed = parseTypedTime(nextText, period)
    if (parsed) {
      // Typing 24-hour time like "16:15" flips the switch to match.
      setPeriod(Number(parsed.slice(0, 2)) >= 12 ? 'PM' : 'AM')
      onChange(parsed)
    }
  }

  function handlePeriodChange(nextPeriod) {
    setPeriod(nextPeriod)
    const parsed = parseTypedTime(text, nextPeriod)
    if (parsed) {
      onChange(parsed)
    }
  }

  return (
    <div className="exact-time">
      <input
        type="text"
        inputMode="text"
        placeholder="e.g. 4:15"
        aria-label="Exact time"
        maxLength="5"
        value={text}
        onChange={(event) => handleTextChange(event.target.value)}
        onBlur={() => {
          // Put back the last good time if what was typed isn't a time.
          if (text && !parseTypedTime(text, period) && value) {
            setText(splitTime(value).text)
          }
        }}
      />
      <div className="ampm" role="group" aria-label="AM or PM">
        {['AM', 'PM'].map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === period}
            onClick={() => handlePeriodChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ExactTimeInput

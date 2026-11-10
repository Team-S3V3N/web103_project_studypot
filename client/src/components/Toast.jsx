import { useEffect, useState } from 'react'

const SHOW_FOR_MS = 6000

// A short confirmation that floats at the bottom of the screen, then fades away.
// `onDone` runs once it has finished fading out (or is closed with ×).
function Toast({ message, onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), SHOW_FOR_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`toast${leaving ? ' is-leaving' : ''}`}
      role="status"
      onAnimationEnd={() => {
        if (leaving) {
          onDone()
        }
      }}
    >
      <svg className="toast-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10" />
        <path d="m7.5 12.5 3 3 6-6.5" />
      </svg>
      <span>{message}</span>
      <button className="toast-close" type="button" aria-label="Dismiss" onClick={() => setLeaving(true)}>
        ×
      </button>
    </div>
  )
}

export default Toast

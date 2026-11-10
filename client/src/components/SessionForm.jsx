import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../api.js'
import { formatDuration, minutesBetween } from '../lib/formatters.js'
import { useStudent } from '../student/StudentContext.jsx'
import CalendarPicker from './session-form/CalendarPicker.jsx'
import TimePicker from './session-form/TimePicker.jsx'
import './session-form/sessionForm.css'

const MAX_SUBJECT_CHIPS = 8
// Quick picks that set the end time from the start time.
const LENGTH_CHOICES = [60, 90, 120, 180]

// "14:00" + 90 -> "15:30". Returns null past midnight, since sessions end the day they start.
function addMinutes(time, minutes) {
  const [hour, minute] = time.split(':').map(Number)
  const total = hour * 60 + minute + minutes
  if (total >= 24 * 60) {
    return null
  }
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// Loads every session once, for the calendar dots and the subject shortcuts.
// If it fails the form still works, just without those extras.
function useOtherSessions(currentId) {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    apiRequest('/sessions', { signal: controller.signal })
      .then((data) => setSessions(data.sessions.filter((item) => item.id !== currentId)))
      .catch(() => {})
    return () => controller.abort()
  }, [currentId])

  return sessions
}

// Pass `session` to edit an existing session; leave it out to host a new one.
// `onSaved` receives the saved session from the server.
function SessionForm({ session, onSaved, onCancel }) {
  const { student } = useStudent()
  const otherSessions = useOtherSessions(session?.id)
  const [fields, setFields] = useState({
    title: session?.title ?? '',
    subject: session?.subject ?? '',
    location: session?.location ?? '',
    description: session?.description ?? '',
    session_date: session?.session_date?.slice(0, 10) ?? '',
    session_time: session?.session_time?.slice(0, 5) ?? '',
    end_time: session?.end_time?.slice(0, 5) ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dateError, setDateError] = useState('')
  const [timeError, setTimeError] = useState('')
  const [endTimeError, setEndTimeError] = useState('')
  const isEditing = Boolean(session)
  const length = minutesBetween(fields.session_time, fields.end_time)
  const endsTooEarly = length !== null && length <= 0

  function setField(name, value) {
    setFields((current) => ({ ...current, [name]: value }))
  }

  const busyDates = useMemo(() => {
    const counts = new Map()
    for (const item of otherSessions) {
      const key = item.session_date.slice(0, 10)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [otherSessions])

  const subjectChips = useMemo(() => {
    const seen = new Map()
    for (const item of otherSessions) {
      const key = item.subject.trim().toLocaleLowerCase()
      if (!seen.has(key)) {
        seen.set(key, item.subject.trim())
      }
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b)).slice(0, MAX_SUBJECT_CHIPS)
  }, [otherSessions])

  async function handleSubmit(event) {
    event.preventDefault()

    const missingDate = !fields.session_date
    const missingTime = !fields.session_time
    const missingEndTime = !fields.end_time
    setDateError(missingDate ? 'Pick a date on the calendar.' : '')
    setTimeError(missingTime ? 'Pick a start time.' : '')
    setEndTimeError(missingEndTime ? 'Pick an end time.' : '')
    if (missingDate || missingTime || missingEndTime || endsTooEarly) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const data = await apiRequest(isEditing ? `/sessions/${encodeURIComponent(session.id)}` : '/sessions', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? fields : { ...fields, creator_id: student.id }),
      })
      onSaved(data.session)
    } catch (requestError) {
      setError(requestError.message)
      setSaving(false)
    }
  }

  return (
    <form className="session-form visual-form" onSubmit={handleSubmit}>
      <div className="visual-form-columns">
        <section className="form-panel form-panel-what" aria-label="Session details">
          <label>
            <span>Session title</span>
            <input
              name="title"
              type="text"
              maxLength="150"
              required
              autoFocus
              placeholder="e.g. Linear algebra practice"
              value={fields.title}
              onChange={(event) => setField('title', event.target.value)}
            />
          </label>

          <div className="field">
            <label>
              <span>Subject</span>
              <input
                name="subject"
                type="text"
                maxLength="100"
                required
                placeholder="Pick one below or type a new one"
                value={fields.subject}
                onChange={(event) => setField('subject', event.target.value)}
              />
            </label>
            {subjectChips.length > 0 && (
              <div className="chip-list" role="group" aria-label="Subjects other sessions use">
                {subjectChips.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    className="chip"
                    aria-pressed={fields.subject.trim().toLocaleLowerCase() === subject.toLocaleLowerCase()}
                    onClick={() => setField('subject', subject)}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label>
            <span>Location</span>
            <input
              name="location"
              type="text"
              maxLength="200"
              required
              placeholder="e.g. Library, Room 110"
              value={fields.location}
              onChange={(event) => setField('location', event.target.value)}
            />
          </label>

          <label>
            <span>Description <span className="optional-label">(optional)</span></span>
            <textarea
              name="description"
              rows="5"
              maxLength="5000"
              placeholder="What will you cover? What should people bring?"
              value={fields.description}
              onChange={(event) => setField('description', event.target.value)}
            />
          </label>
        </section>

        <section className="form-panel form-panel-when" aria-label="Date and time">
          <div className="field">
            <span id="form-date-label" className="field-label">Date</span>
            <CalendarPicker
              value={fields.session_date}
              busyDates={busyDates}
              labelId="form-date-label"
              onChange={(value) => {
                setField('session_date', value)
                setDateError('')
              }}
            />
            {busyDates.size > 0 && (
              <p className="field-hint"><span className="calendar-dot" aria-hidden="true" /> Other sessions that day</p>
            )}
            {dateError && <p className="form-error" role="alert">{dateError}</p>}
          </div>

          <div className="field">
            <span id="form-time-label" className="field-label">Start time</span>
            <TimePicker
              value={fields.session_time}
              labelId="form-time-label"
              exactLabel="Exact start time"
              onChange={(value) => {
                setField('session_time', value)
                setTimeError('')
              }}
            />
            {timeError && <p className="form-error" role="alert">{timeError}</p>}
          </div>

          <div className="field">
            <span id="form-end-time-label" className="field-label">End time</span>
            <TimePicker
              value={fields.end_time}
              labelId="form-end-time-label"
              exactLabel="Exact end time"
              scrollTo={(fields.session_time && addMinutes(fields.session_time, 120)) || undefined}
              onChange={(value) => {
                setField('end_time', value)
                setEndTimeError('')
              }}
            />
            {fields.session_time && (
              <div className="chip-list" role="group" aria-label="Session length">
                {LENGTH_CHOICES.map((minutes) => {
                  const end = addMinutes(fields.session_time, minutes)
                  return (
                    <button
                      key={minutes}
                      type="button"
                      className="chip"
                      disabled={!end}
                      aria-pressed={length === minutes}
                      onClick={() => {
                        setField('end_time', end)
                        setEndTimeError('')
                      }}
                    >
                      {formatDuration(minutes)}
                    </button>
                  )
                })}
              </div>
            )}
            {endsTooEarly ? (
              <p className="form-error" role="alert">End time must be after the start time.</p>
            ) : endTimeError ? (
              <p className="form-error" role="alert">{endTimeError}</p>
            ) : length !== null && (
              <p className="field-hint">Lasts {formatDuration(length)}</p>
            )}
          </div>
        </section>
      </div>

      <div className="visual-form-submit">
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="button button-secondary" type="button" disabled={saving} onClick={onCancel}>
            Cancel
          </button>
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? (isEditing ? 'Saving…' : 'Posting…') : (isEditing ? 'Save changes' : 'Post session')}
          </button>
        </div>
      </div>
    </form>
  )
}

export default SessionForm

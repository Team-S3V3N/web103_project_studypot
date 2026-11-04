import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { downloadCalendarFile } from '../../lib/calendar.js'
import { getInitials } from './copy.js'

export function BackLink() {
  return <Link className="text-link back-link" to="/">← Back to sessions</Link>
}

export function Icon({ name }) {
  const paths = {
    calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></>,
    user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" /></>,
    link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  }

  return (
    <svg className="icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  )
}

export function RsvpButton({ details, status, className = '' }) {
  const { isMember, membershipPending, toggleMembership } = details

  if (status.state === 'ended') {
    return null
  }

  return (
    <button
      className={`button ${isMember ? 'button-secondary' : 'button-primary'} ${className}`}
      type="button"
      disabled={membershipPending}
      onClick={toggleMembership}
    >
      {membershipPending ? 'Updating…' : isMember ? 'Cancel RSVP' : 'RSVP'}
    </button>
  )
}

export function RsvpMessages({ details }) {
  const { actionError, notice, participantRefreshFailed, retry } = details

  return (
    <>
      {actionError && <p className="form-error" role="alert">{actionError}</p>}
      {participantRefreshFailed && (
        <button className="text-link refresh-participants" type="button" onClick={retry}>
          Refresh attendee list
        </button>
      )}
      {notice && <p className="success-notice" role="status">{notice}</p>}
    </>
  )
}

export function Avatar({ name, size = 'medium' }) {
  return <span className={`person-avatar person-avatar-${size}`} aria-hidden="true">{getInitials(name)}</span>
}

export function AttendeeStack({ participants, max = 5 }) {
  if (participants.length === 0) {
    return null
  }

  const shown = participants.slice(0, max)
  const extra = participants.length - shown.length

  return (
    <span className="attendee-stack" aria-hidden="true">
      {shown.map((participant) => <Avatar key={participant.id} name={participant.name} size="small" />)}
      {extra > 0 && <span className="person-avatar person-avatar-small attendee-extra">+{extra}</span>}
    </span>
  )
}

export function AttendeeList({ session, emptyText = 'No one has RSVP’d yet. Be the first.' }) {
  if (session.participants.length === 0) {
    return <p className="details-empty">{emptyText}</p>
  }

  return (
    <ul className="attendee-list">
      {session.participants.map((participant) => (
        <li key={participant.id}>
          <Avatar name={participant.name} />
          <span>{participant.name}</span>
          {participant.id === session.creator_id && <span className="host-label">Host</span>}
        </li>
      ))}
    </ul>
  )
}

export function CalendarButton({ session, status, className = 'button button-secondary' }) {
  if (status.state === 'ended' || status.state === 'unknown') {
    return null
  }

  return (
    <button className={className} type="button" onClick={() => downloadCalendarFile(session)}>
      <Icon name="calendar" /> Add to calendar
    </button>
  )
}

export function CopyLinkButton({ session, className = 'button button-secondary' }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return undefined
    }

    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/sessions/${session.id}`)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button className={className} type="button" onClick={handleCopy}>
      <Icon name="link" /> {copied ? 'Link copied' : 'Copy link'}
    </button>
  )
}

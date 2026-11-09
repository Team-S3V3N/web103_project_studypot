import { Link } from 'react-router-dom'
import { formatSessionTimeRange, getSessionDateParts } from '../lib/formatters.js'
import { useStudent } from '../student/StudentContext.jsx'
import { isHost } from '../student/students.js'
import { describeAttendance, getSessionStatus } from '../lib/sessionStatus.js'

function SessionCard({ session, now, onEdit, onDelete, deleting = false }) {
  const { student } = useStudent()
  const { month, day, weekday } = getSessionDateParts(session.session_date)
  const status = getSessionStatus(session, now)
  const count = session.participant_count

  return (
    <article className="session-card">
      <div className="session-card-top">
        <div className="date-block" aria-hidden="true">
          <span className="date-block-month">{month}</span>
          <span className="date-block-day">{day}</span>
        </div>
        <div className="session-card-when">
          <p className="session-subject">{session.subject}</p>
          <p className="session-time">
            <span className="visually-hidden">{month} {day}, </span>
            {weekday && `${weekday} · `}{formatSessionTimeRange(session.session_time, session.end_time)}
          </p>
        </div>
        <span className={`status-tag status-${status.state}`}>{status.label}</span>
      </div>

      <h3>
        <Link className="session-card-link" to={`/sessions/${session.id}`}>{session.title}</Link>
      </h3>
      <p className="session-location">{session.location}</p>
      <p className="session-host">Hosted by {session.creator_name}</p>

      <div className="session-card-footer">
        <span className="attending">{describeAttendance(count)}</span>
        {isHost(session, student) && (
          <div className="session-card-actions">
            <button
              className="card-action"
              type="button"
              aria-label={`Edit ${session.title}`}
              onClick={() => onEdit(session)}
            >
              Edit
            </button>
            <button
              className="card-action card-action-danger"
              type="button"
              aria-label={`Delete ${session.title}`}
              disabled={deleting}
              onClick={() => onDelete(session)}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

export default SessionCard

import { Link } from 'react-router-dom'
import { formatSessionDate, formatSessionTime } from '../lib/formatters.js'

function SessionCard({ session, onEdit, onDelete, deleting = false }) {
  return (
    <article className="session-card">
      <span className="subject-pill">{session.subject}</span>
      <h3>{session.title}</h3>
      <p className="session-meta">
        <span aria-hidden="true">◷</span>
        {formatSessionDate(session.session_date)} · {formatSessionTime(session.session_time)}
      </p>
      <p className="session-meta">
        <span aria-hidden="true">⌖</span>
        {session.location}
      </p>
      <p className="session-host">
        Hosted by {session.creator_name} · {session.participant_count} {session.participant_count === 1 ? 'student' : 'students'} joined
      </p>
      <div className="session-card-actions">
        <Link className="card-link" to={`/sessions/${session.id}`}>
          View details <span aria-hidden="true">→</span>
        </Link>
        <div className="session-management-actions">
          <button className="button button-secondary" type="button" onClick={() => onEdit(session)}>
            Edit
          </button>
          <button
            className="button button-danger"
            type="button"
            disabled={deleting}
            onClick={() => onDelete(session)}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default SessionCard

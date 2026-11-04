import { formatSessionDate } from '../../lib/formatters.js'
import { describeAttendance } from '../../lib/sessionStatus.js'
import { getRsvpHeading } from './copy.js'
import {
  AttendeeList,
  AttendeeStack,
  Avatar,
  BackLink,
  CalendarButton,
  CopyLinkButton,
  Icon,
  RsvpButton,
  RsvpMessages,
} from './parts.jsx'

function buildSteps(times, now) {
  return [
    { at: times.opensAt, time: times.opensAtLabel, title: 'Session opens', text: 'Arrive early and find your group.' },
    { at: times.start, time: times.startLabel, title: 'Session starts', text: 'The host kicks things off.' },
    { at: times.endsAt, time: `~${times.endsAtLabel}`, title: 'Wraps up', text: 'Estimated. Stay as long as you need.' },
  ].map((step) => ({ ...step, done: now >= step.at }))
}

// Session details: everything needed to decide up top, then a step-by-step plan for the session.
function SessionTimeline({ details, status, now, onEdit, onDelete }) {
  const { session } = details
  const steps = status.times ? buildSteps(status.times, now) : []

  return (
    <div className="layout-timeline">
      <BackLink />

      <header className="timeline-hero">
        <div className="timeline-hero-text">
          <p className="timeline-meta">
            <span>{session.subject}</span>
            <span className={`status-tag status-${status.state}`}>{status.label}</span>
          </p>
          <h1>{session.title}</h1>
          <p className="timeline-description">
            {session.description || 'The host hasn’t added a description yet.'}
          </p>
          <p className="timeline-when">
            <Icon name="calendar" /> {formatSessionDate(session.session_date)}
            {status.times && <> at {status.times.startLabel}</>}
            <span className="timeline-dot" aria-hidden="true" />
            <Icon name="pin" /> {session.location}
          </p>
          <div className="host-actions">
            <button className="button button-secondary" type="button" onClick={onEdit}>
              Edit session
            </button>
            <button
              className="button button-danger"
              type="button"
              disabled={details.deletingSession}
              onClick={onDelete}
            >
              {details.deletingSession ? 'Deleting…' : 'Delete session'}
            </button>
          </div>
          {details.managementError && <p className="form-error host-message" role="alert">{details.managementError}</p>}
          {details.managementNotice && <p className="success-notice host-message" role="status">{details.managementNotice}</p>}
        </div>

        <div className="timeline-rsvp">
          <p className="timeline-rsvp-heading">{getRsvpHeading(status, details.isMember)}</p>
          <p className="timeline-attending">
            <AttendeeStack participants={session.participants} />
            {describeAttendance(session.participant_count)}
          </p>
          <RsvpButton details={details} status={status} className="button-block" />
          <div className="timeline-secondary">
            <CalendarButton session={session} status={status} className="text-button" />
            <CopyLinkButton session={session} className="text-button" />
          </div>
          <RsvpMessages details={details} />
        </div>
      </header>

      <div className="timeline-body">
        <section aria-labelledby="timeline-plan">
          <h2 id="timeline-plan">The plan</h2>
          {steps.length > 0 ? (
            <ol className="timeline-steps">
              {steps.map((step) => (
                <li key={step.title} className={step.done ? 'is-done' : ''}>
                  <span className="timeline-marker" aria-hidden="true" />
                  <span className="timeline-time">{step.time}</span>
                  <span className="timeline-step-text">
                    <strong>{step.title}{step.done && <span className="visually-hidden"> (done)</span>}</strong>
                    <span>{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="details-empty">The host hasn’t set a time yet.</p>
          )}
          <p className="timeline-place">
            <Icon name="pin" />
            <span>
              <strong>{session.location}</strong>
              <span>Look for the group in this spot when the session opens.</span>
            </span>
          </p>
        </section>

        <section aria-labelledby="timeline-people">
          <h2 id="timeline-people">People</h2>
          <div className="timeline-host">
            <Avatar name={session.creator_name} />
            <span>
              <strong>{session.creator_name}</strong>
              <span>Host · organizing this session</span>
            </span>
          </div>
          <h3 className="timeline-subheading">Who’s going</h3>
          <AttendeeList session={session} />
        </section>
      </div>
    </div>
  )
}

export default SessionTimeline

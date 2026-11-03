import { useParams } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'
import { getSessionStatus, useNow } from '../lib/sessionStatus.js'
import { BackLink } from './session-details/parts.jsx'
import SessionTimeline from './session-details/SessionTimeline.jsx'
import { useSessionDetails } from './session-details/useSessionDetails.js'
import './session-details/sessionDetails.css'

function SessionDetails() {
  const { id } = useParams()
  const now = useNow()
  const details = useSessionDetails(id)

  if (details.loading) {
    return <main className="page-content"><Spinner label="Loading session details" /></main>
  }

  if (details.error || !details.session) {
    return (
      <main className="page-content">
        <BackLink />
        <section className="status-panel error-panel" role="alert">
          <p>{details.error || 'Study session not found.'}</p>
          <button className="button button-secondary" type="button" onClick={details.retry}>
            Try again
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="page-content">
      <SessionTimeline details={details} status={getSessionStatus(details.session, now)} now={now} />
    </main>
  )
}

export default SessionDetails

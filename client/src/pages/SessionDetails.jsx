import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'
import Toast from '../components/Toast.jsx'
import { getSessionStatus, useNow } from '../lib/sessionStatus.js'
import { BackLink } from './session-details/parts.jsx'
import SessionTimeline from './session-details/SessionTimeline.jsx'
import { useSessionDetails } from './session-details/useSessionDetails.js'
import './session-details/sessionDetails.css'

function SessionDetails() {
  const { id } = useParams()
  const now = useNow()
  const navigate = useNavigate()
  const location = useLocation()
  const details = useSessionDetails(id)
  // A "created" or "updated" message handed over by the form page. Shown once:
  // it is cleared from history so a refresh doesn't show it again.
  const [notice, setNotice] = useState(location.state?.notice ?? '')

  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  async function handleDeleteSession() {
    if (!window.confirm(`Delete "${details.session.title}"? This cannot be undone.`)) {
      return
    }

    if (await details.deleteSession()) {
      navigate('/')
    }
  }

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
      <SessionTimeline
        details={details}
        status={getSessionStatus(details.session, now)}
        now={now}
        onEdit={() => navigate(`/sessions/${encodeURIComponent(id)}/edit`)}
        onDelete={handleDeleteSession}
      />
      {notice && <Toast message={notice} onDone={() => setNotice('')} />}
    </main>
  )
}

export default SessionDetails

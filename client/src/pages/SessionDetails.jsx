import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CreateSessionModal from '../components/CreateSessionModal.jsx'
import Spinner from '../components/Spinner.jsx'
import { getSessionStatus, useNow } from '../lib/sessionStatus.js'
import { BackLink } from './session-details/parts.jsx'
import SessionTimeline from './session-details/SessionTimeline.jsx'
import { useSessionDetails } from './session-details/useSessionDetails.js'
import './session-details/sessionDetails.css'

function SessionDetails() {
  const { id } = useParams()
  const now = useNow()
  const navigate = useNavigate()
  const details = useSessionDetails(id)
  const [editModalOpen, setEditModalOpen] = useState(false)

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
        onEdit={() => setEditModalOpen(true)}
        onDelete={handleDeleteSession}
      />

      {editModalOpen && (
        <CreateSessionModal
          session={details.session}
          onClose={() => setEditModalOpen(false)}
          onCreated={() => {
            setEditModalOpen(false)
            details.refreshAfterEdit()
          }}
        />
      )}
    </main>
  )
}

export default SessionDetails

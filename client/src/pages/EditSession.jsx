import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../api.js'
import SessionForm from '../components/SessionForm.jsx'
import Spinner from '../components/Spinner.jsx'
import { useStudent } from '../student/StudentContext.jsx'
import { isHost } from '../student/students.js'

function EditSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { student } = useStudent()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const sessionPath = `/sessions/${encodeURIComponent(id)}`

  useEffect(() => {
    const controller = new AbortController()

    async function loadSession() {
      setLoading(true)
      setError('')

      try {
        const data = await apiRequest(sessionPath, { signal: controller.signal })
        setSession(data.session)
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadSession()
    return () => controller.abort()
  }, [sessionPath, retryToken])

  if (loading) {
    return <main className="page-content"><Spinner label="Loading session" /></main>
  }

  if (error || !session) {
    return (
      <main className="page-content form-page">
        <section className="status-panel error-panel" role="alert">
          <p>{error || 'Study session not found.'}</p>
          <button className="button button-secondary" type="button" onClick={() => setRetryToken((token) => token + 1)}>
            Try again
          </button>
        </section>
      </main>
    )
  }

  if (!isHost(session, student)) {
    return (
      <main className="page-content form-page">
        <h1>Edit session</h1>
        <p className="status-panel">
          Only the host, {session.creator_name}, can edit this session.
        </p>
      </main>
    )
  }

  return (
    <main className="page-content form-page">
      <h1>Edit session</h1>
      <p className="page-description">{session.title}</p>
      <SessionForm
        session={session}
        onCancel={() => navigate(sessionPath)}
        onSaved={() => navigate(sessionPath, {
          state: { notice: 'Your study session has been updated.' },
        })}
      />
    </main>
  )
}

export default EditSession

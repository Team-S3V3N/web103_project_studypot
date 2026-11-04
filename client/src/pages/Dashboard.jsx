import { useEffect, useMemo, useState } from 'react'
import CreateSessionModal from '../components/CreateSessionModal.jsx'
import SessionCard from '../components/SessionCard.jsx'
import { apiRequest } from '../api.js'

function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [deletingSessionId, setDeletingSessionId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadSessions() {
      setLoading(true)
      setError('')

      try {
        const data = await apiRequest('/sessions?upcoming=true', { signal: controller.signal })
        setSessions(data.sessions)
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

    loadSessions()
    return () => controller.abort()
  }, [retryToken])

  const subjects = useMemo(
    () => [...new Set(sessions.map((session) => session.subject))].sort((a, b) => a.localeCompare(b)),
    [sessions],
  )

  const filteredSessions = useMemo(() => {
    const searchTerm = search.trim().toLocaleLowerCase()

    return sessions.filter((session) => {
      const matchesSearch = !searchTerm ||
        session.title.toLocaleLowerCase().includes(searchTerm) ||
        session.subject.toLocaleLowerCase().includes(searchTerm)
      const matchesSubject = !subject || session.subject === subject
      const matchesDate = !date || session.session_date.slice(0, 10) === date

      return matchesSearch && matchesSubject && matchesDate
    })
  }, [date, search, sessions, subject])

  async function handleDeleteSession(session) {
    if (!window.confirm(`Delete "${session.title}"? This cannot be undone.`)) {
      return
    }

    setDeletingSessionId(session.id)
    setActionError('')
    setNotice('')

    try {
      await apiRequest(`/sessions/${encodeURIComponent(session.id)}`, { method: 'DELETE' })
      setNotice('The study session has been deleted.')
      setRetryToken((token) => token + 1)
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setDeletingSessionId(null)
    }
  }

  return (
    <main className="page-content">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Make progress together</p>
          <h1>Find your study crew.</h1>
          <p className="page-description">Explore upcoming sessions and learn better together.</p>
        </div>
        <button className="button button-primary create-session-button" type="button" onClick={() => setCreateModalOpen(true)}>
          <span aria-hidden="true">+</span> Create session
        </button>
      </section>

      {notice && <p className="success-notice" role="status">{notice}</p>}
      {actionError && <p className="form-error" role="alert">{actionError}</p>}

      <section className="filters-panel" aria-label="Filter study sessions">
        <label className="search-field">
          <span>Search sessions</span>
          <input
            type="search"
            placeholder="Search by title or subject"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          <span>Subject</span>
          <select value={subject} onChange={(event) => setSubject(event.target.value)}>
            <option value="">All subjects</option>
            {subjects.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label>
          <span>Date</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button
          className="button button-secondary reset-button"
          type="button"
          onClick={() => {
            setSearch('')
            setSubject('')
            setDate('')
          }}
        >
          Reset
        </button>
      </section>

      <section className="sessions-section" aria-labelledby="sessions-heading">
        <div className="section-heading">
          <h2 id="sessions-heading">Upcoming sessions</h2>
          {!loading && !error && (
            <span className="result-count">
              {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'}
            </span>
          )}
        </div>

        {loading && <p className="status-panel" role="status">Loading study sessions…</p>}
        {!loading && error && (
          <div className="status-panel error-panel" role="alert">
            <p>We couldn’t load study sessions: {error}</p>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setRetryToken((token) => token + 1)}
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && sessions.length === 0 && (
          <p className="status-panel">No study sessions are available yet. Check back soon.</p>
        )}
        {!loading && !error && sessions.length > 0 && filteredSessions.length === 0 && (
          <p className="status-panel">No sessions match your search. Try another subject or reset your filters.</p>
        )}
        {!loading && !error && filteredSessions.length > 0 && (
          <div className="session-grid">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                deleting={deletingSessionId === session.id}
                onEdit={setEditingSession}
                onDelete={handleDeleteSession}
              />
            ))}
          </div>
        )}
      </section>

      <aside className="how-it-works">
        <h2>How it works</h2>
        <p>1. Discover sessions <span aria-hidden="true">→</span> 2. View details <span aria-hidden="true">→</span> 3. Join your group</p>
      </aside>

      {createModalOpen && (
        <CreateSessionModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={() => {
            setCreateModalOpen(false)
            setNotice('Your study session has been created.')
            setRetryToken((token) => token + 1)
          }}
        />
      )}
      {editingSession && (
        <CreateSessionModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onCreated={() => {
            setEditingSession(null)
            setNotice('Your study session has been updated.')
            setActionError('')
            setRetryToken((token) => token + 1)
          }}
        />
      )}
    </main>
  )
}

export default Dashboard

import { useNavigate } from 'react-router-dom'
import SessionForm from '../components/SessionForm.jsx'

function NewSession() {
  const navigate = useNavigate()

  return (
    <main className="page-content form-page">
      <h1>Host a session</h1>
      <p className="page-description">Set the time and place, and classmates can RSVP.</p>
      <SessionForm
        onCancel={() => navigate('/')}
        onSaved={(session) => navigate(`/sessions/${session.id}`, {
          state: { notice: 'Your study session has been created.' },
        })}
      />
    </main>
  )
}

export default NewSession

import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { CampusProvider, useCampus } from './campus/CampusContext.jsx'
import CampusSwitcher from './components/CampusSwitcher.jsx'
import ProfileMenu from './components/ProfileMenu.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import Dashboard from './pages/Dashboard.jsx'
import EditSession from './pages/EditSession.jsx'
import NewSession from './pages/NewSession.jsx'
import SessionDetails from './pages/SessionDetails.jsx'
import SignIn from './pages/SignIn.jsx'
import { StudentProvider, useStudent } from './student/StudentContext.jsx'
import './App.css'

const SIGNED_OUT_KEY = 'studypot-signed-out'

function readSignedIn() {
  try {
    return window.localStorage.getItem(SIGNED_OUT_KEY) !== 'true'
  } catch {
    return true
  }
}

function AppLayout() {
  const { campus } = useCampus()
  const { student } = useStudent()
  const [signedIn, setSignedIn] = useState(readSignedIn)
  const { pathname } = useLocation()
  // The dashboard has its own big "Host a session" button, and the host page is the form itself.
  const showHostButton = signedIn && pathname !== '/' && pathname !== '/sessions/new'

  useEffect(() => {
    try {
      window.localStorage.setItem(SIGNED_OUT_KEY, String(!signedIn))
    } catch {
      // Storage can be blocked; the choice still holds for this visit.
    }
  }, [signedIn])

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="wordmark" to="/" aria-label="StudyPot home">
            <span className="wordmark-name">StudyPot</span>
            {!campus.isDefault && <span className="wordmark-campus">{campus.name}</span>}
          </Link>

          <div className="header-tools">
            {showHostButton && (
              <Link className="button button-primary header-host-button" to="/sessions/new">
                <span className="header-host-full">Host a session</span>
                <span className="header-host-short">Host</span>
              </Link>
            )}
            <CampusSwitcher />
            {signedIn && (
              <>
                <ProfileMenu student={student} />
                <button
                  className="header-menu-button logout-button"
                  type="button"
                  onClick={() => setSignedIn(false)}
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {signedIn ? (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sessions/new" element={<NewSession />} />
          <Route path="/sessions/:id" element={<SessionDetails />} />
          <Route path="/sessions/:id/edit" element={<EditSession />} />
          <Route
            path="*"
            element={(
              <main className="page-content">
                <section className="empty-panel">
                  <h1>Page not found</h1>
                  <Link className="text-link" to="/">Back to sessions</Link>
                </section>
              </main>
            )}
          />
        </Routes>
      ) : (
        <SignIn student={student} onSignIn={() => setSignedIn(true)} />
      )}

      <SiteFooter signedIn={signedIn} />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <CampusProvider>
        <StudentProvider>
          <AppLayout />
        </StudentProvider>
      </CampusProvider>
    </BrowserRouter>
  )
}

export default App

import { useEffect, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import { CampusProvider, useCampus } from './campus/CampusContext.jsx'
import CampusSwitcher from './components/CampusSwitcher.jsx'
import ProfileMenu from './components/ProfileMenu.jsx'
import Dashboard from './pages/Dashboard.jsx'
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

          {signedIn && (
            <nav className="site-nav" aria-label="Main navigation">
              <NavLink to="/" end>Sessions</NavLink>
            </nav>
          )}

          <div className="header-tools">
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
          <Route path="/sessions/:id" element={<SessionDetails />} />
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

      <footer className="site-footer">
        <span>StudyPot</span>
        {campus.isDefault
          ? <span>Find your study crew.</span>
          : <span>{campus.name} is a fictional demo campus. StudyPot is not affiliated with any university.</span>}
      </footer>
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

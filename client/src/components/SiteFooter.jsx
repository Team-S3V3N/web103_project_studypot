import { Link } from 'react-router-dom'
import { useCampus } from '../campus/CampusContext.jsx'

const YEAR = new Date().getFullYear()

function SiteFooter({ signedIn }) {
  const { campus } = useCampus()

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link className="footer-wordmark" to="/">StudyPot</Link>
          </div>

          {signedIn && (
            <nav className="footer-column" aria-label="Footer">
              <p className="footer-heading">Explore</p>
              <Link to="/">Browse sessions</Link>
              <Link to="/sessions/new">Host a session</Link>
            </nav>
          )}

          <div className="footer-column">
            <p className="footer-heading">About</p>
            <span>Built by Team 7</span>
            <span>CodePath WEB103</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {YEAR} StudyPot · Team 7, CodePath WEB103</span>
          {!campus.isDefault && (
            <span>{campus.name} is a fictional campus. StudyPot is not affiliated with any university.</span>
          )}
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter

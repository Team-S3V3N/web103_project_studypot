import { useCampus } from '../campus/CampusContext.jsx'

function SignIn({ student, onSignIn }) {
  const { campus } = useCampus()

  return (
    <main className="page-content sign-in-page">
      <section className="sign-in-card" aria-labelledby="sign-in-heading">
        <h1 id="sign-in-heading">You’re logged out</h1>
        <p>
          {campus.isDefault
            ? 'Sign in to find and join study sessions.'
            : `Sign in with your ${campus.name} student account to find and join study sessions.`}
        </p>
        <button className="button button-primary" type="button" onClick={onSignIn}>
          Sign in as {student.name}
        </button>
        <p className="sign-in-note">Demo account. No password needed.</p>
      </section>
    </main>
  )
}

export default SignIn

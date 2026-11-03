import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../../api.js'

export const DEMO_STUDENT_ID = 1

// Loads one session and handles RSVP / cancel. Shared by every details layout.
export function useSessionDetails(id) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [membershipPending, setMembershipPending] = useState(false)
  const [retryToken, setRetryToken] = useState(0)
  const [participantRefreshFailed, setParticipantRefreshFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadSession() {
      setLoading(true)
      setError('')

      try {
        const data = await apiRequest(`/sessions/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        })
        setSession(data.session)
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message)
          setSession(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadSession()
    return () => controller.abort()
  }, [id, retryToken])

  const isMember = Boolean(session?.participants.some(
    (participant) => participant.id === DEMO_STUDENT_ID,
  ))

  const retry = useCallback(() => {
    setActionError('')
    setRetryToken((token) => token + 1)
  }, [])

  async function toggleMembership() {
    if (!session) {
      return
    }

    setMembershipPending(true)
    setActionError('')
    setNotice('')
    let membershipUpdated = false

    try {
      if (isMember) {
        await apiRequest(
          `/sessions/${encodeURIComponent(id)}/members/${DEMO_STUDENT_ID}`,
          { method: 'DELETE' },
        )
        membershipUpdated = true
        setNotice('Your RSVP was cancelled.')
      } else {
        await apiRequest(`/sessions/${encodeURIComponent(id)}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_id: DEMO_STUDENT_ID }),
        })
        membershipUpdated = true
        setNotice('You’re on the list. See you there.')
      }

      const data = await apiRequest(`/sessions/${encodeURIComponent(id)}`)
      setSession(data.session)
      setParticipantRefreshFailed(false)
    } catch (requestError) {
      if (membershipUpdated) {
        setParticipantRefreshFailed(true)
        setActionError(`Your RSVP changed, but the attendee list could not refresh: ${requestError.message}`)
      } else {
        setActionError(requestError.message)
      }
    } finally {
      setMembershipPending(false)
    }
  }

  return {
    session,
    loading,
    error,
    retry,
    isMember,
    toggleMembership,
    membershipPending,
    actionError,
    notice,
    participantRefreshFailed,
  }
}

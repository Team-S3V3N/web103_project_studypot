// The app has no real accounts yet, so everyone uses this demo student.
export const CURRENT_STUDENT = { id: 1, name: 'Alex Morgan' }

// Only the student who created a session can edit or delete it.
export function isHost(session) {
  return session?.creator_id === CURRENT_STUDENT.id
}

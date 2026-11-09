// Demo students. The ids match the students in server/db/reset.sql.
// The app has no real accounts yet, so the profile menu lets you switch between them.
export const DEMO_STUDENTS = [
  { id: 1, name: 'Alex Morgan' },
  { id: 2, name: 'Jordan Lee' },
  { id: 3, name: 'Taylor Rivera' },
]

const STORAGE_KEY = 'studypot-demo-student'

export function readStoredStudentId() {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY))
    return DEMO_STUDENTS.some((student) => student.id === stored) ? stored : DEMO_STUDENTS[0].id
  } catch {
    return DEMO_STUDENTS[0].id
  }
}

export function storeStudentId(id) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(id))
  } catch {
    // Storage can be blocked; the choice still holds until the page reloads.
  }
}

// Only the student who created a session can edit or delete it.
export function isHost(session, student) {
  return session?.creator_id === student.id
}

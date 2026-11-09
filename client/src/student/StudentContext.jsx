import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEMO_STUDENTS, readStoredStudentId, storeStudentId } from './students.js'

const StudentContext = createContext(null)

export function StudentProvider({ children }) {
  const [studentId, setStudentIdState] = useState(readStoredStudentId)
  const student = DEMO_STUDENTS.find((item) => item.id === studentId) ?? DEMO_STUDENTS[0]

  // Saved right away (not in an effect) so the next API request already uses the new student.
  const setStudentId = useCallback((id) => {
    storeStudentId(id)
    setStudentIdState(id)
  }, [])

  const value = useMemo(
    () => ({ student, students: DEMO_STUDENTS, setStudentId }),
    [student, setStudentId],
  )

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useStudent() {
  const context = useContext(StudentContext)

  if (!context) {
    throw new Error('useStudent must be used inside StudentProvider')
  }

  return context
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CAMPUSES, DEFAULT_CAMPUS_ID } from './campuses.js'

const STORAGE_KEY = 'studypot-demo-campus'

const CampusContext = createContext(null)

function readStoredCampusId() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return CAMPUSES.some((campus) => campus.id === stored) ? stored : DEFAULT_CAMPUS_ID
  } catch {
    return DEFAULT_CAMPUS_ID
  }
}

export function CampusProvider({ children }) {
  const [campusId, setCampusId] = useState(readStoredCampusId)
  const campus = CAMPUSES.find((item) => item.id === campusId) ?? CAMPUSES[0]

  // Push the campus colors into CSS variables so every component re-themes at once.
  useEffect(() => {
    const root = document.documentElement
    const { colors } = campus

    root.dataset.campus = campus.id
    root.style.setProperty('--brand', colors.primary)
    root.style.setProperty('--on-brand', colors.onPrimary)
    root.style.setProperty('--accent', colors.accent)
    root.style.setProperty('--on-accent', colors.onAccent)
    root.style.setProperty('--brand-ink', colors.ink)
    root.style.setProperty('--surface', colors.surface)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors.primary)
    document.title = campus.isDefault ? 'StudyPot' : `StudyPot · ${campus.shortName}`

    try {
      window.localStorage.setItem(STORAGE_KEY, campus.id)
    } catch {
      // Private browsing can block storage; the theme still applies for this visit.
    }
  }, [campus])

  const value = useMemo(() => ({ campus, campuses: CAMPUSES, setCampusId }), [campus])

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useCampus() {
  const context = useContext(CampusContext)

  if (!context) {
    throw new Error('useCampus must be used inside CampusProvider')
  }

  return context
}

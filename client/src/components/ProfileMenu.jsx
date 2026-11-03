import { useCallback, useRef, useState } from 'react'
import { useCampus } from '../campus/CampusContext.jsx'
import { useDismiss } from './useDismiss.js'

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toLocaleUpperCase()
}

function ProfileMenu({ student, onSignOut }) {
  const { campus } = useCampus()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const close = useCallback(() => setOpen(false), [])

  useDismiss(open, close, containerRef, buttonRef)

  return (
    <div className="header-menu" ref={containerRef}>
      <button
        ref={buttonRef}
        className="header-menu-button profile-button"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <span className="avatar" aria-hidden="true">{getInitials(student.name)}</span>
        <span className="profile-name">{student.name}</span>
      </button>

      {open && (
        <div className="dropdown profile-menu" role="group" aria-label="Account">
          <div className="profile-summary">
            <span className="avatar avatar-large" aria-hidden="true">{getInitials(student.name)}</span>
            <span>
              <span className="profile-summary-name">{student.name}</span>
              <span className="profile-summary-detail">
                Student{campus.isDefault ? '' : ` at ${campus.shortName}`}
              </span>            </span>
          </div>
          <button
            type="button"
            className="dropdown-item"
            onClick={() => {
              close()
              onSignOut()
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu

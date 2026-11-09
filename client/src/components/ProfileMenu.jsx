import { useCallback, useRef, useState } from 'react'
import { useCampus } from '../campus/CampusContext.jsx'
import { useStudent } from '../student/StudentContext.jsx'
import { useDismiss } from './useDismiss.js'

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toLocaleUpperCase()
}

function ProfileMenu({ student }) {
  const { campus } = useCampus()
  const { students, setStudentId } = useStudent()
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
              </span>
            </span>
          </div>
          <div className="profile-switch">
            <p className="dropdown-heading">Switch account</p>
            <ul>
              {students.filter((item) => item.id !== student.id).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setStudentId(item.id)
                      close()
                      buttonRef.current?.focus()
                    }}
                  >
                    <span className="avatar avatar-small" aria-hidden="true">{getInitials(item.name)}</span>
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu

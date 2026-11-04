import { useCallback, useRef, useState } from 'react'
import { useCampus } from '../campus/CampusContext.jsx'
import { useDismiss } from './useDismiss.js'

function Swatch({ colors }) {
  return (
    <span className="campus-swatch" aria-hidden="true">
      <span style={{ background: colors.primary }} />
      <span style={{ background: colors.accent }} />
    </span>
  )
}

function CampusSwitcher() {
  const { campus, campuses, setCampusId } = useCampus()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const close = useCallback(() => setOpen(false), [])

  useDismiss(open, close, containerRef, buttonRef)

  return (
    <div className="header-menu" ref={containerRef}>
      <button
        ref={buttonRef}
        className="header-menu-button campus-switcher-button"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        title="Preview StudyPot for another campus"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <Swatch colors={campus.colors} />
        <span className="campus-switcher-name">{campus.shortName}</span>
        <span className="caret" aria-hidden="true" />
      </button>

      {open && (
        <div className="dropdown campus-menu" role="group" aria-label="Choose a demo campus">
          <p className="dropdown-heading">Preview as campus</p>
          <ul>
            {campuses.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="dropdown-item campus-option"
                  aria-pressed={item.id === campus.id}
                  onClick={() => {
                    setCampusId(item.id)
                    close()
                    buttonRef.current?.focus()
                  }}
                >
                  <Swatch colors={item.colors} />
                  <span className="campus-option-text">
                    <span className="campus-option-name">{item.name}</span>
                    <span className="campus-option-location">{item.location}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default CampusSwitcher

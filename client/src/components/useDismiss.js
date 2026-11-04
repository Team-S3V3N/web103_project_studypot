import { useEffect } from 'react'

// Closes a dropdown when the user clicks outside it or presses Escape.
export function useDismiss(open, close, containerRef, triggerRef) {
  useEffect(() => {
    if (!open) {
      return undefined
    }

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        close()
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        close()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, close, containerRef, triggerRef])
}

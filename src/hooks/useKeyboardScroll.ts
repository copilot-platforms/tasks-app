import { RefObject, useEffect } from 'react'
import Scrollbars from 'react-custom-scrollbars'

interface UseKeyboardScrollOptions {
  padding?: number
}
// useKeyboardScroll is a hook made to add functionality of keyboard scrolling to the custom scrollbar - 'react-custom-scrollbars' used in our application.
export const useKeyboardScroll = (scrollbarsRef: RefObject<Scrollbars>, options: UseKeyboardScrollOptions = {}) => {
  const { padding = 8 } = options

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return

      setTimeout(() => {
        const input = document.querySelector('[role="combobox"]') as HTMLElement
        if (!input) return

        const activeId = input.getAttribute('aria-activedescendant')
        if (!activeId) return

        const activeElement = document.getElementById(activeId)
        if (!activeElement || !scrollbarsRef.current) return

        const container = scrollbarsRef.current.getValues()
        const activeRect = activeElement.getBoundingClientRect()
        const containerRect = (scrollbarsRef.current as any).container.getBoundingClientRect()

        const elementTop = activeRect.top - containerRect.top
        const elementBottom = activeRect.bottom - containerRect.top

        if (elementTop < 0) {
          scrollbarsRef.current.scrollTop(container.scrollTop + elementTop - padding)
        } else if (elementBottom > containerRect.height) {
          scrollbarsRef.current.scrollTop(container.scrollTop + (elementBottom - containerRect.height) + padding)
        }
      }, 0)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [scrollbarsRef, padding])
}

'use client'

import { ReactNode, useEffect } from 'react'

export const InterrupCmdK = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  return children
}

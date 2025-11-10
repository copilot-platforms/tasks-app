import { useEffect, useState } from 'react'

export const useIsTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(pointer: coarse) and (hover: none)')
      setIsTouchDevice(mediaQuery.matches)
    }
  }, [])

  return isTouchDevice
}

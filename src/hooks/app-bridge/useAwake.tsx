import { useEffect, useState } from 'react'

export function useAwake() {
  const [awake, setAwake] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setAwake(true), 0)
    return () => clearTimeout(id)
  }, [])

  return awake
}

'use client'

import { useState, useEffect, ReactNode } from 'react'

//this HOC can be used to force disable server rendering for the components supposed to render only on the client side
export const ForceDisableServerRender = ({ children }: { children: ReactNode }) => {
  //this state tracks if the component is in client side or not during hydration
  const [isCLient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isCLient) return null

  return children
}

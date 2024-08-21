'use client'

import { CSSProperties, ReactNode, useEffect, useState } from 'react'
import Scrollbars from 'react-custom-scrollbars'

export const CustomScrollbar = ({ children, style }: { children: ReactNode; style: CSSProperties }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null //checking if the component mounts before applying the styles so that this component doesnt get replaced by default scrollbar if the styles are not loaded in time.

  return (
    <Scrollbars
      autoHide
      renderThumbVertical={(props) => {
        return (
          <div
            {...props}
            className="thumb"
            style={{
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              ...style,
            }}
          />
        )
      }}
      autoHideTimeout={500}
      autoHideDuration={500}
      hideTracksWhenNotNeeded={true}
    >
      {children}
    </Scrollbars>
  )
}

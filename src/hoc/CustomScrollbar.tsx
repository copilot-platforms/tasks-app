'use client'

import { CSSProperties, ReactNode } from 'react'
import Scrollbars from 'react-custom-scrollbars'

export const CustomScrollbar = ({ children, style }: { children: ReactNode; style: CSSProperties }) => {
  return (
    <Scrollbars
      autoHide
      renderThumbVertical={(props) => (
        <div
          {...props}
          className="thumb"
          style={{
            borderRadius: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            ...style,
          }}
        />
      )}
      autoHideTimeout={500}
      autoHideDuration={500}
      hideTracksWhenNotNeeded={true}
    >
      {children}
    </Scrollbars>
  )
}

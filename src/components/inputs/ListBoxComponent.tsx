import { useKeyboardScroll } from '@/hooks/useKeyboardScroll'
import { Box, useMediaQuery } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { useRef } from 'react'
import Scrollbars from 'react-custom-scrollbars'

export type ListboxComponentProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode
  role: string
  endOption?: React.ReactNode
  endOptionHref?: string
  autoHeightMax?: string
}

const ListboxComponent = React.forwardRef<HTMLDivElement, ListboxComponentProps>((props, ref) => {
  const { children, endOption, endOptionHref, autoHeightMax, ...other } = props
  const scrollbarsRef = useRef<Scrollbars>(null)
  const xs = useMediaQuery('(max-width:600px)')
  useKeyboardScroll(scrollbarsRef, { padding: 12 })
  const router = useRouter()
  console.log('rendering')
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'none',
      }}
    >
      <div ref={ref} {...other} style={{ padding: '0px' }}>
        <Scrollbars
          ref={scrollbarsRef}
          renderThumbVertical={(scrollbarProps) => (
            <div
              {...scrollbarProps}
              className="thumb"
              style={{
                borderRadius: '6px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            />
          )}
          renderView={(viewProps) => (
            <div
              {...viewProps}
              style={{
                ...viewProps.style,
                borderRadius: '0',
                position: 'relative',
                maxHeight: autoHeightMax ?? (xs ? '175px' : '291px'),
                inset: '0px',
                overflow: 'auto',
                paddingBottom: '18px',
                minHeight: '100%',
              }}
            />
          )}
          autoHide
          autoHeight
          autoHeightMax={autoHeightMax ?? (xs ? '172px' : '291px')}
          autoHideTimeout={500}
          autoHideDuration={500}
          hideTracksWhenNotNeeded
          universal
        >
          {props.children}
        </Scrollbars>
      </div>
      {endOption && <Box onMouseDown={() => endOptionHref && router.push(endOptionHref)}>{endOption}</Box>}
    </div>
  )
})

ListboxComponent.displayName = 'ListboxComponent'

export default ListboxComponent

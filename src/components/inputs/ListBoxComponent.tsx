import { useKeyboardScroll } from '@/hooks/useKeyboardScroll'
import { Box, useMediaQuery } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { useRef } from 'react'
import Scrollbars, { ScrollbarProps } from 'react-custom-scrollbars'
export type ListComponentProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode
  role: string
  endOption?: React.ReactNode
  endOptionHref?: string
  autoHeightMax?: string
}

const ListboxComponent = React.forwardRef<HTMLDivElement, ListComponentProps>((props, ref) => {
  const { children, endOption, endOptionHref, autoHeightMax, ...other } = props
  const scrollbarsRef = useRef<Scrollbars>(null)
  const xs = useMediaQuery('(max-width:600px)')
  useKeyboardScroll(scrollbarsRef, { padding: 12 })
  const router = useRouter()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'none',
      }}
    >
      <Box ref={ref} {...other} style={{ padding: '0px' }}>
        <Scrollbars
          className={props.className}
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
                paddingBottom: '7px',
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
        >
          {props.children}
        </Scrollbars>
      </Box>
      {endOption && (
        <Box ref={ref} onMouseDown={() => endOptionHref && router.push(endOptionHref)}>
          {endOption}
        </Box>
      )}
    </Box>
  )
})

ListboxComponent.displayName = 'ListboxComponent'

export default ListboxComponent

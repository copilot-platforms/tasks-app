import { Box, useMediaQuery } from '@mui/material'
import { useRouter } from 'next/navigation'
import { forwardRef } from 'react'
import Scrollbars, { ScrollbarProps } from 'react-custom-scrollbars'

export interface ListComponentProps extends Omit<ScrollbarProps, 'ref'> {
  children: React.ReactNode
  endOption?: React.ReactNode
  endOptionHref?: string
  autoHeightMax?: string
}

const ListComponentInternal = forwardRef<Scrollbars, ListComponentProps>((props, ref) => {
  const { children, endOption, endOptionHref, autoHeightMax, ...comProps } = props
  const xs = useMediaQuery('(max-width:600px)')

  return (
    <Box>
      <Scrollbars
        {...comProps}
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
              maxHeight: xs ? '175px' : '291px',
              inset: '0px',
              overflow: 'auto',
              paddingBottom: xs ? '12px' : '7px',
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
        {children}
      </Scrollbars>
      {endOption ?? null}
    </Box>
  )
})
ListComponentInternal.displayName = 'ListComponentInternal'

export const ListComponent = (
  props: JSX.IntrinsicElements['div'] & { endOption?: React.ReactNode; endOptionHref?: string; autoHeightMax?: string },
) => <ListComponentInternal {...(props as ListComponentProps)} />

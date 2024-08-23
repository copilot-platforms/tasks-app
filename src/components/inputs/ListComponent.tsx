import { useMediaQuery } from '@mui/material'
import { forwardRef } from 'react'
import Scrollbars, { ScrollbarProps } from 'react-custom-scrollbars'

interface ListComponentProps extends Omit<ScrollbarProps, 'ref'> {
  children: React.ReactNode
}

const ListComponentInternal = forwardRef<Scrollbars, ListComponentProps>((props, ref) => {
  const { children, ...comProps } = props
  const xs = useMediaQuery('(max-width:600px)')

  return (
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
            position: 'relative',
            maxHeight: xs ? '175px' : '291px',
            marginBottom: '-25px',
            inset: '0px',
            overflow: 'scroll',
            marginRight: '-20px',
            paddingBottom: '15px',
          }}
        />
      )}
      autoHide
      autoHeight
      autoHeightMax={xs ? '172px' : '291px'}
      autoHideTimeout={500}
      autoHideDuration={500}
      hideTracksWhenNotNeeded
    >
      {children}
    </Scrollbars>
  )
})
ListComponentInternal.displayName = 'ListComponentInternal'

export const ListComponent = (props: JSX.IntrinsicElements['div']) => (
  <ListComponentInternal {...(props as ListComponentProps)} />
)

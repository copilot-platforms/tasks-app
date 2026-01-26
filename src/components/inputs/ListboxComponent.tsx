import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'

import React from 'react'

type ListboxComponentProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode
  role: string
  endOption?: React.ReactNode
  endOptionHref?: string
}

const ListboxComponent = React.forwardRef<HTMLDivElement, ListboxComponentProps>((props, ref) => {
  const { children, endOption, endOptionHref, ...otherProps } = props

  const router = useRouter()
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'none',
      }}
    >
      <Box ref={ref} {...otherProps}>
        {children}
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

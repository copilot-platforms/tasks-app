import { StyledTypography } from '@/app/detail/ui/styledComponent'
import { Box } from '@mui/material'

export const DotSeparator = () => {
  return (
    <StyledTypography className="dot-separator">
      {' '}
      <Box color={(theme) => theme.color.gray[300]}>&#x2022;</Box>{' '}
    </StyledTypography>
  )
}

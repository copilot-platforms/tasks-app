import { StyledTypography } from '@/app/detail/ui/styledComponent'
import { Box } from '@mui/material'

export const DotSeparator = () => {
  return (
    <StyledTypography color={({ color }) => color.gray[300]}>
      {' '}
      <span>&#x2022;</span>{' '}
    </StyledTypography>
  )
}

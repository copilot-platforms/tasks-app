'use client'

import { FormHelperText, styled } from '@mui/material'

export const StyledHelperText = styled(FormHelperText)(({ theme }) => ({
  textAlign: 'right',
  marginRight: 0,
  color: theme.color.muiError,
  margin: '3px 0px 0px 14px',
}))

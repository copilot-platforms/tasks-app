'use client'

import { TextField, styled } from '@mui/material'

export const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'padding',
})<{ padding?: string; borderColor?: string; borderLess?: boolean }>(({ padding, borderColor, borderLess, theme }) => ({
  '& .MuiInputBase-root': {
    padding: '0px 8px',
  },
  '& .MuiOutlinedInput-input': {
    padding: padding ? padding : '3px 8px 3px 0px',
  },
  '& label.Mui-focused': {
    color: theme.color.base.black,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.color.borders.border,
      border: borderLess && 'none',
    },
    '&:hover fieldset': {
      borderColor: theme.color.borders.border,
      border: borderLess && 'none',
    },
    '&.Mui-focused fieldset': {
      border: borderLess ? 'none' : `1px solid ${borderColor || theme.color.base.black}`,
    },
  },
  '&.MuiTextField-root': {
    backgroundColor: '#fff',
  },
  input: {
    '&::placeholder': {
      opacity: 1,
      fontSize: '13px',
    },
    fontSize: '14px',
  },
}))

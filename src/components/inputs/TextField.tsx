'use client'

import { TextField, styled } from '@mui/material'

export const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'padding',
})<{ basePadding?: string; padding?: string; borderColor?: string; borderLess?: boolean }>(
  ({ basePadding, padding, borderColor, borderLess, theme }) => ({
    '& .MuiInputBase-root': {
      padding: basePadding ? basePadding : '0px 8px',
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
        fontSize: '12px',
      },
      fontSize: '12px',
    },
  }),
)

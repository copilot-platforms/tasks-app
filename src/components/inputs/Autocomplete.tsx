import React from 'react'
import { Autocomplete, styled } from '@mui/material'

interface StyledAutocompleteProps {
  placement?: string
}

export const StyledAutocomplete = styled(Autocomplete, {
  shouldForwardProp: (prop) => prop !== 'placement',
})<StyledAutocompleteProps>(({ theme, placement }) => ({
  '& .MuiAutocomplete-endAdornment': {
    display: 'none',
  },
  '& .MuiOutlinedInput-root': {
    padding: placement === 'top' ? '8px 12px 4px 12px' : '4px 12px 8px 12px',
    paddingRight: '12px !important',
    '& .MuiAutocomplete-input': {
      padding: '0px',
      height: '21px',
      marginLeft: '4px',
      '&::placeholder': {
        color: '#9B9FA3',
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '21px',
      },
    },
  },
  '& .MuiOutlinedInput-root.Mui-focused': {
    borderRadius: placement === 'top' ? '0px 0px 4px 4px' : '4px 4px 0px 0px',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #EDEDF0',
  },
  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #EDEDF0',
    padding: 0,
  },
}))

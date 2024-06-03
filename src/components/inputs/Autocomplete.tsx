import { Autocomplete, styled } from '@mui/material'

export const StyledAutocomplete = styled(Autocomplete)({
  '& .MuiAutocomplete-endAdornment': {
    display: 'none',
  },
  '& .MuiOutlinedInput-root': {
    padding: 0,
    border: '1px solid #EDEDF0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #EDEDF0',
  },
  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #EDEDF0',
    padding: 0,
  },
})

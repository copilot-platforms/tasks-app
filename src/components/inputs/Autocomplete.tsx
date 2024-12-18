import { Autocomplete, styled } from '@mui/material'

export const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    padding: '6px 14px 10px 14px',
    paddingRight: '14px !important',
  },

  '& .MuiOutlinedInput-root.Mui-focused': {
    borderRadius: '4px 4px 0px 0px',
  },
  '& fieldset.MuiOutlinedInput-notchedOutline': {
    borderWidth: '1px',
  },
  '& .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
    padding: '0px',
  },
  '& .MuiAutocomplete-popper div': {
    borderTopRightRadius: '0px',
    borderTopLeftRadius: '0px',
  },
  '& .MuiAutocomplete-endAdornment': {
    display: 'none',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #EDEDF0',
  },
}))

import { InputAdornment, styled } from '@mui/material'
import { useState } from 'react'
import { StyledTextField } from '@/components/inputs/TextField'
import { SearchIcon } from '@/icons'

interface ISearchBar {
  value: string
  getSearchKeyword: (keyword: string) => void
}

const SearchBar = ({ value, getSearchKeyword }: ISearchBar) => {
  const [focused, setFocused] = useState(false)

  return (
    <StyledTextInput
      value={value}
      focused={focused}
      variant="outlined"
      placeholder={focused ? 'Search...' : 'Search'}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment
            position="start"
            sx={{
              cursor: 'default',
            }}
          >
            <SearchIcon />
          </InputAdornment>
        ),
        inputProps: {
          style: {
            marginBottom: '2px',
          },
        },
      }}
      autoComplete="off"
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onChange={(e) => getSearchKeyword(e.target.value)}
    />
  )
}

export default SearchBar

const StyledTextInput = styled(StyledTextField, {
  shouldForwardProp: (prop) => prop !== 'focused',
})<{ focused: boolean }>(({ focused }) => ({
  width: focused ? '220px' : '90px',
  transition: 'width 0.5s',
  '& .MuiOutlinedInput-input': {
    cursor: 'pointer',
  },
}))

import { InputAdornment, SxProps, Theme, styled } from '@mui/material'
import { useRef, useState } from 'react'
import { StyledTextField } from '@/components/inputs/TextField'
import { SearchIcon } from '@/icons'

interface ISearchBar {
  value: string
  getSearchKeyword: (keyword: string) => void
}

const SearchBar = ({ value, getSearchKeyword }: ISearchBar) => {
  const [focused, setFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleIconClick = () => {
    setFocused(true)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <StyledTextField
      inputRef={inputRef}
      value={value}
      focused={focused}
      variant="outlined"
      placeholder={focused ? 'Search...' : 'Search'}
      basePadding="4px 8px"
      sx={{
        width: { md: focused ? '220px' : '90px', sd: focused ? '90px' : '30px', xs: focused ? '100px' : '30px' },
        transition: 'width 0.5s',
        '& .MuiOutlinedInput-input': {
          cursor: 'pointer',
        },
      }}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment
            position="start"
            sx={{
              cursor: 'default',
            }}
          >
            <SearchIcon onClick={handleIconClick} />
          </InputAdornment>
        ),
      }}
      autoComplete="off"
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onChange={(e) => getSearchKeyword(e.target.value)}
    />
  )
}

export default SearchBar

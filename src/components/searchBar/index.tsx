import { InputAdornment, SxProps, Theme, styled } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { StyledTextField } from '@/components/inputs/TextField'
import { CrossIconSmall, SearchIcon } from '@/icons'
import { FilterOptions } from '@/types/interfaces'
import { useDebounce } from '@/hooks/useDebounce'

interface ISearchBar {
  value: string
  getSearchKeyword: (keyword: string) => void
  onClear: () => void
}

const SearchBar = ({ value, getSearchKeyword, onClear }: ISearchBar) => {
  const [focused, setFocused] = useState<boolean>(false)
  const [fieldValue, setFieldValue] = useState(value)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      const inputElement = e.target as HTMLInputElement
      inputElement.blur()
      setFocused(false)
    }
  }

  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleIconClick = () => {
    setFocused(true)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }
  const getSearchKeywordDebounced = useDebounce(getSearchKeyword, 300)

  return (
    <StyledTextField
      inputRef={inputRef}
      value={fieldValue}
      focused={focused}
      variant="outlined"
      placeholder={focused ? 'Search...' : 'Search'}
      basePadding="4.4px 8px"
      sx={{
        width: {
          md: focused || fieldValue ? '220px' : '90px',
          sd: focused ? '90px' : '28px',
          xs: focused ? '100px' : '28px',
        },
        transition: 'width 0.5s',
        '& .MuiOutlinedInput-input': {
          cursor: 'pointer',
        },
      }}
      size="small"
      onKeyDown={handleKeyDown}
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
        endAdornment: (
          <InputAdornment
            position="end"
            sx={{
              cursor: 'default',
              display: fieldValue ? 'flex' : 'none',
            }}
          >
            <CrossIconSmall
              onClick={() => {
                onClear()
                setFieldValue('')
              }}
            />
          </InputAdornment>
        ),
      }}
      autoComplete="off"
      onBlur={() => setFocused(false)}
      onFocus={() => {
        setFocused(true)
      }}
      onChange={(e) => {
        setFieldValue(e.target.value)
        getSearchKeywordDebounced(e.target.value)
      }}
    />
  )
}

export default SearchBar

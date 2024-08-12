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
  title?: string
}

const SearchBar = ({ value, getSearchKeyword, onClear, title }: ISearchBar) => {
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
      placeholder={focused ? 'Find in view...' : 'Search'}
      basePadding="4px 4px 4px 8px"
      title={value ? value : (title ?? 'Find in view...')}
      sx={{
        width: {
          md: focused || fieldValue ? '220px' : '80px',
          sm: focused || fieldValue ? '120px' : '32px',
          xs: focused || fieldValue ? '110px' : '32px',
        },

        transition: 'width 0.5s',
        '& .MuiOutlinedInput-input': {
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '15px',
          cursor: 'pointer',
          '&::placeholder': {
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '15px',
          },
        },
        '& .MuiOutlinedInput-root': {
          '&:hover': {
            backgroundColor: (theme) => theme.color.gray[100],
          },
        },
      }}
      size="small"
      onKeyDown={handleKeyDown}
      InputProps={{
        startAdornment: (
          <InputAdornment
            position="start"
            sx={{
              cursor: 'pointer',

              marginLeft: { xs: '2px', md: '0px' },
            }}
          >
            <SearchIcon onClick={handleIconClick} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment
            position="end"
            sx={{
              cursor: 'pointer',
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

'use client'

import { Box, Stack, Typography } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useEffect, useState } from 'react'
import store from '@/redux/store'
import { setFilteredTasks } from '@/redux/features/taskBoardSlice'
import SearchBar from '@/components/searchBar'

export const FilterBar = ({}: {}) => {
  const [searchText, setSearchText] = useState('')

  useEffect(() => {}, [searchText])
  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} py="18.5px">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <div> </div>
          <SearchBar
            value={searchText}
            getSearchKeyword={(keyword) => {
              setSearchText(keyword)
              store.dispatch(setFilteredTasks(keyword))
            }}
          />
        </Stack>
      </AppMargin>
    </Box>
  )
}

'use client'

import { Box, Stack, Typography } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useEffect, useState } from 'react'
import SearchBar from '../searchBar/SearchBar'
import store from '@/redux/store'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { setFilteredTasks } from '@/redux/features/taskBoardSlice'

export const FilterBar = ({}: {}) => {
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    store.dispatch(setFilteredTasks(searchText))
  }, [searchText])
  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} py="18.5px">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="lg">Filter Bar Here</Typography>
          <SearchBar value={searchText} getSearchKeyword={(keyword) => setSearchText(keyword)} />
        </Stack>
      </AppMargin>
    </Box>
  )
}

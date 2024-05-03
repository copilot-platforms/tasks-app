'use client'

import { Box, Stack, Typography } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useEffect, useState } from 'react'
import store from '@/redux/store'
import { selectTaskBoard, setFilteredTasks, setViewSettings } from '@/redux/features/taskBoardSlice'
import SearchBar from '@/components/searchBar'
import { ViewModeSelector } from '../inputs/ViewModeSelector'
import { useSelector } from 'react-redux'
import { View } from '@/types/interfaces'

export const FilterBar = ({ updateViewModeSetting }: { updateViewModeSetting: (mode: View) => void }) => {
  const [searchText, setSearchText] = useState('')

  const { view } = useSelector(selectTaskBoard)

  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} py="18.5px">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <div> </div>
          <Stack direction="row" alignItems="center" columnGap={3}>
            <SearchBar
              value={searchText}
              getSearchKeyword={(keyword) => {
                setSearchText(keyword)
                store.dispatch(setFilteredTasks(keyword))
              }}
            />

            <ViewModeSelector
              selectedMode={view}
              handleModeChange={(mode) => {
                store.dispatch(setViewSettings(mode))
                updateViewModeSetting(mode)
              }}
            />
          </Stack>
        </Stack>
      </AppMargin>
    </Box>
  )
}

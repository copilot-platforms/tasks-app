'use client'

import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useState } from 'react'
import store from '@/redux/store'
import { setViewSettings, setFilterOptions } from '@/redux/features/taskBoardSlice'
import SearchBar from '@/components/searchBar'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { useSelector } from 'react-redux'
import { IAssigneeCombined, View } from '@/types/interfaces'
import { FilterByAsigneeIcon } from '@/icons'
import { ViewModeSelector } from '../inputs/ViewModeSelector'
import { FilterByAssigneeBtn } from '../buttons/FilterByAssigneeBtn'
import FilterButtonGroup from '@/components/buttonsGroup/FilterButtonsGroup'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { useFilter } from '@/hooks/useFilter'

export const FilterBar = ({ updateViewModeSetting }: { updateViewModeSetting: (mode: View) => void }) => {
  const [searchText, setSearchText] = useState('')
  const [activeButtonIndex, setActiveButtonIndex] = useState<number>(3)
  const { view, assignee } = useSelector(selectTaskBoard)
  const { tokenPayload } = useSelector(selectAuthDetails)

  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: assignee[0],
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  useFilter()

  const filterButtons = [
    {
      name: 'My tasks',
      onClick: async (index: number) => {
        store.dispatch(setFilterOptions({ type: 'filterButton', payload: tokenPayload?.internalUserId as string }))
        setActiveButtonIndex(index)
      },
    },
    {
      name: "My team's tasks",
      onClick: (index: number) => {
        store.dispatch(setFilterOptions({ type: 'filterButton', payload: ['internalUser'] }))
        setActiveButtonIndex(index)
      },
    },
    {
      name: 'Client tasks',
      onClick: (index: number) => {
        store.dispatch(setFilterOptions({ type: 'filterButton', payload: ['client', 'company'] }))
        setActiveButtonIndex(index)
      },
    },
    {
      name: 'All tasks',
      onClick: (index: number) => {
        store.dispatch(setFilterOptions({ type: 'filterButton', payload: ['all'] }))
        setActiveButtonIndex(index)
      },
    },
  ]
  const assigneeValue = _assigneeValue as IAssigneeCombined

  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} py="14px">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" columnGap={3}>
            <FilterButtonGroup filterButtons={filterButtons} activeButtonIndex={activeButtonIndex} />
            <Selector
              getSelectedValue={(_newValue) => {
                const newValue = _newValue as IAssigneeCombined
                updateAssigneeValue(newValue)
                store.dispatch(setFilterOptions({ type: 'filterAssignee', payload: newValue.id as string }))
              }}
              startIcon={<FilterByAsigneeIcon />}
              options={assignee}
              placeholder="Assignee"
              value={assigneeValue}
              selectorType={SelectorType.ASSIGNEE_SELECTOR}
              extraOption={{
                id: '',
                name: 'No assignee',
                value: '',
                extraOptionFlag: true,
              }}
              extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
                return (
                  <Box
                    component="li"
                    {...props}
                    sx={{
                      '&.MuiAutocomplete-option[aria-selected="true"]': {
                        bgcolor: (theme) => theme.color.gray[100],
                      },
                      '&.MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
                        bgcolor: (theme) => theme.color.gray[100],
                      },
                    }}
                    onClick={(e) => {
                      updateAssigneeValue({ id: '', name: 'No assignee' })
                      setAnchorEl(anchorEl ? null : e.currentTarget)
                      store.dispatch(
                        setFilterOptions({ type: 'filterAssignee', payload: e.currentTarget as unknown as string }),
                      )
                    }}
                  >
                    <Stack direction="row" alignItems="center" columnGap={3}>
                      <Avatar alt="user" sx={{ width: '20px', height: '20px' }} />
                      <Typography variant="sm" fontWeight={400}>
                        No assignee
                      </Typography>
                    </Stack>
                  </Box>
                )
              }}
              buttonContent={<FilterByAssigneeBtn assigneeValue={assigneeValue} updateAssigneeValue={updateAssigneeValue} />}
            />
          </Stack>
          <Stack direction="row" alignItems="center" columnGap={3}>
            <SearchBar
              value={searchText}
              getSearchKeyword={(keyword) => {
                setSearchText(keyword)
                store.dispatch(setFilterOptions({ type: 'filterSearch', payload: keyword }))
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

'use client'

import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useState } from 'react'
import store from '@/redux/store'
import { setFilterOptions, setViewSettings } from '@/redux/features/taskBoardSlice'
import SearchBar from '@/components/searchBar'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { useSelector } from 'react-redux'
import { FilterOptions, FilterOptionsKeywords, IAssigneeCombined, IFilterOptions, View } from '@/types/interfaces'
import { FilterByAsigneeIcon } from '@/icons'
import { ViewModeSelector } from '../inputs/ViewModeSelector'
import { FilterByAssigneeBtn } from '../buttons/FilterByAssigneeBtn'
import FilterButtonGroup from '@/components/buttonsGroup/FilterButtonsGroup'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { useFilter } from '@/hooks/useFilter'
import { IUTokenSchema } from '@/types/common'

export const FilterBar = ({ updateViewModeSetting }: { updateViewModeSetting: (mode: View) => void }) => {
  const { view, assignee, filterOptions } = useSelector(selectTaskBoard)
  const handleFilterOptionsChange = (optionType: FilterOptions, newValue: string | null) => {
    store.dispatch(setFilterOptions({ optionType, newValue }))
  }
  const [activeButtonIndex, setActiveButtonIndex] = useState<number>(3)
  const { tokenPayload } = useSelector(selectAuthDetails)

  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: '',
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  useFilter(filterOptions)

  const filterButtons = [
    {
      name: 'My tasks',
      onClick: async (index: number) => {
        handleFilterOptionsChange(FilterOptions.TYPE, IUTokenSchema.parse(tokenPayload)?.internalUserId)
        setActiveButtonIndex(index)
      },
      id: 'MyTasks',
    },
    {
      name: "My team's tasks",
      onClick: (index: number) => {
        handleFilterOptionsChange(FilterOptions.TYPE, FilterOptionsKeywords.TEAM)
        setActiveButtonIndex(index)
      },
      id: 'TeamTasks',
    },
    {
      name: 'Client tasks',
      onClick: (index: number) => {
        handleFilterOptionsChange(FilterOptions.TYPE, FilterOptionsKeywords.CLIENTS)
        setActiveButtonIndex(index)
      },
      id: 'ClientTasks',
    },
    {
      name: 'All tasks',
      onClick: (index: number) => {
        handleFilterOptionsChange(FilterOptions.TYPE, '')
        setActiveButtonIndex(index)
      },
      id: 'AllTasks',
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
                handleFilterOptionsChange(FilterOptions.ASSIGNEE, newValue.id as string)
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
                      handleFilterOptionsChange(FilterOptions.ASSIGNEE, 'none')
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
              buttonContent={
                <FilterByAssigneeBtn
                  assigneeValue={assigneeValue}
                  updateAssigneeValue={updateAssigneeValue}
                  handleClick={handleFilterOptionsChange}
                />
              }
            />
          </Stack>
          <Stack direction="row" alignItems="center" columnGap={3}>
            <SearchBar
              value={filterOptions.keyword}
              getSearchKeyword={(keyword) => {
                handleFilterOptionsChange(FilterOptions.KEYWORD, keyword)
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

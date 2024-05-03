'use client'

import { Avatar, Box, Stack, Typography } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useState } from 'react'
import store from '@/redux/store'
import { setFilteredAsignee, setFilteredTasks } from '@/redux/features/taskBoardSlice'
import SearchBar from '@/components/searchBar'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { useSelector } from 'react-redux'
import { IAssigneeCombined } from '@/types/interfaces'
import { FilterByAsigneeIcon } from '@/icons'
import { FilterByAssigneeBtn } from '../buttons/FilterByAssigneeBtn'

export const FilterBar = () => {
  const { assignee } = useSelector(selectTaskBoard)
  const [searchText, setSearchText] = useState('')

  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: assignee[0],
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  const assigneeValue = _assigneeValue as IAssigneeCombined

  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} py="18.5px">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" columnGap={3}>
            <Selector
              getSelectedValue={(_newValue) => {
                const newValue = _newValue as IAssigneeCombined
                updateAssigneeValue(newValue)
                store.dispatch(setFilteredAsignee(_newValue))
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
                      store.dispatch(setFilteredAsignee(e.currentTarget))
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

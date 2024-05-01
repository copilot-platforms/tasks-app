'use client'

import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useState } from 'react'
import store from '@/redux/store'
import { setFilteredTasks } from '@/redux/features/taskBoardSlice'
import SearchBar from '@/components/searchBar'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { useSelector } from 'react-redux'
import { IAssigneeCombined } from '@/types/interfaces'
import { CrossIcon, FilterByAsigneeIcon } from '@/icons'

export const FilterBar = ({}: {}) => {
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
                //additional logic to apply filter
              }}
              startIcon={<FilterByAsigneeIcon />}
              options={assignee}
              placeholder="Assignee"
              value={assigneeValue}
              selectorType={SelectorType.ASSIGNEE_SELECTOR}
              buttonContent={
                <Typography
                  variant="bodySm"
                  lineHeight="32px"
                  fontWeight={500}
                  fontSize="12px"
                  sx={{ color: (theme) => theme.color.gray[600] }}
                >
                  <Stack direction="row" alignItems="center" columnGap={1}>
                    <> Filter by</>
                    {assigneeValue?.name || assigneeValue?.givenName ? (
                      <Stack direction="row" alignItems="center" columnGap={1}>
                        <Avatar
                          alt="user"
                          src={
                            (assigneeValue as IAssigneeCombined).avatarImageUrl ||
                            (assigneeValue as IAssigneeCombined).iconImageUrl
                          }
                          sx={{ width: '20px', height: '20px' }}
                        />
                        {assigneeValue?.name || assigneeValue?.givenName}
                        <IconButton aria-label="remove" onClick={() => updateAssigneeValue({})}>
                          <CrossIcon />
                        </IconButton>
                      </Stack>
                    ) : (
                      <> assignee</>
                    )}
                  </Stack>
                </Typography>
              }
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

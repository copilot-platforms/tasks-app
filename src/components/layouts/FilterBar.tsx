'use client'

import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useState } from 'react'
import store from '@/redux/store'
import { setFilterOptions, setFilteredAssgineeList, setViewSettings } from '@/redux/features/taskBoardSlice'
import SearchBar from '@/components/searchBar'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { useSelector } from 'react-redux'
import {
  FilterByOptions,
  FilterOptions,
  FilterOptionsKeywords,
  IAssigneeCombined,
  IFilterOptions,
  View,
} from '@/types/interfaces'
import { FilterByAsigneeIcon } from '@/icons'
import { ViewModeSelector } from '../inputs/ViewModeSelector'
import { FilterByAssigneeBtn } from '../buttons/FilterByAssigneeBtn'
import FilterButtonGroup from '@/components/buttonsGroup/FilterButtonsGroup'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { useFilter } from '@/hooks/useFilter'
import { IUTokenSchema } from '@/types/common'
import { NoAssigneeExtraOptions } from '@/utils/noAssignee'
import ExtraOptionRendererAssignee from '@/components/inputs/ExtraOptionRendererAssignee'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'

export const FilterBar = ({
  updateViewModeSetting,
}: {
  updateViewModeSetting: (payload: CreateViewSettingsDTO) => void
}) => {
  const { view, filteredAssigneeList, filterOptions } = useSelector(selectTaskBoard)
  const handleFilterOptionsChange = async (optionType: FilterOptions, newValue: string | null) => {
    store.dispatch(setFilterOptions({ optionType, newValue }))
    const updatedFilterOptions = store.getState().taskBoard.filterOptions
    updateViewModeSetting({
      viewMode: view,
      filterOptions: {
        ...updatedFilterOptions,
        [optionType]: newValue,
      },
    })
  }

  const ButtonIndex =
    filterOptions.type == FilterOptionsKeywords.CLIENTS
      ? 2
      : filterOptions.type == FilterOptionsKeywords.TEAM
        ? 1
        : filterOptions.type == ''
          ? 3
          : 0

  const [noAssigneOptionFlag, setNoAssigneeOptionFlag] = useState<boolean>(true)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: filteredAssigneeList.find((item) => item.id == filterOptions.assignee),
    type: SelectorType.ASSIGNEE_SELECTOR,
  })
  useFilter(filterOptions)
  const filterButtons = [
    {
      name: 'My tasks',
      onClick: () => {
        handleFilterOptionsChange(FilterOptions.TYPE, IUTokenSchema.parse(tokenPayload)?.internalUserId)
        updateAssigneeValue(null)
        filterOptions.assignee !== '' && handleFilterOptionsChange(FilterOptions.ASSIGNEE, '')
      },
      id: 'MyTasks',
    },
    {
      name: "My team's tasks",
      onClick: () => {
        handleFilterOptionsChange(FilterOptions.TYPE, FilterOptionsKeywords.TEAM)
        updateAssigneeValue(null)
        setNoAssigneeOptionFlag(false)
        filterOptions.assignee !== '' && handleFilterOptionsChange(FilterOptions.ASSIGNEE, '')
      },
      id: 'TeamTasks',
    },
    {
      name: 'Client tasks',
      onClick: () => {
        handleFilterOptionsChange(FilterOptions.TYPE, FilterOptionsKeywords.CLIENTS)
        updateAssigneeValue(null)
        setNoAssigneeOptionFlag(false)
        filterOptions.assignee !== '' && handleFilterOptionsChange(FilterOptions.ASSIGNEE, '')
      },
      id: 'ClientTasks',
    },
    {
      name: 'All tasks',
      onClick: () => {
        handleFilterOptionsChange(FilterOptions.TYPE, '')
        updateAssigneeValue(null)
        setNoAssigneeOptionFlag(true)
        filterOptions.assignee !== '' && handleFilterOptionsChange(FilterOptions.ASSIGNEE, '')
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
      <Box>
        <AppMargin size={SizeofAppMargin.LARGE} py="14px">
          <Stack direction={'row'} justifyContent={'space-between'} sx={{ maxHeight: '32px' }}>
            <Stack direction={'row'} columnGap={3}>
              <Box>
                <FilterButtonGroup filterButtons={filterButtons} activeButtonIndex={ButtonIndex} />
              </Box>
              {filterOptions[FilterOptions.TYPE] !== tokenPayload?.internalUserId && (
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'none', sd: 'block' },
                  }}
                >
                  <Selector
                    getSelectedValue={(_newValue) => {
                      const newValue = _newValue as IAssigneeCombined
                      updateAssigneeValue(newValue)
                      handleFilterOptionsChange(FilterOptions.ASSIGNEE, newValue?.id as string)
                    }}
                    startIcon={<FilterByAsigneeIcon />}
                    options={filteredAssigneeList}
                    placeholder="Assignee"
                    value={assigneeValue}
                    selectorType={SelectorType.ASSIGNEE_SELECTOR}
                    extraOption={NoAssigneeExtraOptions}
                    extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
                      return (
                        noAssigneOptionFlag && (
                          <ExtraOptionRendererAssignee
                            props={props}
                            onClick={(e) => {
                              updateAssigneeValue({ id: '', name: 'No assignee' })
                              setAnchorEl(anchorEl ? null : e.currentTarget)
                              handleFilterOptionsChange(FilterOptions.ASSIGNEE, 'none')
                            }}
                          />
                        )
                      )
                    }}
                    buttonContent={
                      <FilterByAssigneeBtn
                        assigneeValue={assigneeValue}
                        updateAssigneeValue={updateAssigneeValue}
                        handleClick={handleFilterOptionsChange}
                      />
                    }
                    padding="2px 10px"
                  />
                </Box>
              )}
            </Stack>
            <Stack direction="row" alignItems="center" columnGap={3}>
              <Box
                sx={{
                  display: { xs: 'none', sd: 'block' },
                }}
              >
                <SearchBar
                  value={filterOptions.keyword}
                  getSearchKeyword={(keyword) => {
                    handleFilterOptionsChange(FilterOptions.KEYWORD, keyword)
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: { xs: 'none', sm: 'none', sd: 'block' },
                }}
              >
                <ViewModeSelector
                  selectedMode={view}
                  handleModeChange={(mode) => {
                    store.dispatch(setViewSettings({ viewMode: mode, filterOptions: filterOptions }))
                    updateViewModeSetting({ viewMode: mode, filterOptions: filterOptions })
                  }}
                />
              </Box>
            </Stack>
          </Stack>
        </AppMargin>
      </Box>
      <AppMargin size={SizeofAppMargin.LARGE}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ display: { sm: 'flex', sd: 'none' }, mb: { xs: '12px', md: '0px' } }}
        >
          <Selector
            getSelectedValue={(_newValue) => {
              const newValue = _newValue as IAssigneeCombined
              updateAssigneeValue(newValue)
              handleFilterOptionsChange(FilterOptions.ASSIGNEE, newValue.id as string)
            }}
            startIcon={<FilterByAsigneeIcon />}
            options={filteredAssigneeList}
            placeholder="Assignee"
            value={assigneeValue}
            selectorType={SelectorType.ASSIGNEE_SELECTOR}
            extraOption={NoAssigneeExtraOptions}
            extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
              return (
                <ExtraOptionRendererAssignee
                  props={props}
                  onClick={(e) => {
                    updateAssigneeValue({ id: '', name: 'No assignee' })
                    setAnchorEl(anchorEl ? null : e.currentTarget)
                    handleFilterOptionsChange(FilterOptions.ASSIGNEE, 'none')
                  }}
                />
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
          <Stack direction={'row'} columnGap={2}>
            <Box
              sx={{
                display: { xs: 'block', sd: 'none', md: 'none' },
              }}
            >
              <SearchBar
                value={filterOptions.keyword}
                getSearchKeyword={(keyword) => {
                  handleFilterOptionsChange(FilterOptions.KEYWORD, keyword)
                }}
              />
            </Box>

            <ViewModeSelector
              selectedMode={view}
              handleModeChange={(mode) => {
                store.dispatch(setViewSettings({ viewMode: mode, filterOptions: filterOptions }))
                updateViewModeSetting({ viewMode: mode, filterOptions: filterOptions })
              }}
            />
          </Stack>
        </Stack>
      </AppMargin>
    </Box>
  )
}

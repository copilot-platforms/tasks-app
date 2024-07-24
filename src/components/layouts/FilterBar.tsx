'use client'

import { Box, CircularProgress, Stack } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useState } from 'react'
import store from '@/redux/store'
import { setFilterOptions, setViewSettings } from '@/redux/features/taskBoardSlice'
import SearchBar from '@/components/searchBar'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { useSelector } from 'react-redux'
import { FilterByOptions, FilterOptions, FilterOptionsKeywords, IAssigneeCombined } from '@/types/interfaces'
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
import { z } from 'zod'
import { setDebouncedFilteredAssignees } from '@/utils/users'
import { MiniLoader } from '@/components/atoms/MiniLoader'

export const FilterBar = ({
  updateViewModeSetting,
}: {
  updateViewModeSetting: (payload: CreateViewSettingsDTO) => void
}) => {
  const [activeDebounceTimeoutId, setActiveDebounceTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const { view, filteredAssigneeList, filterOptions, assignee, token } = useSelector(selectTaskBoard)
  const [filteredAssignee, setFilteredAssignee] = useState(filteredAssigneeList)
  const [loading, setLoading] = useState(false)

  const handleFilterOptionsChange = async (optionType: FilterOptions, newValue: string | null) => {
    store.dispatch(setFilterOptions({ optionType, newValue }))
    newValue == FilterOptionsKeywords.CLIENTS
      ? setFilteredAssignee(assignee.filter((el) => el.type == FilterByOptions.CLIENT || el.type == FilterByOptions.COMPANY))
      : newValue == FilterOptionsKeywords.TEAM
        ? setFilteredAssignee(assignee.filter((el) => el.type == FilterByOptions.IUS))
        : newValue == ''
          ? setFilteredAssignee(assignee)
          : setFilteredAssignee(assignee) //FilteredAssignee is also updated in the component's state and used in Selector's autocomplete to mitigate the time taken to update the store and fetch values to the Selector's autocomplete.
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
    item:
      filterOptions.assignee == 'No assignee'
        ? NoAssigneeExtraOptions
        : filteredAssigneeList.find((item) => item.id == filterOptions.assignee),
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
        borderBottom: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
      }}
    >
      <Box sx={{ overflowX: 'hidden', padding: { xs: '12px 22px', sm: '12px 24px' } }}>
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
                  options={loading ? [] : filteredAssignee}
                  placeholder="Assignee"
                  value={assigneeValue}
                  selectorType={SelectorType.ASSIGNEE_SELECTOR}
                  extraOption={NoAssigneeExtraOptions}
                  extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
                    return (
                      noAssigneOptionFlag && (
                        <>
                          {/* //****Disabling re-assignment completely for now*** */}
                          {/* <ExtraOptionRendererAssignee
                              props={props}
                              onClick={(e) => {
                                updateAssigneeValue({ id: '', name: 'No assignee' })
                                setAnchorEl(anchorEl ? null : e.currentTarget)
                                handleFilterOptionsChange(FilterOptions.ASSIGNEE, 'No assignee')
                              }}
                            /> */}
                          {loading && <MiniLoader />}
                        </>
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
                  handleInputChange={async (newInputValue: string) => {
                    if (!newInputValue) {
                      setFilteredAssignee(filteredAssigneeList)
                      return
                    }

                    setDebouncedFilteredAssignees(
                      activeDebounceTimeoutId,
                      setActiveDebounceTimeoutId,
                      setLoading,
                      setFilteredAssignee,
                      z.string().parse(token),
                      newInputValue,
                    )
                  }}
                  filterOption={(x: unknown) => x}
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
      </Box>
      <AppMargin size={SizeofAppMargin.LARGE}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ display: { sm: 'flex', sd: 'none' }, mb: { xs: '12px', md: '0px' }, maxHeight: '30px' }}
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
                    handleFilterOptionsChange(FilterOptions.ASSIGNEE, 'No assignee')
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

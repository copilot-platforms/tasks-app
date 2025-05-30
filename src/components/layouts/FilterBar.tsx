'use client'

import { Box, IconButton, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import store from '@/redux/store'
import { setFilterOptions, setViewSettingsTemp, setViewSettings, setIsTasksLoading } from '@/redux/features/taskBoardSlice'
import SearchBar from '@/components/searchBar'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { useSelector } from 'react-redux'
import {
  FilterOptions,
  FilterOptionsKeywords,
  IAssigneeCombined,
  IFilterOptions,
  HandleSelectorComponentModes,
} from '@/types/interfaces'
import { CrossIcon, FilterByAsigneeIcon } from '@/icons'
import { FilterByAssigneeBtn } from '../buttons/FilterByAssigneeBtn'
import FilterButtonGroup from '@/components/buttonsGroup/FilterButtonsGroup'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { useFilter } from '@/hooks/useFilter'
import { IUTokenSchema } from '@/types/common'
import { NoAssigneeExtraOptions, NoDataFoundOption } from '@/utils/noAssignee'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { z } from 'zod'
import { setDebouncedFilteredAssignees } from '@/utils/users'
import { MiniLoader } from '@/components/atoms/MiniLoader'
import { checkAssignee } from '@/utils/assignee'
import { filterOptionsToAssigneeMap, filterTypeToButtonIndexMap } from '@/types/objectMaps'
import { UserRole } from '@/app/api/core/types/user'
import { DisplaySelector } from '@/components/inputs/DisplaySelector'

interface FilterBarProps {
  mode: UserRole
  updateViewModeSetting: (payload: CreateViewSettingsDTO) => void
}
export const FilterBar = ({ mode, updateViewModeSetting }: FilterBarProps) => {
  const [activeDebounceTimeoutId, setActiveDebounceTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const { view, filteredAssigneeList, filterOptions, assignee, token, viewSettingsTemp, showArchived, showUnarchived } =
    useSelector(selectTaskBoard)
  const [filteredAssignee, setFilteredAssignee] = useState(filteredAssigneeList)
  const [loading, setLoading] = useState(false)
  const viewMode = viewSettingsTemp ? viewSettingsTemp.viewMode : view
  const archivedOptions = {
    showArchived: viewSettingsTemp ? viewSettingsTemp.showArchived : showArchived,
    showUnarchived: viewSettingsTemp ? viewSettingsTemp.showUnarchived : showUnarchived,
  }

  const viewModeFilterOptions = viewSettingsTemp ? (viewSettingsTemp.filterOptions as IFilterOptions) : filterOptions //ViewSettingsTemp used to apply temp values of viewSettings in filterOptions and viewMode because clientSideUpdate applies outdated cached values to original view and filterOptions if navigated

  // Stores the initial assignee list for a particular filter type
  const [initialAssignees, setInitialAssignees] = useState(filteredAssignee)
  const [inputStatusValue, setInputStatusValue] = useState('')

  useEffect(() => {
    setFilteredAssignee(filteredAssigneeList)
  }, [filteredAssigneeList]) //to prevent filteredAssignee not updating when filteredAssigneeList changes when fetching assignee is delayed

  useEffect(() => {
    // Base these initial values off of first fetch of filteredAssignee
    if (!initialAssignees.length) {
      setInitialAssignees(filteredAssignee)
    }
    // When focus is taken away from selector, make sure that assignee search results are replaced
    if (filteredAssignee.length && initialAssignees.length && !inputStatusValue) {
      loading && setLoading(false)
      setFilteredAssignee(initialAssignees)
    }
  }, [initialAssignees, filteredAssignee, inputStatusValue])

  const handleFilterOptionsChange = async (optionType: FilterOptions, newValue: string | null) => {
    store.dispatch(setFilterOptions({ optionType, newValue }))
    if (optionType === FilterOptions.TYPE) {
      const filterFunction = filterOptionsToAssigneeMap[newValue as string] || filterOptionsToAssigneeMap.default
      setFilteredAssignee(filterFunction(assignee))
      const newAssignees = filterFunction(assignee)
      setInitialAssignees(newAssignees)
    }

    //FilteredAssignee is also updated in the component's state and used in Selector's autocomplete to mitigate the time taken to update the store and fetch values to the Selector's autocomplete.
    const updatedFilterOptions = viewSettingsTemp
      ? (store.getState().taskBoard.viewSettingsTemp?.filterOptions as IFilterOptions)
      : store.getState().taskBoard.filterOptions

    store.dispatch(
      setViewSettingsTemp({
        viewMode: view,
        filterOptions: { ...updatedFilterOptions, [optionType]: newValue },
        showArchived: showArchived,
        showUnarchived: showUnarchived,
      }),
    )
    updateViewModeSetting({
      viewMode: view,
      filterOptions: {
        ...updatedFilterOptions,
        [optionType]: newValue,
      },
      showArchived: showArchived,
      showUnarchived: showUnarchived,
    })
  }

  const ButtonIndex = filterTypeToButtonIndexMap[viewModeFilterOptions.type] ?? 0

  const [noAssigneOptionFlag, setNoAssigneeOptionFlag] = useState<boolean>(true)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item:
      viewModeFilterOptions.assignee == 'No assignee'
        ? NoAssigneeExtraOptions
        : filteredAssigneeList.find((item) => item.id == viewModeFilterOptions.assignee),
    type: SelectorType.ASSIGNEE_SELECTOR,
    mode: HandleSelectorComponentModes.CreateTaskFieldUpdate,
  })
  const filterButtons = [
    {
      name: 'My tasks',
      onClick: () => {
        const selfAssigneeId = IUTokenSchema.parse(tokenPayload).internalUserId
        handleFilterOptionsChange(FilterOptions.TYPE, selfAssigneeId)
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
        borderTop: 'none',
      }}
    >
      <Box
        sx={{
          overflowX: 'hidden',
          padding: '12px 20px',
          display: { xs: 'none', sm: 'none', sd: 'block' },
        }}
      >
        <Stack direction={'row'} justifyContent={'space-between'} sx={{ maxHeight: '32px' }}>
          <Stack direction={'row'} columnGap={3}>
            {mode === UserRole.IU && (
              <>
                <FilterButtonGroup filterButtons={filterButtons} activeButtonIndex={ButtonIndex} />
                {filterOptions[FilterOptions.TYPE] !== tokenPayload?.internalUserId && (
                  <Box
                    sx={{
                      display: { xs: 'none', sm: 'none', sd: 'block' },
                    }}
                  >
                    <Selector
                      inputStatusValue={inputStatusValue}
                      setInputStatusValue={setInputStatusValue}
                      getSelectedValue={(_newValue) => {
                        const newValue = _newValue as IAssigneeCombined
                        updateAssigneeValue(newValue)
                        handleFilterOptionsChange(FilterOptions.ASSIGNEE, newValue?.id as string)
                      }}
                      startIcon={<FilterByAsigneeIcon />}
                      endIcon={
                        checkAssignee(assigneeValue) && (
                          <IconButton
                            aria-label="remove"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateAssigneeValue(null)
                              handleFilterOptionsChange(FilterOptions.ASSIGNEE, '')
                            }}
                            sx={{
                              cursor: 'default',
                              borderRadius: 0,
                              padding: '6px 5px 6px 6px',

                              '&:hover': {
                                bgcolor: (theme) => theme.color.gray[100],
                              },
                            }}
                            disableRipple
                            disableTouchRipple
                          >
                            <CrossIcon />
                          </IconButton>
                        )
                      }
                      options={loading ? [] : filteredAssignee.length ? filteredAssignee : [NoDataFoundOption]}
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
                      buttonContent={<FilterByAssigneeBtn assigneeValue={assigneeValue} />}
                      padding="2px 10px 2px 10px"
                      handleInputChange={async (newInputValue: string) => {
                        if (!newInputValue) {
                          setFilteredAssignee(initialAssignees)
                          return
                        }

                        setDebouncedFilteredAssignees(
                          activeDebounceTimeoutId,
                          setActiveDebounceTimeoutId,
                          setLoading,
                          setFilteredAssignee,
                          z.string().parse(token),
                          newInputValue,
                          filterOptions.type,
                        )
                      }}
                      filterOption={(x: unknown) => x}
                    />
                  </Box>
                )}
              </>
            )}
          </Stack>
          <Stack direction="row" alignItems="center" columnGap={3}>
            <SearchBar
              value={viewModeFilterOptions.keyword}
              getSearchKeyword={(keyword) => {
                handleFilterOptionsChange(FilterOptions.KEYWORD, keyword)
              }}
              onClear={() => {
                handleFilterOptionsChange(FilterOptions.KEYWORD, '')
              }}
            />
            <DisplaySelector
              selectedMode={viewMode}
              handleModeChange={(mode) => {
                store.dispatch(
                  setViewSettings({
                    viewMode: mode,
                    filterOptions: filterOptions,
                    showArchived: showArchived,
                    showUnarchived: showUnarchived,
                  }),
                )
                updateViewModeSetting({
                  viewMode: mode,
                  filterOptions: filterOptions,
                  showArchived: showArchived,
                  showUnarchived: showUnarchived,
                })
                store.dispatch(
                  setViewSettingsTemp({
                    viewMode: mode,
                    filterOptions: viewModeFilterOptions,
                    showArchived: showArchived,
                    showUnarchived: showUnarchived,
                  }),
                )
              }}
              archivedOptions={archivedOptions}
              handleArchivedOptionsChange={(archivedOptions) => {
                store.dispatch(setIsTasksLoading(true))
                store.dispatch(
                  setViewSettings({
                    viewMode: viewMode,
                    filterOptions: filterOptions,
                    showArchived: archivedOptions.showArchived,
                    showUnarchived: archivedOptions.showUnarchived,
                  }),
                )
                updateViewModeSetting({
                  viewMode: viewMode,
                  filterOptions: filterOptions,
                  showArchived: archivedOptions.showArchived,
                  showUnarchived: archivedOptions.showUnarchived,
                })
                store.dispatch(
                  setViewSettingsTemp({
                    viewMode: viewMode,
                    filterOptions: filterOptions,
                    showArchived: archivedOptions.showArchived,
                    showUnarchived: archivedOptions.showUnarchived,
                  }),
                )
              }}
            />
          </Stack>
        </Stack>
      </Box>
      <Box sx={{ padding: '12px 20px', display: { sm: 'block', sd: 'none' } }}>
        <Stack direction="column" rowGap={'8px'}>
          {mode === UserRole.IU && <FilterButtonGroup filterButtons={filterButtons} activeButtonIndex={ButtonIndex} />}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              '@media (max-width: 368px)': {
                flexWrap: 'wrap',
                height: 'auto',
              },
              rowGap: '8px',
              columnGap: '8px',
            }}
          >
            <Box>
              {filterOptions[FilterOptions.TYPE] !== tokenPayload?.internalUserId && mode === UserRole.IU && (
                <Selector
                  inputStatusValue={inputStatusValue}
                  setInputStatusValue={setInputStatusValue}
                  getSelectedValue={(_newValue) => {
                    const newValue = _newValue as IAssigneeCombined
                    updateAssigneeValue(newValue)
                    handleFilterOptionsChange(FilterOptions.ASSIGNEE, newValue?.id as string)
                  }}
                  startIcon={<FilterByAsigneeIcon />}
                  endIcon={
                    checkAssignee(assigneeValue) && (
                      <IconButton
                        aria-label="remove"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateAssigneeValue(null)
                          handleFilterOptionsChange(FilterOptions.ASSIGNEE, '')
                        }}
                        sx={{
                          cursor: 'default',
                          borderRadius: 0,
                          padding: '6px 5px 6px 6px',

                          '&:hover': {
                            bgcolor: (theme) => theme.color.gray[100],
                          },
                        }}
                        disableRipple
                        disableTouchRipple
                      >
                        <CrossIcon />
                      </IconButton>
                    )
                  }
                  options={loading ? [] : filteredAssignee.length ? filteredAssignee : [NoDataFoundOption]}
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
                  buttonContent={<FilterByAssigneeBtn assigneeValue={assigneeValue} />}
                  padding="2px 10px 2px 10px"
                  handleInputChange={async (newInputValue: string) => {
                    if (!newInputValue) {
                      setFilteredAssignee(initialAssignees)
                      return
                    }

                    setDebouncedFilteredAssignees(
                      activeDebounceTimeoutId,
                      setActiveDebounceTimeoutId,
                      setLoading,
                      setFilteredAssignee,
                      z.string().parse(token),
                      newInputValue,
                      filterOptions.type,
                    )
                  }}
                  filterOption={(x: unknown) => x}
                />
              )}
            </Box>
            <Stack direction={'row'} columnGap={2}>
              <SearchBar
                value={viewModeFilterOptions.keyword}
                getSearchKeyword={(keyword) => {
                  handleFilterOptionsChange(FilterOptions.KEYWORD, keyword)
                }}
                onClear={() => {
                  handleFilterOptionsChange(FilterOptions.KEYWORD, '')
                }}
              />
              <DisplaySelector
                mobileView
                selectedMode={viewMode}
                handleModeChange={(mode) => {
                  store.dispatch(
                    setViewSettings({
                      viewMode: mode,
                      filterOptions: filterOptions,
                      showArchived: showArchived,
                      showUnarchived: showUnarchived,
                    }),
                  )
                  updateViewModeSetting({
                    viewMode: mode,
                    filterOptions: filterOptions,
                    showArchived: showArchived,
                    showUnarchived: showUnarchived,
                  })
                  store.dispatch(
                    setViewSettingsTemp({
                      viewMode: mode,
                      filterOptions: viewModeFilterOptions,
                      showArchived: showArchived,
                      showUnarchived: showUnarchived,
                    }),
                  )
                }}
                archivedOptions={archivedOptions}
                handleArchivedOptionsChange={(archivedOptions) => {
                  store.dispatch(setIsTasksLoading(true))
                  store.dispatch(
                    setViewSettings({
                      viewMode: viewMode,
                      filterOptions: filterOptions,
                      showArchived: archivedOptions.showArchived,
                      showUnarchived: archivedOptions.showUnarchived,
                    }),
                  )
                  updateViewModeSetting({
                    viewMode: viewMode,
                    filterOptions: filterOptions,
                    showArchived: archivedOptions.showArchived,
                    showUnarchived: archivedOptions.showUnarchived,
                  })
                  store.dispatch(
                    setViewSettingsTemp({
                      viewMode: viewMode,
                      filterOptions: filterOptions,
                      showArchived: archivedOptions.showArchived,
                      showUnarchived: archivedOptions.showUnarchived,
                    }),
                  )
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}

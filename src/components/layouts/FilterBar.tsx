'use client'

import { UserRole } from '@/app/api/core/types/user'
import FilterButtonGroup from '@/components/buttonsGroup/FilterButtonsGroup'
import { CopilotSelector } from '@/components/inputs/CopilotSelector'
import { DisplaySelector } from '@/components/inputs/DisplaySelector'
import { SelectorType } from '@/components/inputs/Selector'
import SearchBar from '@/components/searchBar'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import {
  selectTaskBoard,
  setFilterOptions,
  setIsTasksLoading,
  setViewSettings,
  setViewSettingsTemp,
} from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { IUTokenSchema } from '@/types/common'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import {
  FilterOptions,
  FilterOptionsKeywords,
  HandleSelectorComponentModes,
  IAssigneeCombined,
  IFilterOptions,
} from '@/types/interfaces'
import { filterOptionsToAssigneeMap, filterTypeToButtonIndexMap } from '@/types/objectMaps'
import { getAssigneeId } from '@/utils/assignee'
import { getSelectedUserIds } from '@/utils/getSelectedUserIds'
import { NoAssigneeExtraOptions } from '@/utils/noAssignee'
import { Box, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

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
                    <CopilotSelector
                      name="Filter by assignee"
                      onChange={(inputValue) => {
                        const newUserIds = getSelectedUserIds(inputValue)
                        const newAssignee = getAssigneeId(newUserIds)
                        if (newAssignee) {
                          handleFilterOptionsChange(FilterOptions.ASSIGNEE, newAssignee)
                        } else {
                          handleFilterOptionsChange(FilterOptions.ASSIGNEE, '')
                        }
                      }}
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
                <CopilotSelector
                  name="Filter by assignee"
                  onChange={(inputValue) => {
                    const newUserIds = getSelectedUserIds(inputValue)
                    const newAssignee = getAssigneeId(newUserIds)
                    if (newAssignee) {
                      handleFilterOptionsChange(FilterOptions.ASSIGNEE, newAssignee)
                    }
                  }}
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

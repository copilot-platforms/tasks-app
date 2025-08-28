'use client'

import { UserRole } from '@/app/api/core/types/user'
import { FilterByAssigneeBtn } from '@/components/buttons/FilterByAssigneeBtn'
import { SelectorButton } from '@/components/buttons/SelectorButton'
import FilterButtonGroup from '@/components/buttonsGroup/FilterButtonsGroup'
import { CopilotPopSelector } from '@/components/inputs/CopilotSelector'
import { DisplaySelector } from '@/components/inputs/DisplaySelector'
import SearchBar from '@/components/searchBar'
import { CrossIcon, FilterByAsigneeIcon } from '@/icons'
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
import { CreateViewSettingsDTO, DisplayOptions } from '@/types/dto/viewSettings.dto'
import { FilterOptions, FilterOptionsKeywords, IFilterOptions, UserIds } from '@/types/interfaces'
import { filterTypeToButtonIndexMap } from '@/types/objectMaps'
import { checkAssignee, emptyAssignee, getAssigneeId, UserIdsType } from '@/utils/assignee'
import { getWorkspaceLabels } from '@/utils/getWorkspaceLabels'
import { NoAssignee } from '@/utils/noAssignee'
import { getSelectedUserIds, getSelectorAssignee, getSelectorAssigneeFromFilterOptions } from '@/utils/selector'
import { Box, IconButton, Stack } from '@mui/material'
import { useState } from 'react'
import { useSelector } from 'react-redux'

interface FilterBarProps {
  mode: UserRole
  updateViewModeSetting: (payload: CreateViewSettingsDTO) => void
}

export const FilterBar = ({ mode, updateViewModeSetting }: FilterBarProps) => {
  const { view, filterOptions, assignee, viewSettingsTemp, showArchived, showUnarchived, showSubtasks } =
    useSelector(selectTaskBoard)

  const viewMode = viewSettingsTemp ? viewSettingsTemp.viewMode : view
  const displayOptions = {
    showArchived: viewSettingsTemp ? viewSettingsTemp.showArchived : showArchived,
    showUnarchived: viewSettingsTemp ? viewSettingsTemp.showUnarchived : showUnarchived,
    showSubtasks: viewSettingsTemp ? viewSettingsTemp.showSubtasks : showSubtasks,
  }

  const viewModeFilterOptions = viewSettingsTemp ? (viewSettingsTemp.filterOptions as IFilterOptions) : filterOptions //ViewSettingsTemp used to apply temp values of viewSettings in filterOptions and viewMode because clientSideUpdate applies outdated cached values to original view and filterOptions if navigated

  const handleFilterOptionsChange = async (optionType: FilterOptions, newValue: string | null | UserIdsType) => {
    store.dispatch(setFilterOptions({ optionType, newValue }))
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
        showSubtasks: showSubtasks,
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
      showSubtasks: showSubtasks,
    })
  }

  const ButtonIndex = filterTypeToButtonIndexMap[viewModeFilterOptions.type] ?? 0

  const [noAssigneOptionFlag, setNoAssigneeOptionFlag] = useState<boolean>(true)

  const { tokenPayload, workspace } = useSelector(selectAuthDetails)

  const [assigneeValue, setAssigneeValue] = useState(
    viewModeFilterOptions.assignee[UserIds.INTERNAL_USER_ID] == 'No assignee'
      ? NoAssignee
      : getSelectorAssigneeFromFilterOptions(assignee, viewModeFilterOptions.assignee),
  )

  const handleDisplayOptionsChange = (displayOptions: DisplayOptions) => {
    store.dispatch(setIsTasksLoading(true))
    const newViewSettings = {
      viewMode,
      filterOptions,
      ...displayOptions,
    }
    store.dispatch(setViewSettings(newViewSettings))
    updateViewModeSetting(newViewSettings)
    store.dispatch(setViewSettingsTemp(newViewSettings))
  }

  const filterButtons = [
    {
      name: 'My tasks',
      onClick: () => {
        const selfAssigneeId = IUTokenSchema.parse(tokenPayload).internalUserId
        handleFilterOptionsChange(FilterOptions.TYPE, selfAssigneeId)
        setAssigneeValue(undefined)
        handleFilterOptionsChange(FilterOptions.ASSIGNEE, emptyAssignee)
      },
      id: 'MyTasks',
    },
    {
      name: "My team's tasks",
      onClick: () => {
        handleFilterOptionsChange(FilterOptions.TYPE, FilterOptionsKeywords.TEAM)
        setAssigneeValue(undefined)
        setNoAssigneeOptionFlag(false)
        handleFilterOptionsChange(FilterOptions.ASSIGNEE, emptyAssignee)
      },
      id: 'TeamTasks',
    },
    {
      name: `${getWorkspaceLabels(workspace, true).individualTerm} tasks`,
      onClick: () => {
        handleFilterOptionsChange(FilterOptions.TYPE, FilterOptionsKeywords.CLIENTS)
        setAssigneeValue(undefined)
        setNoAssigneeOptionFlag(false)
        handleFilterOptionsChange(FilterOptions.ASSIGNEE, emptyAssignee)
      },
      id: 'ClientTasks',
    },
    {
      name: 'All tasks',
      onClick: () => {
        handleFilterOptionsChange(FilterOptions.TYPE, '')
        setAssigneeValue(undefined)
        setNoAssigneeOptionFlag(true)
        handleFilterOptionsChange(FilterOptions.ASSIGNEE, emptyAssignee)
      },
      id: 'AllTasks',
    },
  ]

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
                    <CopilotPopSelector
                      hideClientsList={filterOptions[FilterOptions.TYPE] === FilterOptionsKeywords.TEAM}
                      hideIusList={filterOptions[FilterOptions.TYPE] === FilterOptionsKeywords.CLIENTS}
                      initialValue={assigneeValue}
                      buttonContent={
                        <SelectorButton
                          startIcon={<FilterByAsigneeIcon />}
                          endIcon={
                            checkAssignee(assigneeValue) && (
                              <IconButton
                                aria-label="remove"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setAssigneeValue(undefined)
                                  handleFilterOptionsChange(FilterOptions.ASSIGNEE, emptyAssignee)
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
                          buttonContent={<FilterByAssigneeBtn assigneeValue={assigneeValue} />}
                        />
                      }
                      name="Filter by assignee"
                      onChange={(inputValue) => {
                        const newUserIds = getSelectedUserIds(inputValue)
                        const newAssignee = getAssigneeId(newUserIds)
                        if (newAssignee) {
                          setAssigneeValue(getSelectorAssignee(assignee, inputValue))
                          handleFilterOptionsChange(FilterOptions.ASSIGNEE, newUserIds)
                        } else {
                          setAssigneeValue(undefined)
                          handleFilterOptionsChange(FilterOptions.ASSIGNEE, emptyAssignee)
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
                    filterOptions,
                    showArchived,
                    showUnarchived,
                    showSubtasks,
                  }),
                )
                updateViewModeSetting({
                  viewMode: mode,
                  filterOptions,
                  showArchived,
                  showUnarchived,
                  showSubtasks,
                })
                store.dispatch(
                  setViewSettingsTemp({
                    viewMode: mode,
                    filterOptions,
                    showArchived,
                    showUnarchived,
                    showSubtasks,
                  }),
                )
              }}
              displayOptions={displayOptions}
              handleDisplayOptionsChange={handleDisplayOptionsChange}
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
                <CopilotPopSelector
                  hideClientsList={filterOptions[FilterOptions.TYPE] === FilterOptionsKeywords.TEAM}
                  hideIusList={filterOptions[FilterOptions.TYPE] === FilterOptionsKeywords.CLIENTS}
                  initialValue={assigneeValue}
                  buttonContent={
                    <SelectorButton
                      startIcon={<FilterByAsigneeIcon />}
                      endIcon={
                        checkAssignee(assigneeValue) && (
                          <IconButton
                            aria-label="remove"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setAssigneeValue(undefined)
                              handleFilterOptionsChange(FilterOptions.ASSIGNEE, emptyAssignee)
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
                      buttonContent={<FilterByAssigneeBtn assigneeValue={assigneeValue} />}
                    />
                  }
                  name="Filter by assignee"
                  onChange={(inputValue) => {
                    const newUserIds = getSelectedUserIds(inputValue)
                    const newAssignee = getAssigneeId(newUserIds)
                    if (newAssignee) {
                      setAssigneeValue(getSelectorAssignee(assignee, inputValue))
                      handleFilterOptionsChange(FilterOptions.ASSIGNEE, newUserIds)
                    } else {
                      setAssigneeValue(undefined)
                      handleFilterOptionsChange(FilterOptions.ASSIGNEE, emptyAssignee)
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
                      showSubtasks: showSubtasks,
                    }),
                  )
                  updateViewModeSetting({
                    viewMode: mode,
                    filterOptions: filterOptions,
                    showArchived: showArchived,
                    showUnarchived: showUnarchived,
                    showSubtasks: showSubtasks,
                  })
                  store.dispatch(
                    setViewSettingsTemp({
                      viewMode: mode,
                      filterOptions: viewModeFilterOptions,
                      showArchived: showArchived,
                      showUnarchived: showUnarchived,
                      showSubtasks: showSubtasks,
                    }),
                  )
                }}
                displayOptions={displayOptions}
                handleDisplayOptionsChange={handleDisplayOptionsChange}
              />
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}

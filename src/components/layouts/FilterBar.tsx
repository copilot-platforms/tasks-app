'use client'

import FilterButtonGroup from '@/components/buttonsGroup/FilterButtonsGroup'
import { DisplaySelector } from '@/components/inputs/DisplaySelector'
import SearchBar from '@/components/searchBar'
import { useFilterBar } from '@/hooks/useFilterBar'
import { AddLargeIcon } from '@/icons'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { setShowModal } from '@/redux/features/createTaskSlice'
import { selectTaskBoard, setIsTasksLoading, setViewSettings, setViewSettingsTemp } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { IUTokenSchema } from '@/types/common'
import { DisplayOptions } from '@/types/dto/viewSettings.dto'
import { FilterOptions, FilterOptionsKeywords, IAssigneeCombined, IFilterOptions, UserIds } from '@/types/interfaces'
import {
  clientFilterTypeToButtonIndexMap,
  filterTypeToButtonIndexMap,
  previewFilterTypeToButtonIndexMap,
} from '@/types/objectMaps'
import { emptyAssignee, UserIdsType } from '@/utils/assignee'
import { getWorkspaceLabels } from '@/utils/getWorkspaceLabels'
import { NoAssignee } from '@/utils/noAssignee'
import { getSelectorAssigneeFromFilterOptions } from '@/utils/selector'
import { UserRole } from '@api/core/types/user'
import { Box, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { IconBtn } from '../buttons/IconBtn'

interface FilterBarProps {
  mode: UserRole
}

export const FilterBar = ({ mode }: FilterBarProps) => {
  const { view, filterOptions, assignee, viewSettingsTemp, showArchived, showUnarchived, showSubtasks, previewMode } =
    useSelector(selectTaskBoard)

  const { updateViewModeSetting, handleFilterOptionsChange } = useFilterBar()

  const viewMode = viewSettingsTemp ? viewSettingsTemp.viewMode : view
  const displayOptions = {
    showArchived: viewSettingsTemp ? viewSettingsTemp.showArchived : showArchived,
    showUnarchived: viewSettingsTemp ? viewSettingsTemp.showUnarchived : showUnarchived,
    showSubtasks: viewSettingsTemp ? viewSettingsTemp.showSubtasks : showSubtasks,
  }

  const viewModeFilterOptions = viewSettingsTemp ? (viewSettingsTemp.filterOptions as IFilterOptions) : filterOptions //ViewSettingsTemp used to apply temp values of viewSettings in filterOptions and viewMode because clientSideUpdate applies outdated cached values to original view and filterOptions if navigated

  const ButtonIndex = previewMode
    ? (previewFilterTypeToButtonIndexMap[viewModeFilterOptions.type] ?? 0)
    : mode === UserRole.IU
      ? (filterTypeToButtonIndexMap[viewModeFilterOptions.type] ?? 0)
      : (clientFilterTypeToButtonIndexMap[viewModeFilterOptions.type] ?? 0)

  const { tokenPayload, workspace } = useSelector(selectAuthDetails)

  const [assigneeValue, setAssigneeValue] = useState<IAssigneeCombined | undefined>()

  useEffect(() => {
    if (
      !viewModeFilterOptions.assignee[UserIds.INTERNAL_USER_ID] &&
      !viewModeFilterOptions.assignee[UserIds.CLIENT_ID] &&
      !!viewModeFilterOptions.assignee[UserIds.COMPANY_ID]
    )
      return
    setAssigneeValue(
      viewModeFilterOptions.assignee[UserIds.INTERNAL_USER_ID] == 'No assignee'
        ? NoAssignee
        : getSelectorAssigneeFromFilterOptions(assignee, viewModeFilterOptions.assignee),
    )
  }, [viewModeFilterOptions.assignee])

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

  // handles click on filter by type buttons
  const handleFilterTypeClick = ({ filterTypeValue }: { filterTypeValue: string | null | UserIdsType }) => {
    let filterValue = filterTypeValue
    handleFilterOptionsChange(FilterOptions.TYPE, filterValue)

    // empty assignee filter option
    setAssigneeValue(undefined)
    handleFilterOptionsChange(FilterOptions.ASSIGNEE, emptyAssignee)
  }

  const IuFilterButtons = [
    {
      name: 'My tasks',
      onClick: () => handleFilterTypeClick({ filterTypeValue: IUTokenSchema.parse(tokenPayload).internalUserId }),
      id: 'MyTasks',
    },
    {
      name: 'Team tasks',
      onClick: () => handleFilterTypeClick({ filterTypeValue: FilterOptionsKeywords.TEAM }),
      id: 'TeamTasks',
    },
    {
      name: `${getWorkspaceLabels(workspace, true).individualTerm} tasks`,
      onClick: () => handleFilterTypeClick({ filterTypeValue: FilterOptionsKeywords.CLIENTS }),
      id: 'ClientTasks',
    },
    {
      name: 'All tasks',
      onClick: () => handleFilterTypeClick({ filterTypeValue: '' }),
      id: 'AllTasks',
    },
  ]

  const CuFilterButtons = [
    {
      name: 'All tasks',
      onClick: () => handleFilterTypeClick({ filterTypeValue: FilterOptionsKeywords.CLIENT_WITH_VIEWERS }),
      id: 'AllTasks',
    },
    {
      name: 'My tasks',
      onClick: () => handleFilterTypeClick({ filterTypeValue: FilterOptionsKeywords.CLIENTS }),
      id: 'MyTasks',
    },
  ]

  const previewFilterButtons = [
    {
      name: 'My tasks',
      onClick: () => {
        handleFilterTypeClick({ filterTypeValue: IUTokenSchema.parse(tokenPayload).internalUserId })
      },
      id: 'MyTasks',
    },
    {
      name: 'Team tasks',
      onClick: () => handleFilterTypeClick({ filterTypeValue: FilterOptionsKeywords.TEAM }),
      id: 'TeamTasks',
    },
    {
      name: `${getWorkspaceLabels(workspace, true).individualTerm} tasks`,
      onClick: () => handleFilterTypeClick({ filterTypeValue: FilterOptionsKeywords.CLIENTS }),
      id: 'ClientTasks',
    },
  ]

  const filterButtons = previewMode ? previewFilterButtons : mode === UserRole.IU ? IuFilterButtons : CuFilterButtons

  return (
    <Box
      sx={
        previewMode
          ? { borderBottom: (theme) => `1px solid ${theme.color.borders.borderDisabled}` }
          : {
              border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
              borderTop: 'none',
            }
      }
    >
      <Box
        sx={{
          padding: '12px 20px',
          display: { xs: 'none', sm: 'none', sd: 'block' },
        }}
      >
        <Stack direction={'row'} justifyContent={'space-between'} sx={{ maxHeight: '32px' }}>
          <Stack direction={'row'} columnGap={3}>
            <FilterButtonGroup filterButtons={filterButtons} activeButtonIndex={ButtonIndex} />
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
            {previewMode && (
              <IconBtn
                handleClick={() => {
                  store.dispatch(setShowModal())
                }}
                padding="8px"
                icon={<AddLargeIcon />}
              />
            )}
          </Stack>
        </Stack>
      </Box>
      <Box sx={{ padding: '12px 20px', display: { sm: 'block', sd: 'none' } }}>
        <Stack direction="column" rowGap={'8px'}>
          <FilterButtonGroup filterButtons={filterButtons} activeButtonIndex={ButtonIndex} />

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

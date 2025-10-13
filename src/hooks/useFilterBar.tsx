import { updateViewModeSettings } from '@/app/(home)/actions'
import { selectTaskBoard, setIsTasksLoading, setFilterOptions, setViewSettingsTemp } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { CreateViewSettingsDTO, DisplayOptions } from '@/types/dto/viewSettings.dto'
import { FilterOptions, IFilterOptions } from '@/types/interfaces'
import { UserIdsType } from '@/utils/assignee'
import { useSelector } from 'react-redux'
import z from 'zod'

export const useFilterBar = () => {
  const { token, view, viewSettingsTemp, showArchived, showUnarchived, showSubtasks } = useSelector(selectTaskBoard)

  const updateViewModeSetting = async (payload: CreateViewSettingsDTO) => {
    try {
      await updateViewModeSettings(z.string().parse(token), payload)
    } catch (error) {
      console.error('view settings update error', error)
    }
  }

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

  return { updateViewModeSetting, handleFilterOptionsChange }
}

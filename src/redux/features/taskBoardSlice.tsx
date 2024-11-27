import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { AssigneeType, FilterByOptions, FilterOptions, IAssigneeCombined, IFilterOptions, View } from '@/types/interfaces'
import { ViewMode } from '@prisma/client'
import { CreateViewSettingsDTO, FilterOptionsType } from '@/types/dto/viewSettings.dto'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'

interface IInitialState {
  workflowStates: WorkflowStateResponse[]
  assignee: IAssigneeCombined[]
  backupTasks: TaskResponse[]
  tasks: TaskResponse[]
  token: string | undefined
  view: ViewMode
  filteredTasks: TaskResponse[]
  filterOptions: IFilterOptions
  filteredAssigneeList: IAssigneeCombined[]
  showArchived: boolean | undefined
  showUnarchived: boolean | undefined
  viewSettingsTemp: CreateViewSettingsDTO | undefined
  isTasksLoading: boolean
}

const initialState: IInitialState = {
  workflowStates: [],
  backupTasks: [], //state for tasks used as a dependency for details page to listen to real-time changes. This should be updated everytime tasks state is updated to keep up, except the one with archived-unarchived filter updates.
  tasks: [],
  token: undefined,
  assignee: [],
  view: ViewMode.board,
  filteredTasks: [], //contains tasks which are client-side filtered. is modified from the useFilter custom hook.
  filterOptions: {
    [FilterOptions.ASSIGNEE]: '',
    [FilterOptions.KEYWORD]: '',
    [FilterOptions.TYPE]: '',
  },
  filteredAssigneeList: [],
  showArchived: undefined,
  showUnarchived: undefined,
  viewSettingsTemp: undefined,
  // Use this state as a global loading flag for tasks
  isTasksLoading: true,
}

const taskBoardSlice = createSlice({
  name: 'taskBoard',
  initialState,
  reducers: {
    setWorkflowStates: (state, action: { payload: WorkflowStateResponse[] }) => {
      state.workflowStates = action.payload
    },
    setBackupTasks: (state, action: { payload: TaskResponse[] }) => {
      state.backupTasks = action.payload
    },
    setTasks: (state, action: { payload: TaskResponse[] }) => {
      state.tasks = action.payload
    },
    appendTask: (state, action: { payload: TaskResponse }) => {
      state.tasks = [...state.tasks, action.payload]
    },
    setFilteredTasks: (state, action: { payload: TaskResponse[] }) => {
      state.filteredTasks = action.payload
    },
    setToken: (state, action: { payload: string }) => {
      state.token = action.payload
    },
    updateWorkflowStateIdByTaskId: (state, action) => {
      let taskToUpdate = state.tasks.find((task) => task.id === action.payload.taskId)
      if (taskToUpdate) {
        taskToUpdate.workflowStateId = action.payload.targetWorkflowStateId
        const updatedTasks = [...state.tasks.filter((task) => task.id !== action.payload.taskId), taskToUpdate]
        state.tasks = updatedTasks
        state.filteredTasks = state.filteredTasks.map((filteredTask) => {
          const updatedTask = updatedTasks.find((task) => task.id === filteredTask.id)
          return updatedTask || filteredTask
        })
      }
    },
    setAssigneeList: (state, action: { payload: IAssigneeCombined[] }) => {
      state.assignee = action.payload
      state.filteredAssigneeList = action.payload
    },
    setViewSettings: (state, action: { payload: CreateViewSettingsDTO }) => {
      const { viewMode, filterOptions, showArchived, showUnarchived } = action.payload
      state.view = viewMode
      state.showArchived = showArchived
      state.showUnarchived = showUnarchived
      taskBoardSlice.caseReducers.updateFilterOption(state, { payload: { filterOptions } })
    },
    setViewSettingsTemp: (state, action: { payload: CreateViewSettingsDTO }) => {
      state.viewSettingsTemp = action.payload
    },
    setFilterOptions: (state, action: { payload: { optionType: FilterOptions; newValue: string | null } }) => {
      state.filterOptions = {
        ...state.filterOptions,
        [action.payload.optionType]: action.payload.newValue,
      }
    },
    setFilteredAssgineeList: (state, action: { payload: { filteredType: FilterByOptions } }) => {
      const filteredType = action.payload.filteredType
      if (filteredType == 'internalUsers') {
        state.filteredAssigneeList = state.assignee.filter((el) => el.type == FilterByOptions.IUS)
      }
      if (filteredType == 'clients') {
        state.filteredAssigneeList = state.assignee.filter(
          (el) => el.type == FilterByOptions.CLIENT || el.type == FilterByOptions.COMPANY,
        )
      }
      if (filteredType == FilterByOptions.NOFILTER) {
        state.filteredAssigneeList = state.assignee
      }
    },
    updateFilterOption: (state, action: { payload: { filterOptions: FilterOptionsType } }) => {
      const { filterOptions } = action.payload
      if (filterOptions?.assignee) {
        const assigneeCheck = state.assignee.find((assignee) => assignee.id == filterOptions.assignee)
        if (!assigneeCheck) {
          filterOptions.assignee = ''
        }
      }
      state.filterOptions = action.payload.filterOptions
    }, //updates filters according to viewSettings

    setIsTasksLoading: (state, action: { payload: boolean }) => {
      state.isTasksLoading = action.payload
    },
  },
})

export const selectTaskBoard = (state: RootState) => state.taskBoard

export const {
  setWorkflowStates,
  setBackupTasks,
  setTasks,
  appendTask,
  updateWorkflowStateIdByTaskId,
  setToken,
  setAssigneeList,
  setFilteredTasks,
  setViewSettings,
  setFilterOptions,
  setFilteredAssgineeList,
  setViewSettingsTemp,
  setIsTasksLoading,
} = taskBoardSlice.actions

export default taskBoardSlice.reducer

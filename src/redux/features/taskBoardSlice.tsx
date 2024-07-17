import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { AssigneeType, FilterByOptions, FilterOptions, IAssigneeCombined, IFilterOptions, View } from '@/types/interfaces'
import { ViewMode } from '@prisma/client'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'

interface IInitialState {
  workflowStates: WorkflowStateResponse[]
  assignee: IAssigneeCombined[]
  tasks: TaskResponse[]
  token: string | undefined
  view: ViewMode
  filteredTasks: TaskResponse[]
  filterOptions: IFilterOptions
  filteredAssigneeList: IAssigneeCombined[]
}

const initialState: IInitialState = {
  workflowStates: [],
  tasks: [],
  token: undefined,
  assignee: [],
  view: ViewMode.board,
  filteredTasks: [],
  filterOptions: {
    [FilterOptions.ASSIGNEE]: '',
    [FilterOptions.KEYWORD]: '',
    [FilterOptions.TYPE]: '',
  },
  filteredAssigneeList: [],
}

const taskBoardSlice = createSlice({
  name: 'taskBoard',
  initialState,
  reducers: {
    setWorkflowStates: (state, action: { payload: WorkflowStateResponse[] }) => {
      state.workflowStates = action.payload
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
        state.filteredTasks = updatedTasks
      }
    },
    setAssigneeList: (state, action: { payload: IAssigneeCombined[] }) => {
      state.assignee = action.payload
      state.filteredAssigneeList = action.payload
    },
    setViewSettings: (state, action: { payload: CreateViewSettingsDTO }) => {
      state.view = action.payload.viewMode
      state.filterOptions = action.payload.filterOptions
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
  },
})

export const selectTaskBoard = (state: RootState) => state.taskBoard

export const {
  setWorkflowStates,
  setTasks,
  appendTask,
  updateWorkflowStateIdByTaskId,
  setToken,
  setAssigneeList,
  setFilteredTasks,
  setViewSettings,
  setFilterOptions,
  setFilteredAssgineeList,
} = taskBoardSlice.actions

export default taskBoardSlice.reducer

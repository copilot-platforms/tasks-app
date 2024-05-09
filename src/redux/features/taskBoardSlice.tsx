import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { AssigneeType, IAssigneeCombined, IFilterOptions, View } from '@/types/interfaces'

interface IInitialState {
  workflowStates: WorkflowStateResponse[]
  assignee: IAssigneeCombined[]
  tasks: TaskResponse[]
  token: string | undefined
  view: View
  filteredTasks: TaskResponse[]
  filterOptions: IFilterOptions[]
}

const initialState: IInitialState = {
  workflowStates: [],
  tasks: [],
  token: undefined,
  assignee: [],
  view: View.BOARD_VIEW,
  filteredTasks: [],
  filterOptions: [
    {
      type: 'filterButton',
      payload: ['all'],
    },
    {
      type: 'filterAssignee',
      payload: '',
    },
    {
      type: 'filterSearch',
      payload: '',
    },
  ],
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
    },
    setViewSettings: (state, action: { payload: View }) => {
      state.view = action.payload
    },

    setFilterOptions: (state, action: { payload: IFilterOptions }) => {
      state.filterOptions = state.filterOptions.map((option) => {
        if (option.type === action.payload.type) {
          return {
            ...option,
            payload: action.payload.payload,
          }
        }
        return option
      })
    },
    applyFilter: (state) => {
      state.filteredTasks = state.tasks?.slice()
      state.filterOptions.map((item) => {
        if (item.type == 'filterSearch') {
          const keyword = (item.payload as string).toLowerCase()
          state.filteredTasks =
            item.payload !== ''
              ? state.filteredTasks.filter(
                  (task) => task.title?.toLowerCase().includes(keyword) || task.body?.toLowerCase().includes(keyword),
                )
              : state.filteredTasks
        } else if (item.type == 'filterAssignee') {
          const assigneeId = item.payload
          state.filteredTasks = !assigneeId
            ? state.filteredTasks
            : assigneeId
              ? state.filteredTasks.filter((task) => task.assigneeId == assigneeId)
              : state.filteredTasks.filter((task) => !task.assigneeId)
        } else {
          const assigneeType: (AssigneeType | 'all')[] | string = item.payload as (AssigneeType | 'all')[] | string
          state.filteredTasks = !assigneeType
            ? state.filteredTasks
            : assigneeType.includes('all')
              ? state.filteredTasks
              : typeof assigneeType === 'string'
                ? state.filteredTasks.filter((task) => task.assigneeId == assigneeType)
                : state.filteredTasks.filter((task) => assigneeType.includes(task.assigneeType as AssigneeType | 'all'))
        }
      })
    },
  },
})

export const selectTaskBoard = (state: RootState) => state.taskBoard

export const {
  setWorkflowStates,
  setTasks,
  updateWorkflowStateIdByTaskId,
  setToken,
  setAssigneeList,
  setViewSettings,
  setFilterOptions,
  applyFilter,
} = taskBoardSlice.actions

export default taskBoardSlice.reducer

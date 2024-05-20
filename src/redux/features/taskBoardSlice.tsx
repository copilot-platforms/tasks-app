import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { AssigneeType, IAssigneeCombined, View } from '@/types/interfaces'

interface IInitialState {
  workflowStates: WorkflowStateResponse[]
  assignee: IAssigneeCombined[]
  tasks: TaskResponse[]
  token: string | undefined
  view: View
  filteredTasks: TaskResponse[]
}

const initialState: IInitialState = {
  workflowStates: [],
  tasks: [],
  token: undefined,
  assignee: [],
  view: View.BOARD_VIEW,
  filteredTasks: [],
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
    },
    setViewSettings: (state, action: { payload: View }) => {
      state.view = action.payload
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
  setFilteredTasks,
  setViewSettings,
} = taskBoardSlice.actions

export default taskBoardSlice.reducer

import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssigneeCombined } from '@/types/interfaces'

interface IInitialState {
  workflowStates: WorkflowStateResponse[]
  assignee: IAssigneeCombined[]
  tasks: TaskResponse[]
  token: string | undefined
}

const initialState: IInitialState = {
  workflowStates: [],
  tasks: [],
  token: undefined,
  assignee: [],
}

const taskBoardSlice = createSlice({
  name: 'taskBoard',
  initialState,
  reducers: {
    setWorkflowStates: (state, action) => {
      state.workflowStates = action.payload
    },
    setTasks: (state, action) => {
      state.tasks = action.payload
    },
    setToken: (state, action) => {
      state.token = action.payload
    },
    updateWorkflowStateIdByTaskId: (state, action) => {
      let taskToUpdate = state.tasks.find((task) => task.id === action.payload.taskId)
      if (taskToUpdate) {
        taskToUpdate.workflowStateId = action.payload.targetWorkflowStateId
        const updatedTasks = [...state.tasks.filter((task) => task.id !== action.payload.taskId), taskToUpdate]
        state.tasks = updatedTasks
      }
    },
    setAssigneeList: (state, action) => {
      state.assignee = action.payload
    },
  },
})

export const selectTaskBoard = (state: RootState) => state.taskBoard

export const { setWorkflowStates, setTasks, updateWorkflowStateIdByTaskId, setToken, setAssigneeList } =
  taskBoardSlice.actions

export default taskBoardSlice.reducer

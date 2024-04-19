import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { TaskResponse } from '@/types/dto/tasks.dto'

interface IInitialState {
  workflowStates: WorkflowStateResponse[]
  tasks: TaskResponse[]
}

const initialState: IInitialState = {
  workflowStates: [],
  tasks: [],
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
    updateWorkflowStateIdByTaskId: (state, action) => {
      let taskToUpdate = state.tasks.find((task) => task.id === action.payload.taskId)
      if (taskToUpdate) {
        taskToUpdate.workflowStateId = action.payload.targetWorkflowStateId
        const updatedTasks = [...state.tasks.filter((task) => task.id !== action.payload.taskId), taskToUpdate]
        state.tasks = updatedTasks
      }
    },
  },
})

export const selectTaskBoard = (state: RootState) => state.taskBoard

export const { setWorkflowStates, setTasks, updateWorkflowStateIdByTaskId } = taskBoardSlice.actions

export default taskBoardSlice.reducer

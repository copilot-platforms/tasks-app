import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssigneeCombined, View } from '@/types/interfaces'

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
    setWorkflowStates: (state, action) => {
      state.workflowStates = action.payload
    },
    setTasks: (state, action) => {
      state.tasks = action.payload
      state.filteredTasks = action.payload
    },

    setToken: (state, action) => {
      state.token = action.payload
    },
    setFilteredTasks: (state, action) => {
      const keyword = action.payload?.toLowerCase()
      const filteredTasks =
        keyword != ''
          ? state.tasks.filter(
              (task) => task.title?.toLowerCase().includes(keyword) || task.body?.toLowerCase().includes(keyword),
            )
          : state.tasks
      state.filteredTasks = filteredTasks
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
    setAssigneeList: (state, action) => {
      state.assignee = action.payload
    },
  },
})

export const selectTaskBoard = (state: RootState) => state.taskBoard

export const { setWorkflowStates, setTasks, updateWorkflowStateIdByTaskId, setToken, setFilteredTasks, setAssigneeList } =
  taskBoardSlice.actions

export default taskBoardSlice.reducer

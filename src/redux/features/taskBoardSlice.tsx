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
  filteredTasks: TaskResponse[]
}

const initialState: IInitialState = {
  workflowStates: [],
  tasks: [],
  token: undefined,
  assignee: [],
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
    setFilteredAsignee: (state, action) => {
      const assigneeId = action.payload?.id
      const filteredTasks = !action.payload
        ? state.tasks
        : assigneeId
          ? state.tasks.filter((task) => task.assigneeId == assigneeId)
          : state.tasks.filter((task) => !task.assigneeId)
      state.filteredTasks = filteredTasks
    },
    setFilteredTaskByType: (state, action) => {
      const assigneeType: string[] = action.payload?.assigneeType
      const filteredTask = assigneeType.includes('all')
        ? state.tasks
        : state.tasks.filter((task) => assigneeType.includes(task.assigneeType as string))
      state.filteredTasks = filteredTask
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

export const {
  setWorkflowStates,
  setTasks,
  updateWorkflowStateIdByTaskId,
  setToken,
  setFilteredTasks,
  setAssigneeList,
  setFilteredAsignee,
  setFilteredTaskByType,
} = taskBoardSlice.actions

export default taskBoardSlice.reducer

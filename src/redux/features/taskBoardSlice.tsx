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
      state.filteredTasks = action.payload
    },

    setToken: (state, action: { payload: string }) => {
      state.token = action.payload
    },
    setFilteredTasks: (state, action: { payload: string }) => {
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
      const assigneeType: (AssigneeType | 'all')[] = action.payload?.assigneeType
      const filteredTask = assigneeType.includes('all')
        ? state.tasks
        : state.tasks.filter((task) => assigneeType.includes(task.assigneeType as AssigneeType | 'all'))
      state.filteredTasks = filteredTask
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
  setFilteredTasks,
  setAssigneeList,
  setFilteredAsignee,
  setFilteredTaskByType,
  setViewSettings,
} = taskBoardSlice.actions

export default taskBoardSlice.reducer

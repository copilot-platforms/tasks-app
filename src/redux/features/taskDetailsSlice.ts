import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { IAssigneeCombined, IAssigneeSuggestions } from '@/types/interfaces'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'

interface IInitialState {
  showConfirmDeleteModal: boolean
  showSidebar: boolean
  assigneeSuggestions: IAssigneeSuggestions[]
  currentTask: TaskResponse | undefined
  currentAssignee: IAssigneeCombined | undefined
  currentWorkflowState: WorkflowStateResponse | undefined
}

const initialState: IInitialState = {
  showConfirmDeleteModal: false,
  showSidebar: false,
  assigneeSuggestions: [],
  currentTask: undefined,
  currentAssignee: undefined,
  currentWorkflowState: undefined,
}

const taskDetailsSlice = createSlice({
  name: 'taskDetails',
  initialState,
  reducers: {
    setShowConfirmDeleteModal: (state) => {
      state.showConfirmDeleteModal = !state.showConfirmDeleteModal
    },
    setShowSidebar: (state, action: { payload: boolean }) => {
      state.showSidebar = action.payload
    },
    setAssigneeSuggestion: (state, action: { payload: IAssigneeSuggestions[] }) => {
      state.assigneeSuggestions = action.payload
    },
    setStateOptimizers_taskDetailsSlice: (
      state,
      action: {
        payload: {
          currentTask?: TaskResponse
          currentAssignee?: IAssigneeCombined
          currentWorkflowState?: WorkflowStateResponse
        }
      },
    ) => {
      const { currentTask, currentAssignee, currentWorkflowState } = action.payload
      state.currentTask = currentTask
      state.currentWorkflowState = currentWorkflowState
      state.currentAssignee = currentAssignee
    },
  },
})

export const selectTaskDetails = (state: RootState) => state.taskDetail

export const { setShowConfirmDeleteModal, setShowSidebar, setAssigneeSuggestion, setStateOptimizers_taskDetailsSlice } =
  taskDetailsSlice.actions

export default taskDetailsSlice.reducer

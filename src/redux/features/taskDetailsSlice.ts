import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { IAssigneeCombined, IAssigneeSuggestions } from '@/types/interfaces'
import { TaskResponse } from '@/types/dto/tasks.dto'

interface IInitialState {
  showConfirmDeleteModal: boolean
  showSidebar: boolean
  assigneeSuggestions: IAssigneeSuggestions[]
  task: TaskResponse | undefined
  showConfirmAssignModal: boolean
  // URL of an image opened in preview modal for task description / comments
  openImage: string | null
  expandedComments: string[]
}

const initialState: IInitialState = {
  showConfirmDeleteModal: false,
  showSidebar: true,
  assigneeSuggestions: [],
  task: undefined,
  showConfirmAssignModal: false,
  openImage: null,
  expandedComments: [],
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
    setTask: (state, action: { payload: TaskResponse }) => {
      state.task = action.payload
    },
    toggleShowConfirmAssignModal: (state) => {
      state.showConfirmAssignModal = !state.showConfirmAssignModal
    },
    setOpenImage: (state, action: { payload: string | null }) => {
      state.openImage = action.payload
    },
    setExpandedComments: (state, action: { payload: string[] }) => {
      state.expandedComments = action.payload
    },
  },
})

export const selectTaskDetails = (state: RootState) => state.taskDetail

export const {
  setShowConfirmDeleteModal,
  setShowSidebar,
  setAssigneeSuggestion,
  setTask,
  toggleShowConfirmAssignModal,
  setOpenImage,
  setExpandedComments,
} = taskDetailsSlice.actions

export default taskDetailsSlice.reducer

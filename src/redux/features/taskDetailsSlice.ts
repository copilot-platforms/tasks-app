import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { IAssigneeSuggestions } from '@/types/interfaces'
import { TaskResponse } from '@/types/dto/tasks.dto'

interface IInitialState {
  showConfirmDeleteModal: boolean
  showSidebar: boolean
  assigneeSuggestions: IAssigneeSuggestions[]
  task: TaskResponse | undefined
  showConfirmAssignModal: boolean
}

const initialState: IInitialState = {
  showConfirmDeleteModal: false,
  showSidebar: true,
  assigneeSuggestions: [],
  task: undefined,
  showConfirmAssignModal: false,
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
    setShowConfirmAssignModal: (state) => {
      state.showConfirmAssignModal = !state.showConfirmAssignModal
    },
  },
})

export const selectTaskDetails = (state: RootState) => state.taskDetail

export const { setShowConfirmDeleteModal, setShowSidebar, setAssigneeSuggestion, setTask, setShowConfirmAssignModal } =
  taskDetailsSlice.actions

export default taskDetailsSlice.reducer

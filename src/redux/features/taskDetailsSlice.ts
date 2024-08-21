import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { IAssigneeSuggestions } from '@/types/interfaces'

interface IInitialState {
  showConfirmDeleteModal: boolean
  showSidebar: boolean
  assigneeSuggestions: IAssigneeSuggestions[]
}

const initialState: IInitialState = {
  showConfirmDeleteModal: false,
  showSidebar: true,
  assigneeSuggestions: [],
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
  },
})

export const selectTaskDetails = (state: RootState) => state.taskDetail

export const { setShowConfirmDeleteModal, setShowSidebar, setAssigneeSuggestion } = taskDetailsSlice.actions

export default taskDetailsSlice.reducer

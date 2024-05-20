import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface IInitialState {
  showConfirmDeleteModal: boolean
  showSidebar: boolean
}

const initialState: IInitialState = {
  showConfirmDeleteModal: false,
  showSidebar: true,
}

const taskDetailsSlice = createSlice({
  name: 'taskDetails',
  initialState,
  reducers: {
    setShowConfirmDeleteModal: (state) => {
      state.showConfirmDeleteModal = !state.showConfirmDeleteModal
    },
    setShowSidebar: (state) => {
      state.showSidebar = !state.showSidebar
    },
  },
})

export const selectTaskDetails = (state: RootState) => state.taskDetail

export const { setShowConfirmDeleteModal, setShowSidebar } = taskDetailsSlice.actions

export default taskDetailsSlice.reducer

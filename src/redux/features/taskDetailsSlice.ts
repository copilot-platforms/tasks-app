import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface IInitialState {
  showConfirmDeleteModal: boolean
}

const initialState: IInitialState = {
  showConfirmDeleteModal: false,
}

const taskDetailsSlice = createSlice({
  name: 'taskDetails',
  initialState,
  reducers: {
    setShowConfirmDeleteModal: (state) => {
      state.showConfirmDeleteModal = !state.showConfirmDeleteModal
    },
  },
})

export const selectTaskDetails = (state: RootState) => state.taskDetail

export const { setShowConfirmDeleteModal } = taskDetailsSlice.actions

export default taskDetailsSlice.reducer

import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface IInitialState {
  showModal: boolean
}

const initialState: IInitialState = {
  showModal: false,
}

const createTaskSlice = createSlice({
  name: 'createTask',
  initialState,
  reducers: {
    setShowModal: (state) => {
      state.showModal = !state.showModal
    },
  },
})

export const selectCreateTask = (state: RootState) => state.createTask

export const { setShowModal } = createTaskSlice.actions

export default createTaskSlice.reducer

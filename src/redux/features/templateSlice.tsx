import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface IInitialState {
  showTemplateModal: boolean
}

const initialState: IInitialState = {
  showTemplateModal: false,
}

const createTemplateSlice = createSlice({
  name: 'templateSlice',
  initialState,
  reducers: {
    setShowTemplateModal: (state) => {
      state.showTemplateModal = !state.showTemplateModal
    },
  },
})

export const selectCreateTemplate = (state: RootState) => state.createTemplate

export const { setShowTemplateModal } = createTemplateSlice.actions

export default createTemplateSlice.reducer

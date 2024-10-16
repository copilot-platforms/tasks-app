import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { IAssigneeSuggestions } from '@/types/interfaces'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'

interface IInitialState {
  showConfirmDeleteModal: boolean
  showSidebar: boolean
  assigneeSuggestions: IAssigneeSuggestions[]
  activities: LogResponse[]
}

const initialState: IInitialState = {
  showConfirmDeleteModal: false,
  showSidebar: true,
  assigneeSuggestions: [],
  activities: [],
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
    setActivities: (state, action: { payload: LogResponse[] }) => {
      state.activities = action.payload
    },
  },
})

export const selectTaskDetails = (state: RootState) => state.taskDetail

export const { setShowConfirmDeleteModal, setShowSidebar, setAssigneeSuggestion, setActivities } = taskDetailsSlice.actions

export default taskDetailsSlice.reducer

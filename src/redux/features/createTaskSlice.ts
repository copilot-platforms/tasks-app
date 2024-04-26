import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface IInitialState {
  showModal: boolean
  title: string
  description: string
  workflowStateId: string
  assigneeType: string
  assigneeId: string
}

const initialState: IInitialState = {
  showModal: false,
  title: '',
  workflowStateId: '',
  description: '',
  assigneeType: '',
  assigneeId: '',
}

const createTaskSlice = createSlice({
  name: 'createTask',
  initialState,
  reducers: {
    setShowModal: (state) => {
      state.showModal = !state.showModal
    },

    setCreateTaskFields: (state, action) => {
      const { targetField, value } = action.payload
      //@ts-ignore
      state[targetField] = value
    },

    clearCreateTaskFields: (state) => {
      state.title = ''
      state.workflowStateId = ''
      state.description = ''
      state.assigneeType = ''
      state.assigneeId = ''
    },
  },
})

export const selectCreateTask = (state: RootState) => state.createTask

export const { setShowModal, setCreateTaskFields, clearCreateTaskFields } = createTaskSlice.actions

export default createTaskSlice.reducer

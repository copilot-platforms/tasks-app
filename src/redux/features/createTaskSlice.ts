import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { AssigneeType } from '@prisma/client'

interface IInitialState {
  showModal: boolean
  title: string
  description: string
  workflowStateId: string
  assigneeType?: AssigneeType | null
  assigneeId: string | null
}

const initialState: IInitialState = {
  showModal: false,
  title: '',
  workflowStateId: '',
  description: '',
  assigneeType: null,
  assigneeId: null,
}

const createTaskSlice = createSlice({
  name: 'createTask',
  initialState,
  reducers: {
    setShowModal: (state) => {
      state.showModal = !state.showModal
    },

    setCreateTaskFields: (state, action: { payload: { targetField: string; value: string | null } }) => {
      const { targetField, value } = action.payload
      //@ts-ignore
      state[targetField] = value
    },

    clearCreateTaskFields: (state) => {
      state.title = ''
      state.workflowStateId = ''
      state.description = ''
      state.assigneeType = null
      state.assigneeId = null
    },
  },
})

export const selectCreateTask = (state: RootState) => state.createTask

export const { setShowModal, setCreateTaskFields, clearCreateTaskFields } = createTaskSlice.actions

export default createTaskSlice.reducer

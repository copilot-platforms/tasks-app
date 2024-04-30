import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { AssigneeType } from '@/types/dto/tasks.dto'

interface IInitialState {
  showModal: boolean
  title: string
  description: string
  workflowStateId: string
  assigneeType: AssigneeType
  assigneeId: string
}

const initialState: IInitialState = {
  showModal: false,
  title: '',
  workflowStateId: '',
  description: '',
  assigneeType: undefined,
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
  },
})

export const selectCreateTask = (state: RootState) => state.createTask

export const { setShowModal, setCreateTaskFields } = createTaskSlice.actions

export default createTaskSlice.reducer

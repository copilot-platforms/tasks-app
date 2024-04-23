import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { IAssigneeCombined } from '@/types/interfaces'

interface IInitialState {
  showModal: boolean
  title: string
  description: string
  workflowStateId: string
  assignee: IAssigneeCombined[]
}

const initialState: IInitialState = {
  showModal: false,
  title: '',
  workflowStateId: '',
  description: '',
  assignee: [],
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

    setAssigneeList: (state, action) => {
      state.assignee = action.payload
    },
  },
})

export const selectCreateTask = (state: RootState) => state.createTask

export const { setShowModal, setCreateTaskFields, setAssigneeList } = createTaskSlice.actions

export default createTaskSlice.reducer

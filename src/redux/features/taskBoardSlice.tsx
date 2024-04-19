import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { CreateWorkflowStateRequest } from '@/types/dto/workflowStates.dto'

interface IInitialState {
  workflowStates: CreateWorkflowStateRequest[]
}

const initialState: IInitialState = {
  workflowStates: [],
}

const taskBoardSlice = createSlice({
  name: 'taskBoard',
  initialState,
  reducers: {
    setWorkflowStates: (state, action) => {
      state.workflowStates = action.payload
    },
  },
})

export const selectTaskBoard = (state: RootState) => state.taskBoard

export const { setWorkflowStates } = taskBoardSlice.actions

export default taskBoardSlice.reducer

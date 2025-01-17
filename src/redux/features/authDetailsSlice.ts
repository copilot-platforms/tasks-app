import { Token, WorkspaceResponse } from '@/types/common'
import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'

interface IInitialState {
  tokenPayload: Token | undefined
  workspace: WorkspaceResponse | undefined
}

const initialState: IInitialState = {
  tokenPayload: undefined,
  workspace: undefined,
}

const authDetailsSlice = createSlice({
  name: 'authDetails',
  initialState,
  reducers: {
    setTokenPayload: (state, action: { payload: Token }) => {
      state.tokenPayload = action.payload
    },
    setWorkspace: (state, action: { payload: WorkspaceResponse }) => {
      state.workspace = action.payload
    },
  },
})

export const selectAuthDetails = (state: RootState) => state.authDetail

export const { setTokenPayload, setWorkspace } = authDetailsSlice.actions

export default authDetailsSlice.reducer

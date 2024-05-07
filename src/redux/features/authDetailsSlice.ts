import { Token } from '@/types/common'
import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'

interface IInitialState {
  tokenPayload: Token | {}
  internalUserId: string
}

const initialState: IInitialState = {
  tokenPayload: {},
  internalUserId: '',
}

const authDetailsSlice = createSlice({
  name: 'authDetails',
  initialState,
  reducers: {
    setTokenPayload: (state, action) => {
      state.tokenPayload = action.payload
    },
    setInternalUserId: (state, action) => {
      state.internalUserId = action.payload
    },
  },
})

export const selectAuthDetails = (state: RootState) => state.authDetail

export const { setTokenPayload, setInternalUserId } = authDetailsSlice.actions

export default authDetailsSlice.reducer

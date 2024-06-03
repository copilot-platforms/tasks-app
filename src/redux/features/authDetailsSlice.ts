import { Token } from '@/types/common'
import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'

interface IInitialState {
  tokenPayload: Token | undefined
}

const initialState: IInitialState = {
  tokenPayload: undefined,
}

const authDetailsSlice = createSlice({
  name: 'authDetails',
  initialState,
  reducers: {
    setTokenPayload: (state, action: { payload: Token }) => {
      state.tokenPayload = action.payload
    },
  },
})

export const selectAuthDetails = (state: RootState) => state.authDetail

export const { setTokenPayload } = authDetailsSlice.actions

export default authDetailsSlice.reducer

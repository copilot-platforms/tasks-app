import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import createTaskReducer from './features/createTaskSlice'
import taskBoardReducer from './features/taskBoardSlice'
import taskDetailReducer from './features/taskDetailsSlice'
import authDetailReducer from './features/authDetailsSlice'

const store = configureStore({
  reducer: {
    createTask: createTaskReducer,
    taskBoard: taskBoardReducer,
    taskDetail: taskDetailReducer,
    authDetail: authDetailReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>

export default store

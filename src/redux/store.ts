import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import createTaskReducer from './features/createTaskSlice';

const store = configureStore({
  reducer: {
    createTask: createTaskReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export default store;

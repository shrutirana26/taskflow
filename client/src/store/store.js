import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import teamReducer from './slices/teamSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    teams: teamReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;

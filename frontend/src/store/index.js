import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './session';
import spotsReducer from './spots';

const store = configureStore({
  reducer: {
    session: sessionReducer,
    spots: spotsReducer
  }
});

export default store;

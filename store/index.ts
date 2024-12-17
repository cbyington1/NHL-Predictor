import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import predictionsReducer from './slices/predictionsSlice';  // Add this import

const store = configureStore({
  reducer: {
    app: appReducer,
    predictions: predictionsReducer,  // Add predictions reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
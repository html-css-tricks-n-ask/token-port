import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from './slices/portfolioSlice';
import walletReducer from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
    wallet: walletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
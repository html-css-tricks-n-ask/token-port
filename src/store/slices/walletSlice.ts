import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    connectWallet: (state, action: PayloadAction<{ address: string; chainId: number }>) => {
      state.isConnected = true;
      state.address = action.payload.address;
      state.chainId = action.payload.chainId;
    },
    disconnectWallet: (state) => {
      state.isConnected = false;
      state.address = null;
      state.chainId = null;
    },
  },
});

export const { connectWallet, disconnectWallet } = walletSlice.actions;
export default walletSlice.reducer;
import { create } from 'zustand';
import type { WalletState } from '../types/web3';

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  chainId: null,
  isConnecting: false,
  error: null,
  setAddress: (address: string | null) => set({ address }),
  setChainId: (chainId: number | null) => set({ chainId }),
  setIsConnecting: (isConnecting: boolean) => set({ isConnecting }),
  setError: (error: string | null) => set({ error }),
})); 
import { create } from 'zustand';
import type { PointsState } from '../types/web3';

export const usePointsStore = create<PointsState>((set) => ({
  balance: 0,
  isLoading: false,
  error: null,
  setBalance: (balance: number) => set({ balance }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
})); 
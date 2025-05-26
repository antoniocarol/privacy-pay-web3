import { create } from 'zustand';

interface UserState {
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
})); 
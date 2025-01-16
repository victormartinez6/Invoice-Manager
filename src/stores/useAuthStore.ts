import { create } from 'zustand';
import { auth } from '../config/firebase';
import { User } from 'firebase/auth';

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Listen to auth state changes
auth.onAuthStateChanged((user) => {
  useAuthStore.getState().setUser(user);
});

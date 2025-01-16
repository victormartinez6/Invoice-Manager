import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => {
  let unsubscribe: (() => void) | null = null;

  return {
    user: null,
    loading: true,
    error: null,
    initialized: false,

    initialize: async () => {
      if (unsubscribe) {
        console.log('Auth listener already initialized');
        return;
      }

      try {
        return new Promise<void>((resolve) => {
          unsubscribe = onAuthStateChanged(auth, 
            (user) => {
              console.log('Auth state changed:', user ? 'logged in' : 'logged out');
              set({ 
                user, 
                loading: false, 
                error: null,
                initialized: true 
              });
              resolve();
            },
            (error) => {
              console.error('Auth state change error:', error);
              set({ 
                error: error.message, 
                loading: false,
                initialized: true 
              });
              resolve();
            }
          );
        });
      } catch (error) {
        console.error('Initialize error:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Authentication failed',
          loading: false,
          initialized: true
        });
      }
    },

    signIn: async (email: string, password: string) => {
      set({ loading: true, error: null });
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        set({ 
          user: userCredential.user, 
          loading: false, 
          error: null 
        });
      } catch (error) {
        console.error('Sign in error:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Sign in failed',
          loading: false 
        });
        throw error;
      }
    },

    signOut: async () => {
      set({ loading: true, error: null });
      try {
        await firebaseSignOut(auth);
        set({ 
          user: null, 
          loading: false, 
          error: null 
        });
      } catch (error) {
        console.error('Sign out error:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Sign out failed',
          loading: false 
        });
        throw error;
      }
    }
  };
});
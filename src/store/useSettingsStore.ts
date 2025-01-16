import { create } from 'zustand';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Settings } from '../types/settings';
import { useAuthStore } from './useAuthStore';

interface SettingsStore {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const settingsRef = doc(db, 'settings', user.uid);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        set({ settings: settingsDoc.data() as Settings, loading: false });
      } else {
        // Set default settings if none exist
        const defaultSettings: Settings = {
          currency: 'BRL',  // Definindo BRL como moeda padrão
          paymentTerms: 0,
          companyDetails: {
            name: '',
            email: '',
            phone: '',
            address: {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: '',
            },
          },
        };
        await setDoc(settingsRef, defaultSettings);
        set({ settings: defaultSettings, loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateSettings: async (newSettings: Partial<Settings>) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const settingsRef = doc(db, 'settings', user.uid);
      await setDoc(settingsRef, newSettings, { merge: true });
      set(state => ({
        settings: state.settings ? { ...state.settings, ...newSettings } : newSettings,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
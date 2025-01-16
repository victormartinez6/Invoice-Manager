import { create } from 'zustand';
import { Team } from '../types/team';
import { teamService } from '../services/teamService';

interface TeamStore {
  teams: Team[];
  loading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  loading: false,
  error: null,
  fetchTeams: async () => {
    try {
      set({ loading: true, error: null });
      const teams = await teamService.getUserTeams();
      set({ teams, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch teams',
        loading: false 
      });
    }
  }
}));

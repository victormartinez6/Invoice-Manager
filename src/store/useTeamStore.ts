import { create } from 'zustand';
import { Team } from '../types/team';
import { teamService } from '../services/teamService';

interface TeamStore {
  teams: Team[];
  loading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<void>;
  addMember: (teamId: string, email: string) => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  loading: false,
  error: null,

  fetchTeams: async () => {
    set({ loading: true, error: null });
    try {
      const teams = await teamService.getUserTeams();
      set({ teams, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        loading: false 
      });
    }
  },

  createTeam: async (name: string) => {
    set({ loading: true, error: null });
    try {
      await teamService.createTeam(name);
      const teams = await teamService.getUserTeams();
      set({ teams, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        loading: false 
      });
    }
  },

  addMember: async (teamId: string, email: string) => {
    set({ loading: true, error: null });
    try {
      await teamService.addMember(teamId, email);
      const teams = await teamService.getUserTeams();
      set({ teams, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        loading: false 
      });
    }
  }
}));
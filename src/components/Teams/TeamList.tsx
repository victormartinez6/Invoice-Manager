import React, { useEffect, useState, useCallback } from 'react';
import { useTeamStore } from '../../stores/useTeamStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { teamService } from '../../services/teamService';
import { toast } from 'react-toastify';
import { TeamMembers } from './TeamMembers';
import { Team } from '../../types/team';
import { 
  Plus, 
  Save, 
  X, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Ban,
  Power
} from 'lucide-react';

export const TeamList: React.FC = () => {
  const { user } = useAuthStore();
  const { teams, loading, error, fetchTeams } = useTeamStore();
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const refreshTeams = useCallback(async () => {
    try {
      await fetchTeams();
    } catch (err) {
      console.error('Error refreshing teams:', err);
      toast.error('Failed to refresh teams');
    }
  }, [fetchTeams]);

  useEffect(() => {
    if (user) {
      refreshTeams();
    }
  }, [user, refreshTeams]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      setIsLoading(true);
      await teamService.createTeam(teamName);
      setTeamName('');
      toast.success('Team created successfully');
      await refreshTeams();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !teamName.trim()) return;

    try {
      setIsLoading(true);
      await teamService.updateTeam(editingTeam.id, teamName);
      setTeamName('');
      setEditingTeam(null);
      toast.success('Team updated successfully');
      await refreshTeams();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      await teamService.deleteTeam(team.id);
      toast.success('Team deleted successfully');
      await refreshTeams();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTeamStatus = async (team: Team, status: 'active' | 'inactive') => {
    try {
      setIsLoading(true);
      await teamService.updateTeamStatus(team.id, status);
      toast.success('Team status updated successfully');
      await refreshTeams();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update team status');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
  };

  const cancelEditing = () => {
    setEditingTeam(null);
    setTeamName('');
  };

  const toggleTeamDetails = (teamId: string) => {
    setSelectedTeam(selectedTeam === teamId ? null : teamId);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-gray-500 text-center">Please log in to view teams.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Teams</h2>

      <form onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder={editingTeam ? "Enter new team name" : "Enter team name"}
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
            disabled={isLoading || loading}
          />
          <button
            type="submit"
            disabled={isLoading || loading || !teamName}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2 transition-colors duration-200"
          >
            {editingTeam ? (
              <>
                <Save className="w-4 h-4" />
                Update Team
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Team
              </>
            )}
          </button>
          {editingTeam && (
            <button
              type="button"
              onClick={cancelEditing}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map(team => (
            <div key={team.id} className="border rounded-lg p-4 hover:border-primary-500 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{team.name}</h3>
                  <p className="text-sm text-gray-500">
                    {team.isOwner ? 'Owner' : 'Member'} • 
                    {Object.keys(team.memberDetails).length} member(s) •
                    <span className={team.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                      {team.status === 'active' ? ' Active' : ' Inactive'}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleTeamDetails(team.id)}
                    className="text-primary-500 hover:text-primary-600 p-2 rounded-full transition-colors duration-200"
                  >
                    {selectedTeam === team.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {team.isOwner && (
                    <>
                      <button
                        onClick={() => startEditing(team)}
                        className="text-primary-500 hover:text-primary-600 p-2 rounded-full transition-colors duration-200"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team)}
                        className="text-red-500 hover:text-red-600 p-2 rounded-full transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateTeamStatus(team, team.status === 'active' ? 'inactive' : 'active')}
                        className="text-primary-500 hover:text-primary-600 p-2 rounded-full transition-colors duration-200"
                        title={team.status === 'active' ? 'Deactivate Team' : 'Activate Team'}
                      >
                        {team.status === 'active' ? <Ban className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {selectedTeam === team.id && (
                <div className="mt-4 border-t pt-4">
                  <TeamMembers 
                    team={team} 
                    onUpdate={refreshTeams}
                  />
                </div>
              )}
            </div>
          ))}

          {teams.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No teams found. Create your first team to get started!
            </p>
          )}
        </div>
      )}
    </div>
  );
};
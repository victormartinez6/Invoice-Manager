import React, { useState, useCallback } from 'react';
import { Team, TeamMember } from '../../types/team';
import { teamService } from '../../services/teamService';
import { toast } from 'react-toastify';
import { 
  UserPlus, 
  Power, 
  Ban, 
  Trash2,
  Mail,
  Shield,
  Activity,
  Loader2
} from 'lucide-react';

interface TeamMembersProps {
  team: Team;
  onUpdate: () => void;
}

export const TeamMembers: React.FC<TeamMembersProps> = ({ team, onUpdate }) => {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMemberAction, setLoadingMemberAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleAddMember = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || isLoading) return;

    try {
      setIsLoading(true);
      const result = await teamService.addMember(team.id, newMemberEmail);
      setNewMemberEmail('');
      setResetLink(result.resetLink);
      setSuccessMessage(result.message);
      await onUpdate();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  }, [team.id, newMemberEmail, isLoading, onUpdate]);

  const handleUpdateStatus = useCallback(async (email: string, status: 'active' | 'inactive') => {
    if (loadingMemberAction) return;

    try {
      setLoadingMemberAction(email);
      await teamService.updateMemberStatus(team.id, email, status);
      toast.success('Member status updated');
      await onUpdate();
    } catch (error) {
      console.error('Error updating member status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update member');
    } finally {
      setLoadingMemberAction(null);
    }
  }, [team.id, onUpdate, loadingMemberAction]);

  const handleRemoveMember = useCallback(async (email: string) => {
    if (loadingMemberAction) return;
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      setLoadingMemberAction(email);
      await teamService.removeMember(team.id, email);
      toast.success('Member removed');
      await onUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    } finally {
      setLoadingMemberAction(null);
    }
  }, [team.id, onUpdate, loadingMemberAction]);

  const renderMemberStatus = (member: TeamMember) => {
    if (!member) return null;
    
    switch (member.status) {
      case 'active':
        return (
          <span className="text-green-600 flex items-center gap-1">
            <Activity className="w-4 h-4" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="text-red-600 flex items-center gap-1">
            <Ban className="w-4 h-4" />
            Inactive
          </span>
        );
      case 'pending':
        return (
          <span className="text-yellow-600 flex items-center gap-1">
            <Mail className="w-4 h-4" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const renderMemberRole = (member: TeamMember) => {
    if (!member) return null;
    
    return (
      <span className="flex items-center gap-1">
        <Shield className="w-4 h-4" />
        {member.role}
      </span>
    );
  };

  const membersList = Object.entries(team.memberDetails || {}).filter(([_, member]) => member !== null);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">Team Members</h3>
      
      {team.isOwner && (
        <>
          <form onSubmit={handleAddMember} className="mb-6">
            <div className="flex gap-2">
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Enter member's email"
                className="flex-1 p-2 border rounded"
                disabled={isLoading}
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={isLoading || !newMemberEmail}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Add Member
              </button>
            </div>
          </form>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-start gap-3">
                <div className="text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-800">{successMessage}</p>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="mt-2 text-sm text-green-600 hover:text-green-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {resetLink && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">Member Access Instructions</h4>
              <p className="text-sm text-yellow-700 mb-2">
                Please share these instructions with the new member:
              </p>
              <div className="bg-white p-3 rounded border border-yellow-300 text-sm">
                <p className="mb-2">To access the system, please:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the link below to set your password</li>
                  <li>Create a new password</li>
                  <li>Log in with your email and new password</li>
                </ol>
                <div className="mt-3">
                  <p className="font-medium mb-1">Password Reset Link:</p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={resetLink}
                      readOnly
                      className="flex-1 p-2 bg-gray-50 border rounded text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(resetLink);
                        toast.success('Link copied to clipboard');
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setResetLink(null)}
                  className="mt-3 text-sm text-gray-600 hover:text-gray-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="space-y-4">
        {membersList.map(([email, member]) => (
          <div key={email} className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <div className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                {email}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                {renderMemberRole(member)} • {renderMemberStatus(member)}
              </div>
            </div>
            
            {team.isOwner && member && member.role !== 'owner' && (
              <div className="flex gap-2">
                {member.status !== 'active' && (
                  <button
                    onClick={() => handleUpdateStatus(email, 'active')}
                    disabled={!!loadingMemberAction}
                    className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 disabled:opacity-50"
                    title="Activate member"
                  >
                    {loadingMemberAction === email ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Power className="w-5 h-5" />
                    )}
                  </button>
                )}
                {member.status !== 'inactive' && (
                  <button
                    onClick={() => handleUpdateStatus(email, 'inactive')}
                    disabled={!!loadingMemberAction}
                    className="text-orange-600 hover:text-orange-800 p-2 rounded-full hover:bg-orange-50 disabled:opacity-50"
                    title="Deactivate member"
                  >
                    {loadingMemberAction === email ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Ban className="w-5 h-5" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleRemoveMember(email)}
                  disabled={!!loadingMemberAction}
                  className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 disabled:opacity-50"
                  title="Remove member"
                >
                  {loadingMemberAction === email ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        ))}

        {membersList.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No members in this team yet.
          </p>
        )}
      </div>
    </div>
  );
};

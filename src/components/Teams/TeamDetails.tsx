import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Crown, X, Eye, EyeOff, ToggleLeft, ToggleRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useTeamStore } from '../../store/useTeamStore';
import { useAuthStore } from '../../store/useAuthStore';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { format } from 'date-fns';

export const TeamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    teams, 
    loading, 
    error,
    notification,
    addMember, 
    removeMember, 
    toggleMemberStatus,
    clearError,
    clearNotification
  } = useTeamStore();
  const [email, setEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const team = teams.find(t => t.id === id);
  const isOwner = team?.ownerId === user?.uid;
  const currentUserRole = team?.members[user?.uid || '']?.role;

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => clearNotification(), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team?.id || !email.trim()) return;

    // Check if email already exists in team
    const memberExists = Object.values(team.members).some(
      member => member.email.toLowerCase() === email.toLowerCase()
    );

    if (memberExists) {
      clearError();
      clearNotification();
      useTeamStore.setState({ 
        notification: {
          type: 'warning',
          message: 'This user is already a member of the team'
        }
      });
      return;
    }

    try {
      await addMember(team.id, email.trim());
      setEmail('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    if (!team?.id) return;
    try {
      await toggleMemberStatus(team.id, userId);
    } catch (error) {
      console.error('Error toggling member status:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!team?.id) return;
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(team.id, userId);
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!team) return <ErrorMessage message="Team not found" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/teams')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">{team.name}</h2>
            <p className="text-sm text-gray-500">
              {Object.keys(team.members).length} members
            </p>
          </div>
        </div>
        
        {isOwner && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Member
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {notification && (
        <div className={`border-l-4 p-4 ${
          notification.type === 'warning' 
            ? 'bg-yellow-50 border-yellow-400' 
            : 'bg-green-50 border-green-400'
        }`}>
          <div className="flex">
            <AlertCircle className={`h-5 w-5 ${
              notification.type === 'warning' ? 'text-yellow-400' : 'text-green-400'
            }`} />
            <p className={`ml-3 text-sm ${
              notification.type === 'warning' ? 'text-yellow-700' : 'text-green-700'
            }`}>
              {notification.message}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(team.members)
          .sort(([, a], [, b]) => {
            // Sort by role (owner first, then admin, then member)
            const roleOrder = { owner: 0, admin: 1, member: 2 };
            const roleCompare = roleOrder[a.role] - roleOrder[b.role];
            if (roleCompare !== 0) return roleCompare;
            
            // Then sort by status (active first)
            if (a.status !== b.status) {
              return a.status === 'active' ? -1 : 1;
            }
            
            // Finally sort by email
            return a.email.localeCompare(b.email);
          })
          .map(([userId, member]) => (
            <div
              key={userId}
              className={`flex items-center justify-between p-4 bg-white rounded-lg shadow ${
                member.status === 'inactive' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                {member.role === 'owner' && (
                  <Crown className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium">{member.email}</p>
                  <p className="text-sm text-gray-500">
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)} · 
                    Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {member.initialPassword && (
                  <button
                    onClick={() => setSelectedMember(selectedMember === userId ? null : userId)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="View initial password"
                  >
                    {selectedMember === userId ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                )}
                
                {member.role !== 'owner' && (isOwner || currentUserRole === 'admin') && (
                  <>
                    <button
                      onClick={() => handleToggleStatus(userId)}
                      className={`p-2 ${
                        member.status === 'active' 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-red-600 hover:text-red-700'
                      }`}
                      title={`${member.status === 'active' ? 'Deactivate' : 'Activate'} member`}
                    >
                      {member.status === 'active' ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveMember(userId)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Remove member"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </>
                )}
              </div>
              
              {selectedMember === userId && member.initialPassword && (
                <div className="absolute right-0 mt-2 p-2 bg-white rounded-md shadow-lg border border-gray-200">
                  <p className="text-sm font-mono">{member.initialPassword}</p>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Team Member</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEmail('');
                  clearError();
                  clearNotification();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEmail('');
                    clearError();
                    clearNotification();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
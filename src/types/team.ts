export type TeamMemberRole = 'owner' | 'member';
export type TeamMemberStatus = 'active' | 'inactive' | 'pending';

export interface TeamMember {
  email: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  memberDetails: Record<string, TeamMember>;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  isOwner?: boolean;
}
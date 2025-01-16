import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  or
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  getAuth
} from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { Team, TeamMember } from '../types/team';

export const teamService = {
  async getUserTeams(): Promise<Team[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const teamsRef = collection(db, 'teams');
      const q = query(
        teamsRef,
        or(
          where('ownerId', '==', user.uid),
          where(`memberDetails.${user.email}.status`, 'in', ['active', 'pending'])
        )
      );

      const querySnapshot = await getDocs(q);
      const teams: Team[] = [];

      querySnapshot.forEach((doc) => {
        const teamData = doc.data();
        teams.push({
          ...teamData,
          id: doc.id,
          isOwner: teamData.ownerId === user.uid,
          status: teamData.status || 'active',
          memberDetails: teamData.memberDetails || {}
        } as Team);
      });

      return teams;
    } catch (error) {
      console.error('Error in getUserTeams:', error);
      throw error;
    }
  },

  async createTeam(name: string): Promise<Team> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      const teamData: Omit<Team, 'id'> = {
        name,
        ownerId: user.uid,
        status: 'active',
        memberDetails: {
          [user.email!]: {
            email: user.email!,
            role: 'owner',
            status: 'active',
            addedAt: new Date().toISOString()
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'teams'), teamData);
      return { ...teamData, id: docRef.id, isOwner: true } as Team;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  async addMember(teamId: string, email: string): Promise<{ message: string }> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);

      if (!teamSnap.exists()) {
        throw new Error('Team not found');
      }

      const teamData = teamSnap.data() as Team;
      if (teamData.ownerId !== user.uid) {
        throw new Error('Only team owner can add members');
      }

      // Check if member already exists
      if (teamData.memberDetails && teamData.memberDetails[email]) {
        throw new Error('Member already exists in team');
      }

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);

      try {
        // Create new user account
        await createUserWithEmailAndPassword(getAuth(), email, tempPassword);
      } catch (error: any) {
        // If user already exists, that's fine
        if (error.code !== 'auth/email-already-in-use') {
          throw error;
        }
      }

      // Send password reset email
      await sendPasswordResetEmail(getAuth(), email);

      // Add new member with pending status
      const newMember: TeamMember = {
        email,
        role: 'member',
        status: 'pending',
        addedAt: new Date().toISOString()
      };

      await updateDoc(teamRef, {
        [`memberDetails.${email}`]: newMember
      });

      return { 
        message: `Member added successfully. A password reset email has been sent to ${email}.`
      };

    } catch (error) {
      console.error('Error in addMember:', error);
      throw error;
    }
  },

  async updateMemberStatus(teamId: string, memberEmail: string, status: 'active' | 'inactive'): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }

      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }

      const team = teamDoc.data() as Team;

      // Check if user is owner
      if (team.ownerId !== user.uid) {
        throw new Error('Only team owner can update member status');
      }

      await updateDoc(teamRef, {
        [`memberDetails.${memberEmail}.status`]: status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in updateMemberStatus:', error);
      throw error;
    }
  },

  async removeMember(teamId: string, memberEmail: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }

      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }

      const team = teamDoc.data() as Team;

      // Check if user is owner
      if (team.ownerId !== user.uid) {
        throw new Error('Only team owner can remove members');
      }

      // Can't remove the owner
      const memberKey = memberEmail.replace('.', '_');
      if (team.memberDetails[memberKey]?.role === 'owner') {
        throw new Error('Cannot remove team owner');
      }

      await updateDoc(teamRef, {
        [`memberDetails.${memberKey}`]: null,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in removeMember:', error);
      throw error;
    }
  },

  async updateTeam(teamId: string, name: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      throw new Error('Team not found');
    }

    const teamData = teamSnap.data() as Team;
    if (teamData.ownerId !== user.uid) {
      throw new Error('Only team owner can update team');
    }

    await updateDoc(teamRef, { name });
  },

  async updateTeamStatus(teamId: string, status: 'active' | 'inactive'): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      throw new Error('Team not found');
    }

    const teamData = teamSnap.data() as Team;
    if (teamData.ownerId !== user.uid) {
      throw new Error('Only team owner can update team status');
    }

    await updateDoc(teamRef, { status });
  },

  async deleteTeam(teamId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      throw new Error('Team not found');
    }

    const teamData = teamSnap.data() as Team;
    if (teamData.ownerId !== user.uid) {
      throw new Error('Only team owner can delete team');
    }

    await deleteDoc(teamRef);
  },
};
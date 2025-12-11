import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Group {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: string;
  streak: number;
  profile?: {
    display_name: string | null;
    email: string | null;
  };
}

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const fetchUserGroups = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get groups the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const groupIds = memberData.map(m => m.group_id);
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds);

        if (groupsError) throw groupsError;
        setGroups(groupsData || []);
        
        if (groupsData && groupsData.length > 0) {
          setCurrentGroup(groupsData[0]);
        }
      } else {
        setGroups([]);
        setCurrentGroup(null);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchGroupMembers = useCallback(async (groupId: string) => {
    if (!user) return;

    try {
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      // Fetch profiles for each member
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        const membersWithProfiles = membersData.map(member => ({
          ...member,
          profile: profilesData?.find(p => p.id === member.user_id) || null
        }));

        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, [user]);

  const createGroup = async (name: string) => {
    if (!user) return null;

    const inviteCode = generateInviteCode();

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          created_by: user.id,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as a member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          user_id: user.id,
          group_id: groupData.id,
          streak: 0
        });

      if (memberError) throw memberError;

      toast.success('Group created!');
      await fetchUserGroups();
      return groupData;
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
      return null;
    }
  };

  const joinGroup = async (inviteCode: string) => {
    if (!user) return false;

    try {
      // Find the group by invite code
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .maybeSingle();

      if (groupError) throw groupError;

      if (!groupData) {
        toast.error('Invalid invite code');
        return false;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', groupData.id)
        .maybeSingle();

      if (existingMember) {
        toast.error('You are already in this group');
        return false;
      }

      // Join the group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          user_id: user.id,
          group_id: groupData.id,
          streak: 0
        });

      if (joinError) throw joinError;

      toast.success(`Joined "${groupData.name}"!`);
      await fetchUserGroups();
      return true;
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
      return false;
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('user_id', user.id)
        .eq('group_id', groupId);

      if (error) throw error;

      toast.success('Left the group');
      setCurrentGroup(null);
      setMembers([]);
      await fetchUserGroups();
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
      return false;
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, [fetchUserGroups]);

  useEffect(() => {
    if (currentGroup) {
      fetchGroupMembers(currentGroup.id);
    }
  }, [currentGroup, fetchGroupMembers]);

  return {
    groups,
    members,
    currentGroup,
    isLoading,
    createGroup,
    joinGroup,
    leaveGroup,
    setCurrentGroup,
    refetch: fetchUserGroups
  };
}

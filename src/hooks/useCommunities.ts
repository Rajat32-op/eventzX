import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Community {
  id: string;
  name: string;
  description: string | null;
  type: string;
  image_url: string | null;
  created_by: string | null;
  member_count: number;
  is_joined: boolean;
  is_admin: boolean;
}

export interface CommunityMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCommunities = async () => {
    try {
      // Fetch all communities
      const { data: communitiesData, error: communitiesError } = await supabase
        .from("communities")
        .select("*");

      if (communitiesError) throw communitiesError;

      // Fetch member counts and roles
      const { data: memberData, error: countError } = await supabase
        .from("community_members")
        .select("community_id, user_id, role");

      if (countError) throw countError;

      // Get user's joined communities and admin status
      let userJoinedCommunities: string[] = [];
      let userAdminCommunities: string[] = [];
      if (user) {
        const userMembers = memberData?.filter((m) => m.user_id === user.id) || [];
        userJoinedCommunities = userMembers.map((m) => m.community_id);
        userAdminCommunities = userMembers
          .filter((m) => m.role === 'admin')
          .map((m) => m.community_id);
      }

      // Count members per community
      const countMap: Record<string, number> = {};
      memberData?.forEach((m) => {
        countMap[m.community_id] = (countMap[m.community_id] || 0) + 1;
      });

      const formattedCommunities = communitiesData?.map((community) => ({
        ...community,
        member_count: countMap[community.id] || 0,
        is_joined: userJoinedCommunities.includes(community.id),
        is_admin: userAdminCommunities.includes(community.id),
      })) || [];

      setCommunities(formattedCommunities);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) return;

    const community = communities.find((c) => c.id === communityId);
    if (!community) return;

    if (community.is_joined) {
      // Leave community
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Error", description: "Failed to leave community", variant: "destructive" });
        return;
      }

      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId
            ? { ...c, is_joined: false, member_count: c.member_count - 1 }
            : c
        )
      );
      toast({ title: "Left community", description: `You've left "${community.name}"` });
    } else {
      // Join community
      const { error } = await supabase
        .from("community_members")
        .insert({ community_id: communityId, user_id: user.id });

      if (error) {
        toast({ title: "Error", description: "Failed to join community", variant: "destructive" });
        return;
      }

      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId
            ? { ...c, is_joined: true, member_count: c.member_count + 1 }
            : c
        )
      );
      toast({ title: "Welcome to the Circle! 🎉", description: "You've joined the community." });
    }
  };

  const createCommunity = async (name: string, description: string | null, type: string, imageUrl?: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("communities")
      .insert({ 
        name, 
        description: description || null, 
        type, 
        created_by: user.id,
        image_url: imageUrl || null
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create community", variant: "destructive" });
      return null;
    }

    // Auto-join the creator as admin
    await supabase
      .from("community_members")
      .insert({ community_id: data.id, user_id: user.id, role: 'admin' });

    await fetchCommunities();
    toast({ title: "Circle Created! 🎉", description: `"${name}" is now live.` });
    return data;
  };

  useEffect(() => {
    fetchCommunities();
  }, [user]);

  // Fetch members of a community
  const fetchMembers = async (communityId: string): Promise<CommunityMember[]> => {
    const { data, error } = await supabase
      .from("community_members")
      .select(`
        id,
        user_id,
        role,
        joined_at,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .eq("community_id", communityId)
      .order("role", { ascending: false })
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Error fetching members:", error);
      return [];
    }

    return (data || []).map((member: any) => ({
      id: member.id,
      user_id: member.user_id,
      role: member.role || 'member',
      joined_at: member.joined_at,
      profile: member.profiles,
    }));
  };

  // Add a member to community (admin only)
  const addMember = async (communityId: string, userId: string) => {
    const { error } = await supabase
      .from("community_members")
      .insert({ community_id: communityId, user_id: userId, role: 'member' });

    if (error) {
      if (error.code === '23505') {
        toast({ title: "Already a member", description: "This user is already in the community", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to add member", variant: "destructive" });
      }
      return false;
    }

    await fetchCommunities();
    toast({ title: "Member added", description: "User has been added to the community" });
    return true;
  };

  // Remove a member from community (admin only)
  const removeMember = async (communityId: string, userId: string) => {
    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error", description: "Failed to remove member", variant: "destructive" });
      return false;
    }

    await fetchCommunities();
    toast({ title: "Member removed", description: "User has been removed from the community" });
    return true;
  };

  // Update community info (admin only)
  const updateCommunity = async (communityId: string, updates: { name?: string; description?: string | null; image_url?: string }) => {
    const { error } = await supabase
      .from("communities")
      .update(updates)
      .eq("id", communityId);

    if (error) {
      toast({ title: "Error", description: "Failed to update community", variant: "destructive" });
      return false;
    }

    await fetchCommunities();
    toast({ title: "Updated", description: "Community info has been updated" });
    return true;
  };

  // Upload community image
  const uploadCommunityImage = async (communityId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${communityId}.${fileExt}`;
    const filePath = `community-avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Add cache buster
    const imageUrl = `${publicUrl}?t=${Date.now()}`;
    await updateCommunity(communityId, { image_url: imageUrl });
    return imageUrl;
  };

  // Delete community (admin only)
  const deleteCommunity = async (communityId: string) => {
    // First delete all members
    const { error: membersError } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId);

    if (membersError) {
      toast({ title: "Error", description: "Failed to delete community members", variant: "destructive" });
      return false;
    }

    // Then delete the community
    const { error } = await supabase
      .from("communities")
      .delete()
      .eq("id", communityId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete community", variant: "destructive" });
      return false;
    }

    await fetchCommunities();
    toast({ title: "Deleted", description: "Community has been deleted" });
    return true;
  };

  return { 
    communities, 
    loading, 
    joinCommunity, 
    createCommunity, 
    refetch: fetchCommunities,
    fetchMembers,
    addMember,
    removeMember,
    updateCommunity,
    uploadCommunityImage,
    deleteCommunity
  };
}

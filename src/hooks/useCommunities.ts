import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Community {
  id: string;
  name: string;
  description: string;
  type: string;
  image_url: string | null;
  created_by: string | null;
  member_count: number;
  is_joined: boolean;
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

      // Fetch member counts
      const { data: memberCounts, error: countError } = await supabase
        .from("community_members")
        .select("community_id");

      if (countError) throw countError;

      // Get user's joined communities
      let userJoinedCommunities: string[] = [];
      if (user) {
        const { data: userMembers } = await supabase
          .from("community_members")
          .select("community_id")
          .eq("user_id", user.id);
        userJoinedCommunities = userMembers?.map((m) => m.community_id) || [];
      }

      // Count members per community
      const countMap: Record<string, number> = {};
      memberCounts?.forEach((m) => {
        countMap[m.community_id] = (countMap[m.community_id] || 0) + 1;
      });

      const formattedCommunities = communitiesData?.map((community) => ({
        ...community,
        member_count: countMap[community.id] || 0,
        is_joined: userJoinedCommunities.includes(community.id),
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

  const createCommunity = async (name: string, description: string, type: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("communities")
      .insert({ name, description, type, created_by: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create community", variant: "destructive" });
      return null;
    }

    // Auto-join the creator
    await supabase
      .from("community_members")
      .insert({ community_id: data.id, user_id: user.id });

    await fetchCommunities();
    toast({ title: "Circle Created! 🎉", description: `"${name}" is now live.` });
    return data;
  };

  useEffect(() => {
    fetchCommunities();
  }, [user]);

  return { communities, loading, joinCommunity, createCommunity, refetch: fetchCommunities };
}

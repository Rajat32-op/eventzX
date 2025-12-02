import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  college: string | null;
  city: string | null;
  bio: string | null;
  interests: string[];
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export function useFriendRequests() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { createNotification } = useNotifications();

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch all profiles except current user
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id);

      if (profilesError) throw profilesError;
      setProfiles(profilesData?.map(p => ({ ...p, interests: p.interests || [] })) || []);

      // Fetch sent requests
      const { data: sentData, error: sentError } = await supabase
        .from("friend_requests")
        .select("receiver_id, status")
        .eq("sender_id", user.id);

      if (sentError) throw sentError;
      setSentRequests(sentData?.filter(r => r.status === "pending").map(r => r.receiver_id) || []);
      
      // Get accepted friends from sent requests
      const sentFriends = sentData?.filter(r => r.status === "accepted").map(r => r.receiver_id) || [];

      // Fetch received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from("friend_requests")
        .select(`
          *,
          sender:profiles!friend_requests_sender_id_fkey(id, name, email, avatar_url, college, city, bio, interests)
        `)
        .eq("receiver_id", user.id);

      if (receivedError) throw receivedError;
      setReceivedRequests(receivedData?.filter(r => r.status === "pending").map(r => ({
        ...r,
        sender: r.sender ? { ...r.sender, interests: r.sender.interests || [] } : undefined
      })) as FriendRequest[] || []);
      
      // Get accepted friends from received requests
      const receivedFriends = receivedData?.filter(r => r.status === "accepted").map(r => r.sender_id) || [];
      
      setFriends([...sentFriends, ...receivedFriends]);
    } catch (error) {
      console.error("Error fetching friend data:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (receiverId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("friend_requests")
      .insert({ sender_id: user.id, receiver_id: receiverId });

    if (error) {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
      return;
    }

    // Get sender profile info for notification
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    // Create notification for receiver
    await createNotification(
      receiverId,
      'friend_request',
      'New Connection Request',
      `${senderProfile?.name || 'Someone'} wants to connect with you`,
      '/discover'
    );

    setSentRequests((prev) => [...prev, receiverId]);
    toast({ title: "Request Sent! 🙏", description: "They'll be notified about your connection request." });
  };

  const acceptRequest = async (requestId: string, senderId: string) => {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      toast({ title: "Error", description: "Failed to accept request", variant: "destructive" });
      return;
    }

    setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
    setFriends((prev) => [...prev, senderId]);
    toast({ title: "Connected! 🎉", description: "You're now connected." });
  };

  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) {
      toast({ title: "Error", description: "Failed to reject request", variant: "destructive" });
      return;
    }

    setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
    toast({ title: "Request Declined", description: "The request has been declined." });
  };

  const disconnectFriend = async (friendId: string) => {
    if (!user) return;

    // Find the friend request (could be sent or received)
    const { error } = await supabase
      .from("friend_requests")
      .delete()
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
      .eq("status", "accepted");

    if (error) {
      toast({ title: "Error", description: "Failed to disconnect", variant: "destructive" });
      return;
    }

    setFriends((prev) => prev.filter((id) => id !== friendId));
    toast({ title: "Disconnected", description: "You are no longer connected." });
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    profiles,
    sentRequests,
    receivedRequests,
    friends,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    disconnectFriend,
    refetch: fetchData,
  };
}

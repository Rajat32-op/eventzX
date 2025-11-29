import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  community_id: string | null;
  content: string;
  created_at: string;
  read_at: string | null;
  sender?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface Conversation {
  id: string;
  name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_community: boolean;
}

export function useMessages(receiverId?: string, communityId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMessages = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, name, avatar_url)
        `)
        .order("created_at", { ascending: true });

      if (receiverId) {
        query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`);
      } else if (communityId) {
        query = query.eq("community_id", communityId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Fetch all messages involving the user
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (messagesError) throw messagesError;

      // Fetch community messages
      const { data: communityMemberships } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user.id);

      const communityIds = communityMemberships?.map(m => m.community_id) || [];

      let communityMessages: any[] = [];
      if (communityIds.length > 0) {
        const { data: commMsgs } = await supabase
          .from("messages")
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(id, name, avatar_url)
          `)
          .in("community_id", communityIds)
          .order("created_at", { ascending: false });
        communityMessages = commMsgs || [];
      }

      // Fetch communities info
      const { data: communitiesData } = await supabase
        .from("communities")
        .select("*")
        .in("id", communityIds);

      // Group messages by conversation
      const conversationMap: Record<string, Conversation> = {};

      // Process direct messages
      messagesData?.forEach((msg) => {
        const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
        if (!otherUser || msg.community_id) return;

        const convId = otherUser.id;
        if (!conversationMap[convId] || new Date(msg.created_at) > new Date(conversationMap[convId].last_message_time)) {
          conversationMap[convId] = {
            id: convId,
            name: otherUser.name,
            avatar_url: otherUser.avatar_url,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: msg.receiver_id === user.id && !msg.read_at ? 1 : 0,
            is_community: false,
          };
        } else if (msg.receiver_id === user.id && !msg.read_at) {
          conversationMap[convId].unread_count++;
        }
      });

      // Process community messages
      communitiesData?.forEach((community) => {
        const communityMsgs = communityMessages.filter(m => m.community_id === community.id);
        const lastMsg = communityMsgs[0];
        
        conversationMap[`community_${community.id}`] = {
          id: community.id,
          name: community.name,
          avatar_url: community.image_url,
          last_message: lastMsg?.content || "No messages yet",
          last_message_time: lastMsg?.created_at || community.created_at,
          unread_count: 0,
          is_community: true,
        };
      });

      const sortedConversations = Object.values(conversationMap).sort(
        (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );

      setConversations(sortedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || (!receiverId && !communityId)) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: receiverId || null,
      community_id: communityId || null,
      content,
    });

    if (error) {
      console.error("Error sending message:", error);
      return false;
    }

    return true;
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Fetch sender info
          const { data: sender } = await supabase
            .from("profiles")
            .select("id, name, avatar_url")
            .eq("id", newMessage.sender_id)
            .single();

          const messageWithSender = { ...newMessage, sender };

          // Check if this message belongs to current conversation
          if (receiverId) {
            if (
              (newMessage.sender_id === user.id && newMessage.receiver_id === receiverId) ||
              (newMessage.sender_id === receiverId && newMessage.receiver_id === user.id)
            ) {
              setMessages((prev) => [...prev, messageWithSender]);
            }
          } else if (communityId && newMessage.community_id === communityId) {
            setMessages((prev) => [...prev, messageWithSender]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, receiverId, communityId]);

  useEffect(() => {
    if (receiverId || communityId) {
      fetchMessages();
    } else {
      fetchConversations();
    }
  }, [user, receiverId, communityId]);

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    refetchMessages: fetchMessages,
    refetchConversations: fetchConversations,
  };
}

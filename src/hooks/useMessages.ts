import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

const MESSAGES_PER_PAGE = 15;

export function useMessages(receiverId?: string, communityId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!user) return;

    const conversationId = receiverId || communityId;
    
    try {
      const from = pageNum * MESSAGES_PER_PAGE;
      const to = from + MESSAGES_PER_PAGE - 1;

      let query = supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (receiverId) {
        query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`);
      } else if (communityId) {
        query = query.eq("community_id", communityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const newMessages = (data || []).reverse(); // Reverse to get oldest first
      
      if (append) {
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
      }

      setHasMore((data || []).length === MESSAGES_PER_PAGE);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error loading messages",
        description: "Could not load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, receiverId, communityId, toast]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchMessages(nextPage, true);
  }, [page, hasMore, loading, fetchMessages]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // PHASE 3: Fetch unread counts from user_chat_metadata
      const { data: metadataData, error: metadataError } = await (supabase as any)
        .from("user_chat_metadata")
        .select("*")
        .eq("user_id", user.id);

      if (metadataError) throw metadataError;

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
        
        // Initialize conversation if it doesn't exist
        if (!conversationMap[convId]) {
          // Get unread count from metadata
          const metadata = metadataData?.find(m => 
            m.chat_id === convId && m.chat_type === 'private'
          );
          
          conversationMap[convId] = {
            id: convId,
            name: otherUser.name,
            avatar_url: otherUser.avatar_url,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: metadata?.unread_count || 0,
            is_community: false,
          };
        }
        
        // Update to latest message if this one is newer
        if (new Date(msg.created_at) > new Date(conversationMap[convId].last_message_time)) {
          conversationMap[convId].last_message = msg.content;
          conversationMap[convId].last_message_time = msg.created_at;
        }
      });

      // Process community messages
      communitiesData?.forEach((community) => {
        const communityMsgs = communityMessages.filter(m => m.community_id === community.id);
        const lastMsg = communityMsgs[0];
        
        // Get unread count from metadata
        const metadata = metadataData?.find(m => 
          m.chat_id === community.id && m.chat_type === 'group'
        );
        
        conversationMap[`community_${community.id}`] = {
          id: community.id,
          name: community.name,
          avatar_url: community.image_url,
          last_message: lastMsg?.content || "No messages yet",
          last_message_time: lastMsg?.created_at || community.created_at,
          unread_count: metadata?.unread_count || 0,
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
  }, [user]);

  const markMessagesAsRead = async () => {
    if (!user || (!receiverId && !communityId)) return;

    try {
      // PHASE 4: Use new mark_messages_as_read function
      const chatId = receiverId || communityId;
      const chatType = receiverId ? 'private' : 'group';
      
      const { data, error } = await (supabase as any).rpc('mark_messages_as_read', {
        p_user_id: user.id,
        p_chat_id: chatId,
        p_chat_type: chatType
      });

      if (error) {
        console.error("Error in markMessagesAsRead:", error);
        throw error;
      }
      
      console.log(`Marked ${data} messages as read`);
      
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || (!receiverId && !communityId)) {
      console.log('sendMessage: Missing user or conversation ID', { user, receiverId, communityId });
      return false;
    }


    console.log('sendMessage: Attempting to send real message', { 
      sender_id: user.id, 
      receiver_id: receiverId, 
      community_id: communityId,
      content 
    });

    try {
      const { data, error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: receiverId || null,
        community_id: communityId || null,
        content,
      }).select();

      if (error) {
        console.error('sendMessage: Database error', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // PHASE 5: Subscribe to realtime updates with new tables
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscriptions for user:', user.id);

    // Subscribe to chat metadata updates (for unread counts)
    const metadataChannel = supabase
      .channel(`metadata-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_chat_metadata",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Metadata update received:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedMetadata = payload.new as any;
            
            // Update conversation unread count
            setConversations(prev => prev.map(conv => {
              const matchesChat = updatedMetadata.chat_type === 'private'
                ? conv.id === updatedMetadata.chat_id
                : conv.id === updatedMetadata.chat_id && conv.is_community;
              
              if (matchesChat) {
                return { ...conv, unread_count: updatedMetadata.unread_count };
              }
              return conv;
            }));
            
            // Recalculate total unread count
            fetchTotalUnreadCount();
          }
        }
      )
      .subscribe((status) => {
        console.log('Metadata subscription status:', status);
      });

    // Subscribe to messages in current conversation
    let messagesChannel: any = null;
    if (receiverId || communityId) {
      messagesChannel = supabase
        .channel(`messages-${receiverId || communityId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          async (payload) => {
            console.log('Realtime message received:', payload);
            const newMessage = payload.new as any;
            
            // Check if this message belongs to current conversation
            const isRelevant = receiverId 
              ? (newMessage.sender_id === user.id && newMessage.receiver_id === receiverId) ||
                (newMessage.sender_id === receiverId && newMessage.receiver_id === user.id)
              : newMessage.community_id === communityId;

            if (!isRelevant) {
              console.log('Message not relevant to current conversation');
              return;
            }
            
            // Fetch sender info
            const { data: sender } = await supabase
              .from("profiles")
              .select("id, name, avatar_url")
              .eq("id", newMessage.sender_id)
              .single();

            const messageWithSender = { ...newMessage, sender };

            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some(m => m.id === messageWithSender.id)) {
                console.log('Message already exists, skipping');
                return prev;
              }
              console.log('Adding new message to state');
              return [...prev, messageWithSender];
            });
          }
        )
        .subscribe((status) => {
          console.log('Messages subscription status:', status);
        });
    }

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(metadataChannel);
      if (messagesChannel) {
        supabase.removeChannel(messagesChannel);
      }
    };
  }, [user, receiverId, communityId]);

  // Fetch total unread count
  const fetchTotalUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any).rpc('get_total_unread_count', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      const count = data || 0;
      setTotalUnreadCount(count);
      
      // Update document title with unread count
      if (count > 0) {
        document.title = `(${count}) EventzX`;
      } else {
        document.title = 'EventzX';
      }
    } catch (error) {
      console.error("Error fetching total unread count:", error);
    }
  }, [user]);

  // Load total unread count on mount
  useEffect(() => {
    if (user) {
      fetchTotalUnreadCount();
    }
  }, [user, fetchTotalUnreadCount]);

  useEffect(() => {
    if (receiverId || communityId) {
      setPage(0);
      setMessages([]);
      fetchMessages(0, false);
    } else {
      fetchConversations();
    }
  }, [user, receiverId, communityId, fetchConversations, fetchMessages]);

  return {
    messages,
    conversations,
    loading,
    hasMore,
    totalUnreadCount,
    sendMessage,
    loadMoreMessages,
    markMessagesAsRead,
    refetchMessages: () => fetchMessages(0, false),
    refetchConversations: fetchConversations,
    fetchTotalUnreadCount,
  };
}

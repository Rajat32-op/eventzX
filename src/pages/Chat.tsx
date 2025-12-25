import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, Users, UserPlus, ArrowRight } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface Friend {
  id: string;
  name: string;
  avatar_url: string | null;
  college: string | null;
  city: string | null;
}

export default function Chat() {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const { conversations, loading, refetchConversations } = useMessages();
  const { totalUnreadCount } = useUnreadCount();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch friends for search
  useEffect(() => {
    async function fetchFriends() {
      if (!user) return;
      setLoadingFriends(true);
      
      try {
        const { data: friendRequests } = await supabase
          .from('friend_requests')
          .select(`
            sender:profiles!friend_requests_sender_id_fkey(id, name, avatar_url, college, city),
            receiver:profiles!friend_requests_receiver_id_fkey(id, name, avatar_url, college, city),
            sender_id,
            receiver_id
          `)
          .eq('status', 'accepted')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (friendRequests) {
          const friendsList = friendRequests.map(req => {
            const friend = req.sender_id === user.id ? req.receiver : req.sender;
            return friend as Friend;
          }).filter(Boolean);
          
          setFriends(friendsList);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoadingFriends(false);
      }
    }
    
    fetchFriends();
  }, [user]);

  // Refetch conversations when component mounts
  useEffect(() => {
    if (refetchConversations) {
      refetchConversations();
    }
  }, [refetchConversations]);

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter((conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Filter friends by search
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const conversationUserIds = conversations
      .filter(c => !c.is_community)
      .map(c => c.id);
    
    return friends
      .filter(friend => 
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !conversationUserIds.includes(friend.id)
      );
  }, [friends, searchQuery, conversations]);

  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-blue-50/95 backdrop-blur-lg dark:glass dark:backdrop-blur-lg border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center relative shadow-lg">
              <MessageCircle className="w-5 h-5 text-white" />
              {totalUnreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center text-xs px-1"
                >
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </Badge>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-xl text-foreground">
                Messages
              </h1>
              <p className="text-xs text-muted-foreground">
                {totalUnreadCount > 0 ? `${totalUnreadCount} unread messages` : 'Your conversations'}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search friends or conversations..."
              className="pl-10 bg-background/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 py-4">
        {showSearchResults ? (
          <div className="space-y-4">
            {/* Friends matching search (not in conversations) */}
            {filteredFriends.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Start new chat
                </h3>
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <Card
                      key={friend.id}
                      className="border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-md"
                      onClick={() => navigate(`/chat/user/${friend.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-11 h-11 border-2 border-primary/20">
                            <AvatarImage src={friend.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {friend.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">
                              {friend.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {friend.college || friend.city || 'No location'}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" className="shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Conversations matching search */}
            {filteredConversations.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Conversations
                </h3>
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      onClick={() =>
                        navigate(
                          conversation.is_community
                            ? `/chat/community/${conversation.id}`
                            : `/chat/user/${conversation.id}`
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {/* No results */}
            {filteredFriends.length === 0 && filteredConversations.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try searching for a friend's name
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  No conversations yet
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
                  Connect with people or join communities to start chatting
                </p>
                <Button variant="outline" onClick={() => navigate("/discover")}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Find Friends
                </Button>
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  onClick={() =>
                    navigate(
                      conversation.is_community
                        ? `/chat/community/${conversation.id}`
                        : `/chat/user/${conversation.id}`
                    )
                  }
                />
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ConversationCard({ 
  conversation, 
  onClick 
}: { 
  conversation: any; 
  onClick: () => void;
}) {
  return (
    <Card
      className="border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-md group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-transparent group-hover:border-primary/30 transition-colors">
              <AvatarImage src={conversation.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {conversation.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {conversation.is_community && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center border-2 border-background">
                <Users className="w-3 h-3 text-foreground" />
              </div>
            )}
            {conversation.unread_count > 0 && !conversation.is_community && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h3 className="font-display font-semibold text-foreground truncate">
                {conversation.name}
              </h3>
              <span className="text-[11px] text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(conversation.last_message_time), {
                  addSuffix: false,
                })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate pr-8">
              {conversation.last_message}
            </p>
          </div>

          {conversation.unread_count > 0 && (
            <Badge className="bg-primary text-primary-foreground shrink-0 rounded-full min-w-[22px] h-[22px] flex items-center justify-center text-xs">
              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

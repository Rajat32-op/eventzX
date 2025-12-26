import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, Users, UserPlus, ArrowRight, Sparkles, MessagesSquare } from "lucide-react";
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
      {/* Header with gradient */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 dark:from-primary/5 dark:via-accent/5 dark:to-secondary/5 backdrop-blur-xl border-b border-border/50">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                <MessagesSquare className="w-6 h-6 text-white" />
              </div>
              {totalUnreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center text-xs px-1.5 bg-red-500 hover:bg-red-500 border-2 border-background"
                >
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </Badge>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-xl bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Messages
              </h1>
              <p className="text-xs text-muted-foreground">
                {totalUnreadCount > 0 ? `${totalUnreadCount} unread` : 'Stay connected'}
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          </div>

          {/* Search with enhanced styling */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search friends or conversations..."
              className="pl-10 bg-background/80 border-primary/20 focus:border-primary/50 rounded-xl h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 py-4 pb-24">
        {showSearchResults ? (
          <div className="space-y-6">
            {/* Friends matching search (not in conversations) */}
            {filteredFriends.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                    <UserPlus className="w-3.5 h-3.5 text-white" />
                  </div>
                  Start new chat
                </h3>
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <Card
                      key={friend.id}
                      className="bg-gradient-to-r from-accent/5 to-secondary/5 border-accent/20 hover:border-accent/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5"
                      onClick={() => navigate(`/chat/user/${friend.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 ring-2 ring-accent/30">
                            <AvatarImage src={friend.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-accent to-secondary text-white font-semibold">
                              {friend.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {friend.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {friend.college || friend.city || 'Tap to chat'}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <ArrowRight className="w-4 h-4 text-accent" />
                          </div>
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
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                  </div>
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
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Search className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">No results for "{searchQuery}"</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Try searching for a friend's name
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-muted-foreground">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center">
                  <MessagesSquare className="w-12 h-12 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  Start Chatting!
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                  Connect with friends or join communities to start conversations
                </p>
                <Button 
                  onClick={() => navigate("/discover")}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Find Friends
                </Button>
              </div>
            ) : (
              conversations.map((conversation, index) => (
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
                  index={index}
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
  onClick,
  index = 0
}: { 
  conversation: any; 
  onClick: () => void;
  index?: number;
}) {
  const isGroup = conversation.is_community;
  
  return (
    <Card
      className="border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 group overflow-hidden animate-fade-up"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-3">
          {/* Avatar with gradient ring */}
          <div className="relative">
            <div className={`p-0.5 rounded-full ${isGroup ? 'bg-gradient-to-br from-accent to-secondary' : 'bg-gradient-to-br from-primary to-accent'}`}>
              <Avatar className="w-12 h-12 border-2 border-background">
                <AvatarImage src={conversation.avatar_url} />
                <AvatarFallback className={`font-semibold ${isGroup ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                  {conversation.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            {isGroup && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center border-2 border-background shadow-sm">
                <Users className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {conversation.name}
              </h3>
              <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                {formatDistanceToNow(new Date(conversation.last_message_time), {
                  addSuffix: false,
                })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {conversation.last_message}
            </p>
          </div>

          {/* Unread badge */}
          {conversation.unread_count > 0 && (
            <Badge className="bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white shrink-0 rounded-full min-w-[24px] h-6 flex items-center justify-center text-xs font-bold shadow-lg shadow-primary/25">
              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
            </Badge>
          )}
        </div>
        
        {/* Hover gradient line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-accent to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </CardContent>
    </Card>
  );
}

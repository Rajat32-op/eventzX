import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Users, Loader2, MoreVertical, Phone, Video, Info, Sparkles, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMessages } from "@/hooks/useMessages";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

export default function ChatRoom() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshUnreadCount } = useUnreadCount();
  const [newMessage, setNewMessage] = useState("");
  const [chatInfo, setChatInfo] = useState<{ name: string; avatar_url: string | null } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const isCommunity = type === "community";
  const { messages, loading, hasMore, sendMessage: sendMsg, loadMoreMessages, markMessagesAsRead, refetchConversations } = useMessages(
    isCommunity ? undefined : id,
    isCommunity ? id : undefined
  );

  useEffect(() => {
    const fetchChatInfo = async () => {
      if (isCommunity) {
        const { data } = await supabase
          .from("communities")
          .select("name, image_url")
          .eq("id", id)
          .single();
        if (data) setChatInfo({ name: data.name, avatar_url: data.image_url });
      } else {
        const { data } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("id", id)
          .single();
        if (data) setChatInfo(data);
      }
    };

    fetchChatInfo();
  }, [id, isCommunity]);

  // Mark messages as read when entering the chat
  useEffect(() => {
    if (user && id && markMessagesAsRead) {
      const markAsRead = async () => {
        await markMessagesAsRead();
        // Refresh conversations to update unread count
        if (refetchConversations) {
          refetchConversations();
        }
        // Refresh global unread count
        refreshUnreadCount();
      };
      markAsRead();
    }
  }, [id, user, markMessagesAsRead, refetchConversations, refreshUnreadCount]);

  useEffect(() => {
    // Only auto-scroll on new messages, not on initial load
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const success = await sendMsg(newMessage.trim());
    if (success) {
      setNewMessage("");
    }
    setIsSending(false);
  };

  const handleLoadMore = async () => {
    const container = messagesContainerRef.current;
    const scrollHeightBefore = container?.scrollHeight || 0;
    
    await loadMoreMessages();
    
    // Maintain scroll position after loading more messages
    setTimeout(() => {
      if (container) {
        const scrollHeightAfter = container.scrollHeight;
        container.scrollTop = scrollHeightAfter - scrollHeightBefore;
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header with gradient */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 dark:from-primary/5 dark:via-accent/5 dark:to-secondary/5 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/chat")} 
              className="shrink-0 hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div 
              className="relative cursor-pointer group"
              onClick={() => !isCommunity && id && navigate(`/user/${id}`)}
            >
              <div className={`p-0.5 rounded-full ${isCommunity ? 'bg-gradient-to-br from-accent to-secondary' : 'bg-gradient-to-br from-primary to-accent'}`}>
                <Avatar className="w-10 h-10 border-2 border-background">
                  <AvatarImage src={chatInfo?.avatar_url || undefined} />
                  <AvatarFallback className={`font-semibold ${isCommunity ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                    {chatInfo?.name?.charAt(0).toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>
              </div>
              {isCommunity && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center border-2 border-background shadow-sm">
                  <Users className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div 
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => !isCommunity && id && navigate(`/user/${id}`)}
            >
              <h1 className="font-display font-semibold text-foreground truncate">
                {chatInfo?.name || "Loading..."}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isCommunity ? "Community Chat" : "Tap for profile"}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isCommunity && (
                  <DropdownMenuItem onClick={() => id && navigate(`/user/${id}`)}>
                    <Info className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                )}
                {isCommunity && (
                  <DropdownMenuItem onClick={() => navigate(`/communities`)}>
                    <Users className="w-4 h-4 mr-2" />
                    View Community
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Load More Button */}
        {hasMore && !loading && messages.length > 0 && (
          <div className="flex justify-center pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              className="rounded-full text-xs bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/50"
            >
              Load older messages
            </Button>
          </div>
        )}
        
        {loading && messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center mb-4">
              <Send className="w-10 h-10 text-primary" />
            </div>
            <p className="font-semibold text-foreground">Say Hello! 👋</p>
            <p className="text-sm text-muted-foreground mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === user?.id;
            const messageDate = new Date(message.created_at);
            const showDate = index === 0 || 
              new Date(messages[index - 1].created_at).toDateString() !== messageDate.toDateString();
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20 px-4 py-1.5 rounded-full font-medium">
                      {isToday(messageDate) ? 'Today' : 
                       isYesterday(messageDate) ? 'Yesterday' : 
                       format(messageDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                  {!isOwn && (
                    <Avatar 
                      className="w-8 h-8 cursor-pointer ring-2 ring-primary/20"
                      onClick={() => message.sender?.id && navigate(`/user/${message.sender.id}`)}
                    >
                      <AvatarImage src={message.sender?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xs font-semibold">
                        {message.sender?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-md ${
                      isOwn
                        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-br-sm"
                        : "bg-card text-foreground rounded-bl-sm border border-primary/10 shadow-primary/5"
                    }`}
                  >
                    {isCommunity && !isOwn && (
                      <p 
                        className="text-xs font-semibold mb-1 text-primary cursor-pointer hover:underline"
                        onClick={() => message.sender?.id && navigate(`/user/${message.sender.id}`)}
                      >
                        {message.sender?.name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      {format(messageDate, 'h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-primary/10 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 backdrop-blur-lg p-4 pb-safe">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 rounded-full bg-background/80 border-primary/20 focus:border-primary focus:ring-primary/20"
            disabled={isSending}
          />
          <Button 
            onClick={handleSend} 
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="rounded-full w-10 h-10 shrink-0 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

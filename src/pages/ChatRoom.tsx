import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Users, Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={
                    chatInfo?.avatar_url ||
                    `https://api.dicebear.com/7.x/${isCommunity ? "shapes" : "avataaars"}/svg?seed=${chatInfo?.name || id}`
                  }
                />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {chatInfo?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              {isCommunity && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                  <Users className="w-2.5 h-2.5 text-foreground" />
                </div>
              )}
            </div>
            <div>
              <h1 className="font-display font-semibold text-foreground">
                {chatInfo?.name || "Loading..."}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isCommunity ? "Community Chat" : "Direct Message"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Load More Button */}
        {hasMore && !loading && messages.length > 0 && (
          <div className="flex justify-center pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
            >
              Load older messages
            </Button>
          </div>
        )}
        
        {loading && messages.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-2">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                {!isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={
                        message.sender?.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.name}`
                      }
                    />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {message.sender?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {isCommunity && !isOwn && (
                    <p className="text-xs font-medium mb-1 opacity-70">
                      {message.sender?.name}
                    </p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border glass p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
            disabled={isSending}
          />
          <Button 
            onClick={handleSend} 
            disabled={!newMessage.trim() || isSending}
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

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Users } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { dummyConversations } from "@/data/dummyData";

export default function Chat() {
  const [searchQuery, setSearchQuery] = useState("");
  const { conversations, loading } = useMessages();
  const navigate = useNavigate();

  // Always show dummy data alongside real conversations
  const displayConversations = [...conversations, ...dummyConversations];

  const filteredConversations = displayConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">Messages</h1>
              <p className="text-xs text-muted-foreground">Your conversations</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 py-6 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No conversations yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect with people or join communities to start chatting
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer"
              onClick={() =>
                navigate(
                  conversation.is_community
                    ? `/chat/community/${conversation.id}`
                    : `/chat/user/${conversation.id}`
                )
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={
                          conversation.avatar_url ||
                          `https://api.dicebear.com/7.x/${
                            conversation.is_community ? "shapes" : "avataaars"
                          }/svg?seed=${conversation.name}`
                        }
                      />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {conversation.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.is_community && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <Users className="w-3 h-3 text-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-semibold text-foreground truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(conversation.last_message_time), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message}
                    </p>
                  </div>

                  {conversation.unread_count > 0 && (
                    <Badge className="bg-primary text-foreground">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}

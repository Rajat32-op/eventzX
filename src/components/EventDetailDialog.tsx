import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Trash2, MessageCircle, MapPin, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface eventDetailDialogProps {
  event: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function formateventTime(date: string, time: string) {
  try {
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch {
    return `${date}, ${time}`;
  }
}

export function EventDetailDialog({ event, open, onOpenChange }: eventDetailDialogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (open && event?.id) {
      fetchComments();
    }
  }, [open, event?.id]);

  const fetchComments = async () => {
    if (!event?.id) return;

    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("event_comments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          user:profiles!event_comments_user_id_fkey(id, name, avatar_url)
        `)
        .eq("event_id", event.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !event?.id || !newComment.trim()) return;

    try {
      setSubmitting(true);
      const { error } = await (supabase as any).from("event_comments").insert({
        event_id: event.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      await fetchComments();
      
      toast({
        title: "Comment posted",
        description: "Your comment has been added",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from("event_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  if (!event) return null;

  const attendees = event.event_attendees?.[0]?.count || event.attendee_count || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-display">{event.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm">
            <MessageCircle className="w-4 h-4" />
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </DialogDescription>
        </DialogHeader>

        {/* Comments section */}
        <ScrollArea className="flex-1 px-6 py-4 overflow-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet</p>
                <p className="text-xs mt-1">Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar 
                      className="w-8 h-8 cursor-pointer"
                      onClick={() => {
                        onOpenChange(false);
                        navigate(`/user/${comment.user_id}`);
                      }}
                    >
                      <AvatarImage src={comment.user.avatar_url} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span 
                            className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors"
                            onClick={() => {
                              onOpenChange(false);
                              navigate(`/user/${comment.user_id}`);
                            }}
                          >
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        {user?.id === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-foreground mt-1 break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </ScrollArea>

        {/* Comment input */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex gap-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {user?.user_metadata?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmitComment();
                  }
                }}
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  ArrowRight, 
  Trash2, 
  Users, 
  UserPlus, 
  MessageCircle, 
  Calendar,
  Loader2,
  CheckCheck
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'friend_request':
      return <UserPlus className="w-5 h-5 text-primary" />;
    case 'event_join':
      return <Calendar className="w-5 h-5 text-accent" />;
    case 'event_update':
      return <Calendar className="w-5 h-5 text-secondary" />;
    case 'community_join':
      return <Users className="w-5 h-5 text-primary" />;
    case 'message':
      return <MessageCircle className="w-5 h-5 text-secondary" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
};

export default function Notifications() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-blue-50/95 backdrop-blur-lg dark:glass dark:backdrop-blur-lg border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-primary hover:text-primary"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Notifications List */}
      <div className="container px-4 py-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">No notifications yet</p>
            <p className="text-sm text-muted-foreground">
              We'll notify you when something happens
            </p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <Card
              key={notification.id}
              className={`border-border/50 transition-all duration-300 cursor-pointer animate-fade-up ${
                !notification.read 
                  ? 'bg-primary/5 hover:border-primary/50 border-primary/30' 
                  : 'hover:border-border'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    !notification.read ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-foreground mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}

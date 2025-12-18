import { Home, Plus, Users, Search, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Circle", path: "/communities" },
  { icon: Plus, label: "Create", path: "/create" },
  { icon: Search, label: "Discover", path: "/discover" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
];

export function BottomNav() {
  const location = useLocation();
  const { totalUnreadCount } = useUnreadCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-background/80 dark:backdrop-blur-lg border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.08)] dark:shadow-none">
      <div className="flex items-center justify-around px-2 py-3 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isCreate = item.label === "Create";

          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-200",
                isCreate
                  ? "relative -mt-6"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isCreate ? (
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center glow-primary">
                  <item.icon className="w-6 h-6 text-foreground" />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <item.icon
                      className={cn(
                        "w-6 h-6 transition-all duration-200",
                        isActive && "scale-110"
                      )}
                    />
                    {item.label === "Chat" && totalUnreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-4 min-w-[16px] flex items-center justify-center text-[10px] px-1 py-0"
                      >
                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

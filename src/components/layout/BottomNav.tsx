import { Home, Plus, Users, Search, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Circle", path: "/communities" },
  { icon: Plus, label: "Create", path: "/create" },
  { icon: Search, label: "Discover", path: "/discover" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
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
                  <item.icon
                    className={cn(
                      "w-6 h-6 transition-all duration-200",
                      isActive && "scale-110"
                    )}
                  />
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

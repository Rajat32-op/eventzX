import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UnreadCountContextType {
  totalUnreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const UnreadCountContext = createContext<UnreadCountContextType | undefined>(undefined);

export function UnreadCountProvider({ children }: { children: ReactNode }) {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const { user } = useAuth();

  const refreshUnreadCount = async () => {
    if (!user) {
      setTotalUnreadCount(0);
      return;
    }

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
  };

  // Subscribe to metadata changes for real-time updates
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    refreshUnreadCount();

    // Set up real-time subscription
    const channel = supabase
      .channel(`unread-count-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_chat_metadata",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // When metadata changes, refresh the count
          refreshUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <UnreadCountContext.Provider value={{ totalUnreadCount, refreshUnreadCount }}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export function useUnreadCount() {
  const context = useContext(UnreadCountContext);
  if (context === undefined) {
    throw new Error('useUnreadCount must be used within an UnreadCountProvider');
  }
  return context;
}

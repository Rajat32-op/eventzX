import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";

interface event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  creator_id: string;
  max_attendees: number | null;
  show_in_campus: boolean | null;
  show_in_city: boolean | null;
  city: string | null;
  college: string | null;
  created_at: string;
  creator: {
    id: string;
    name: string;
    avatar_url: string | null;
    college: string | null;
    city: string | null;
  };
  attendee_count: number;
  is_joined: boolean;
}

export function useevents() {
  const [events, setevents] = useState<event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { createNotification } = useNotifications();

  const fetchPublicEvents = async () => {
    try {
      // Fetch public national events via edge function (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('get-public-events', {
        body: {}
      });

      if (error) {
        console.error("Error fetching public events:", error);
        setevents([]);
        return;
      }
      
      if (data?.success && data?.events) {
        setevents(data.events as event[]);
      } else {
        console.error("Error fetching public events:", data?.message);
        setevents([]);
      }
    } catch (error) {
      console.error("Error fetching public events:", error);
      setevents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchevents = async () => {
    // If no user, fetch public events via edge function
    if (!user) {
      return fetchPublicEvents();
    }

    try {
      // Fetch events with creator info, ordered by most recent first
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          creator:profiles!events_creator_id_fkey(id, name, avatar_url, college, city)
        `)
        .order("created_at", { ascending: false });

      if (eventsError) throw eventsError;

      // Fetch attendee counts
      const { data: attendeeCounts, error: countError } = await supabase
        .from("event_attendees")
        .select("event_id");

      if (countError) throw countError;

      // Get user's joined events
      let userJoinedevents: string[] = [];
      if (user) {
        const { data: userAttendees } = await supabase
          .from("event_attendees")
          .select("event_id")
          .eq("user_id", user.id);
        userJoinedevents = userAttendees?.map((a) => a.event_id) || [];
      }

      // Count attendees per event
      const countMap: Record<string, number> = {};
      attendeeCounts?.forEach((a) => {
        countMap[a.event_id] = (countMap[a.event_id] || 0) + 1;
      });

      const formattedevents = eventsData?.map((event: any) => ({
        ...event,
        creator: event.creator,
        attendee_count: countMap[event.id] || 0,
        is_joined: userJoinedevents.includes(event.id),
        show_in_campus: event.show_in_campus ?? null,
        show_in_city: event.show_in_city ?? null,
        city: event.city ?? null,
        college: event.college ?? null,
      })) || [];

      setevents(formattedevents as event[]);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinevent = async (eventId: string) => {
    if (!user) return;

    const event = events.find((m) => m.id === eventId);
    if (!event) return;

    if (event.is_joined) {
      // Leave event
      const { error } = await supabase
        .from("event_attendees")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Error", description: "Failed to leave event", variant: "destructive" });
        return;
      }

      setevents((prev) =>
        prev.map((m) =>
          m.id === eventId
            ? { ...m, is_joined: false, attendee_count: m.attendee_count - 1 }
            : m
        )
      );
      toast({ title: "Left event", description: `You've left "${event.title}"` });
    } else {
      // Check max attendees
      if (event.max_attendees && event.attendee_count >= event.max_attendees) {
        toast({ title: "event Full", description: "This event has reached its capacity", variant: "destructive" });
        return;
      }

      // Join event (use upsert to avoid duplicate key errors)
      const { error } = await supabase
        .from("event_attendees")
        .upsert({ event_id: eventId, user_id: user.id }, { onConflict: 'event_id,user_id' });

      if (error) {
        toast({ title: "Error", description: "Failed to join event", variant: "destructive" });
        return;
      }

      // Get joiner profile info for notification
      const { data: joinerProfile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      // Create notification for event creator (if it's not the same user)
      if (event.creator_id !== user.id) {
        const truncatedTitle = event.title.length > 30 
          ? `${event.title.substring(0, 30)}...` 
          : event.title;
        
        await createNotification(
          event.creator_id,
          'event_join',
          `${joinerProfile?.name || 'Someone'} joined your event!`,
          `${joinerProfile?.name || 'Someone'} joined "${truncatedTitle}"`,
          '/',
          { event_id: eventId, event_title: event.title }
        );
      }

      setevents((prev) =>
        prev.map((m) =>
          m.id === eventId
            ? { ...m, is_joined: true, attendee_count: m.attendee_count + 1 }
            : m
        )
      );
      toast({ title: "Joined! 🎉", description: `You're now part of "${event.title}"` });
    }
  };

  const deleteevent = async (eventId: string) => {
    if (!user) return;

    const event = events.find((m) => m.id === eventId);
    if (!event) return;

    // Check if user is the creator
    if (event.creator_id !== user.id) {
      toast({ title: "Error", description: "You can only delete your own events", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId)
        .eq("creator_id", user.id);

      if (error) throw error;

      setevents((prev) => prev.filter((m) => m.id !== eventId));
      toast({ title: "Deleted", description: "event has been deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchevents();
  }, [user]);

  return { events, loading, joinevent, deleteevent, refetch: fetchevents };
}

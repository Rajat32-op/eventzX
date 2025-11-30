import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { dummyMeetups, dummyCityMeetups } from "@/data/dummyData";

interface Meetup {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  creator_id: string;
  max_attendees: number | null;
  created_at: string;
  creator: {
    id: string;
    name: string;
    avatar_url: string | null;
    college: string | null;
  };
  attendee_count: number;
  is_joined: boolean;
}

export function useMeetups() {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { createNotification } = useNotifications();

  const fetchMeetups = async () => {
    try {
      // Fetch meetups with creator info, ordered by most recent first
      const { data: meetupsData, error: meetupsError } = await supabase
        .from("meetups")
        .select(`
          *,
          creator:profiles!meetups_creator_id_fkey(id, name, avatar_url, college)
        `)
        .order("created_at", { ascending: false });

      if (meetupsError) throw meetupsError;

      // Fetch attendee counts
      const { data: attendeeCounts, error: countError } = await supabase
        .from("meetup_attendees")
        .select("meetup_id");

      if (countError) throw countError;

      // Get user's joined meetups
      let userJoinedMeetups: string[] = [];
      if (user) {
        const { data: userAttendees } = await supabase
          .from("meetup_attendees")
          .select("meetup_id")
          .eq("user_id", user.id);
        userJoinedMeetups = userAttendees?.map((a) => a.meetup_id) || [];
      }

      // Count attendees per meetup
      const countMap: Record<string, number> = {};
      attendeeCounts?.forEach((a) => {
        countMap[a.meetup_id] = (countMap[a.meetup_id] || 0) + 1;
      });

      const formattedMeetups = meetupsData?.map((meetup) => ({
        ...meetup,
        creator: meetup.creator,
        attendee_count: countMap[meetup.id] || 0,
        is_joined: userJoinedMeetups.includes(meetup.id),
      })) || [];

      // Append dummy data at the end (for demo purposes - will be removed later)
      const allMeetups = [...formattedMeetups, ...dummyMeetups, ...dummyCityMeetups];
      
      setMeetups(allMeetups);
    } catch (error) {
      console.error("Error fetching meetups:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinMeetup = async (meetupId: string) => {
    if (!user) return;

    const meetup = meetups.find((m) => m.id === meetupId);
    if (!meetup) return;

    if (meetup.is_joined) {
      // Leave meetup
      const { error } = await supabase
        .from("meetup_attendees")
        .delete()
        .eq("meetup_id", meetupId)
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Error", description: "Failed to leave meetup", variant: "destructive" });
        return;
      }

      setMeetups((prev) =>
        prev.map((m) =>
          m.id === meetupId
            ? { ...m, is_joined: false, attendee_count: m.attendee_count - 1 }
            : m
        )
      );
      toast({ title: "Left meetup", description: `You've left "${meetup.title}"` });
    } else {
      // Check max attendees
      if (meetup.max_attendees && meetup.attendee_count >= meetup.max_attendees) {
        toast({ title: "Meetup Full", description: "This meetup has reached its capacity", variant: "destructive" });
        return;
      }

      // Join meetup
      const { error } = await supabase
        .from("meetup_attendees")
        .insert({ meetup_id: meetupId, user_id: user.id });

      if (error) {
        toast({ title: "Error", description: "Failed to join meetup", variant: "destructive" });
        return;
      }

      // Get joiner profile info for notification
      const { data: joinerProfile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      // Create notification for meetup creator (if it's not the same user)
      if (meetup.creator_id !== user.id) {
        const truncatedTitle = meetup.title.length > 30 
          ? `${meetup.title.substring(0, 30)}...` 
          : meetup.title;
        
        await createNotification(
          meetup.creator_id,
          'meetup_join',
          'Someone joined your meetup!',
          `${joinerProfile?.name || 'Someone'} joined "${truncatedTitle}"`,
          '/',
          { meetup_id: meetupId, meetup_title: meetup.title }
        );
      }

      setMeetups((prev) =>
        prev.map((m) =>
          m.id === meetupId
            ? { ...m, is_joined: true, attendee_count: m.attendee_count + 1 }
            : m
        )
      );
      toast({ title: "Joined! 🎉", description: `You're now part of "${meetup.title}"` });
    }
  };

  useEffect(() => {
    fetchMeetups();
  }, [user]);

  return { meetups, loading, joinMeetup, refetch: fetchMeetups };
}

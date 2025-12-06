import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MapPin,
  GraduationCap,
  Calendar,
  UserPlus,
  MessageCircle,
  UserCheck,
  Clock,
  Loader2,
  Heart,
  UserMinus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { format } from "date-fns";

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  college: string | null;
  city: string | null;
  bio: string | null;
  interests: string[];
  created_at: string;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { sentRequests, friends, sendRequest, disconnectFriend } = useFriendRequests();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        navigate("/discover");
        return;
      }

      setProfile({ ...data, interests: data.interests || [] });
      setLoading(false);
    };

    fetchProfile();
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const connectionStatus = friends.includes(profile.id)
    ? "connected"
    : sentRequests.includes(profile.id)
    ? "pending"
    : "none";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-semibold text-foreground">Profile</h1>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="border-border/50 overflow-hidden">
          {/* Banner gradient */}
          <div className="h-24 gradient-primary relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
          </div>

          <CardContent className="relative px-6 pb-6">
            {/* Avatar & Actions */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <Avatar className="w-24 h-24 border-4 border-card">
                <AvatarImage
                  src={
                    profile.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`
                  }
                />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                {connectionStatus === "connected" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/chat/user/${profile.id}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                )}
                <Button
                  variant={connectionStatus !== "none" ? "outline" : "default"}
                  size="sm"
                  onClick={() => {
                    if (connectionStatus === "none") {
                      sendRequest(profile.id);
                    } else if (connectionStatus === "connected") {
                      disconnectFriend(profile.id);
                    }
                  }}
                  disabled={connectionStatus === "pending"}
                >
                  {connectionStatus === "connected" ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Disconnect
                    </>
                  ) : connectionStatus === "pending" ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Pending
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {profile.name}
                </h2>
                {profile.bio && (
                  <p className="text-muted-foreground text-sm mt-1">{profile.bio}</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.college && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>{profile.college}</span>
                  </div>
                )}
                {profile.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span>{profile.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span>Joined {format(new Date(profile.created_at), "MMM yyyy")}</span>
                </div>
              </div>

              {/* Interests */}
              {profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="interest">
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shared Interests CTA */}
        {profile.interests.length > 0 && (
          <Card className="gradient-secondary border-0 overflow-hidden">
            <CardContent className="p-6 relative">
              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                Shared Interests
              </h3>
              <p className="text-foreground/80 text-sm mb-4">
                {profile.name} is interested in {profile.interests.slice(0, 2).join(" and ")}.
                {connectionStatus === "connected"
                  ? " Start a conversation about your shared Event!"
                  : " Connect to chat!"}
              </p>
              {connectionStatus === "connected" ? (
                <Button
                  variant="glass"
                  onClick={() => navigate(`/chat/user/${profile.id}`)}
                >
                  Start Conversation
                </Button>
              ) : connectionStatus === "none" ? (
                <Button variant="glass" onClick={() => sendRequest(profile.id)}>
                  Connect First
                </Button>
              ) : (
                <Button variant="glass" disabled>
                  Request Pending
                </Button>
              )}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

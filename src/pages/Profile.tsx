import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Edit,
  Calendar,
  Users,
  MapPin,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-bold text-lg text-foreground">
              Profile
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container px-4 py-6">
        {/* Profile Card */}
        <Card className="border-border/50 overflow-hidden mb-6">
          {/* Banner gradient */}
          <div className="h-24 gradient-primary relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
          </div>

          <CardContent className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <Avatar className="w-24 h-24 border-4 border-card">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {profile.name}
                </h2>
                <p className="text-muted-foreground text-sm">{profile.email}</p>
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
                  <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-foreground">{profile.bio}</p>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="interest">
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-foreground">
                    0
                  </p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-foreground">
                    0
                  </p>
                  <p className="text-xs text-muted-foreground">Joined</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-primary">
                    0
                  </p>
                  <p className="text-xs text-muted-foreground">Connections</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="created" className="mb-6">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="created" className="font-display">
              <Users className="w-4 h-4 mr-2" />
              My Meetups
            </TabsTrigger>
            <TabsTrigger value="joined" className="font-display">
              <Calendar className="w-4 h-4 mr-2" />
              Joined
            </TabsTrigger>
          </TabsList>

          <TabsContent value="created" className="mt-0 space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>You haven't created any meetups yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/create")}>
                Create Your First Meetup
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="joined" className="mt-0 space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>You haven't joined any meetups yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
                Discover Meetups
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Spiritual Journey */}
        {profile.journey && (
          <Card className="border-border/50 mb-6">
            <CardContent className="p-6">
              <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                My Spiritual Journey
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                {profile.journey}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
}

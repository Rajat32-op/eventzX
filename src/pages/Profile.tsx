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
import { mockUser, mockMeetups } from "@/data/mockData";
import { MeetupCard } from "@/components/MeetupCard";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

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
                <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                  {mockUser.name.charAt(0)}
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
                  {mockUser.name}
                </h2>
                <p className="text-muted-foreground text-sm">{mockUser.email}</p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>{mockUser.college}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>{mockUser.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span>Joined {mockUser.joinedDate}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-foreground">{mockUser.bio}</p>

              {/* Interests */}
              <div className="flex flex-wrap gap-2">
                {mockUser.interests.map((interest) => (
                  <Badge key={interest} variant="interest">
                    {interest}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-6 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-foreground">
                    {mockUser.meetupsCreated}
                  </p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-foreground">
                    {mockUser.meetupsJoined}
                  </p>
                  <p className="text-xs text-muted-foreground">Joined</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-primary">
                    17
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
            {mockMeetups.slice(0, 2).map((meetup, index) => (
              <div
                key={meetup.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <MeetupCard {...meetup} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="joined" className="mt-0 space-y-4">
            {mockMeetups.slice(2, 5).map((meetup, index) => (
              <div
                key={meetup.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <MeetupCard {...meetup} isJoined />
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-destructive"
          onClick={() => navigate("/auth")}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
}

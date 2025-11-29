import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  UserPlus,
  Check,
  Calendar,
  MapPin,
  GraduationCap,
  MessageCircle,
  Heart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock user data - in real app, this would come from database
const mockUsers: Record<string, {
  id: string;
  name: string;
  avatar: string;
  college: string;
  city: string;
  interests: string[];
  bio: string;
  journey: string;
  joinedDate: string;
  meetupsJoined: number;
  connections: number;
}> = {
  "1": {
    id: "1",
    name: "Arjun Sharma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",
    college: "IIT Hyderabad",
    city: "Hyderabad",
    interests: ["Meditation", "Yoga", "Temple Visits"],
    bio: "Seeking inner peace through daily meditation practice",
    journey: "Started my spiritual journey during my second year when I felt lost and anxious. Meditation helped me find clarity and purpose. Now I practice daily and love sharing this gift with others who might be going through similar phases.",
    joinedDate: "Oct 2024",
    meetupsJoined: 12,
    connections: 34,
  },
  "2": {
    id: "2",
    name: "Priya Menon",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    college: "IIT Hyderabad",
    city: "Hyderabad",
    interests: ["Yoga", "Nature Walks", "Discussion"],
    bio: "Yoga enthusiast, love meaningful conversations",
    journey: "Yoga transformed my physical and mental health. I discovered that spirituality isn't about religion—it's about connection with yourself and others. Every sunrise walk reminds me of life's simple beauties.",
    joinedDate: "Nov 2024",
    meetupsJoined: 8,
    connections: 21,
  },
  "3": {
    id: "3",
    name: "Rahul Verma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
    college: "IIT Madras",
    city: "Chennai",
    interests: ["Church Visit", "Meditation", "Discussion"],
    bio: "Finding spirituality in everyday moments",
    journey: "Growing up in a Christian household, I learned early about faith. College opened my eyes to different spiritual traditions. Now I appreciate how diverse paths lead to similar inner peace.",
    joinedDate: "Sep 2024",
    meetupsJoined: 15,
    connections: 42,
  },
  "4": {
    id: "4",
    name: "Fatima Khan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fatima",
    college: "IIT Delhi",
    city: "Delhi",
    interests: ["Mosque Visit", "Meditation", "Nature Walks"],
    bio: "Exploring different spiritual paths",
    journey: "My faith has always been central to who I am. Coming to college, I found beauty in learning about other traditions while deepening my own practice. Nature walks help me reflect and connect with the divine.",
    joinedDate: "Aug 2024",
    meetupsJoined: 10,
    connections: 28,
  },
  "5": {
    id: "5",
    name: "Aditya Patel",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aditya",
    college: "IIT Bombay",
    city: "Mumbai",
    interests: ["Temple Visits", "Yoga", "Discussion"],
    bio: "On a journey of self-discovery",
    journey: "Started with temple visits with my grandmother. Now, thousands of miles away from home, I've built a community of fellow seekers. Spirituality is about finding home wherever you are.",
    joinedDate: "Jul 2024",
    meetupsJoined: 20,
    connections: 56,
  },
  "6": {
    id: "6",
    name: "Sara Joseph",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sara",
    college: "IIT Kanpur",
    city: "Kanpur",
    interests: ["Church Visit", "Nature Walks", "Meditation"],
    bio: "Faith, nature, and community",
    journey: "Sunday mornings at church shaped my childhood. In college, I've learned that spirituality is personal yet communal. My best moments are when I'm in nature, feeling connected to something larger.",
    joinedDate: "Oct 2024",
    meetupsJoined: 7,
    connections: 19,
  },
};

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requestSent, setRequestSent] = useState(false);

  const user = userId ? mockUsers[userId] : null;

  if (!user) {
    return (
      <AppLayout>
        <div className="container px-4 py-12 text-center">
          <p className="text-muted-foreground">User not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleConnect = () => {
    setRequestSent(true);
    toast({
      title: "Request Sent! 🙏",
      description: `${user.name} will be notified about your connection request.`,
    });
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-lg text-foreground">
              Profile
            </h1>
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
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button 
                  variant={requestSent ? "outline" : "default"} 
                  size="sm"
                  onClick={handleConnect}
                  disabled={requestSent}
                >
                  {requestSent ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Sent
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
                  {user.name}
                </h2>
                <p className="text-muted-foreground text-sm">{user.bio}</p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>{user.college}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>{user.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span>Joined {user.joinedDate}</span>
                </div>
              </div>

              {/* Interests */}
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <Badge key={interest} variant="interest">
                    {interest}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-6 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-foreground">
                    {user.meetupsJoined}
                  </p>
                  <p className="text-xs text-muted-foreground">Meetups</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-primary">
                    {user.connections}
                  </p>
                  <p className="text-xs text-muted-foreground">Connections</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spiritual Journey */}
        <Card className="border-border/50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-accent" />
              <h3 className="font-display font-semibold text-lg text-foreground">
                My Spiritual Journey
              </h3>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              {user.journey}
            </p>
          </CardContent>
        </Card>

        {/* Mutual Interests CTA */}
        <Card className="gradient-secondary border-0 overflow-hidden">
          <CardContent className="p-6 relative">
            <h3 className="font-display font-bold text-lg text-foreground mb-2">
              Shared Interests
            </h3>
            <p className="text-foreground/80 text-sm mb-4">
              You both enjoy {user.interests[0]} and {user.interests[1]}. 
              Start a conversation about your shared spiritual journey!
            </p>
            <Button variant="glass">
              Start Conversation
            </Button>
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

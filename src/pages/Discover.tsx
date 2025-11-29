import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Check, GraduationCap, MapPin, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const suggestedUsers = [
  {
    id: "1",
    name: "Arjun Sharma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",
    college: "IIT Hyderabad",
    city: "Hyderabad",
    interests: ["Meditation", "Yoga", "Temple Visits"],
    bio: "Seeking inner peace through daily meditation practice",
    requestSent: false,
  },
  {
    id: "2",
    name: "Priya Menon",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    college: "IIT Hyderabad",
    city: "Hyderabad",
    interests: ["Yoga", "Nature Walks", "Discussion"],
    bio: "Yoga enthusiast, love meaningful conversations",
    requestSent: false,
  },
  {
    id: "3",
    name: "Rahul Verma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
    college: "IIT Madras",
    city: "Chennai",
    interests: ["Church Visit", "Meditation", "Discussion"],
    bio: "Finding spirituality in everyday moments",
    requestSent: false,
  },
  {
    id: "4",
    name: "Fatima Khan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fatima",
    college: "IIT Delhi",
    city: "Delhi",
    interests: ["Mosque Visit", "Meditation", "Nature Walks"],
    bio: "Exploring different spiritual paths",
    requestSent: false,
  },
  {
    id: "5",
    name: "Aditya Patel",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aditya",
    college: "IIT Bombay",
    city: "Mumbai",
    interests: ["Temple Visits", "Yoga", "Discussion"],
    bio: "On a journey of self-discovery",
    requestSent: false,
  },
  {
    id: "6",
    name: "Sara Joseph",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sara",
    college: "IIT Kanpur",
    city: "Kanpur",
    interests: ["Church Visit", "Nature Walks", "Meditation"],
    bio: "Faith, nature, and community",
    requestSent: false,
  },
];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(suggestedUsers);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendRequest = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, requestSent: true } : user
    ));
    toast({
      title: "Request Sent! 🙏",
      description: "They'll be notified about your connection request.",
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.interests.some(interest => 
      interest.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Discover People
              </h1>
              <p className="text-xs text-muted-foreground">
                Find your spiritual companions
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, college, or interests..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 py-6 space-y-4">
        {/* Suggested Section */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-semibold text-foreground">
            Suggested for You
          </h2>
          <span className="text-xs text-muted-foreground">
            {filteredUsers.length} people
          </span>
        </div>

        {/* User Cards */}
        <div className="space-y-3">
          {filteredUsers.map((user, index) => (
            <Card 
              key={user.id}
              className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:glow-primary animate-fade-up cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/user/${user.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 border-2 border-primary/20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/20 text-primary text-lg">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground">
                      {user.name}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                        <span>{user.college}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-accent" />
                        <span>{user.city}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                      {user.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {user.interests.slice(0, 3).map((interest) => (
                        <Badge key={interest} variant="interest" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant={user.requestSent ? "outline" : "default"}
                    size="sm"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user.requestSent) {
                        handleSendRequest(user.id);
                      }
                    }}
                    disabled={user.requestSent}
                  >
                    {user.requestSent ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Sent
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found matching your search.</p>
          </div>
        )}

        {/* CTA Card */}
        <Card className="gradient-primary border-0 overflow-hidden mt-6">
          <CardContent className="p-6 relative">
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              Invite Friends
            </h3>
            <p className="text-foreground/80 text-sm mb-4">
              Know someone who'd love InnerCircle? Share the app and grow your spiritual network.
            </p>
            <Button variant="glass">
              Share InnerCircle
            </Button>
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

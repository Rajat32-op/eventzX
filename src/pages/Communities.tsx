import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, MapPin, ChevronRight, Star } from "lucide-react";

const campusCommunities = [
  {
    id: "1",
    name: "IIT Hyderabad Circle",
    members: 234,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=iith",
    isJoined: true,
    type: "Campus",
    description: "Your campus spiritual community",
  },
  {
    id: "2",
    name: "Meditation Squad",
    members: 89,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=meditation",
    isJoined: true,
    type: "Interest",
    description: "Daily meditation practitioners",
  },
  {
    id: "3",
    name: "Gita Study Group",
    members: 56,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=gita",
    isJoined: false,
    type: "Interest",
    description: "Weekly verse-by-verse discussions",
  },
  {
    id: "4",
    name: "Temple Trippers",
    members: 128,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=temple",
    isJoined: true,
    type: "Interest",
    description: "Weekend temple visits & pilgrimages",
  },
];

const cityCommunities = [
  {
    id: "5",
    name: "Hyderabad Spiritual Circle",
    members: 1250,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=hyderabad",
    isJoined: true,
    type: "City",
    description: "Connect with spiritual seekers across Hyderabad",
  },
  {
    id: "6",
    name: "Hyderabad Yoga Network",
    members: 890,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=yoga-hyd",
    isJoined: false,
    type: "City",
    description: "Yoga enthusiasts in the city",
  },
];

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    members: number;
    image: string;
    isJoined: boolean;
    type: string;
    description: string;
  };
}

function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-all duration-300 hover:glow-primary">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 rounded-xl">
            <AvatarImage src={community.image} alt={community.name} />
            <AvatarFallback className="rounded-xl bg-primary/20 text-primary">
              {community.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-semibold text-foreground truncate">
                {community.name}
              </h3>
              {community.isJoined && (
                <Star className="w-4 h-4 text-primary fill-primary shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {community.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{community.members} members</span>
              </div>
              <Badge variant="outline" className="text-[10px] px-2 py-0">
                {community.type}
              </Badge>
            </div>
          </div>

          <Button
            variant={community.isJoined ? "outline" : "default"}
            size="sm"
          >
            {community.isJoined ? "View" : "Join"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Communities() {
  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Communities
              </h1>
              <p className="text-xs text-muted-foreground">
                Find your spiritual tribe
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 py-6 space-y-8">
        {/* Campus Communities */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg text-foreground">
              Campus Communities
            </h2>
          </div>
          <div className="space-y-3">
            {campusCommunities.map((community, index) => (
              <div
                key={community.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CommunityCard community={community} />
              </div>
            ))}
          </div>
        </section>

        {/* City Communities */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-accent" />
            <h2 className="font-display font-semibold text-lg text-foreground">
              City Circles
            </h2>
          </div>
          <div className="space-y-3">
            {cityCommunities.map((community, index) => (
              <div
                key={community.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CommunityCard community={community} />
              </div>
            ))}
          </div>
        </section>

        {/* Discover */}
        <section>
          <Card className="gradient-primary border-0 overflow-hidden">
            <CardContent className="p-6 relative">
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Discover More
              </h3>
              <p className="text-foreground/80 text-sm mb-4">
                Explore spiritual communities across India. Connect with students from other campuses.
              </p>
              <Button variant="glass">
                Explore All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Users, 
  ChevronRight, 
  Star, 
  Sparkles,
  CheckCircle,
  Globe,
  GraduationCap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Community {
  id: string;
  name: string;
  members: number;
  image: string;
  isJoined: boolean;
  type: "Campus" | "City" | "Interest";
  description: string;
  activeNow?: number;
}

const initialCampusCommunities: Community[] = [
  {
    id: "1",
    name: "IIT Hyderabad Circle",
    members: 234,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=iith",
    isJoined: true,
    type: "Campus",
    description: "Your campus spiritual community",
    activeNow: 12,
  },
  {
    id: "2",
    name: "Meditation Squad",
    members: 89,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=meditation",
    isJoined: false,
    type: "Interest",
    description: "Daily meditation practitioners",
    activeNow: 5,
  },
  {
    id: "3",
    name: "Yoga & Wellness",
    members: 156,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=yoga",
    isJoined: false,
    type: "Interest",
    description: "Connect with yoga enthusiasts",
    activeNow: 8,
  },
  {
    id: "4",
    name: "Nature Explorers",
    members: 128,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=nature",
    isJoined: false,
    type: "Interest",
    description: "Weekend walks & nature trips",
    activeNow: 3,
  },
];

const initialCityCommunities: Community[] = [
  {
    id: "5",
    name: "Hyderabad Spiritual Circle",
    members: 1250,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=hyderabad",
    isJoined: false,
    type: "City",
    description: "Connect across Hyderabad campuses",
    activeNow: 45,
  },
  {
    id: "6",
    name: "Hyderabad Interfaith",
    members: 890,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=interfaith",
    isJoined: false,
    type: "City",
    description: "Unity in diversity - all faiths welcome",
    activeNow: 23,
  },
];

export default function Communities() {
  const [campusCommunities, setCampusCommunities] = useState(initialCampusCommunities);
  const [cityCommunities, setCityCommunities] = useState(initialCityCommunities);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleJoin = (communityId: string, isCampus: boolean) => {
    if (isCampus) {
      setCampusCommunities(communities =>
        communities.map(c =>
          c.id === communityId ? { ...c, isJoined: true, members: c.members + 1 } : c
        )
      );
    } else {
      setCityCommunities(communities =>
        communities.map(c =>
          c.id === communityId ? { ...c, isJoined: true, members: c.members + 1 } : c
        )
      );
    }
    toast({
      title: "Welcome to the Circle! 🎉",
      description: "You've joined the community. Start connecting!",
    });
  };

  const filterCommunities = (communities: Community[]) =>
    communities.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
              <Users className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Your Circles
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 py-6 space-y-8">
        {/* Campus Communities */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg text-foreground">
              Campus & Interest Circles
            </h2>
          </div>
          <div className="space-y-3">
            {filterCommunities(campusCommunities).map((community, index) => (
              <Card 
                key={community.id}
                className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:glow-primary animate-fade-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-14 h-14 rounded-xl">
                        <AvatarImage src={community.image} alt={community.name} />
                        <AvatarFallback className="rounded-xl bg-primary/20 text-primary">
                          {community.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {community.isJoined && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-foreground" />
                        </div>
                      )}
                    </div>

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
                        {community.activeNow && (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>{community.activeNow} active</span>
                          </div>
                        )}
                        <Badge variant="outline" className="text-[10px] px-2 py-0">
                          {community.type}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      variant={community.isJoined ? "outline" : "default"}
                      size="sm"
                      onClick={() => !community.isJoined && handleJoin(community.id, true)}
                      className={community.isJoined ? "" : "glow-primary"}
                    >
                      {community.isJoined ? (
                        <>
                          View
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* City Communities */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-accent" />
            <h2 className="font-display font-semibold text-lg text-foreground">
              City-Wide Circles
            </h2>
          </div>
          <div className="space-y-3">
            {filterCommunities(cityCommunities).map((community, index) => (
              <Card 
                key={community.id}
                className="border-border/50 hover:border-accent/50 transition-all duration-300 hover:glow-accent animate-fade-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-14 h-14 rounded-xl">
                        <AvatarImage src={community.image} alt={community.name} />
                        <AvatarFallback className="rounded-xl bg-accent/20 text-accent">
                          {community.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {community.isJoined && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-foreground truncate">
                          {community.name}
                        </h3>
                        {community.isJoined && (
                          <Star className="w-4 h-4 text-accent fill-accent shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {community.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{community.members.toLocaleString()} members</span>
                        </div>
                        {community.activeNow && (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>{community.activeNow} active</span>
                          </div>
                        )}
                        <Badge variant="outline" className="text-[10px] px-2 py-0 border-accent/50 text-accent">
                          {community.type}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      variant={community.isJoined ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => !community.isJoined && handleJoin(community.id, false)}
                      className={community.isJoined ? "" : "bg-accent hover:bg-accent/90"}
                    >
                      {community.isJoined ? (
                        <>
                          View
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Discover More CTA */}
        <Card className="gradient-primary border-0 overflow-hidden">
          <CardContent className="p-6 relative">
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              Create Your Own Circle
            </h3>
            <p className="text-foreground/80 text-sm mb-4">
              Start a community for your specific interest. Gather people who share your spiritual path.
            </p>
            <Button variant="glass">
              Create Circle
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

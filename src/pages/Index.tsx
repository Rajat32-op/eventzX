import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MeetupCard } from "@/components/MeetupCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Sparkles, Bell, Filter } from "lucide-react";
import { mockMeetups } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "all", name: "All" },
  { id: "meditation", name: "Meditation" },
  { id: "yoga", name: "Yoga" },
  { id: "temple", name: "Temple Visit" },
  { id: "gita", name: "Bhagavad Gita" },
  { id: "nature", name: "Nature Walk" },
  { id: "bhakti", name: "Bhakti" },
];

export default function Index() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [joinedMeetups, setJoinedMeetups] = useState<string[]>([]);
  const { toast } = useToast();

  const handleJoin = (meetupId: string, title: string) => {
    if (joinedMeetups.includes(meetupId)) {
      setJoinedMeetups((prev) => prev.filter((id) => id !== meetupId));
      toast({
        title: "Left meetup",
        description: `You've left "${title}"`,
      });
    } else {
      setJoinedMeetups((prev) => [...prev, meetupId]);
      toast({
        title: "Joined! 🎉",
        description: `You're now part of "${title}"`,
      });
    }
  };

  const filteredMeetups =
    activeCategory === "all"
      ? mockMeetups
      : mockMeetups.filter((m) =>
          m.category.toLowerCase().includes(activeCategory)
        );

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Logo & Location */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">
                  InnerCircle
                </h1>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <MapPin className="w-3 h-3" />
                  IIT Hyderabad
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full" />
              </Button>
              <Avatar className="w-9 h-9 border-2 border-primary/30">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan" />
                <AvatarFallback>AG</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search meetups, activities..."
              className="pl-10 pr-10"
            />
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 py-6">
        {/* Tabs */}
        <Tabs defaultValue="campus" className="mb-6">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="campus" className="font-display">
              Campus Feed
            </TabsTrigger>
            <TabsTrigger value="city" className="font-display">
              Hyderabad Circle
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campus" className="mt-0">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "interest"}
                  className="cursor-pointer whitespace-nowrap shrink-0"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>

            {/* Meetups Feed */}
            <div className="space-y-4">
              {filteredMeetups.map((meetup, index) => (
                <div
                  key={meetup.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <MeetupCard
                    {...meetup}
                    isJoined={joinedMeetups.includes(meetup.id)}
                    onJoin={() => handleJoin(meetup.id, meetup.title)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="city" className="mt-0">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "interest"}
                  className="cursor-pointer whitespace-nowrap shrink-0"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>

            {/* City Meetups */}
            <div className="space-y-4">
              {filteredMeetups.slice(0, 3).map((meetup, index) => (
                <div
                  key={meetup.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <MeetupCard
                    {...meetup}
                    host={{
                      ...meetup.host,
                      college: "Hyderabad Circle",
                    }}
                    isJoined={joinedMeetups.includes(meetup.id)}
                    onJoin={() => handleJoin(meetup.id, meetup.title)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

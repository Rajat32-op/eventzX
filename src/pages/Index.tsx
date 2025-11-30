import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MeetupCard } from "@/components/MeetupCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Sparkles, Bell, Filter, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMeetups } from "@/hooks/useMeetups";
import { format } from "date-fns";
import { dummyMeetups, dummyCityMeetups } from "@/data/dummyData";

const categories = [
  { id: "all", name: "All" },
  { id: "meditation", name: "Meditation" },
  { id: "yoga", name: "Yoga" },
  { id: "temple", name: "Temple Visit" },
  { id: "church", name: "Church Visit" },
  { id: "mosque", name: "Mosque Visit" },
  { id: "nature", name: "Nature Walk" },
  { id: "discussion", name: "Discussion" },
];

export default function Index() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { meetups, loading, joinMeetup } = useMeetups();

  // Use dummy data if no real meetups exist
  const displayMeetups = meetups.length > 0 ? meetups : dummyMeetups;
  const displayCityMeetups = meetups.length > 0 ? meetups : dummyCityMeetups;

  const filteredMeetups = displayMeetups.filter((meetup) => {
    const matchesCategory =
      activeCategory === "all" ||
      meetup.category.toLowerCase().includes(activeCategory);
    const matchesSearch =
      searchQuery === "" ||
      meetup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meetup.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredCityMeetups = displayCityMeetups.filter((meetup) => {
    const matchesCategory =
      activeCategory === "all" ||
      meetup.category.toLowerCase().includes(activeCategory);
    const matchesSearch =
      searchQuery === "" ||
      meetup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meetup.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatMeetupTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(date);
      return `${format(dateObj, "EEE, MMM d")}, ${time.slice(0, 5)}`;
    } catch {
      return `${date}, ${time}`;
    }
  };

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">InnerCircle</h1>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <MapPin className="w-3 h-3" />
                  {profile?.college || "Select Campus"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full" />
              </Button>
              <Avatar className="w-9 h-9 border-2 border-primary/30 cursor-pointer" onClick={() => navigate("/profile")}>
                <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} />
                <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search meetups..." className="pl-10 pr-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        <Tabs defaultValue="campus" className="mb-6">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="campus" className="font-display">Campus Feed</TabsTrigger>
            <TabsTrigger value="city" className="font-display">{profile?.city || "City"} Circle</TabsTrigger>
          </TabsList>

          <TabsContent value="campus" className="mt-0">
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {categories.map((category) => (
                <Badge key={category.id} variant={activeCategory === category.id ? "default" : "interest"} className="cursor-pointer whitespace-nowrap shrink-0" onClick={() => setActiveCategory(category.id)}>
                  {category.name}
                </Badge>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredMeetups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No meetups found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/create")}>Create the first one!</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMeetups.map((meetup, index) => (
                  <div key={meetup.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <MeetupCard
                      title={meetup.title}
                      description={meetup.description}
                      time={formatMeetupTime(meetup.date, meetup.time)}
                      location={meetup.location}
                      category={meetup.category}
                      host={{ name: meetup.creator?.name || "Unknown", avatar: meetup.creator?.avatar_url || undefined, college: meetup.creator?.college || "Unknown" }}
                      attendees={meetup.attendee_count}
                      maxAttendees={meetup.max_attendees || undefined}
                      isJoined={meetup.is_joined}
                      onJoin={() => joinMeetup(meetup.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="city" className="mt-0">
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {categories.map((category) => (
                <Badge key={category.id} variant={activeCategory === category.id ? "default" : "interest"} className="cursor-pointer whitespace-nowrap shrink-0" onClick={() => setActiveCategory(category.id)}>
                  {category.name}
                </Badge>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCityMeetups.map((meetup, index) => (
                  <div key={meetup.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <MeetupCard
                      title={meetup.title}
                      description={meetup.description}
                      time={formatMeetupTime(meetup.date, meetup.time)}
                      location={meetup.location}
                      category={meetup.category}
                      host={{ name: meetup.creator?.name || "Unknown", avatar: meetup.creator?.avatar_url || undefined, college: meetup.creator?.college || `${profile?.city || "Hyderabad"} Circle` }}
                      attendees={meetup.attendee_count}
                      maxAttendees={meetup.max_attendees || undefined}
                      isJoined={meetup.is_joined}
                      onJoin={() => !meetup.id.startsWith("city-") && joinMeetup(meetup.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

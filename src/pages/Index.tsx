import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MeetupCard } from "@/components/MeetupCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, MapPin, Sparkles, Bell, Filter, Loader2, CalendarIcon, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMeetups } from "@/hooks/useMeetups";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { colleges } from "@/data/colleges";

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    selectedCampuses: [] as string[],
    selectedCities: [] as string[],
    dateFilterType: 'all' as 'all' | 'today' | 'tomorrow' | 'after' | 'on',
    dateValue: undefined as Date | undefined,
    timeFilterType: 'all' as 'all' | 'after' | 'before' | 'range',
    timeAfter: '',
    timeBefore: '',
    timeRangeStart: '',
    timeRangeEnd: '',
  });
  const [availableCampuses, setAvailableCampuses] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { meetups, loading, joinMeetup, deleteMeetup } = useMeetups();
  const { unreadCount } = useNotifications();

  // Extract unique campuses and cities from colleges data
  useEffect(() => {
    const campuses = [...new Set(colleges.map(c => c.name))].sort();
    const cities = [...new Set(colleges.map(c => c.city))].sort();
    setAvailableCampuses(campuses);
    setAvailableCities(cities);
  }, []);

  // Meetups now come from useMeetups hook (includes DB + dummy data)
  const displayMeetups = meetups;
  const displayCityMeetups = meetups;

  const applyFilters = (meetup: any) => {
    // Category filter
    const matchesCategory =
      activeCategory === "all" ||
      meetup.category.toLowerCase().includes(activeCategory);
    
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      meetup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meetup.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Campus filter
    let matchesCampus = true;
    if (filters.selectedCampuses.length > 0) {
      matchesCampus = filters.selectedCampuses.some(campus => 
        meetup.location?.toLowerCase().includes(campus.toLowerCase())
      );
    }
    
    // City filter
    let matchesCity = true;
    if (filters.selectedCities.length > 0) {
      matchesCity = filters.selectedCities.some(city => 
        meetup.location?.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    // Date filter
    let matchesDate = true;
    if (filters.dateFilterType !== 'all' && meetup.date) {
      const meetupDate = new Date(meetup.date);
      meetupDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filters.dateFilterType === 'today') {
        matchesDate = meetupDate.getTime() === today.getTime();
      } else if (filters.dateFilterType === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        matchesDate = meetupDate.getTime() === tomorrow.getTime();
      } else if (filters.dateFilterType === 'after' && filters.dateValue) {
        const afterDate = new Date(filters.dateValue);
        afterDate.setHours(0, 0, 0, 0);
        matchesDate = meetupDate.getTime() > afterDate.getTime();
      } else if (filters.dateFilterType === 'on' && filters.dateValue) {
        const onDate = new Date(filters.dateValue);
        onDate.setHours(0, 0, 0, 0);
        matchesDate = meetupDate.getTime() === onDate.getTime();
      }
    }
    
    // Time filter
    let matchesTime = true;
    if (filters.timeFilterType !== 'all' && meetup.time) {
      const meetupTime = meetup.time.slice(0, 5); // Get HH:MM
      
      if (filters.timeFilterType === 'after' && filters.timeAfter) {
        matchesTime = meetupTime > filters.timeAfter;
      } else if (filters.timeFilterType === 'before' && filters.timeBefore) {
        matchesTime = meetupTime < filters.timeBefore;
      } else if (filters.timeFilterType === 'range' && filters.timeRangeStart && filters.timeRangeEnd) {
        matchesTime = meetupTime >= filters.timeRangeStart && meetupTime <= filters.timeRangeEnd;
      }
    }
    
    return matchesCategory && matchesSearch && matchesCampus && matchesCity && matchesDate && matchesTime;
  };

  const filteredMeetups = displayMeetups.filter(applyFilters);
  const filteredCityMeetups = displayCityMeetups.filter(applyFilters);

  const formatMeetupTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(date);
      return `${format(dateObj, "EEE, MMM d")}, ${time.slice(0, 5)}`;
    } catch {
      return `${date}, ${time}`;
    }
  };

  const resetFilters = () => {
    setFilters({
      selectedCampuses: [],
      selectedCities: [],
      dateFilterType: 'all',
      dateValue: undefined,
      timeFilterType: 'all',
      timeAfter: '',
      timeBefore: '',
      timeRangeStart: '',
      timeRangeEnd: '',
    });
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.selectedCampuses.length > 0) count++;
    if (filters.selectedCities.length > 0) count++;
    if (filters.dateFilterType !== 'all') count++;
    if (filters.timeFilterType !== 'all') count++;
    return count;
  };

  const toggleCampus = (campus: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCampuses: prev.selectedCampuses.includes(campus)
        ? prev.selectedCampuses.filter(c => c !== campus)
        : [...prev.selectedCampuses, campus]
    }));
  };

  const toggleCity = (city: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCities: prev.selectedCities.includes(city)
        ? prev.selectedCities.filter(c => c !== city)
        : [...prev.selectedCities, city]
    }));
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-secondary rounded-full flex items-center justify-center text-[10px] font-bold text-foreground px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
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
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                  <Filter className="w-4 h-4" />
                  {activeFilterCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-foreground">
                      {activeFilterCount()}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Meetups</SheetTitle>
                  <SheetDescription>
                    Refine your search with advanced filters
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6 max-h-[70vh] overflow-y-auto">
                  {/* Campus Filter */}
                  <div className="space-y-2">
                    <Label>Campuses ({filters.selectedCampuses.length} selected)</Label>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                      {availableCampuses.map((campus) => (
                        <div key={campus} className="flex items-center space-x-2">
                          <Checkbox
                            id={`campus-${campus}`}
                            checked={filters.selectedCampuses.includes(campus)}
                            onCheckedChange={() => toggleCampus(campus)}
                          />
                          <label
                            htmlFor={`campus-${campus}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {campus}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* City Filter */}
                  <div className="space-y-2">
                    <Label>Cities ({filters.selectedCities.length} selected)</Label>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                      {availableCities.map((city) => (
                        <div key={city} className="flex items-center space-x-2">
                          <Checkbox
                            id={`city-${city}`}
                            checked={filters.selectedCities.includes(city)}
                            onCheckedChange={() => toggleCity(city)}
                          />
                          <label
                            htmlFor={`city-${city}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {city}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Select
                      value={filters.dateFilterType}
                      onValueChange={(value: any) => setFilters({ ...filters, dateFilterType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="after">After a date</SelectItem>
                        <SelectItem value="on">On a specific date</SelectItem>
                      </SelectContent>
                    </Select>
                    {(filters.dateFilterType === 'after' || filters.dateFilterType === 'on') && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filters.dateValue && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateValue ? format(filters.dateValue, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.dateValue}
                            onSelect={(date) => setFilters({ ...filters, dateValue: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>

                  {/* Time Filter */}
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Select
                      value={filters.timeFilterType}
                      onValueChange={(value: any) => setFilters({ ...filters, timeFilterType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Times</SelectItem>
                        <SelectItem value="after">After a time</SelectItem>
                        <SelectItem value="before">Before a time</SelectItem>
                        <SelectItem value="range">In a time range</SelectItem>
                      </SelectContent>
                    </Select>
                    {filters.timeFilterType === 'after' && (
                      <div className="space-y-1">
                        <Label className="text-xs">After</Label>
                        <Input
                          type="time"
                          value={filters.timeAfter}
                          onChange={(e) => setFilters({ ...filters, timeAfter: e.target.value })}
                        />
                      </div>
                    )}
                    {filters.timeFilterType === 'before' && (
                      <div className="space-y-1">
                        <Label className="text-xs">Before</Label>
                        <Input
                          type="time"
                          value={filters.timeBefore}
                          onChange={(e) => setFilters({ ...filters, timeBefore: e.target.value })}
                        />
                      </div>
                    )}
                    {filters.timeFilterType === 'range' && (
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Start</Label>
                          <Input
                            type="time"
                            value={filters.timeRangeStart}
                            onChange={(e) => setFilters({ ...filters, timeRangeStart: e.target.value })}
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">End</Label>
                          <Input
                            type="time"
                            value={filters.timeRangeEnd}
                            onChange={(e) => setFilters({ ...filters, timeRangeEnd: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <SheetFooter className="flex gap-2">
                  <Button variant="outline" onClick={resetFilters} className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
                    Apply Filters
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
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
                      isOwner={meetup.creator_id === user?.id}
                      onJoin={() => joinMeetup(meetup.id)}
                      onDelete={() => deleteMeetup(meetup.id)}
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
                      isOwner={meetup.creator_id === user?.id}
                      onJoin={() => !meetup.id.startsWith("city-") && joinMeetup(meetup.id)}
                      onDelete={() => deleteMeetup(meetup.id)}
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

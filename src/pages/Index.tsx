import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EventCard } from "@/components/EventCard";
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
import { FeedbackDialog } from "@/components/FeedbackDialog";


import { Search, MapPin, Sparkles, Bell, Filter, Loader2, CalendarIcon, X, Share2, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useevents } from "@/hooks/useEvents";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/contexts/ThemeContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const categories = [
  { id: "hackathons-tech", name: "Hackathons & Tech", },
  { id: "competitions-challenges", name: "Competitions & Challenges", },
  { id: "sports-fitness", name: "Sports & Fitness", },
  { id: "cultural-social", name: "Cultural & Social", },
  { id: "study-project-groups", name: "Study & Project Groups", },
  { id: "clubs-communities", name: "Clubs & Communities", },
  { id: "travel-cab-sharing", name: "Travel & Cab Sharing", },
  { id: "volunteering-social-good", name: "Volunteering & Social Good", },
  { id: "wellness-lifestyle", name: "Wellness & Lifestyle", },
  { id: "Workshops", name: "Workshops" }
];
export default function Index() {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFilterType: 'all' as 'all' | 'today' | 'tomorrow' | 'after' | 'on',
    dateValue: undefined as Date | undefined,
    timeFilterType: 'all' as 'all' | 'after' | 'before' | 'range',
    timeAfter: '',
    timeBefore: '',
    timeRangeStart: '',
    timeRangeEnd: '',
  });
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { events, loading, joinevent, deleteevent } = useevents();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const displayevents = events;
  const displayCityevents = events;
  const displayNationalevents = events;

  const applyFilters = (event: any, feedType: 'campus' | 'city' | 'national') => {
    // 1. City/Campus/National location filter (mandatory)
    let matchesUserLocation = false;
    if (feedType === 'campus') {
      // Campus feed: show events from same college that have show_in_campus enabled
      if (profile?.college) {
        matchesUserLocation =
          event.college?.toLowerCase() === profile.college.toLowerCase() &&
          event.show_in_campus === true;
      }
    } else if (feedType === 'city') {
      // City feed: show events from same city that have show_in_city enabled
      if (profile?.city) {
        matchesUserLocation =
          event.city?.toLowerCase() === profile.city.toLowerCase() &&
          event.show_in_city === true;
      }
    } else if (feedType === 'national') {
      // National feed: show events with show_national enabled
      matchesUserLocation = event.show_national === true;
    }

    if (!matchesUserLocation) return false;

    // 2. Category filter
    const matchesCategory =
      activeCategories.length === 0 ||
      activeCategories.some(cat => event.category.toLowerCase().includes(cat.toLowerCase()));

    // 3. Search filter
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 4. Date filter
    let matchesDate = true;
    if (filters.dateFilterType !== 'all' && event.date) {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.dateFilterType === 'today') {
        matchesDate = eventDate.getTime() === today.getTime();
      } else if (filters.dateFilterType === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        matchesDate = eventDate.getTime() === tomorrow.getTime();
      } else if (filters.dateFilterType === 'after' && filters.dateValue) {
        const afterDate = new Date(filters.dateValue);
        afterDate.setHours(0, 0, 0, 0);
        matchesDate = eventDate.getTime() > afterDate.getTime();
      } else if (filters.dateFilterType === 'on' && filters.dateValue) {
        const onDate = new Date(filters.dateValue);
        onDate.setHours(0, 0, 0, 0);
        matchesDate = eventDate.getTime() === onDate.getTime();
      }
    }

    // 5. Time filter
    let matchesTime = true;
    if (filters.timeFilterType !== 'all' && event.time) {
      const eventTime = event.time.slice(0, 5); // Get HH:MM

      if (filters.timeFilterType === 'after' && filters.timeAfter) {
        matchesTime = eventTime > filters.timeAfter;
      } else if (filters.timeFilterType === 'before' && filters.timeBefore) {
        matchesTime = eventTime < filters.timeBefore;
      } else if (filters.timeFilterType === 'range' && filters.timeRangeStart && filters.timeRangeEnd) {
        matchesTime = eventTime >= filters.timeRangeStart && eventTime <= filters.timeRangeEnd;
      }
    }

    return matchesCategory && matchesSearch && matchesDate && matchesTime;
  };

  // Separate filtering for campus, city, and national feeds
  const filteredevents = displayevents.filter(event => applyFilters(event, 'campus'));
  const filteredCityevents = displayCityevents.filter(event => applyFilters(event, 'city'));
  const filteredNationalevents = displayNationalevents.filter(event => applyFilters(event, 'national'));

  const formateventTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(date);
      return `${format(dateObj, "EEE, MMM d")}, ${time.slice(0, 5)}`;
    } catch {
      return `${date}, ${time}`;
    }
  };

  const resetFilters = () => {
    setFilters({
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
    if (filters.dateFilterType !== 'all') count++;
    if (filters.timeFilterType !== 'all') count++;
    return count;
  };

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-blue-50/95 backdrop-blur-lg dark:glass dark:backdrop-blur-lg border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">EventzX</h1>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <MapPin className="w-3 h-3" />
                  {user
                    ? ((profile as any)?.is_student !== false
                        ? (profile?.college || "Select Campus")
                        : (profile?.city || "Select City"))
                    : "India"
                  }
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </Button>
              {user ? (
                <>
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
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">{profile?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/auth", { state: { from: { pathname: "/" } } })}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search events..." className="pl-10 pr-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                  <SheetTitle>Filter events</SheetTitle>
                  <SheetDescription>
                    Refine your search with advanced filters
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6 max-h-[70vh] overflow-y-auto">
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
        {/* For logged in students: show Campus, City, and National feeds */}
        {/* For logged in non-students: show City and National feeds */}
        {/* For non-logged users: show only National feed */}
        <Tabs
          key={(profile as any)?.is_student}
          defaultValue="national"
          className="mb-6"
        >
          {user && (profile as any)?.is_student !== false && (
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="national" className="font-display">🌍 National</TabsTrigger>
              <TabsTrigger value="campus" className="font-display">🎓 Campus</TabsTrigger>
              <TabsTrigger value="city" className="font-display">🌆 City</TabsTrigger>
            </TabsList>
          )}
          {user && (profile as any)?.is_student === false && (
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="national" className="font-display">🌍 National</TabsTrigger>
              <TabsTrigger value="city" className="font-display">🌆 City</TabsTrigger>
            </TabsList>
          )}
          {!user && (
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="national" className="font-display">🌍 National</TabsTrigger>
              <TabsTrigger value="campus" className="font-display">🎓 Campus</TabsTrigger>
              <TabsTrigger value="city" className="font-display">🌆 City</TabsTrigger>
            </TabsList>
          )}

          {/* Campus tab for non-logged users - show login prompt */}
          {!user && (
            <TabsContent value="campus" className="mt-0">
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Login to see campus events from your college</p>
                <Button variant="default" onClick={() => navigate("/auth", { state: { from: { pathname: "/" } } })}>
                  Login to Continue
                </Button>
              </div>
            </TabsContent>
          )}

          {/* City tab for non-logged users - show login prompt */}
          {!user && (
            <TabsContent value="city" className="mt-0">
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Login to see events from your city</p>
                <Button variant="default" onClick={() => navigate("/auth", { state: { from: { pathname: "/" } } })}>
                  Login to Continue
                </Button>
              </div>
            </TabsContent>
          )}

          {user && (profile as any)?.is_student !== false && (
            <TabsContent value="campus" className="mt-0">
              <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={activeCategories.includes(category.id) ? "default" : "interest"}
                    className="cursor-pointer whitespace-nowrap shrink-0 transition-all"
                    onClick={() => {
                      setActiveCategories(prev =>
                        prev.includes(category.id)
                          ? prev.filter(c => c !== category.id)
                          : [...prev, category.id]
                      );
                    }}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredevents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No events found</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate("/create")}>Create the first one!</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredevents.map((event, index) => (
                    <div key={event.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <EventCard
                        event={{
                          ...event,
                          isJoined: event.is_joined,
                          isOwner: event.creator_id === user?.id,
                          onJoin: () => joinevent(event.id),
                          onDelete: () => deleteevent(event.id)
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {user && (
            <TabsContent value="city" className="mt-0">
              <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={activeCategories.includes(category.id) ? "default" : "interest"}
                    className="cursor-pointer whitespace-nowrap shrink-0 transition-all"
                    onClick={() => {
                      setActiveCategories(prev =>
                        prev.includes(category.id)
                          ? prev.filter(c => c !== category.id)
                          : [...prev, category.id]
                      );
                    }}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredCityevents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No events found</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate("/create")}>Create the first one!</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCityevents.map((event, index) => (
                    <div key={event.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <EventCard
                        event={{
                          ...event,
                          isJoined: event.is_joined,
                          isOwner: event.creator_id === user?.id,
                          onJoin: () => !event.id.startsWith("city-") && joinevent(event.id),
                          onDelete: () => deleteevent(event.id)
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="national" className="mt-0">
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={activeCategories.includes(category.id) ? "default" : "interest"}
                  className="cursor-pointer whitespace-nowrap shrink-0 transition-all"
                  onClick={() => {
                    setActiveCategories(prev =>
                      prev.includes(category.id)
                        ? prev.filter(c => c !== category.id)
                        : [...prev, category.id]
                    );
                  }}
                >
                  {category.name}
                </Badge>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredNationalevents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No national events found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/create")}>Create the first one!</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNationalevents.map((event, index) => (
                  <div key={event.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <EventCard
                      event={{
                        ...event,
                        isJoined: event.is_joined,
                        isOwner: event.creator_id === user?.id,
                        onJoin: () => !event.id.startsWith("national-") && joinevent(event.id),
                        onDelete: () => deleteevent(event.id)
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        <div className="mb-4">
          <FeedbackDialog />
        </div>
      </div>
    </AppLayout>
  );
}

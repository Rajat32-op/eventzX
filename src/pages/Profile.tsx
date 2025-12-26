import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Edit,
  Calendar,
  Users,
  MapPin,
  GraduationCap,
  LogOut,
  Loader2,
  ArrowLeft,
  Camera,
  Search,
  Check,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { EventCard } from "@/components/EventCard";
import { fetchColleges, addCollege, type College } from "@/lib/colleges";
import { fetchCities, addCity as addCityToDb, type City } from "@/lib/cities";

export default function Profile() {
  const navigate = useNavigate();
  const { profile, signOut, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ connections: 0, created: 0, joined: 0 });
  const [createdevents, setCreatedevents] = useState<any[]>([]);
  const [joinedevents, setJoinedevents] = useState<any[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useState<HTMLInputElement | null>(null)[1];
  const [isConnectionsDialogOpen, setIsConnectionsDialogOpen] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    college: '',
    city: '',
  });
  
  // College dropdown states for students
  const [colleges, setColleges] = useState<College[]>([]);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);
  const collegeDropdownRef = useRef<HTMLDivElement>(null);
  
  // Add college dialog states
  const [showAddCollegeDialog, setShowAddCollegeDialog] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeCity, setNewCollegeCity] = useState('');
  const [newCollegeCitySearch, setNewCollegeCitySearch] = useState('');
  const [showNewCollegeCityDropdown, setShowNewCollegeCityDropdown] = useState(false);
  const [newCollegeType, setNewCollegeType] = useState('Other');
  const [isAddingCollege, setIsAddingCollege] = useState(false);
  const newCollegeCityDropdownRef = useRef<HTMLDivElement>(null);
  
  // City dropdown states for non-students
  const [cities, setCities] = useState<City[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  
  // Add city dialog states
  const [showAddCityDialog, setShowAddCityDialog] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [isAddingCity, setIsAddingCity] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        bio: profile.bio || '',
        college: profile.college || '',
        city: profile.city || '',
      });
      setCitySearch(profile.city || '');
      setCollegeSearch(profile.college || '');
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  // Fetch colleges for students
  useEffect(() => {
    if ((profile as any)?.is_student !== false && isEditOpen) {
      async function loadColleges() {
        setIsLoadingColleges(true);
        const data = await fetchColleges();
        setColleges(data);
        setIsLoadingColleges(false);
      }
      loadColleges();
    }
  }, [profile, isEditOpen]);

  // Fetch cities for everyone (both students and non-students can change event city)
  useEffect(() => {
    if (isEditOpen) {
      async function loadCities() {
        setIsLoadingCities(true);
        const data = await fetchCities();
        setCities(data);
        setIsLoadingCities(false);
      }
      loadCities();
    }
  }, [isEditOpen]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target as Node)) {
        setShowCollegeDropdown(false);
      }
      if (newCollegeCityDropdownRef.current && !newCollegeCityDropdownRef.current.contains(event.target as Node)) {
        setShowNewCollegeCityDropdown(false);
      }
    }

    if (showCityDropdown || showCollegeDropdown || showNewCollegeCityDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCityDropdown, showCollegeDropdown, showNewCollegeCityDropdown]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const searchLower = citySearch.toLowerCase();
    return cities.filter(c => c.name.toLowerCase().includes(searchLower));
  }, [citySearch, cities]);

  // Filter colleges based on search
  const filteredColleges = useMemo(() => {
    if (!collegeSearch.trim()) return colleges;
    const searchLower = collegeSearch.toLowerCase();
    return colleges.filter(c => 
      c.name.toLowerCase().includes(searchLower) || 
      c.city.toLowerCase().includes(searchLower) ||
      c.type.toLowerCase().includes(searchLower)
    );
  }, [collegeSearch, colleges]);

  // Filter cities for add college dialog
  const filteredNewCollegeCities = useMemo(() => {
    if (!newCollegeCitySearch.trim()) return cities;
    const searchLower = newCollegeCitySearch.toLowerCase();
    return cities.filter(c => c.name.toLowerCase().includes(searchLower));
  }, [newCollegeCitySearch, cities]);

  // Get city for a college
  const getCityForCollege = (collegeName: string): string | null => {
    const college = colleges.find(c => c.name === collegeName);
    return college?.city || null;
  };

  // Add new college handler
  const handleAddCollege = async () => {
    if (!newCollegeName.trim() || !newCollegeCity.trim()) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsAddingCollege(true);
    
    // Check if city exists, if not add it first
    let cityName = newCollegeCity.trim();
    const existingCity = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (!existingCity) {
      const newCity = await addCityToDb(cityName);
      if (newCity) {
        setCities(prev => [...prev, newCity]);
        cityName = newCity.name;
      }
    } else {
      cityName = existingCity.name;
    }
    
    const result = await addCollege(newCollegeName, cityName, newCollegeType);
    setIsAddingCollege(false);

    if (result.success && result.college) {
      toast({
        title: "College added!",
        description: "Your college has been added to our database.",
      });
      // Refresh colleges list
      const updatedColleges = await fetchColleges();
      setColleges(updatedColleges);
      // Select the newly added college
      setEditForm(prev => ({ ...prev, college: result.college!.name, city: result.college!.city }));
      setCollegeSearch(result.college.name);
      setShowAddCollegeDialog(false);
      setNewCollegeName("");
      setNewCollegeCity("");
      setNewCollegeType("Other");
    } else {
      toast({
        title: "Failed to add college",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  // Add new city handler
  const handleAddCity = async () => {
    if (!newCityName.trim()) {
      toast({
        title: "Please enter a city name",
        variant: "destructive",
      });
      return;
    }

    setIsAddingCity(true);
    
    const newCity = await addCityToDb(newCityName.trim());
    setIsAddingCity(false);

    if (newCity) {
      toast({
        title: "City added!",
        description: "Your city has been added to our database.",
      });
      // Refresh cities list and select the new city
      const updatedCities = await fetchCities();
      setCities(updatedCities);
      setEditForm(prev => ({ ...prev, city: newCity.name }));
      setCitySearch(newCity.name);
      setShowAddCityDialog(false);
      setNewCityName("");
    } else {
      toast({
        title: "Failed to add city",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteevent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('creator_id', user.id);

      if (error) throw error;

      toast({
        title: 'event deleted',
        description: 'Your event has been deleted successfully.',
      });

      // Refresh the events list
      fetchProfileData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const fetchConnections = async () => {
    if (!user) return;

    try {
      setLoadingConnections(true);

      // Fetch accepted friend requests
      const { data: friendRequests } = await supabase
        .from('friend_requests')
        .select('*, sender:profiles!friend_requests_sender_id_fkey(id, name, avatar_url, college, city), receiver:profiles!friend_requests_receiver_id_fkey(id, name, avatar_url, college, city)')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      // Extract the other user from each connection
      const connectionsList = friendRequests?.map((req) => {
        return req.sender_id === user.id ? req.receiver : req.sender;
      }) || [];

      setConnections(connectionsList);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  };

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch connections count
      const { count: connectionsCount } = await supabase
        .from('friend_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      // Fetch created events
      const { data: created } = await supabase
        .from('events')
        .select('*, creator:profiles!events_creator_id_fkey(name, avatar_url), event_attendees(count)')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch joined events
      const { data: joinedData } = await supabase
        .from('event_attendees')
        .select('event:events(*, creator:profiles!events_creator_id_fkey(name, avatar_url), event_attendees(count))')
        .eq('user_id', user.id);

      const joined = joinedData?.map(item => item.event).filter(Boolean) || [];

      setStats({
        connections: connectionsCount || 0,
        created: created?.length || 0,
        joined: joined.length || 0,
      });

      setCreatedevents(created || []);
      setJoinedevents(joined);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      let avatarUrl = profile?.avatar_url;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const isStudent = (profile as any)?.is_student !== false;

      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          bio: editForm.bio,
          college: isStudent ? editForm.college : profile?.college,
          city: editForm.city, // Allow everyone to change city for events
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });

      setIsEditOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      // Refresh profile data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

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
      <header className="sticky top-0 z-40 bg-blue-50/95 backdrop-blur-lg dark:glass dark:backdrop-blur-lg border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
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
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-primary/20 text-primary font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Profile Picture</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20 border-2 border-primary/30">
                          <AvatarImage src={avatarPreview || profile?.avatar_url} />
                          <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">{profile?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <label htmlFor="avatar-upload">
                            <Button type="button" variant="outline" size="sm" asChild>
                              <span className="cursor-pointer">
                                <Camera className="w-4 h-4 mr-2" />
                                Choose Photo
                              </span>
                            </Button>
                          </label>
                          <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF (max 5MB)</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>
                    {/* Show college selection only for students */}
                    {(profile as any)?.is_student !== false && (
                      <div className="space-y-2">
                        <Label htmlFor="college">College</Label>
                        <div className="relative" ref={collegeDropdownRef}>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="college"
                              placeholder="Search college, city or type..."
                              value={collegeSearch}
                              onChange={(e) => {
                                setCollegeSearch(e.target.value);
                                setShowCollegeDropdown(true);
                              }}
                              onFocus={() => setShowCollegeDropdown(true)}
                              className="pl-9"
                            />
                          </div>
                          {showCollegeDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
                              <div className="max-h-60 overflow-y-auto">
                                {isLoadingColleges ? (
                                  <div className="px-4 py-6 text-sm text-center text-muted-foreground">
                                    Loading colleges...
                                  </div>
                                ) : filteredColleges.length > 0 ? (
                                  filteredColleges.map((c) => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => {
                                        setEditForm({ 
                                          ...editForm, 
                                          college: c.name,
                                          city: c.city 
                                        });
                                        setCollegeSearch(c.name);
                                        setShowCollegeDropdown(false);
                                      }}
                                      className="w-full px-4 py-2.5 text-left hover:bg-accent/50 transition-colors flex items-center gap-2 border-b border-border last:border-b-0"
                                    >
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                                        {c.type}
                                      </Badge>
                                      <span className="text-sm truncate">{c.name}</span>
                                      <span className="text-xs text-muted-foreground ml-auto shrink-0">{c.city}</span>
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-4 py-6 text-sm text-center space-y-3">
                                    <p className="text-muted-foreground">
                                      College not found?
                                    </p>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setShowCollegeDropdown(false);
                                        setShowAddCollegeDialog(true);
                                      }}
                                      className="w-full"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Your College
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {editForm.college && getCityForCollege(editForm.college) && (
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <Check className="w-4 h-4 text-primary" />
                            <span className="text-sm">{editForm.college}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {getCityForCollege(editForm.college)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* City selection for everyone */}
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City for Events
                        <span className="text-xs text-muted-foreground ml-2">
                          (Which city's events do you want to see?)
                        </span>
                      </Label>
                      <div className="relative" ref={cityDropdownRef}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="city"
                            placeholder="Search and select your city..."
                            value={citySearch}
                            onChange={(e) => {
                              setCitySearch(e.target.value);
                              setShowCityDropdown(true);
                            }}
                            onFocus={() => setShowCityDropdown(true)}
                            className="pl-9"
                          />
                        </div>
                        {showCityDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {isLoadingCities ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                Loading cities...
                              </div>
                            ) : filteredCities.length > 0 ? (
                              filteredCities.map((c) => (
                                <div
                                  key={c.id}
                                  className="px-4 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border last:border-0"
                                  onClick={() => {
                                    setEditForm({ ...editForm, city: c.name });
                                    setCitySearch(c.name);
                                    setShowCityDropdown(false);
                                  }}
                                >
                                  <p className="font-medium text-foreground">{c.name}</p>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-6 text-sm text-center space-y-3">
                                <p className="text-muted-foreground">
                                  {citySearch.trim() ? "City not found?" : "Start typing to search"}
                                </p>
                                {citySearch.trim() && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setShowCityDropdown(false);
                                      setNewCityName(citySearch.trim());
                                      setShowAddCityDialog(true);
                                    }}
                                    className="w-full"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add "{citySearch.trim()}"
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Tell us about yourself"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Add College Dialog */}
              <Dialog open={showAddCollegeDialog} onOpenChange={setShowAddCollegeDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Your College</DialogTitle>
                    <DialogDescription>
                      Can't find your college? Add it to our database.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="newCollegeName">College Name</Label>
                      <Input
                        id="newCollegeName"
                        placeholder="Full name of your college"
                        value={newCollegeName}
                        onChange={(e) => setNewCollegeName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newCollegeCity">City</Label>
                      <div className="relative" ref={newCollegeCityDropdownRef}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="newCollegeCity"
                          placeholder="Search or type a city..."
                          value={newCollegeCitySearch}
                          onChange={(e) => {
                            setNewCollegeCitySearch(e.target.value);
                            setNewCollegeCity(e.target.value);
                            setShowNewCollegeCityDropdown(true);
                          }}
                          onFocus={() => setShowNewCollegeCityDropdown(true)}
                          className="pl-9"
                        />
                        {showNewCollegeCityDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredNewCollegeCities.length > 0 ? (
                              filteredNewCollegeCities.slice(0, 5).map((c) => (
                                <div
                                  key={c.id}
                                  className="px-4 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border last:border-0"
                                  onClick={() => {
                                    setNewCollegeCity(c.name);
                                    setNewCollegeCitySearch(c.name);
                                    setShowNewCollegeCityDropdown(false);
                                  }}
                                >
                                  <p className="font-medium text-foreground">{c.name}</p>
                                </div>
                              ))
                            ) : newCollegeCitySearch.trim() ? (
                              <div className="px-4 py-2.5 text-sm text-muted-foreground">
                                New city: "{newCollegeCitySearch}" will be added
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newCollegeType">Type</Label>
                      <select
                        id="newCollegeType"
                        value={newCollegeType}
                        onChange={(e) => setNewCollegeType(e.target.value)}
                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="IIT">IIT</option>
                        <option value="NIT">NIT</option>
                        <option value="IIIT">IIIT</option>
                        <option value="Central">Central University</option>
                        <option value="State">State University</option>
                        <option value="Private">Private</option>
                        <option value="Deemed">Deemed</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddCollegeDialog(false)} disabled={isAddingCollege}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCollege} disabled={isAddingCollege || !newCollegeName.trim() || !newCollegeCity.trim()}>
                      {isAddingCollege && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Add College
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Add City Dialog */}
              <Dialog open={showAddCityDialog} onOpenChange={setShowAddCityDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Your City</DialogTitle>
                    <DialogDescription>
                      Can't find your city? Add it to our database.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="newCityName">City Name</Label>
                      <Input
                        id="newCityName"
                        placeholder="Enter city name"
                        value={newCityName}
                        onChange={(e) => setNewCityName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddCityDialog(false)} disabled={isAddingCity}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCity} disabled={isAddingCity || !newCityName.trim()}>
                      {isAddingCity && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Add City
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                    {loading ? '-' : stats.created}
                  </p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-foreground">
                    {loading ? '-' : stats.joined}
                  </p>
                  <p className="text-xs text-muted-foreground">Joined</p>
                </div>
                <div 
                  className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setIsConnectionsDialogOpen(true);
                    fetchConnections();
                  }}
                >
                  <p className="font-display text-2xl font-bold text-primary">
                    {loading ? '-' : stats.connections}
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
              My events
            </TabsTrigger>
            <TabsTrigger value="joined" className="font-display">
              <Calendar className="w-4 h-4 mr-2" />
              Joined
            </TabsTrigger>
          </TabsList>

          <TabsContent value="created" className="mt-0 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : createdevents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't created any events yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/create")}>
                  Create Your First event
                </Button>
              </div>
            ) : (
              createdevents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={{
                    ...event,
                    isOwner: true,
                    onDelete: () => deleteevent(event.id)
                  }} 
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="joined" className="mt-0 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : joinedevents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't joined any events yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
                  Discover events
                </Button>
              </div>
            ) : (
              joinedevents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </TabsContent>
        </Tabs>

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

      {/* Connections Dialog */}
      <Dialog open={isConnectionsDialogOpen} onOpenChange={setIsConnectionsDialogOpen}>
        <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Connections</DialogTitle>
            <DialogDescription>
              Your {stats.connections} connection{stats.connections !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {loadingConnections ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No connections yet</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setIsConnectionsDialogOpen(false);
                  navigate("/discover");
                }}>
                  Discover People
                </Button>
              </div>
            ) : (
              connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setIsConnectionsDialogOpen(false);
                    navigate(`/user/${connection.id}`);
                  }}
                >
                  <Avatar className="w-12 h-12 border-2 border-primary/30">
                    <AvatarImage src={connection.avatar_url} alt={connection.name} />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {connection.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {connection.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {connection.college || connection.city}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

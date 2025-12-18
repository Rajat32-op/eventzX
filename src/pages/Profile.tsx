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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { EventCard } from "@/components/EventCard";
import { colleges } from "@/data/colleges";
import { fetchCities, type City } from "@/lib/cities";

// Get city for a college
const getCityForCollege = (collegeName: string): string | null => {
  const college = colleges.find(c => c.name === collegeName);
  return college?.city || null;
};

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
  
  // City dropdown states for non-students
  const [cities, setCities] = useState<City[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        bio: profile.bio || '',
        college: profile.college || '',
        city: profile.city || '',
      });
      setCitySearch(profile.city || '');
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  // Fetch cities for non-students
  useEffect(() => {
    if ((profile as any)?.is_student === false) {
      async function loadCities() {
        setIsLoadingCities(true);
        const data = await fetchCities();
        setCities(data);
        setIsLoadingCities(false);
      }
      loadCities();
    }
  }, [profile]);

  // Handle click outside to close city dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }

    if (showCityDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCityDropdown]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const searchLower = citySearch.toLowerCase();
    return cities.filter(c => c.name.toLowerCase().includes(searchLower));
  }, [citySearch, cities]);

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

      // For students, derive city from college
      const isStudent = (profile as any)?.is_student !== false;
      const cityToSave = isStudent 
        ? getCityForCollege(editForm.college) || editForm.city
        : editForm.city;

      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          bio: editForm.bio,
          college: isStudent ? editForm.college : profile?.college,
          city: cityToSave,
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
                        <Select
                          value={editForm.college}
                          onValueChange={(value) => {
                            const city = getCityForCollege(value);
                            setEditForm({ 
                              ...editForm, 
                              college: value,
                              city: city || editForm.city 
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your college" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {colleges.map((c) => (
                              <SelectItem key={c.id} value={c.name}>
                                <span className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {c.type}
                                  </Badge>
                                  {c.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {editForm.college && getCityForCollege(editForm.college) && (
                          <p className="text-xs text-muted-foreground">
                            City: {getCityForCollege(editForm.college)}
                          </p>
                        )}
                      </div>
                    )}
                    {/* Show city selection only for non-students */}
                    {(profile as any)?.is_student === false && (
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
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
                                <div className="p-4 text-sm text-center text-muted-foreground">
                                  {citySearch.trim() ? "City not found" : "Start typing to search"}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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

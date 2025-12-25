import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  ChevronRight,
  Sparkles,
  CheckCircle,
  Globe,
  GraduationCap,
  Loader2,
  Plus,
  MessageCircle,
  Earth,
  Settings,
  Camera,
  UserPlus,
  UserMinus,
  Info,
  Crown,
  X,
  Trash2,
} from "lucide-react";
import { useCommunities, CommunityMember } from "@/hooks/useCommunities";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SelectedCommunity {
  id: string;
  name: string;
  description: string | null;
  type: string;
  image_url: string | null;
  is_admin: boolean;
  member_count: number;
}

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<SelectedCommunity | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [friends, setFriends] = useState<Array<{id: string, name: string, avatar_url: string, college: string | null, city: string | null}>>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    type: "Campus",
  });
  const { 
    communities, 
    loading, 
    joinCommunity, 
    createCommunity, 
    fetchMembers,
    addMember,
    removeMember,
    updateCommunity,
    uploadCommunityImage,
    deleteCommunity,
    refetch
  } = useCommunities();
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayCommunities = communities;

  const campusCommunities = displayCommunities.filter(
    (c) => c.type === "Campus"
  );
  const cityCommunities = displayCommunities.filter((c) => c.type === "City");
  const nationalCommunities = displayCommunities.filter((c) => c.type === "National");

  const filterCommunities = (communityList: typeof communities) =>
    communityList.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCreateCommunity = async () => {
    if (!newCommunity.name) return;

    await createCommunity(
      newCommunity.name,
      newCommunity.description || null,
      newCommunity.type
    );
    setNewCommunity({ name: "", description: "", type: "Interest" });
    setCreateDialogOpen(false);
  };

  const openInfoDialog = async (community: SelectedCommunity) => {
    setSelectedCommunity(community);
    setEditName(community.name);
    setEditDescription(community.description || "");
    setInfoDialogOpen(true);
    setLoadingMembers(true);
    const membersList = await fetchMembers(community.id);
    setMembers(membersList);
    setLoadingMembers(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedCommunity) return;
    await updateCommunity(selectedCommunity.id, {
      name: editName,
      description: editDescription || null,
    });
    setSelectedCommunity({
      ...selectedCommunity,
      name: editName,
      description: editDescription,
    });
    setEditMode(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCommunity) return;
    
    setUploadingImage(true);
    const imageUrl = await uploadCommunityImage(selectedCommunity.id, file);
    if (imageUrl) {
      setSelectedCommunity({ ...selectedCommunity, image_url: imageUrl });
    }
    setUploadingImage(false);
  };

  const loadFriends = async () => {
    if (!user) return;
    setLoadingFriends(true);
    
    try {
      const { data: friendships } = await supabase
        .from("friend_requests")
        .select(`
          sender_id,
          receiver_id,
          sender:profiles!friend_requests_sender_id_fkey(id, name, avatar_url, college, city),
          receiver:profiles!friend_requests_receiver_id_fkey(id, name, avatar_url, college, city)
        `)
        .eq("status", "accepted")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      const friendList = (friendships || []).map((f: any) => {
        const friend = f.sender_id === user.id ? f.receiver : f.sender;
        return {
          id: friend.id,
          name: friend.name || "",
          avatar_url: friend.avatar_url || "",
          college: friend.college || null,
          city: friend.city || null,
        };
      });

      // Filter out users already in community
      const memberIds = members.map(m => m.user_id);
      const filteredFriends = friendList.filter(f => !memberIds.includes(f.id));
      
      setFriends(filteredFriends);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedCommunity) return;
    const success = await addMember(selectedCommunity.id, userId);
    if (success) {
      setAddMemberDialogOpen(false);
      const membersList = await fetchMembers(selectedCommunity.id);
      setMembers(membersList);
      setSelectedCommunity({
        ...selectedCommunity,
        member_count: selectedCommunity.member_count + 1
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedCommunity) return;
    const success = await removeMember(selectedCommunity.id, userId);
    if (success) {
      setMembers(members.filter(m => m.user_id !== userId));
      setSelectedCommunity({
        ...selectedCommunity,
        member_count: selectedCommunity.member_count - 1
      });
    }
  };

  useEffect(() => {
    if (addMemberDialogOpen) {
      setFriendSearch("");
      loadFriends();
    }
  }, [addMemberDialogOpen]);

  const filteredFriends = friendSearch.trim() 
    ? friends.filter(f => 
        (f.name || "").toLowerCase().includes(friendSearch.toLowerCase()) ||
        (f.college || "").toLowerCase().includes(friendSearch.toLowerCase()) ||
        (f.city || "").toLowerCase().includes(friendSearch.toLowerCase())
      )
    : friends;

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-blue-50/95 backdrop-blur-lg dark:glass dark:backdrop-blur-lg border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-xl text-foreground">
                Circles
              </h1>
              <p className="text-xs text-muted-foreground">
                {communities.filter(c => c.is_joined).length} joined • {communities.length} total
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search circles..."
              className="pl-10 bg-background/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading circles...</p>
          </div>
        ) : (
          <>
            {/* Campus Communities */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display font-semibold text-lg text-foreground">
                    Campus Circles
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground">{campusCommunities.length} circles</span>
              </div>
              {filterCommunities(campusCommunities).length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <GraduationCap className="w-10 h-10 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground text-sm">No campus circles found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {filterCommunities(campusCommunities).map((community, index) => (
                    <Card
                      key={community.id}
                      className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md overflow-hidden"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="w-14 h-14 rounded-xl border-2 border-primary/20">
                              <AvatarImage src={community.image_url || undefined} />
                              <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                                {community.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {community.is_joined && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-display font-semibold text-foreground truncate">
                                {community.name}
                              </h3>
                              {community.is_admin && (
                                <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                              )}
                            </div>
                            {community.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {community.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {community.member_count}
                              </span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                {community.type}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openInfoDialog(community)}
                              >
                                <Info className="w-4 h-4" />
                              </Button>
                              {community.is_joined && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => navigate(`/chat/community/${community.id}`)}
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <Button
                              variant={community.is_joined ? "outline" : "default"}
                              size="sm"
                              onClick={() => joinCommunity(community.id)}
                              className={`text-xs ${community.is_joined ? "" : ""}`}
                            >
                              {community.is_joined ? "Leave" : "Join"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* City Communities */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="font-display font-semibold text-lg text-foreground">
                    City-Wide Circles
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground">{cityCommunities.length} circles</span>
              </div>
              {filterCommunities(cityCommunities).length === 0 ? (
                <div className="text-center py-8 bg-card/30 rounded-xl border border-dashed border-border">
                  <Globe className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No city circles yet</p>
                  <p className="text-muted-foreground/70 text-xs mt-1">Create one to connect with your city</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filterCommunities(cityCommunities).map((community, index) => (
                    <Card
                      key={community.id}
                      className="border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg animate-fade-up overflow-hidden group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="p-0.5 rounded-xl bg-gradient-to-br from-accent to-accent/50">
                              <Avatar className="w-12 h-12 rounded-xl border-2 border-background">
                                <AvatarImage src={community.image_url} />
                                <AvatarFallback className="rounded-xl bg-accent/20 text-accent font-bold text-lg">
                                  {community.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            {community.is_admin && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
                                <Crown className="w-3 h-3 text-yellow-900" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-display font-semibold text-foreground truncate text-sm">
                                {community.name}
                              </h3>
                              {community.is_joined && (
                                <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                              )}
                            </div>
                            {community.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                                {community.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                                <Users className="w-3 h-3" />
                                <span>{community.member_count}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-accent/50 text-accent"
                              >
                                🏙️ City
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openInfoDialog(community)}
                              >
                                <Info className="w-3.5 h-3.5" />
                              </Button>
                              {community.is_joined && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => navigate(`/chat/community/${community.id}`)}
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                            <Button
                              variant={community.is_joined ? "outline" : "secondary"}
                              size="sm"
                              className={`h-7 text-xs ${!community.is_joined ? "bg-accent hover:bg-accent/90" : ""}`}
                              onClick={() => joinCommunity(community.id)}
                            >
                              {community.is_joined ? "Leave" : "Join"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* National Communities */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Earth className="w-4 h-4 text-secondary" />
                  </div>
                  <h2 className="font-display font-semibold text-lg text-foreground">
                    National Circles
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground">{nationalCommunities.length} circles</span>
              </div>
              {filterCommunities(nationalCommunities).length === 0 ? (
                <div className="text-center py-8 bg-card/30 rounded-xl border border-dashed border-border">
                  <Earth className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No national circles yet</p>
                  <p className="text-muted-foreground/70 text-xs mt-1">Create one to connect nationwide</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filterCommunities(nationalCommunities).map((community, index) => (
                    <Card
                      key={community.id}
                      className="border-border/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg animate-fade-up overflow-hidden group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="p-0.5 rounded-xl bg-gradient-to-br from-secondary to-secondary/50">
                              <Avatar className="w-12 h-12 rounded-xl border-2 border-background">
                                <AvatarImage src={community.image_url} />
                                <AvatarFallback className="rounded-xl bg-secondary/20 text-secondary font-bold text-lg">
                                  {community.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            {community.is_admin && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
                                <Crown className="w-3 h-3 text-yellow-900" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-display font-semibold text-foreground truncate text-sm">
                                {community.name}
                              </h3>
                              {community.is_joined && (
                                <CheckCircle className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                              )}
                            </div>
                            {community.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                                {community.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                                <Users className="w-3 h-3" />
                                <span>{community.member_count}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-secondary/50 text-secondary"
                              >
                                🌍 National
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openInfoDialog(community)}
                              >
                                <Info className="w-3.5 h-3.5" />
                              </Button>
                              {community.is_joined && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => navigate(`/chat/community/${community.id}`)}
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                            <Button
                              variant={community.is_joined ? "outline" : "secondary"}
                              size="sm"
                              className={`h-7 text-xs ${!community.is_joined ? "bg-secondary hover:bg-secondary/90" : ""}`}
                              onClick={() => joinCommunity(community.id)}
                            >
                              {community.is_joined ? "Leave" : "Join"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Create Circle CTA */}
        <Card className="gradient-primary border-0 overflow-hidden">
          <CardContent className="p-6 relative">
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              Create Your Own Circle
            </h3>
            <p className="text-foreground/80 text-sm mb-4">
              Start a community for your specific interest. Gather people who
              share common interest
            </p>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="glass">
                  <Plus className="w-4 h-4 mr-1" />
                  Create Circle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Circle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Circle Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Hackthon group"
                      value={newCommunity.name}
                      onChange={(e) =>
                        setNewCommunity({ ...newCommunity, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Textarea
                      id="description"
                      placeholder="What is this circle about?"
                      value={newCommunity.description}
                      onChange={(e) =>
                        setNewCommunity({
                          ...newCommunity,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Circle Type</Label>
                    <Select
                      value={newCommunity.type}
                      onValueChange={(value) =>
                        setNewCommunity({ ...newCommunity, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Campus">Campus</SelectItem>
                        <SelectItem value="City">City</SelectItem>
                        <SelectItem value="National">National</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleCreateCommunity}
                    className="w-full"
                    disabled={!newCommunity.name}
                  >
                    Create Circle
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
          </CardContent>
        </Card>

        {/* Community Info Dialog */}
        <Dialog open={infoDialogOpen} onOpenChange={(open) => {
          setInfoDialogOpen(open);
          if (!open) {
            setEditMode(false);
            setAddMemberDialogOpen(false);
          }
        }}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  {selectedCommunity?.is_admin && <Crown className="w-4 h-4 text-yellow-500" />}
                  Circle Info
                </DialogTitle>
                {selectedCommunity?.is_admin && !editMode && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </DialogHeader>
            
            {selectedCommunity && (
              <div className="flex-1 overflow-auto">
                {/* Community Header */}
                <div className="flex flex-col items-center py-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 rounded-2xl">
                      <AvatarImage src={selectedCommunity.image_url || undefined} />
                      <AvatarFallback className="rounded-2xl bg-primary/20 text-primary text-2xl font-bold">
                        {selectedCommunity.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedCommunity.is_admin && (
                      <>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {editMode ? (
                    <div className="w-full mt-4 space-y-3 px-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Add a description..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} className="flex-1">
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-display font-bold text-xl mt-3">{selectedCommunity.name}</h3>
                      <Badge variant="outline" className="mt-1">{selectedCommunity.type}</Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        {selectedCommunity.member_count} members
                      </p>
                      {selectedCommunity.description && (
                        <p className="text-muted-foreground text-sm text-center mt-2 px-4">
                          {selectedCommunity.description}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Members Section */}
                {!editMode && (
                  <div className="border-t pt-4 px-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Members</h4>
                      {selectedCommunity.is_admin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAddMemberDialogOpen(true)}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                    
                    {loadingMembers ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {members.map((member) => (
                            <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                              <Avatar 
                                className="w-10 h-10 cursor-pointer"
                                onClick={() => {
                                  setInfoDialogOpen(false);
                                  navigate(`/user/${member.user_id}`);
                                }}
                              >
                                <AvatarImage src={member.profile?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {(member.profile?.name || "?").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {member.profile?.name || "Unknown"}
                                </p>
                                {member.role === 'admin' && (
                                  <span className="text-xs text-yellow-500 flex items-center gap-1">
                                    <Crown className="w-3 h-3" /> Admin
                                  </span>
                                )}
                              </div>
                              {selectedCommunity.is_admin && member.role !== 'admin' && member.user_id !== user?.id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveMember(member.user_id)}
                                >
                                  <UserMinus className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Circle</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedCommunity?.name}"? This action cannot be undone. All members will be removed and all data will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
                onClick={async () => {
                  if (!selectedCommunity) return;
                  setIsDeleting(true);
                  const success = await deleteCommunity(selectedCommunity.id);
                  setIsDeleting(false);
                  if (success) {
                    setDeleteDialogOpen(false);
                    setInfoDialogOpen(false);
                    setSelectedCommunity(null);
                  }
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Circle"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Member Dialog */}
        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Add Member
              </DialogTitle>
              <DialogDescription>Select a friend to add to this circle</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, college, or city..."
                  className="pl-9 bg-background/50"
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                />
              </div>
              
              {loadingFriends ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading friends...</p>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Users className="w-12 h-12 text-muted-foreground/50" />
                  <p className="text-center text-muted-foreground text-sm">
                    {friends.length === 0 ? "No friends available to add" : "No friends match your search"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1 pr-2">
                    {filteredFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-all border border-transparent hover:border-primary/20"
                        onClick={() => handleAddMember(friend.id)}
                      >
                        <Avatar className="w-11 h-11 border-2 border-primary/20">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {(friend.name || "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{friend.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {friend.college || friend.city || ""}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-primary hover:bg-primary hover:text-primary-foreground">
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

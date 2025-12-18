import { useState } from "react";
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
} from "lucide-react";
import { useCommunities } from "@/hooks/useCommunities";
import { useNavigate } from "react-router-dom";

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    type: "Interest",
  });
  const { communities, loading, joinCommunity, createCommunity } = useCommunities();
  const navigate = useNavigate();

  const displayCommunities = communities;

  const campusCommunities = displayCommunities.filter(
    (c) => c.type === "Campus" || c.type === "Interest"
  );
  const cityCommunities = displayCommunities.filter((c) => c.type === "City");

  const filterCommunities = (communityList: typeof communities) =>
    communityList.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCreateCommunity = async () => {
    if (!newCommunity.name || !newCommunity.description) return;

    await createCommunity(
      newCommunity.name,
      newCommunity.description,
      newCommunity.type
    );
    setNewCommunity({ name: "", description: "", type: "Interest" });
    setCreateDialogOpen(false);
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-blue-50/95 backdrop-blur-lg dark:glass dark:backdrop-blur-lg border-b border-border ">
        <div className="container px-4 py-4 ">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden glow-primary">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Your Circles
              </h1>
              <p className="text-xs text-muted-foreground">
                Find Your Social Community
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Campus Communities */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-lg text-foreground">
                  Campus & Interest Circles
                </h2>
              </div>
              {filterCommunities(campusCommunities).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No communities found</p>
                </div>
              ) : (
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
                              <AvatarImage src={community.image_url} />
                              <AvatarFallback className="rounded-xl bg-primary/20 text-primary font-semibold">
                                {community.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {community.is_joined && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <CheckCircle className="w-3.5 h-3.5 text-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold text-foreground truncate">
                              {community.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                              {community.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                <span>{community.member_count} members</span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0"
                              >
                                {community.type}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {community.is_joined && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/chat/community/${community.id}`)
                                }
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant={community.is_joined ? "outline" : "default"}
                              size="sm"
                              onClick={() => joinCommunity(community.id)}
                              className={community.is_joined ? "" : "glow-primary"}
                            >
                              {community.is_joined ? (
                                "Leave"
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 mr-1" />
                                  Join
                                </>
                              )}
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
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-accent" />
                <h2 className="font-display font-semibold text-lg text-foreground">
                  City-Wide Circles
                </h2>
              </div>
              {filterCommunities(cityCommunities).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No city circles yet</p>
                </div>
              ) : (
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
                              <AvatarImage src={community.image_url} />
                              <AvatarFallback className="rounded-xl bg-accent/20 text-accent font-semibold">
                                {community.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {community.is_joined && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                                <CheckCircle className="w-3.5 h-3.5 text-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold text-foreground truncate">
                              {community.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                              {community.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                <span>
                                  {community.member_count.toLocaleString()} members
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0 border-accent/50 text-accent"
                              >
                                {community.type}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {community.is_joined && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/chat/community/${community.id}`)
                                }
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant={community.is_joined ? "outline" : "secondary"}
                              size="sm"
                              onClick={() => joinCommunity(community.id)}
                              className={
                                community.is_joined
                                  ? ""
                                  : "bg-accent hover:bg-accent/90"
                              }
                            >
                              {community.is_joined ? (
                                "Leave"
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 mr-1" />
                                  Join
                                </>
                              )}
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
                    <Label htmlFor="description">Description</Label>
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
                        <SelectItem value="Interest">Interest</SelectItem>
                        <SelectItem value="Campus">Campus</SelectItem>
                        <SelectItem value="City">City</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleCreateCommunity}
                    className="w-full"
                    disabled={!newCommunity.name || !newCommunity.description}
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
      </div>
    </AppLayout>
  );
}

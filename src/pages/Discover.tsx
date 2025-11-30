import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Check, GraduationCap, MapPin, Sparkles, Loader2, UserCheck, Clock, UserMinus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { dummyProfiles } from "@/data/dummyData";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const {
    profiles,
    sentRequests,
    receivedRequests,
    friends,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    disconnectFriend,
  } = useFriendRequests();

  // Always show dummy data alongside real profiles
  const displayProfiles = [...profiles, ...dummyProfiles];

  const filteredProfiles = displayProfiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.college?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      profile.interests.some((interest) =>
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const getConnectionStatus = (userId: string) => {
    if (friends.includes(userId)) return "connected";
    if (sentRequests.includes(userId)) return "pending";
    return "none";
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Discover People
              </h1>
              <p className="text-xs text-muted-foreground">
                Find your spiritual companions
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, college, or interests..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 py-6 space-y-4">
        {/* Pending Requests */}
        {receivedRequests.length > 0 && (
          <section className="mb-6">
            <h2 className="font-display font-semibold text-foreground mb-3">
              Connection Requests ({receivedRequests.length})
            </h2>
            <div className="space-y-3">
              {receivedRequests.map((request) => (
                <Card
                  key={request.id}
                  className="border-secondary/50 bg-secondary/5"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-secondary/20">
                        <AvatarImage
                          src={
                            request.sender?.avatar_url ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.sender?.name}`
                          }
                        />
                        <AvatarFallback className="bg-secondary/20 text-secondary">
                          {request.sender?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground">
                          {request.sender?.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {request.sender?.college}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            acceptRequest(request.id, request.sender_id)
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectRequest(request.id)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Suggested Section */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-semibold text-foreground">
            Suggested for You
          </h2>
          <span className="text-xs text-muted-foreground">
            {filteredProfiles.length} people
          </span>
        </div>

        {/* User Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProfiles.map((profile, index) => {
              const status = getConnectionStatus(profile.id);
              return (
                <Card
                  key={profile.id}
                  className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:glow-primary animate-fade-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/user/${profile.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 border-2 border-primary/20">
                        <AvatarImage
                          src={
                            profile.avatar_url ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`
                          }
                        />
                        <AvatarFallback className="bg-primary/20 text-primary text-lg">
                          {profile.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground">
                          {profile.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {profile.college && (
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-primary" />
                              <span>{profile.college}</span>
                            </div>
                          )}
                          {profile.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-accent" />
                              <span>{profile.city}</span>
                            </div>
                          )}
                        </div>

                        {profile.bio && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                            {profile.bio}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {profile.interests.slice(0, 3).map((interest) => (
                            <Badge
                              key={interest}
                              variant="interest"
                              className="text-xs"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant={status !== "none" ? "outline" : "default"}
                        size="sm"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (status === "none") {
                            sendRequest(profile.id);
                          } else if (status === "connected") {
                            disconnectFriend(profile.id);
                          }
                        }}
                        disabled={status === "pending"}
                      >
                        {status === "connected" ? (
                          <>
                            <UserMinus className="w-4 h-4 mr-1" />
                            Disconnect
                          </>
                        ) : status === "pending" ? (
                          <>
                            <Clock className="w-4 h-4 mr-1" />
                            Pending
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No users found matching your search.
            </p>
          </div>
        )}

        {/* CTA Card */}
        <Card className="gradient-primary border-0 overflow-hidden mt-6">
          <CardContent className="p-6 relative">
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              Invite Friends
            </h3>
            <p className="text-foreground/80 text-sm mb-4">
              Know someone who'd love InnerCircle? Share the app and grow your
              spiritual network.
            </p>
            <Button variant="glass">Share InnerCircle</Button>
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

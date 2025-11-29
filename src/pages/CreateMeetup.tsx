import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, MapPin, Clock, Users, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const meetupTypes = [
  { id: "meditation", name: "Meditation", emoji: "🧘" },
  { id: "yoga", name: "Yoga", emoji: "🪷" },
  { id: "temple", name: "Temple Visit", emoji: "🛕" },
  { id: "church", name: "Church Visit", emoji: "⛪" },
  { id: "mosque", name: "Mosque Visit", emoji: "🕌" },
  { id: "walk", name: "Nature Walk", emoji: "🌿" },
  { id: "discussion", name: "Discussion", emoji: "💬" },
  { id: "other", name: "Other", emoji: "✨" },
];

export default function CreateMeetup() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to create a meetup.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.from("meetups").insert({
      creator_id: user.id,
      title,
      description,
      category,
      location,
      date,
      time,
      max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error creating meetup",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Meetup Created! 🎉",
        description: "Your spiritual meetup is now live. Others can join!",
      });
      navigate("/");
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Create Meetup
              </h1>
              <p className="text-xs text-muted-foreground">
                Bring your campus together
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="container px-4 py-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              Meetup Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-3">
                <Label>What type of meetup?</Label>
                <div className="flex flex-wrap gap-2">
                  {meetupTypes.map((type) => (
                    <Badge
                      key={type.id}
                      variant={category === type.id ? "default" : "interest"}
                      className="cursor-pointer text-sm py-2 px-3"
                      onClick={() => setCategory(type.id)}
                    >
                      <span className="mr-1.5">{type.emoji}</span>
                      {type.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder='e.g., "Morning Meditation at 6 AM"'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What's this meetup about? Any requirements?"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      className="pl-10"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g., Campus Garden, H4 Terrace"
                    className="pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Max Attendees */}
              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Max Attendees (optional)</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="maxAttendees"
                    type="number"
                    min="2"
                    max="500"
                    placeholder="No limit (leave empty)"
                    className="pl-10"
                    value={maxAttendees}
                    onChange={(e) => setMaxAttendees(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty for unlimited attendees
                </p>
              </div>

              {/* Submit */}
              <Button
                variant="glow"
                size="lg"
                className="w-full"
                type="submit"
                disabled={isLoading || !title || !description || !location || !date || !time || !category}
              >
                {isLoading ? (
                  "Creating..."
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Create Meetup
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

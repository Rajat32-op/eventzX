import { MapPin, Clock, Users, ChevronRight, Trash2, MessageCircle, Share2, Copy, Check, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EventDetailDialog } from "./EventDetailDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface eventCardPropsIndividual {
  title: string;
  description: string;
  time: string;
  location: string;
  category: string;
  host: {
    name: string;
    avatar?: string;
    college: string;
  };
  attendees: number;
  maxAttendees?: number;
  onJoin?: () => void;
  onDelete?: () => void;
  isJoined?: boolean;
  isOwner?: boolean;
}

interface eventCardPropsObject {
  event: any;
}

type eventCardProps = eventCardPropsIndividual | eventCardPropsObject;

function formateventTime(date: string, time: string) {
  const eventDate = new Date(date + 'T' + time);
  return eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function EventCard(props: eventCardProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const url = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if we received a event object or individual props
  let title, description, time, location, category, host, attendees, maxAttendees, onJoin, onDelete, isJoined, isOwner, creatorId, fullevent, eventLink, isOnline;

  if ('event' in props) {
    const { event } = props;
    fullevent = event;
    title = event.title;
    description = event.description;
    time = formateventTime(event.date, event.time);
    location = event.location;
    isOnline = event.is_online;
    category = event.category;
    host = {
      name: event.creator?.name || 'Unknown',
      avatar: event.creator?.avatar_url,
      college: event.creator?.college || 'Unknown'
    };
    attendees = event.event_attendees?.[0]?.count || 0;
    maxAttendees = event.max_attendees;
    onJoin = event.onJoin;
    onDelete = event.onDelete;
    isJoined = event.isJoined || false;
    isOwner = event.isOwner || false;
    creatorId = event.creator_id;
    eventLink = event.event_link;
  } else {
    ({ title, description, time, location, category, host, attendees, maxAttendees, onJoin, onDelete, isJoined = false, isOwner = false } = props);
  }
  return (
    <>
      <Card
        className="hover:border-primary/50 transition-all duration-300 hover:glow-primary overflow-hidden group"
      >
        <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex">
              <div className="flex-1 min-w-0">
                {/* Category badge */}
                <Badge variant="interest" className="mb-3">
                  {category}
                </Badge>

                {/* Title */}
                <h3 className="font-display font-semibold text-lg mb-2 text-primary transition-colors">
                  {title}
                </h3>

                {/* Description - hidden on mobile, shown inline on larger screens */}
                <p className="text-muted-foreground text-sm mb-4 hidden sm:block">
                  {description}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{time}</span>
                  </div>
                  {isOnline ? (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-accent" />
                      <span>Online</span>
                    </div>
                  ) : location ? (
                    <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                      <PopoverTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-accent transition-colors">
                          <MapPin className="w-4 h-4 text-accent" />
                          <span className="truncate max-w-[150px]">{location}</span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto max-w-[300px] p-3" align="start">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <p className="text-sm break-words">{location}</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : null}
                </div>

                {/* Host info */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border-2 border-primary/30">
                    <AvatarImage src={host.avatar} alt={host.name} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {host.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (creatorId) {
                          navigate(`/user/${creatorId}`);
                        }
                      }}
                    >
                      {host.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {host.college}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col items-end gap-2">
                {/* Share button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsShareOpen(true);
                  }}
                  className="min-w-[80px]"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                {fullevent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        navigate('/auth', { state: { from: location } });
                        return;
                      }
                      setIsDetailOpen(true);
                    }}
                    className="min-w-[80px]"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Comments
                  </Button>
                )}
                {isOwner ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                    }}
                    className="min-w-[80px]"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                ) : eventLink ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        navigate('/auth', { state: { from: url } });
                        return;
                      }
                      window.open(eventLink, '_blank');
                    }}
                    className="min-w-[80px]"
                  >
                    Register
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant={isJoined ? "outline" : "default"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        navigate('/auth', { state: { from: url } });
                        return;
                      }
                      onJoin?.();
                    }}
                    className="min-w-[80px]"
                  >
                    {isJoined ? "Joined" : "Join"}
                    {!isJoined && <ChevronRight className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </div>

          </div>
          {/* Description - shown at bottom full-width on mobile only */}
          <p className="text-muted-foreground text-sm mt-3 pt-3 border-t border-border sm:hidden">
            {description}
          </p>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Event</DialogTitle>
            <DialogDescription>
              Share "{title}" with your friends
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            {/* Copy Link */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                const shareUrl = `${window.location.origin}/?event=${fullevent?.id || ''}`;
                navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                toast({
                  title: "Link copied!",
                  description: "Event link has been copied to clipboard",
                });
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </Button>

            {/* WhatsApp */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                const shareUrl = `${window.location.origin}/?event=${fullevent?.id || ''}`;
                const text = `Check out this event: ${title}\n${shareUrl}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp</span>
            </Button>

            {/* LinkedIn */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                const shareUrl = `${window.location.origin}/?event=${fullevent?.id || ''}`;
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>LinkedIn</span>
            </Button>

            {/* Discord */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                const shareUrl = `${window.location.origin}/?event=${fullevent?.id || ''}`;
                const text = `Check out this event: ${title} - ${shareUrl}`;
                navigator.clipboard.writeText(text);
                toast({
                  title: "Ready for Discord!",
                  description: "Event details copied - paste in your Discord server",
                });
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
              </svg>
              <span>Discord (Copy)</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {fullevent && (
        <EventDetailDialog
          event={fullevent}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      )}
    </>
  );
}

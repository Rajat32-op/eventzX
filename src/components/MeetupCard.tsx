import { MapPin, Clock, Users, ChevronRight, Trash2, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MeetupDetailDialog } from "./MeetupDetailDialog";

interface MeetupCardPropsIndividual {
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

interface MeetupCardPropsObject {
  meetup: any;
}

type MeetupCardProps = MeetupCardPropsIndividual | MeetupCardPropsObject;

function formatMeetupTime(date: string, time: string) {
  const meetupDate = new Date(date + 'T' + time);
  return meetupDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function MeetupCard(props: MeetupCardProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();
  
  // Check if we received a meetup object or individual props
  let title, description, time, location, category, host, attendees, maxAttendees, onJoin, onDelete, isJoined, isOwner, creatorId, fullMeetup;
  
  if ('meetup' in props) {
    const { meetup } = props;
    fullMeetup = meetup;
    title = meetup.title;
    description = meetup.description;
    time = formatMeetupTime(meetup.date, meetup.time);
    location = meetup.location;
    category = meetup.category;
    host = {
      name: meetup.creator?.name || 'Unknown',
      avatar: meetup.creator?.avatar_url,
      college: meetup.creator?.college || 'Unknown'
    };
    attendees = meetup.meetup_attendees?.[0]?.count || 0;
    maxAttendees = meetup.max_attendees;
    onJoin = meetup.onJoin;
    onDelete = meetup.onDelete;
    isJoined = meetup.isJoined || false;
    isOwner = meetup.isOwner || false;
    creatorId = meetup.creator_id;
  } else {
    ({ title, description, time, location, category, host, attendees, maxAttendees, onJoin, onDelete, isJoined = false, isOwner = false } = props);
  }
  return (
    <>
      <Card 
        className="hover:border-primary/50 transition-all duration-300 hover:glow-primary overflow-hidden group"
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
            {/* Category badge */}
            <Badge variant="interest" className="mb-3">
              {category}
            </Badge>

            {/* Title */}
            <h3 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {description}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>{time}</span>
              </div>
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
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-secondary" />
                <span>
                  {attendees}
                  {maxAttendees && `/${maxAttendees}`} joined
                </span>
              </div>
            </div>

            {/* Host info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 border-2 border-primary/30">
                <AvatarImage src={host.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.name}`} alt={host.name} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {host.name.charAt(0)}
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
            {fullMeetup && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
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
            ) : (
              <Button
                variant={isJoined ? "outline" : "default"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
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
      </CardContent>
    </Card>

    {fullMeetup && (
      <MeetupDetailDialog
        meetup={fullMeetup}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    )}
    </>
  );
}

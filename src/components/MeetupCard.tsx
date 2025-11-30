import { MapPin, Clock, Users, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  isJoined?: boolean;
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
  // Check if we received a meetup object or individual props
  let title, description, time, location, category, host, attendees, maxAttendees, onJoin, isJoined;
  
  if ('meetup' in props) {
    const { meetup } = props;
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
    onJoin = undefined;
    isJoined = false;
  } else {
    ({ title, description, time, location, category, host, attendees, maxAttendees, onJoin, isJoined = false } = props);
  }
  return (
    <Card className="hover:border-primary/50 transition-all duration-300 hover:glow-primary overflow-hidden group">
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
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="truncate max-w-[150px]">{location}</span>
              </div>
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
                <AvatarImage src={host.avatar} alt={host.name} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {host.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {host.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {host.college}
                </p>
              </div>
            </div>
          </div>

          {/* Join button */}
          <div className="flex flex-col items-end gap-2">
            <Button
              variant={isJoined ? "outline" : "default"}
              size="sm"
              onClick={onJoin}
              className="min-w-[80px]"
            >
              {isJoined ? "Joined" : "Join"}
              {!isJoined && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

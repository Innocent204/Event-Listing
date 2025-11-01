import { Event } from '../types/event';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Calendar, Clock, MapPin, Ticket, ExternalLink, User, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventDetailProps {
  event: Event;
  onBack: () => void;
}

export function EventDetail({ event, onBack }: EventDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = () => {
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const duration = end.getTime() - start.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minutes`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Button>

      {/* Main Event Card */}
      <Card>
        {event.imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <ImageWithFallback
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-3">
            {event.categories.map((category) => (
              <Badge
                key={category.id}
                className={`${category.color} text-white`}
              >
                {category.name}
              </Badge>
            ))}
          </div>
          
          <CardTitle className="text-2xl">{event.name}</CardTitle>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.startDateTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="mb-3">About This Event</h3>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>
          
          <Separator />
          
          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date & Time */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date & Time
              </h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>{formatDate(event.startDateTime)}</p>
                <p>{formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}</p>
                <p>Duration: {formatDuration()}</p>
              </div>
            </div>
            
            {/* Location */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>{event.venue.name}</p>
                <p>{event.venue.address}</p>
                {event.venue.capacity && (
                  <p>Capacity: {event.venue.capacity.toLocaleString()} people</p>
                )}
              </div>
            </div>
            
            {/* Pricing */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Pricing
              </h4>
              <div className="text-sm text-muted-foreground">
                {event.isFree ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Free Event
                  </Badge>
                ) : (
                  <p>${event.ticketPrice}</p>
                )}
              </div>
            </div>
            
            {/* Organizer */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Organizer
              </h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>{event.organizer.name}</p>
                <p>{event.organizer.contactEmail}</p>
                {event.organizer.website && (
                  <a
                    href={event.organizer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Visit Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {event.ticketingLink && (
              <Button 
                className="flex-1"
                onClick={() => window.open(event.ticketingLink, '_blank', 'noopener,noreferrer')}
              >
                <Ticket className="w-4 h-4 mr-2" />
                {event.isFree ? 'Register for Free' : 'Buy Tickets'}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            {event.website && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open(event.website, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Event Website
              </Button>
            )}
            
            <Button variant="outline" className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
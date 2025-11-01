import { Event } from '../types/event';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import React from 'react';

interface EventMapProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export function EventMap({ events, onEventClick }: EventMapProps) {
  // Group events by venue to avoid overlapping markers
  const eventsByVenue = events.reduce((acc, event) => {
    const venueId = event.venue.id;
    if (!acc[venueId]) {
      acc[venueId] = [];
    }
    acc[venueId].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Event Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for actual map - in a real implementation, you'd use a library like Leaflet or Google Maps */}
          <div className="bg-muted rounded-lg h-64 flex items-center justify-center mb-4">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p>Interactive Map View</p>
              <p className="text-sm">Map integration would show event locations with clickable markers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Venue List with Events */}
      <div className="space-y-4">
        {Object.entries(eventsByVenue).map(([venueId, venueEvents]) => {
          const venue = venueEvents[0].venue;
          return (
            <Card key={venueId}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{venue.name}</CardTitle>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {venue.address}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {venueEvents.length} event{venueEvents.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {venueEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate">{event.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.startDateTime)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(event.startDateTime)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Ticket className="w-3 h-3" />
                            {event.isFree ? 'Free' : `$${event.ticketPrice}`}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.categories.map((category) => (
                            <Badge
                              key={category.id}
                              variant="secondary"
                              className={`${category.color} text-white text-xs`}
                            >
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
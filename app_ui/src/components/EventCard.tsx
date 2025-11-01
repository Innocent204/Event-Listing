import { Event, RawEvent } from '../types/event';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, Clock, ExternalLink, Ticket } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
  key?: string | number;
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  // Log the event data for debugging
  console.log('Event data:', {
    id: event.id,
    name: event.name,
    isFree: event.isFree,
    ticketPrice: event.ticketPrice,
    rawEvent: event.rawEvent
  });
  
  // Helper to get the ticket price from either the direct prop or rawEvent
  const getTicketPrice = (): number | undefined => {
    let price: any;
    
    // First try to get from direct prop
    if (event.ticketPrice !== undefined && event.ticketPrice !== null) {
      price = event.ticketPrice;
    }
    // Then try to get from rawEvent
    else if (event.rawEvent?.ticket_price !== undefined && event.rawEvent?.ticket_price !== null) {
      price = event.rawEvent.ticket_price;
    }
    // Try alternative naming (just in case)
    else if ((event as any).ticket_price !== undefined && (event as any).ticket_price !== null) {
      price = (event as any).ticket_price;
    }
    
    // If we found a price, ensure it's a number
    if (price !== undefined && price !== null) {
      const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
      return isNaN(numPrice) ? undefined : numPrice;
    }
    
    // Default to undefined if not found
    return undefined;
  };
  
  // Helper to check if event is free
  const isEventFree = (): boolean => {
    // Check direct prop first
    if (event.isFree !== undefined && event.isFree !== null) {
      return event.isFree;
    }
    // Then check rawEvent
    if (event.rawEvent?.is_free !== undefined && event.rawEvent?.is_free !== null) {
      return event.rawEvent.is_free;
    }
    // Try alternative naming (just in case)
    if ((event as any).is_free !== undefined && (event as any).is_free !== null) {
      return (event as any).is_free;
    }
    
    // If we have a ticket price, check if it's 0
    const price = getTicketPrice();
    if (price !== undefined && price !== null) {
      return price === 0;
    }
    
    // If we don't have any price information, default to false (not free)
    // This ensures we don't show "Free" for events where we don't know the price
    return false;
  };

  const parseDate = (dateString: string | undefined | null): Date | null => {
    if (!dateString) return null;
    
    // Try parsing the date string directly
    let date = new Date(dateString);
    
    // If the date is invalid, try parsing with Date.parse
    if (isNaN(date.getTime())) {
      const timestamp = Date.parse(dateString);
      if (!isNaN(timestamp)) {
        date = new Date(timestamp);
      }
    }
    
    // If still invalid, return null
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return null;
    }
    
    return date;
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Date not set';
    
    const date = parseDate(dateString);
    if (!date) return 'Invalid date';
    
    try {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Date error';
    }
  };

  const formatTime = (dateString: string | undefined | null) => {
    if (!dateString) return 'Time not set';
    
    const date = parseDate(dateString);
    if (!date) return 'Invalid time';
    
    try {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.warn('Error formatting time:', error);
      return 'Time error';
    }
  };
  
  // Add debug logging for date strings
  console.log('Event date strings:', {
    id: event.id,
    name: event.name,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    rawEvent: event.rawEvent ? {
      start_date_time: event.rawEvent.start_date_time,
      end_date_time: event.rawEvent.end_date_time
    } : null
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails(event)}>
      {event.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <ImageWithFallback
            src={event.imageUrl}
            alt={event.name || 'Event'}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2">{event.name || 'Untitled Event'}</h3>
          <div className="flex flex-wrap gap-1">
            {event.categories && Array.isArray(event.categories) && event.categories.slice(0, 2).map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="text-xs"
                style={{ backgroundColor: category.color, color: 'white', borderColor: category.color }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-muted-foreground line-clamp-2">{event.description || 'No description available'}</p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="whitespace-nowrap">{formatDate(event.startDateTime)}</span>
            <Clock className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
            <span className="whitespace-nowrap">{formatTime(event.startDateTime)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="line-clamp-1">{event.venue?.name || 'Venue not specified'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {(() => {
                  const ticketPrice = getTicketPrice();
                  const isFree = isEventFree();
                  
                  console.log(`Rendering event ${event.id} - isFree: ${isFree}, ticketPrice: ${ticketPrice}`, {
                    rawEvent: event.rawEvent,
                    directProps: {
                      isFree: event.isFree,
                      ticketPrice: event.ticketPrice
                    },
                    computed: {
                      isFree,
                      ticketPrice
                    }
                  });
                  
                  // Priority 1: Show price if we have a valid paid ticket price
                  if (ticketPrice !== undefined && ticketPrice !== null && ticketPrice > 0) {
                    return `$${ticketPrice.toFixed(2)}`;
                  }
                  
                  // Priority 2: Show "Free" only if explicitly marked as free or price is 0
                  if (isFree || ticketPrice === 0) {
                    return <Badge variant="outline" className="text-green-600 border-green-600">Free</Badge>;
                  }
                  
                  // Priority 3: If event name contains "free", show as free
                  if (event.name && typeof event.name === 'string' && event.name.toLowerCase().includes('free')) {
                    return <Badge variant="outline" className="text-green-600 border-green-600">Free</Badge>;
                  }
                  
                  // Fallback: No price information available
                  return <Badge variant="outline" className="text-blue-600 border-blue-600">Contact for price</Badge>;
                })()}
              </span>
            </div>
            
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              View Details
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
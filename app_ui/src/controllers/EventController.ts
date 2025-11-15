import { EventService, EventFilters, EventCreateData } from '../services/EventService';
import { Event } from '../types/event';

// Controller layer - handles business logic and coordinates between services and views
export class EventController {
  createEvent(eventData: { image_url?: string | undefined; ticketing_link?: string | undefined; website?: string | undefined; ticket_price?: number | undefined; name: string; description: string; start_date_time: string; end_date_time: string; venue_id: string; category_ids: string[]; is_free: boolean; }) {
    throw new Error('Method not implemented.');
  }
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  // Handle event listing with filters, search, and pagination
  async handleEventListing(filters: EventFilters, page: number = 1, perPage: number = 12) {
    try {
      const response = await this.eventService.getEvents(filters);

      return {
        success: true,
        data: response,
        message: `Found ${response.total} events`
      };
    } catch (error) {
      return {
        success: false,
        data: { data: [], total: 0, current_page: 1, per_page: perPage, last_page: 1, from: 0, to: 0 },
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Handle single event retrieval
  async handleEventDetail(eventId: string) {
    try {
      const event = await this.eventService.getEventById(eventId);

      return {
        success: true,
        data: event,
        message: 'Event retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to load event'
      };
    }
  }

  // Handle event creation (for organizers)
  async handleEventCreation(eventData: EventCreateData) {
    try {
      // Validate event data
      const validation = this.validateEventData(eventData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: validation.message
        };
      }

      const result = await this.eventService.createEvent(eventData);

      return {
        success: true,
        data: result,
        message: result.message || 'Event created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to create event'
      };
    }
  }

  // Handle event updates (for organizers)
  async handleEventUpdate(eventId: string, eventData: Partial<EventCreateData>) {
    try {
      const result = await this.eventService.updateEvent(eventId, eventData);

      return {
        success: true,
        data: result.event,
        message: result.message || 'Event updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update event'
      };
    }
  }

  // Handle event deletion (for organizers)
  async handleEventDeletion(eventId: string) {
    try {
      const result = await this.eventService.deleteEvent(eventId);

      return {
        success: true,
        data: result,
        message: result.message || 'Event deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to delete event'
      };
    }
  }

  // Handle calendar events
  async handleCalendarEvents(year: number, month: number) {
    try {
      const events = await this.eventService.getEventsForCalendar(year, month);

      return {
        success: true,
        data: events,
        message: 'Calendar events retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to load calendar events'
      };
    }
  }

  // Business logic validation
  private validateEventData(eventData: EventCreateData): { isValid: boolean; message: string } {
    if (!eventData.name || eventData.name.trim().length < 3) {
      return { isValid: false, message: 'Event name must be at least 3 characters long' };
    }

    // Ensure isFree is always a boolean
    if (typeof eventData.is_free === 'undefined') {
      // If isFree is not set, set it based on ticketPrice
      eventData.is_free = !eventData.ticket_price || eventData.ticket_price <= 0;
    }

    // If event is not free, ensure ticketPrice is valid
    if (!eventData.is_free) {
      if (typeof eventData.ticket_price === 'undefined' || eventData.ticket_price === null) {
        return { 
          isValid: false, 
          message: 'Please specify a ticket price for paid events' 
        };
      }
      
      if (eventData.ticket_price <= 0) {
        return { 
          isValid: false, 
          message: 'Ticket price must be greater than 0 for paid events' 
        };
      }
    } else {
      // If event is free, ensure ticketPrice is 0 or not set
      eventData.ticket_price = 0;
    }

    if (!eventData.description || eventData.description.trim().length < 10) {
      return { isValid: false, message: 'Event description must be at least 10 characters long' };
    }

    const startDate = new Date(eventData.start_date_time);
    const endDate = new Date(eventData.end_date_time);
    const now = new Date();

    if (startDate <= now) {
      return { isValid: false, message: 'Event start date must be in the future' };
    }

    if (endDate <= startDate) {
      return { isValid: false, message: 'Event end date must be after start date' };
    }

    if (!eventData.venue_id) {
      return { isValid: false, message: 'Venue is required' };
    }

    if (!eventData.category_ids || eventData.category_ids.length === 0) {
      return { isValid: false, message: 'At least one category is required' };
    }

    if (!eventData.is_free && (!eventData.ticket_price || eventData.ticket_price <= 0)) {
      return { isValid: false, message: 'Ticket price is required for paid events' };
    }

    return { isValid: true, message: 'Valid' };
  }

  // Helper method to format events for different views
  formatEventsForView(events: Event[], viewType: 'list' | 'calendar' | 'map') {
    switch (viewType) {
      case 'calendar':
        return this.groupEventsByDate(events);
      case 'map':
        return this.groupEventsByVenue(events);
      default:
        return events;
    }
  }

  private groupEventsByDate(events: Event[]): Record<string, Event[]> {
    return events.reduce((acc, event) => {
      const date = new Date(event.startDateTime).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
  }

  private groupEventsByVenue(events: Event[]): Record<string, Event[]> {
    return events.reduce((acc, event) => {
      const venueId = event.venue.id;
      if (!acc[venueId]) {
        acc[venueId] = [];
      }
      acc[venueId].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
  }
}
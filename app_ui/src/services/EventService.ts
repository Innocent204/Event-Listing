import api from './ApiClient';
import { AxiosResponse } from 'axios';
import { Event } from '../types/event';

export interface EventFilters {
  search?: string;
  categories?: string[];
  date?: string;
  price_filter?: 'free' | 'paid';
  venue?: string;
  organizer?: string;
  status?: 'approved' | 'pending' | 'rejected' | 'draft' | 'cancelled';
  sort_by?: 'start_date_time' | 'name' | 'created_at';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
}

export interface EventCreateData {
  name: string;
  description: string;
  start_date_time: string;
  end_date_time: string;
  venue_id: number;
  category_ids: number[];
  ticket_price?: number;
  is_free?: boolean;
  website?: string;
  ticketing_link?: string;
  image_url?: string;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

class EventService {
  // GET /api/events/{id} - Get a specific event
  async getEvent(id: string): Promise<Event> {
    try {
      const response: AxiosResponse<Event> = await api.get(`/events/${id}`);
      return this.normalizeEvent(response.data);
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
      throw error;
    }
  }
  async getEvents(filters: EventFilters = {}): Promise<PaginatedResponse<Event>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key + '[]', v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response: AxiosResponse<PaginatedResponse<any>> = await api.get(`/events?${params.toString()}`);
      
      // Normalize each event in the response
      const normalizedData = {
        ...response.data,
        data: response.data.data.map((event: any) => this.normalizeEvent(event))
      };
      
      return normalizedData;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }

  // GET /api/events/{id} - Get a specific event
  async getEventById(id: string): Promise<Event> {
    try {
      const response: AxiosResponse<Event> = await api.get(`/events/${id}`);
      return this.normalizeEvent(response.data);
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
      throw error;
    }
  }

  // POST /api/events - Create a new event
  async createEvent(eventData: EventCreateData): Promise<{ message: string; event: Event }> {
    try {
      const response: AxiosResponse<{ message: string; event: any }> = await api.post('/events', eventData);
      return {
        message: response.data.message,
        event: this.normalizeEvent(response.data.event)
      };
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  // PUT /api/events/{id} - Update an existing event
  async updateEvent(id: string, eventData: Partial<EventCreateData>): Promise<{ message: string; event: Event }> {
    try {
      const response: AxiosResponse<{ message: string; event: Event }> = await api.put(`/events/${id}`, eventData);
      return {
        message: response.data.message,
        event: this.normalizeEvent(response.data.event)
      };
    } catch (error) {
      console.error(`Failed to update event ${id}:`, error);
      throw error;
    }
  }

  // DELETE /api/events/{id} - Delete an event
  async deleteEvent(id: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete event ${id}:`, error);
      throw error;
    }
  }

  // GET /api/events/calendar/{year}/{month} - Get events for calendar view
  async getEventsForCalendar(year: number, month: number): Promise<Event[]> {
    try {
      const response: AxiosResponse<Event[]> = await api.get(`/events/calendar/${year}/${month}`);
      return response.data.map(event => this.normalizeEvent(event));
    } catch (error) {
      console.error(`Failed to fetch calendar events for ${year}-${month}:`, error);
      throw error;
    }
  }

  // GET /api/my-events - Get events created by the current user
  async getMyEvents(filters: { status?: string } = {}): Promise<PaginatedResponse<Event>> {
    try {
      const params = new URLSearchParams();
      if (filters.status) {
        params.append('status', filters.status);
      }

      const response: AxiosResponse<PaginatedResponse<Event>> = await api.get(`/my-events?${params.toString()}`);
      return {
        ...response.data,
        data: response.data.data.map(event => this.normalizeEvent(event))
      };
    } catch (error) {
      console.error('Failed to fetch my events:', error);
      throw error;
    }
  }

  // POST /api/events/{id}/approve - Approve an event (admin only)
  async approveEvent(id: string): Promise<{ message: string; event: Event }> {
    try {
      const response: AxiosResponse<{ message: string; event: Event }> = await api.post(`/events/${id}/approve`);
      return {
        message: response.data.message,
        event: this.normalizeEvent(response.data.event)
      };
    } catch (error) {
      console.error(`Failed to approve event ${id}:`, error);
      throw error;
    }
  }

  // POST /api/events/{id}/reject - Reject an event (admin only)
  async rejectEvent(id: string, reason: string): Promise<{ message: string; event: Event }> {
    try {
      const response: AxiosResponse<{ message: string; event: Event }> = await api.post(`/events/${id}/reject`, { reason });
      return {
        message: response.data.message,
        event: this.normalizeEvent(response.data.event)
      };
    } catch (error) {
      console.error(`Failed to reject event ${id}:`, error);
      throw error;
    }
  }

  // Normalize Laravel API response to frontend format
  private normalizeEvent(eventData: any): Event {
    // Create a copy of the raw event data
    const rawEvent = { ...eventData };
    
    // If venue is an object, create a copy of it too
    if (eventData.venue && typeof eventData.venue === 'object') {
      rawEvent.venue = { ...eventData.venue };
    }
    
    // If organizer is an object, create a copy of it too
    if (eventData.organizer && typeof eventData.organizer === 'object') {
      rawEvent.organizer = { ...eventData.organizer };
    }
    
    // If categories is an array, create a copy of it too
    if (Array.isArray(eventData.categories)) {
      rawEvent.categories = [...eventData.categories];
    }

    const normalizedEvent: Event = {
      id: eventData.id.toString(),
      name: eventData.name,
      description: eventData.description,
      startDateTime: eventData.start_date_time || eventData.startDateTime || '',
      endDateTime: eventData.end_date_time || eventData.endDateTime || '',
      venue: {
        id: eventData.venue.id.toString(),
        name: eventData.venue.name,
        address: eventData.venue.address,
        latitude: eventData.venue.latitude || 0,
        longitude: eventData.venue.longitude || 0,
      },
      organizer: {
        id: eventData.organizer.id.toString(),
        name: eventData.organizer.name,
        contactEmail: eventData.organizer.email,
      },
      categories: eventData.categories.map((cat: any) => ({
        id: cat.id.toString(),
        name: cat.name,
        color: cat.color,
      })),
      ticketPrice: eventData.ticket_price !== null && eventData.ticket_price !== undefined 
        ? (typeof eventData.ticket_price === 'string' ? parseFloat(eventData.ticket_price) : Number(eventData.ticket_price))
        : undefined,
      isFree: eventData.is_free === true || eventData.is_free === 1 || eventData.is_free === '1',
      website: eventData.website,
      ticketingLink: eventData.ticketing_link,
      imageUrl: eventData.image_url,
      status: eventData.status,
      createdAt: eventData.created_at,
      updatedAt: eventData.updated_at,
      // Include the raw event data for reference
      rawEvent: rawEvent
    };
    
    // Log the normalization for debugging
    console.log('Normalized event:', {
      id: normalizedEvent.id,
      name: normalizedEvent.name,
      isFree: normalizedEvent.isFree,
      ticketPrice: normalizedEvent.ticketPrice,
      startDateTime: normalizedEvent.startDateTime,
      endDateTime: normalizedEvent.endDateTime,
      rawDates: {
        start_date_time: eventData.start_date_time,
        end_date_time: eventData.end_date_time
      },
      rawPrice: eventData.ticket_price,
      rawIsFree: eventData.is_free
    });
    
    return normalizedEvent;
  }
}

export { EventService };
export default new EventService();
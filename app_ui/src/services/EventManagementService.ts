import { Event } from '../types/event';
import EventService from './EventService';
import { EventCreateData } from './EventService';

export class EventManagementService {
  private static instance: EventManagementService;

  private constructor() {}

  static getInstance(): EventManagementService {
    if (!EventManagementService.instance) {
      EventManagementService.instance = new EventManagementService();
    }
    return EventManagementService.instance;
  }

  async createEvent(eventData: EventCreateData): Promise<{ success: boolean; message: string; data?: Event }> {
    try {
      const result = await EventService.createEvent(eventData);

      return {
        success: true,
        message: result.message,
        data: undefined // EventService.createEvent doesn't return the created event object
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create event'
      };
    }
  }

  async getAllEvents(): Promise<Event[]> {
    try {
      const response = await EventService.getEvents();
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }
  }

  async getEventById(id: string): Promise<Event | null> {
    try {
      const response = await EventService.getEvent(id);
      return response;
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
      return null;
    }
  }

  async updateEvent(id: string, updates: Partial<EventCreateData>): Promise<{ success: boolean; message: string; data?: Event }> {
    try {
      const result = await EventService.updateEvent(id, updates);

      return {
        success: true,
        message: result.message,
        data: result.event
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update event'
      };
    }
  }

  async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await EventService.deleteEvent(id);

      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete event'
      };
    }
  }

  async getEventsByOrganizer(): Promise<Event[]> {
    try {
      const response = await EventService.getMyEvents();
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch organizer events:', error);
      return [];
    }
  }

  async getEventsByStatus(status: Event['status']): Promise<Event[]> {
    try {
      const response = await EventService.getEvents({ status });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch events by status:', error);
      return [];
    }
  }

  async approveEvent(eventId: string): Promise<{ success: boolean; message: string; data?: Event }> {
    try {
      const result = await EventService.approveEvent(eventId);

      return {
        success: true,
        message: result.message,
        data: result.event
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to approve event'
      };
    }
  }

  async rejectEvent(eventId: string, reason?: string): Promise<{ success: boolean; message: string; data?: Event }> {
    try {
      const result = await EventService.rejectEvent(eventId, reason || '');

      return {
        success: true,
        message: result.message,
        data: result.event
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reject event'
      };
    }
  }

  async getPendingEvents(): Promise<Event[]> {
    try {
      const response = await EventService.getEvents({ status: 'pending' });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch pending events:', error);
      return [];
    }
  }

  async getApprovedEvents(): Promise<Event[]> {
    try {
      const response = await EventService.getEvents({ status: 'approved' });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch approved events:', error);
      return [];
    }
  }

  async getEventAnalytics(): Promise<{
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    pendingEvents: number;
    approvedEvents: number;
    rejectedEvents: number;
    freeEvents: number;
    paidEvents: number;
    categoriesStats: Record<string, number>;
    venueStats: Record<string, number>;
  }> {
    try {
      // Get all events for analytics
      const allEvents = await this.getAllEvents();
      const now = new Date();

      const analytics = {
        totalEvents: allEvents.length,
        upcomingEvents: allEvents.filter(event => new Date(event.startDateTime) > now).length,
        pastEvents: allEvents.filter(event => new Date(event.endDateTime) < now).length,
        pendingEvents: allEvents.filter(event => event.status === 'pending').length,
        approvedEvents: allEvents.filter(event => event.status === 'approved').length,
        rejectedEvents: allEvents.filter(event => event.status === 'rejected').length,
        freeEvents: allEvents.filter(event => event.isFree).length,
        paidEvents: allEvents.filter(event => !event.isFree).length,
        categoriesStats: {} as Record<string, number>,
        venueStats: {} as Record<string, number>
      };

      // Generate category stats
      allEvents.forEach(event => {
        event.categories.forEach(category => {
          analytics.categoriesStats[category.name] = (analytics.categoriesStats[category.name] || 0) + 1;
        });
      });

      // Generate venue stats
      allEvents.forEach(event => {
        const venueName = event.venue.name;
        analytics.venueStats[venueName] = (analytics.venueStats[venueName] || 0) + 1;
      });

      return analytics;
    } catch (error) {
      console.error('Failed to fetch event analytics:', error);
      return {
        totalEvents: 0,
        upcomingEvents: 0,
        pastEvents: 0,
        pendingEvents: 0,
        approvedEvents: 0,
        rejectedEvents: 0,
        freeEvents: 0,
        paidEvents: 0,
        categoriesStats: {},
        venueStats: {}
      };
    }
  }
}
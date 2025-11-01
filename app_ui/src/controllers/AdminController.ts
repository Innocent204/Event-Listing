import { EventService } from '../services/EventService';
import { EventManagementService } from '../services/EventManagementService';
import { CategoryService, CategoryCreateData } from '../services/CategoryService';
import { VenueService, VenueCreateData } from '../services/VenueService';
import { Event } from '../types/event';

// Controller layer - handles admin-specific business logic
export class AdminController {
  private eventService: EventService;
  private eventManagementService: EventManagementService;
  private categoryService: CategoryService;
  private venueService: VenueService;

  constructor() {
    this.eventService = new EventService();
    this.eventManagementService = EventManagementService.getInstance();
    this.categoryService = new CategoryService();
    this.venueService = new VenueService();
  }

  // Handle event approval workflow
  async handleEventApproval(eventId: string, approved: boolean, notes?: string) {
    try {
      const response = approved 
        ? await this.eventManagementService.approveEvent(eventId, notes)
        : await this.eventManagementService.rejectEvent(eventId, notes);

      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update event status'
      };
    }
  }

  // Handle batch event operations
  async handleBatchEventApproval(eventIds: string[], approved: boolean) {
    try {
      const results = await Promise.allSettled(
        eventIds.map(id => this.handleEventApproval(id, approved))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      return {
        success: failed === 0,
        data: { successful, failed, total: results.length },
        message: `${successful} events processed successfully${failed > 0 ? `, ${failed} failed` : ''}`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Batch operation failed'
      };
    }
  }

  // Handle pending events retrieval
  async handlePendingEvents() {
    try {
      const pendingEvents = await this.eventManagementService.getPendingEvents();

      return {
        success: true,
        data: pendingEvents,
        message: `Found ${pendingEvents.length} pending events`
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to load pending events'
      };
    }
  }

  // Handle category management
  async handleCategoryCreation(categoryData: CategoryCreateData) {
    try {
      const validation = this.validateCategoryData(categoryData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: validation.message
        };
      }

      const response = await this.categoryService.createCategory(categoryData);
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to create category');
      }

      return {
        success: true,
        data: response.data,
        message: response.message || 'Category created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to create category'
      };
    }
  }

  async handleCategoryUpdate(categoryId: string, categoryData: Partial<CategoryCreateData>) {
    try {
      const response = await this.categoryService.updateCategory(categoryId, categoryData);
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to update category');
      }

      return {
        success: true,
        data: response.data,
        message: response.message || 'Category updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update category'
      };
    }
  }

  async handleCategoryDeletion(categoryId: string) {
    try {
      const response = await this.categoryService.deleteCategory(categoryId);
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to delete category');
      }

      return {
        success: true,
        data: response.data,
        message: response.message || 'Category deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to delete category'
      };
    }
  }

  // Handle venue management
  async handleVenueCreation(venueData: VenueCreateData) {
    try {
      const validation = this.validateVenueData(venueData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: validation.message
        };
      }

      const response = await this.venueService.createVenue(venueData);
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to create venue');
      }

      return {
        success: true,
        data: response.data,
        message: response.message || 'Venue created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to create venue'
      };
    }
  }

  // Generate analytics and reports
  async handleEventAnalytics(startDate?: string, endDate?: string) {
    try {
      const analytics = await this.eventManagementService.getEventAnalytics();

      return {
        success: true,
        data: analytics,
        message: 'Analytics generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to generate analytics'
      };
    }
  }

  // Private validation methods
  private validateCategoryData(categoryData: CategoryCreateData): { isValid: boolean; message: string } {
    if (!categoryData.name || categoryData.name.trim().length < 2) {
      return { isValid: false, message: 'Category name must be at least 2 characters long' };
    }

    if (!categoryData.color || !categoryData.color.match(/^bg-\w+-\d{3}$/)) {
      return { isValid: false, message: 'Valid Tailwind color class is required (e.g., bg-blue-500)' };
    }

    return { isValid: true, message: 'Valid' };
  }

  private validateVenueData(venueData: VenueCreateData): { isValid: boolean; message: string } {
    if (!venueData.name || venueData.name.trim().length < 2) {
      return { isValid: false, message: 'Venue name must be at least 2 characters long' };
    }

    if (!venueData.address || venueData.address.trim().length < 5) {
      return { isValid: false, message: 'Venue address must be at least 5 characters long' };
    }

    if (!venueData.latitude || venueData.latitude < -90 || venueData.latitude > 90) {
      return { isValid: false, message: 'Valid latitude is required (-90 to 90)' };
    }

    if (!venueData.longitude || venueData.longitude < -180 || venueData.longitude > 180) {
      return { isValid: false, message: 'Valid longitude is required (-180 to 180)' };
    }

    if (venueData.capacity && venueData.capacity < 1) {
      return { isValid: false, message: 'Venue capacity must be a positive number' };
    }

    return { isValid: true, message: 'Valid' };
  }

}
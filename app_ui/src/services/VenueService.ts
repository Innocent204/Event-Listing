import api from './ApiClient';
import { AxiosResponse } from 'axios';

export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VenueCreateData {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
}

class VenueService {
  // GET /api/venues - Get all venues
  async getVenues(): Promise<Venue[]> {
    try {
      const response: AxiosResponse<Venue[]> = await api.get('/venues');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      throw error;
    }
  }

  // GET /api/venues/{id} - Get a specific venue
  async getVenue(id: string): Promise<Venue> {
    try {
      const response: AxiosResponse<Venue> = await api.get(`/venues/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch venue ${id}:`, error);
      throw error;
    }
  }

  // POST /api/venues - Create a new venue
  async createVenue(venueData: VenueCreateData): Promise<Venue> {
    try {
      const response: AxiosResponse<Venue> = await api.post('/venues', venueData);
      return response.data;
    } catch (error) {
      console.error('Failed to create venue:', error);
      throw error;
    }
  }

  // PUT /api/venues/{id} - Update a venue
  async updateVenue(id: string, venueData: Partial<VenueCreateData>): Promise<Venue> {
    try {
      const response: AxiosResponse<Venue> = await api.put(`/venues/${id}`, venueData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update venue ${id}:`, error);
      throw error;
    }
  }

  // DELETE /api/venues/{id} - Delete a venue
  async deleteVenue(id: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(`/venues/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete venue ${id}:`, error);
      throw error;
    }
  }
}

export { VenueService };
export default new VenueService();
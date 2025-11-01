// Base service class that handles API communication
// In a real application, this would handle HTTP requests to Laravel backend
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export class BaseService {
  protected baseUrl = '/api/v1'; // Would be your Laravel API URL

  // Mock API delay to simulate real API calls
  protected async mockDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // In a real app, this would make actual HTTP requests
  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    await this.mockDelay();
    // Mock implementation - replace with actual fetch/axios call
    throw new Error('Mock implementation - override in specific service');
  }

  protected async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    await this.mockDelay();
    // Mock implementation - replace with actual fetch/axios call
    throw new Error('Mock implementation - override in specific service');
  }

  protected async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    await this.mockDelay();
    // Mock implementation - replace with actual fetch/axios call
    throw new Error('Mock implementation - override in specific service');
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    await this.mockDelay();
    // Mock implementation - replace with actual fetch/axios call
    throw new Error('Mock implementation - override in specific service');
  }
}
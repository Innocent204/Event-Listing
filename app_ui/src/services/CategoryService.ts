import api from './ApiClient';
import { AxiosResponse } from 'axios';

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateData {
  name: string;
  color: string;
}

class CategoryService {
  // GET /api/categories - Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const response: AxiosResponse<Category[]> = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  // GET /api/categories/{id} - Get a specific category
  async getCategory(id: string): Promise<Category> {
    try {
      const response: AxiosResponse<Category> = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      throw error;
    }
  }

  // POST /api/categories - Create a new category
  async createCategory(categoryData: CategoryCreateData): Promise<Category> {
    try {
      const response: AxiosResponse<Category> = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }

  // PUT /api/categories/{id} - Update a category
  async updateCategory(id: string, categoryData: Partial<CategoryCreateData>): Promise<Category> {
    try {
      const response: AxiosResponse<Category> = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      throw error;
    }
  }

  // DELETE /api/categories/{id} - Delete a category
  async deleteCategory(id: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      throw error;
    }
  }
}

export { CategoryService };
export default new CategoryService();
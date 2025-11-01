import api from './ApiClient';
import { BaseService, ApiResponse } from './BaseService';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'organizer' | 'public';
  verified: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'organizer' | 'public';
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

// Model layer - handles authentication and user management
export class AuthService extends BaseService {

  // POST /api/login
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post('/login', credentials);

      return {
        data: {
          user: this.normalizeUser(response.data.user),
          token: response.data.token,
          expiresAt: response.data.expires_at
        },
        status: 'success',
        message: 'Login successful'
      };
    } catch (error: any) {
      return {
        data: {} as AuthResponse,
        status: 'error',
        message: error.response?.data?.message || 'Invalid email or password'
      };
    }
  }

  // POST /api/register
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post('/register', userData);

      return {
        data: {
          user: this.normalizeUser(response.data.user),
          token: response.data.token,
          expiresAt: response.data.expires_at
        },
        status: 'success',
        message: response.data.message || 'Registration successful'
      };
    } catch (error: any) {
      return {
        data: {} as AuthResponse,
        status: 'error',
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  // POST /api/logout
  async logout(): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.post('/logout');

      return {
        data: true,
        status: 'success',
        message: response.data.message || 'Logged out successfully'
      };
    } catch (error: any) {
      return {
        data: false,
        status: 'error',
        message: 'Logout failed'
      };
    }
  }

  // GET /api/user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get('/user');

      return {
        data: this.normalizeUser(response.data.user),
        status: 'success'
      };
    } catch (error: any) {
      return {
        data: {} as User,
        status: 'error',
        message: 'Not authenticated'
      };
    }
  }

  // POST /api/refresh
  async refreshToken(): Promise<ApiResponse<{ token: string; expiresAt: string }>> {
    try {
      const response = await api.post('/refresh');

      return {
        data: {
          token: response.data.token,
          expiresAt: response.data.expires_at
        },
        status: 'success',
        message: 'Token refreshed successfully'
      };
    } catch (error: any) {
      return {
        data: { token: '', expiresAt: '' },
        status: 'error',
        message: 'Token refresh failed'
      };
    }
  }

  // PUT /api/profile
  async updateProfile(profileData: Partial<Pick<User, 'name' | 'email'>>): Promise<ApiResponse<User>> {
    try {
      const response = await api.put('/profile', profileData);

      return {
        data: this.normalizeUser(response.data.user),
        status: 'success',
        message: response.data.message || 'Profile updated successfully'
      };
    } catch (error: any) {
      return {
        data: {} as User,
        status: 'error',
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  }

  // Helper method to normalize user data from Laravel API
  private normalizeUser(userData: any): User {
    return {
      id: userData.id.toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role || 'public',
      verified: true, // Laravel users are typically verified by default
      createdAt: userData.created_at || new Date().toISOString()
    };
  }
}
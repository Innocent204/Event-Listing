import { AuthService, LoginCredentials, RegisterData, User } from '../services/AuthService';

// Controller layer - handles authentication business logic
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Handle user login
  async handleLogin(credentials: LoginCredentials) {
    try {
      const validation = this.validateLoginCredentials(credentials);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: validation.message
        };
      }

      const response = await this.authService.login(credentials);
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Login failed');
      }

      // Store token in localStorage (in real app, consider more secure storage)
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return {
        success: true,
        data: response.data,
        message: response.message || 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  // Handle user registration
  async handleRegistration(userData: RegisterData) {
    try {
      const validation = this.validateRegistrationData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: validation.message
        };
      }

      const response = await this.authService.register(userData);
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Registration failed');
      }

      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return {
        success: true,
        data: response.data,
        message: response.message || 'Registration successful'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  // Handle user logout
  async handleLogout() {
    try {
      const response = await this.authService.logout();
      
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      return {
        success: true,
        data: response.data,
        message: response.message || 'Logged out successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  }

  // Handle getting current user
  async handleGetCurrentUser() {
    try {
      const response = await this.authService.getCurrentUser();
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to get current user');
      }

      return {
        success: true,
        data: response.data,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to get current user'
      };
    }
  }

  // Handle profile updates
  async handleProfileUpdate(profileData: Partial<Pick<User, 'name' | 'email'>>) {
    try {
      const validation = this.validateProfileData(profileData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: validation.message
        };
      }

      const response = await this.authService.updateProfile(profileData);
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Profile update failed');
      }

      // Update local storage
      localStorage.setItem('user', JSON.stringify(response.data));

      return {
        success: true,
        data: response.data,
        message: response.message || 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Profile update failed'
      };
    }
  }

  // Handle token refresh
  async handleTokenRefresh() {
    try {
      const response = await this.authService.refreshToken();
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Token refresh failed');
      }

      localStorage.setItem('auth_token', response.data.token);

      return {
        success: true,
        data: response.data,
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Token refresh failed'
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  // Get current user from local storage
  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Check if user has specific role
  hasRole(role: 'admin' | 'organizer' | 'public'): boolean {
    const user = this.getCurrentUserFromStorage();
    return user?.role === role || false;
  }

  // Check if user can perform admin actions
  canPerformAdminActions(): boolean {
    return this.hasRole('admin');
  }

  // Check if user can create events
  canCreateEvents(): boolean {
    return this.hasRole('admin') || this.hasRole('organizer');
  }

  // Private validation methods
  private validateLoginCredentials(credentials: LoginCredentials): { isValid: boolean; message: string } {
    if (!credentials.email || !this.isValidEmail(credentials.email)) {
      return { isValid: false, message: 'Valid email address is required' };
    }
    return { isValid: true, message: 'Valid' };
  }

  private validateRegistrationData(userData: RegisterData): { isValid: boolean; message: string } {
    if (!userData.name || userData.name.trim().length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long' };
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      return { isValid: false, message: 'Valid email address is required' };
    }

    if (!userData.password || userData.password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (userData.password.length > 128) {
      return { isValid: false, message: 'Password must be less than 128 characters' };
    }

    if (!userData.password_confirmation) {
      return { isValid: false, message: 'Password confirmation is required' };
    }

    if (userData.password !== userData.password_confirmation) {
      return { isValid: false, message: 'Password confirmation does not match' };
    }

    // Check password complexity
    if (!this.isStrongPassword(userData.password)) {
      return { 
        isValid: false, 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      };
    }

    return { isValid: true, message: 'Valid' };
  }

  private validateProfileData(profileData: Partial<Pick<User, 'name' | 'email'>>): { isValid: boolean; message: string } {
    if (profileData.name && profileData.name.trim().length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long' };
    }

    if (profileData.email && !this.isValidEmail(profileData.email)) {
      return { isValid: false, message: 'Valid email address is required' };
    }

    return { isValid: true, message: 'Valid' };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers;
  }
}
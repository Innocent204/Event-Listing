import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../services/AuthService';
import { AuthController } from '../controllers/AuthController';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAndRestoreAuth: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, passwordConfirmation: string, role?: 'organizer' | 'public') => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  hasRole: (role: 'admin' | 'organizer' | 'public') => boolean;
  canCreateEvents: () => boolean;
  canPerformAdminActions: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const authController = new AuthController();

  useEffect(() => {
    // Only check for existing authentication when explicitly needed
    // Don't auto-restore on public pages
    setIsLoading(false);
  }, []);

  const checkAndRestoreAuth = async () => {
    try {
      setIsLoading(true);
      if (authController.isAuthenticated()) {
        const result = await authController.handleGetCurrentUser();
        if (result.success && result.data) {
          setUser(result.data);
          return true;
        } else {
          // Clear invalid token
          await authController.handleLogout();
        }
      }
      return false;
    } catch (error) {
      console.error('Auth restoration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await authController.handleLogin({ email, password });
      if (result.success && result.data) {
        setUser(result.data.user);
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }
      return { success: result.success, message: result.message };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string, role: 'organizer' | 'public' = 'public') => {
    try {
      const result = await authController.handleRegistration({ name, email, password, password_confirmation: passwordConfirmation, role });
      if (result.success && result.data) {
        setUser(result.data.user);
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }
      return { success: result.success, message: result.message };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await authController.handleLogout();
      setUser(null);
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Force page reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if logout fails
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  const hasRole = (role: 'admin' | 'organizer' | 'public') => {
    return user?.role === role;
  };

  const canCreateEvents = () => {
    return user?.role === 'admin' || user?.role === 'organizer';
  };

  const canPerformAdminActions = () => {
    return user?.role === 'admin';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    checkAndRestoreAuth,
    login,
    register,
    logout,
    hasRole,
    canCreateEvents,
    canPerformAdminActions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
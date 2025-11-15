import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { EventListPage } from './views/pages/EventListPage';
import { EventDetailPage } from './views/pages/EventDetailPage';
import { SignInPage } from './views/pages/SignInPage';
import { SignUpPage } from './views/pages/SignUpPage';
import { UserDashboard } from './views/pages/UserDashboard';
import { OrganizerDashboard } from './views/pages/OrganizerDashboard';
import { AdminDashboard } from './views/pages/AdminDashboard';
import { UserSettings } from './views/pages/UserSettings';
import { CreateEventPage } from './views/pages/CreateEventPage';
import { Toaster } from './components/ui/sonner';
import { Event } from './types/event';



// Define prop types for components
interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface RoleBasedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

// Protected Route component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, checkAndRestoreAuth } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!authChecked) {
        await checkAndRestoreAuth();
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [authChecked, checkAndRestoreAuth]);

  if (isLoading || !authChecked) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Role-based protected route
const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Main App Router Component
const AppRouter: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const handleEventSelect = (event: Event) => {
    navigate(`/event/${event.id}`);
  };

  const handleSignOut = () => {
    // AuthContext logout will handle localStorage clearing and navigation
    navigate('/');
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <EventListPage 
          onEventSelect={handleEventSelect}
          onSignInClick={() => navigate('/signin')}
          onSignUpClick={() => navigate('/signup')}
        />
      } />
      
      <Route path="/signin" element={
        isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <SignInPage 
            onSignUpClick={() => navigate('/signup')}
            onSignInSuccess={() => navigate('/dashboard')}
          />
      } />
      
      <Route path="/signup" element={
        isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <SignUpPage 
            onSignInClick={() => navigate('/signin')}
            onSignUpSuccess={() => navigate('/dashboard')}
          />
      } />

      <Route path="/event/:id" element={<EventDetailPage />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : user?.role === 'organizer' ? (
            <Navigate to="/organizer" replace />
          ) : (
            <UserDashboard
              onEventSelect={handleEventSelect}
              onSignOut={handleSignOut}
            />
          )}
        </ProtectedRoute>
      } />

      <Route path="/organizer" element={
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={['organizer', 'admin']}>
            <OrganizerDashboard
              onEventSelect={handleEventSelect}
              onCreateEventClick={() => navigate('/create-event')}
              onSignOut={handleSignOut}
            />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminDashboard
              onEventSelect={handleEventSelect}
              onSignOut={handleSignOut}
            />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />

      <Route path="/create-event" element={
        <ProtectedRoute>
          <CreateEventPage
            onBack={() => navigate(-1)}
            onEventCreated={(event) => {
              // Handle successful event creation
              console.log('Event created:', event);
              // Navigate to the new event
              navigate(`/event/${event.id}`);
            }}
          />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <UserSettings
            onBack={() => navigate(-1)}
          />
        </ProtectedRoute>
      } />

      {/* 404 - Not Found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
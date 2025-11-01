import { useState, useEffect } from 'react';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminController } from '../../controllers/AdminController';
import { Event } from '../../types/event';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';
import { AdminSettings } from './AdminSettings';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Settings, 
  LogOut, 
  CheckCircle, 
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Eye,
  Shield,
  Database,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { EventApprovalDialog } from '../../components/EventApprovalDialog';

interface AdminDashboardProps {
  onEventSelect: (event: Event) => void;
  onSignOut: () => void;
}

export function AdminDashboard({ onEventSelect, onSignOut }: AdminDashboardProps) {
  const { user, logout } = useAuth();
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalLoading, setApprovalLoading] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEventForApproval, setSelectedEventForApproval] = useState<Event | null>(null);

  const adminController = new AdminController();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load pending events
      const pendingResult = await adminController.handlePendingEvents();
      if (pendingResult.success) {
        setPendingEvents(pendingResult.data || []);
      }

      // Load analytics
      const analyticsResult = await adminController.handleEventAnalytics();
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }

      // Load mock users data
      setUsers([
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'public', status: 'active', joinDate: '2024-01-15', events: 12 },
        { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'organizer', status: 'active', joinDate: '2024-02-20', events: 8 },
        { id: '3', name: 'Mike Chen', email: 'mike@example.com', role: 'public', status: 'suspended', joinDate: '2024-03-10', events: 3 },
        { id: '4', name: 'Emily Davis', email: 'emily@example.com', role: 'organizer', status: 'active', joinDate: '2024-01-25', events: 15 }
      ]);

      // Load mock venues data
      setVenues([
        { id: '1', name: 'City Convention Center', address: '123 Main St', capacity: 500, events: 25, status: 'active' },
        { id: '2', name: 'Downtown Theater', address: '456 Arts Ave', capacity: 200, events: 18, status: 'active' },
        { id: '3', name: 'Community Park', address: '789 Park Rd', capacity: 1000, events: 12, status: 'active' },
        { id: '4', name: 'Tech Hub Co-working', address: '321 Innovation Dr', capacity: 100, events: 8, status: 'inactive' }
      ]);

      // Load mock categories data
      setCategories([
        { id: '1', name: 'Music & Arts', events: 45, color: '#e11d48', active: true },
        { id: '2', name: 'Technology', events: 32, color: '#3b82f6', active: true },
        { id: '3', name: 'Sports & Fitness', events: 28, color: '#22c55e', active: true },
        { id: '4', name: 'Food & Drink', events: 19, color: '#f59e0b', active: true },
        { id: '5', name: 'Business & Networking', events: 15, color: '#8b5cf6', active: false }
      ]);
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventApproval = async (eventId: string, approved: boolean, notes?: string) => {
    try {
      setApprovalLoading(eventId);
      
      const result = await adminController.handleEventApproval(eventId, approved, notes);
      if (result.success) {
        // Remove from pending events
        setPendingEvents(prev => prev.filter(event => event.id !== eventId));
        
        // Show success toast
        toast.success(result.message || `Event ${approved ? 'approved' : 'rejected'} successfully`);
        
        // Close the approval dialog
        setSelectedEventForApproval(null);
      } else {
        // Show error toast
        toast.error(result.message || `Failed to ${approved ? 'approve' : 'reject'} event`);
      }
    } catch (error) {
      console.error('Error handling event approval:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setApprovalLoading(null);
    }
  };

  const handleApprovalDialogApprove = (eventId: string, notes?: string) => {
    handleEventApproval(eventId, true, notes);
  };

  const handleApprovalDialogReject = (eventId: string, notes?: string) => {
    handleEventApproval(eventId, false, notes);
  };

  const handleUserAction = (userId: string, action: 'activate' | 'suspend' | 'delete' | 'promote') => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'activate':
            return { ...user, status: 'active' };
          case 'suspend':
            return { ...user, status: 'suspended' };
          case 'promote':
            return { ...user, role: user.role === 'public' ? 'organizer' : 'public' };
          case 'delete':
            return null;
          default:
            return user;
        }
      }
      return user;
    }).filter(Boolean));
  };

  const handleVenueAction = (venueId: string, action: 'activate' | 'deactivate' | 'delete') => {
    setVenues(prev => prev.map(venue => {
      if (venue.id === venueId) {
        switch (action) {
          case 'activate':
            return { ...venue, status: 'active' };
          case 'deactivate':
            return { ...venue, status: 'inactive' };
          case 'delete':
            return null;
          default:
            return venue;
        }
      }
      return venue;
    }).filter(Boolean));
  };

  const handleCategoryAction = (categoryId: string, action: 'activate' | 'deactivate' | 'delete') => {
    setCategories(prev => prev.map(category => {
      if (category.id === categoryId) {
        switch (action) {
          case 'activate':
            return { ...category, active: true };
          case 'deactivate':
            return { ...category, active: false };
          case 'delete':
            return null;
          default:
            return category;
        }
      }
      return category;
    }).filter(Boolean));
  };

  const handleLogout = async () => {
    await logout();
    onSignOut();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const dashboardStats = [
    {
      title: 'Total Events',
      value: analytics?.totalEvents?.toString() || '0',
      icon: Calendar,
      description: 'All time',
      trend: '+12%'
    },
    {
      title: 'Pending Approval',
      value: pendingEvents.length.toString(),
      icon: Clock,
      description: 'Requires action',
      trend: pendingEvents.length > 0 ? 'Urgent' : 'Clear'
    },
    {
      title: 'Active Venues',
      value: Object.keys(analytics?.venueStats || {}).length.toString(),
      icon: MapPin,
      description: 'In system',
      trend: '+3%'
    },
    {
      title: 'Event Categories',
      value: Object.keys(analytics?.categoriesStats || {}).length.toString(),
      icon: BarChart3,
      description: 'Active categories',
      trend: 'Stable'
    }
  ];

  // Show settings page if requested
  if (showSettings) {
    return <AdminSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <Badge variant="default" className="bg-purple-600">
                Admin Panel
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-purple-600 text-white">
                    {user ? getInitials(user.name) : 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">System Administrator</p>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-8" />
              
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage events, users, and system settings for PulseCity
            </p>
          </div>

          {/* Urgent Actions Alert */}
          {pendingEvents.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                You have {pendingEvents.length} event{pendingEvents.length !== 1 ? 's' : ''} waiting for approval.
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            stat.trend.includes('+') ? 'text-green-600 border-green-200' :
                            stat.trend === 'Urgent' ? 'text-red-600 border-red-200' :
                            'text-muted-foreground'
                          }`}
                        >
                          {stat.trend}
                        </Badge>
                      </div>
                    </div>
                    <stat.icon className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending" className="relative">
                Pending Events
                {pendingEvents.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {pendingEvents.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="venues">Venues</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Events Pending Approval
                  </CardTitle>
                  <CardDescription>
                    Review and approve or reject submitted events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : pendingEvents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Organizer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Venue</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{event.name}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-xs">
                                  {event.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(event.organizer.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{event.organizer.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(event.startDateTime)}
                            </TableCell>
                            <TableCell>
                              {event.venue.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onEventSelect(event)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEventApproval(event.id, true)}
                                  disabled={approvalLoading === event.id}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEventApproval(event.id, false)}
                                  disabled={approvalLoading === event.id}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">All events approved!</p>
                      <p className="text-sm text-muted-foreground">
                        No events currently pending approval
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Event Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.categoriesStats ? (
                      <div className="space-y-3">
                        {Object.entries(analytics.categoriesStats).map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm">{category}</span>
                            <Badge variant="secondary">{count as number}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Popular Venues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.venueStats ? (
                      <div className="space-y-3">
                        {Object.entries(analytics.venueStats)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 5)
                          .map(([venue, count]) => (
                            <div key={venue} className="flex items-center justify-between">
                              <span className="text-sm truncate">{venue}</span>
                              <Badge variant="secondary">{count as number}</Badge>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Event Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {analytics?.upcomingEvents || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Upcoming</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics?.pastEvents || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {analytics?.freeEvents || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Free Events</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {analytics?.paidEvents || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Paid Events</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Management
                    </div>
                    <Badge variant="outline">
                      {users.length} total users
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'organizer' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.events}</TableCell>
                          <TableCell>{formatDate(user.joinDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {user.status === 'active' ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleUserAction(user.id, 'suspend')}
                                  className="text-red-600"
                                >
                                  <UserX className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleUserAction(user.id, 'activate')}
                                  className="text-green-600"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUserAction(user.id, 'promote')}
                              >
                                <Shield className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUserAction(user.id, 'delete')}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="venues" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Venue Management
                    </div>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Venue
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Manage event venues and locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Venue</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {venues.map((venue) => (
                        <TableRow key={venue.id}>
                          <TableCell>
                            <p className="font-medium">{venue.name}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground">{venue.address}</p>
                          </TableCell>
                          <TableCell>{venue.capacity.toLocaleString()}</TableCell>
                          <TableCell>{venue.events}</TableCell>
                          <TableCell>
                            <Badge variant={venue.status === 'active' ? 'default' : 'secondary'}>
                              {venue.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                              {venue.status === 'active' ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleVenueAction(venue.id, 'deactivate')}
                                  className="text-yellow-600"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleVenueAction(venue.id, 'activate')}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleVenueAction(venue.id, 'delete')}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Category Management
                    </div>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Manage event categories and tags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded" 
                              style={{ backgroundColor: category.color }}
                            />
                            <div>
                              <h4 className="font-medium">{category.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {category.events} events
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={category.active ? 'default' : 'secondary'}>
                              {category.active ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                              {category.active ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCategoryAction(category.id, 'deactivate')}
                                  className="text-yellow-600"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCategoryAction(category.id, 'activate')}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCategoryAction(category.id, 'delete')}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
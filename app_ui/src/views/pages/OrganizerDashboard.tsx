import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EventController } from '../../controllers/EventController';
import { Event } from '../../types/event';
import React from 'react';
import { Logo } from '../../components/Logo';
import { EventCard } from '../../components/EventCard';
import { ThemeToggle } from '../../components/ThemeToggle';
import { OrganizerSettings } from './OrganizerSettings';
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
  Plus, 
  Settings, 
  LogOut, 
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  DollarSign,
  MapPin
} from 'lucide-react';

interface OrganizerDashboardProps {
  onEventSelect: (event: Event) => void;
  onCreateEventClick: () => void;
  onSignOut: () => void;
}

export function OrganizerDashboard({ onEventSelect, onCreateEventClick, onSignOut }: OrganizerDashboardProps) {
  const { user, logout } = useAuth();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [draftEvents, setDraftEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const eventController = new EventController();

  useEffect(() => {
    loadOrganizerData();
  }, []);

  const loadOrganizerData = async () => {
    try {
      setLoading(true);
      
      // Load organizer's events
      const result = await eventController.handleEventListing({});
      if (result.success && result.data) {
        // In real app, filter by organizer's ID
        const organizerEvents = result.data.data.slice(0, 4); // Mock: show first 4 as organizer's events
        setMyEvents(organizerEvents);
        
        // Mock draft events (events pending approval)
        const drafts = result.data.data.slice(4, 6).map(event => ({
          ...event,
          status: 'pending' as const
        }));
        setDraftEvents(drafts);
      }
    } catch (error) {
      console.error('Error loading organizer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onSignOut();
  };

  const handleEditEvent = (eventId: string) => {
    // In real app, this would navigate to edit form
    console.log('Edit event:', eventId);
    // For now, just show an alert
    alert('Edit event functionality would be implemented here');
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setMyEvents(prev => prev.filter(event => event.id !== eventId));
      alert('Event deleted successfully');
    }
  };

  const handleManageAttendees = (eventId: string) => {
    alert('Attendee management for event ' + eventId);
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

  const organizerStats = [
    {
      title: 'Total Events',
      value: (myEvents?.length || 0).toString(),
      icon: Calendar,
      description: 'All time',
      trend: '+2 this month',
      color: 'text-blue-600'
    },
    {
      title: 'Pending Approval',
      value: (draftEvents?.length || 0).toString(),
      icon: Clock,
      description: 'Awaiting review',
      trend: (draftEvents?.length || 0) > 0 ? 'Action needed' : 'All approved',
      color: 'text-yellow-600'
    },
    {
      title: 'Event Attendees',
      value: '247',
      icon: Users,
      description: 'Total registrations',
      trend: '+18 this week',
      color: 'text-green-600'
    },
    {
      title: 'Revenue',
      value: '$1,240',
      icon: DollarSign,
      description: 'From paid events',
      trend: '+15% vs last month',
      color: 'text-purple-600'
    }
  ];

  const upcomingEvents = (myEvents || []).filter(event => 
    new Date(event.startDateTime) > new Date()
  );

  const pastEvents = (myEvents || []).filter(event => 
    new Date(event.startDateTime) <= new Date()
  );

  // Show settings page if requested
  if (showSettings) {
    return <OrganizerSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Event Organizer
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-green-600 text-white">
                    {user ? getInitials(user.name) : 'O'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">Event Organizer</p>
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
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Manage your events and connect with your community
            </p>
          </div>

          {/* Pending Approval Alert */}
          {(draftEvents?.length || 0) > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                You have {draftEvents.length} event{draftEvents.length !== 1 ? 's' : ''} pending admin approval.
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {organizerStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {stat.trend}
                        </Badge>
                      </div>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="my-events">My Events</TabsTrigger>
              <TabsTrigger value="drafts" className="relative">
                Drafts
                {(draftEvents?.length || 0) > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {draftEvents.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your events and grow your audience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button 
                      onClick={onCreateEventClick}
                      className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-6 h-6" />
                      Create Event
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                    >
                      <BarChart3 className="w-6 h-6" />
                      Analytics
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                    >
                      <Users className="w-6 h-6" />
                      Attendees
                    </Button>

                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                    >
                      <TrendingUp className="w-6 h-6" />
                      Promote
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>
                    Your next scheduled events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingEvents.slice(0, 4).map((event) => (
                        <EventCard
                          event={event}
                          onViewDetails={onEventSelect}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No upcoming events</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create event to get started
                      </p>

                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Events */}
            <TabsContent value="my-events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    All My Events
                  </CardTitle>
                  <CardDescription>
                    Manage all your events in one place
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {myEvents && myEvents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Venue</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Attendees</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{event.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {event.categories[0]?.name || 'No category'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(event.startDateTime)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{event.venue.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={new Date(event.startDateTime) > new Date() ? 'default' : 'secondary'}
                                className={new Date(event.startDateTime) > new Date() ? 'bg-green-100 text-green-800' : ''}
                              >
                                {new Date(event.startDateTime) > new Date() ? 'Upcoming' : 'Completed'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{Math.floor(Math.random() * 100) + 10}</span>
                              </div>
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
                                  variant="ghost"
                                  onClick={() => handleEditEvent(event.id)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No events created yet</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start organizing events in your community
                      </p>
                      <Button onClick={onCreateEventClick}>
                        Create Your First Event
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Draft Events */}
            <TabsContent value="drafts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Draft Events
                  </CardTitle>
                  <CardDescription>
                    Events pending admin approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(draftEvents?.length || 0) > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {draftEvents.map((event) => (
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
                              <span className="text-sm text-muted-foreground">
                                {Math.floor(Math.random() * 5) + 1} days ago
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                Pending Review
                              </Badge>
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
                                  variant="ghost"
                                  onClick={() => handleEditEvent(event.id)}
                                >
                                  <Edit className="w-4 h-4" />
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
                      <p className="text-muted-foreground">No pending events</p>
                      <p className="text-sm text-muted-foreground">
                        All your events have been approved and published
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
                
                {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Event Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Attendance</span>
                        <Badge variant="outline">87%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completion Rate</span>
                        <Badge variant="outline">94%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Repeat Attendees</span>
                        <Badge variant="outline">42%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Event Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Music & Arts</span>
                        <Badge variant="secondary">45%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Technology</span>
                        <Badge variant="secondary">30%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Community</span>
                        <Badge variant="secondary">25%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">$1,240</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">$310</p>
                      <p className="text-sm text-muted-foreground">This Month</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">$180</p>
                      <p className="text-sm text-muted-foreground">Per Event Avg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">67%</p>
                      <p className="text-sm text-muted-foreground">Paid Events</p>
                    </div>
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
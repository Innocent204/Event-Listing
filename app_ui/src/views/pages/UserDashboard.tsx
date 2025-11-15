import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EventController } from '../../controllers/EventController';
import { Event, AttendedEvent } from '../../types/event';
import { Logo } from '../../components/Logo';
import { EventCard } from '../../components/EventCard';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Calendar, 
  MapPin, 
  Search, 
  Settings, 
  LogOut, 
  Heart, 
  Clock,
  Users,
  Star,
  MessageSquare,
  UserPlus,
  CheckCircle
} from 'lucide-react';

export function UserDashboard({ onEventSelect, onSignOut }: { onEventSelect?: (event: Event) => void; onSignOut?: () => void; } = {}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [browseEvents, setBrowseEvents] = useState<Event[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
   const [attendedEvents, setAttendedEvents] = useState<AttendedEvent[]>([]);
  const [followingOrganizers, setFollowingOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const eventController = new EventController();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all events
      const eventsResult = await eventController.handleEventListing({});
      if (eventsResult.success && eventsResult.data) {
        const allEvents = eventsResult.data.data;
        
        // Mock data distribution
        setFavoriteEvents(allEvents.slice(0, 3));
        setBrowseEvents(allEvents.slice(0, 8));
        setNearbyEvents(allEvents.slice(2, 6));
        setAttendedEvents(allEvents.slice(4, 7).map((event: Event) => ({
          ...event,
          attendedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          rating: Math.floor(Math.random() * 5) + 1,
          reviewed: Math.random() > 0.5
        })) as AttendedEvent[]);
        
        // Mock following organizers
        setFollowingOrganizers([
          { id: '1', name: 'City Arts Council', followers: 1240, events: 8, verified: true },
          { id: '2', name: 'Tech Meetup Group', followers: 892, events: 12, verified: true },
          { id: '3', name: 'Music Festival Collective', followers: 2341, events: 5, verified: false },
          { id: '4', name: 'Community Sports League', followers: 567, events: 15, verified: true }
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await logout();
      navigate('/');
    }
  };

  const handleEventSelect = (event: Event) => {
    if (onEventSelect) {
      onEventSelect(event);
    } else {
      navigate('/event');
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleToggleFavorite = (eventId: string) => {
    setFavoriteEvents(prev => {
      const isFavorited = prev.some(e => e.id === eventId);
      if (isFavorited) {
        return prev.filter(e => e.id !== eventId);
      } else {
        const eventToAdd = browseEvents.find(e => e.id === eventId);
        return eventToAdd ? [...prev, eventToAdd] : prev;
      }
    });
  };

  const handleFollowOrganizer = (organizerId: string) => {
    setFollowingOrganizers(prev => 
      prev.map(org => 
        org.id === organizerId 
          ? { ...org, isFollowing: !org.isFollowing }
          : org
      )
    );
  };

  const filteredBrowseEvents = browseEvents.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
                           event.categories.some(cat => cat.name.toLowerCase() === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const dashboardStats = [
    {
      title: 'Events Attended',
      value: attendedEvents.length.toString(),
      icon: Calendar,
      description: 'All time',
      color: 'text-blue-600'
    },
    {
      title: 'Favorite Events',
      value: favoriteEvents.length.toString(),
      icon: Heart,
      description: 'Saved for later',
      color: 'text-red-500'
    },
    {
      title: 'Following',
      value: followingOrganizers.filter(org => org.isFollowing).length.toString(),
      icon: Users,
      description: 'Event organizers',
      color: 'text-green-600'
    },
    {
      title: 'Reviews Written',
      value: attendedEvents.filter(event => event.reviewed).length.toString(),
      icon: MessageSquare,
      description: 'Event feedback',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Community Member
              </Badge>
              </div>
              
              <Separator orientation="vertical" className="h-8" />
              
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={handleSettingsClick}>
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
              Here's what's happening in your PulseCity community
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                    <stat.icon className="w-8 h-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="browse">Browse Events</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="attended">Attended</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    What would you like to do today?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => {/* Navigate to browse tab */}}
                    >
                      <Search className="w-6 h-6" />
                      Discover Events
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <MapPin className="w-6 h-6" />
                      Nearby Events
                    </Button>

                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Heart className="w-6 h-6" />
                      My Favorites
                    </Button>

                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Users className="w-6 h-6" />
                      Find Organizers
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>
                    Events you might be interested in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : favoriteEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favoriteEvents.map((event) => (
                        <EventCard
                          event={event}
                          onViewDetails={handleEventSelect}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No upcoming events yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Favorite Events
                  </CardTitle>
                  <CardDescription>
                    Events you've saved for later
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {favoriteEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favoriteEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onViewDetails={handleEventSelect}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No favorite events yet</p>
                      <p className="text-sm text-muted-foreground">
                        Heart events you're interested in to save them here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attended" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Attended Events
                  </CardTitle>
                  <CardDescription>
                    Events you've attended and your feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {attendedEvents.length > 0 ? (
                    <div className="space-y-4">
                      {attendedEvents.map((event) => (
                        <div key={event.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{event.name}</h4>
                              <p className="text-sm text-muted-foreground">{event.venue.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Attended: {new Date(event.attendedDate).toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-1 mt-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4"
                                  />
                                ))}
                                <span className="text-sm text-muted-foreground ml-2">
                                  {event.rating}/5
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {event.reviewed ? (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Reviewed
                                </Badge>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Write Review
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => handleEventSelect(event)}>
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No attended events yet</p>
                      <p className="text-sm text-muted-foreground">
                        Start attending events to see your history here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="following" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Following Organizers
                  </CardTitle>
                  <CardDescription>
                    Event organizers you follow and their latest events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {followingOrganizers.length > 0 ? (
                    <div className="space-y-4">
                      {followingOrganizers.map((organizer) => (
                        <div key={organizer.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{organizer.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{organizer.name}</h4>
                                  {organizer.verified && (
                                    <Badge variant="secondary" className="text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {organizer.followers.toLocaleString()} followers • {organizer.events} events
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant={organizer.isFollowing ? "secondary" : "outline"}
                                onClick={() => handleFollowOrganizer(organizer.id)}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                {organizer.isFollowing ? 'Following' : 'Follow'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Not following any organizers yet</p>
                      <p className="text-sm text-muted-foreground">
                        Follow organizers to stay updated on their events
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="browse" className="space-y-6">
              {/* Search and Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Discover Events
                  </CardTitle>
                  <CardDescription>
                    Find events that match your interests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {filteredBrowseEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredBrowseEvents.map((event) => (
                        <div key={event.id} className="relative">
                          <EventCard
                            event={event}
                            onViewDetails={handleEventSelect}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                            onClick={() => handleToggleFavorite(event.id)}
                          >
                            <Heart 
                              className="w-4 h-4" 
                            />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No events found</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Nearby Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Nearby Events
                  </CardTitle>
                  <CardDescription>
                    Events happening close to you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {nearbyEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nearbyEvents.map((event) => (
                        <div key={event.id} className="relative">
                          <EventCard
                            event={event}
                            onViewDetails={handleEventSelect}
                          />
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {(Math.random() * 5 + 0.5).toFixed(1)} km away
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No nearby events found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attended" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your recent interactions with events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Heart className="w-4 h-4 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm">Favorited "Summer Music Festival"</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm">Attended "Tech Meetup Downtown"</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Users className="w-4 h-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm">Started following "City Arts Council"</p>
                        <p className="text-xs text-muted-foreground">3 days ago</p>
                      </div>
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

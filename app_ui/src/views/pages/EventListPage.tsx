import { useState, useEffect } from 'react';
import { Event, ViewMode, Category } from '../../types/event';
import { EventController } from '../../controllers/EventController';
import CategoryService from '../../services/CategoryService';
import { EventFilters } from '../components/EventFilters';
import { EventCalendar } from '../components/EventCalendar';
import { EventMap } from '../components/EventMap';
import { ViewModeToggle } from '../components/ViewModeToggle';
import { Button } from '../../components/ui/button';
import { Calendar, AlertCircle, LogOut, MapPin, Users, TrendingUp, Star, ArrowRight, Plus, Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { Logo } from '../../components/Logo';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../context/AuthContext';
import { EventCard } from '../../components/EventCard';

interface EventListPageProps {
  onEventSelect: (event: Event) => void;
  onSignInClick?: () => void;
}
export function EventListPage({ onEventSelect, onSignInClick }: EventListPageProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const eventController = new EventController();
  const categoryService = CategoryService;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [searchQuery, selectedCategories, selectedDate, priceFilter]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load categories only once
      if (!categoriesLoaded) {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
        setCategoriesLoaded(true);
      }

      // Load featured events (upcoming events)
      const featuredResult = await eventController.handleEventListing({
        sort_by: 'start_date_time',
        sort_direction: 'asc',
        per_page: 3
      });

      if (featuredResult.success && featuredResult.data) {
        setFeaturedEvents(featuredResult.data.data);
      }

      // Load initial events
      await loadEvents();
    } catch (err) {
      setError('Failed to load initial data');
      console.error('Error loading initial data:', err);
    }
  };

  const loadEvents = async () => {
    try {
      const filters = {
        search: searchQuery || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        date: selectedDate?.toISOString().split('T')[0],
        priceFilter,
      };

      const result = await eventController.handleEventListing(filters);
      
      if (result.success && result.data) {
        setEvents(result.data.data);
        setError(null);
      } else {
        // Show backend connection error more prominently
        setError(`Backend Connection Error: ${result.message}. Please ensure Laravel backend is running on http://localhost:8000`);
        setEvents([]);
      }
    } catch (err) {
      setError('Failed to connect to backend. Please ensure Laravel server is running on port 8000.');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedDate(null);
    setPriceFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user?.name}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => logout()}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={onSignInClick}
                  className="flex items-center gap-2"
                >
                  Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Discover Amazing Events
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Find and explore exciting events happening in your city. From music concerts to tech meetups, discover experiences that matter to you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-3">
                <Calendar className="w-5 h-5 mr-2" />
                Browse Events
              </Button>
              {isAuthenticated ? (
                <Button variant="outline" size="lg" className="text-lg px-8 py-3" onClick={() => window.location.href = '/create-event'}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Event
                </Button>
              ) : (
                <Button variant="outline" size="lg" className="text-lg px-8 py-3" onClick={onSignInClick}>
                  <Users className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <Star className="w-8 h-8 text-primary" />
                Featured Events
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Don't miss out on these upcoming highlighted events in your area.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => onEventSelect(event)}>
                  {event.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 text-lg">{event.name}</CardTitle>
                      <div className="flex flex-wrap gap-1">
                        {event.categories.slice(0, 2).map((category) => (
                          <Badge
                            key={category.id}
                            variant="outline"
                            className="text-xs"
                            style={{ backgroundColor: category.color, color: 'white', borderColor: category.color }}
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground line-clamp-2">{event.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(event.startDateTime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="line-clamp-1">{event.venue.name}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {event.isFree ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">Free</Badge>
                            ) : (
                              `$${event.ticketPrice}`
                            )}
                          </span>
                        </div>

                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          View Details
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg" onClick={() => document.getElementById('all-events')?.scrollIntoView({ behavior: 'smooth' })}>
                View All Events
                <TrendingUp className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6" id="all-events">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <EventFilters
            categories={categories}
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
            selectedDate={selectedDate}
            priceFilter={priceFilter}
            onSearchChange={setSearchQuery}
            onCategoryToggle={handleCategoryToggle}
            onDateChange={setSelectedDate}
            onPriceFilterChange={setPriceFilter}
            onClearFilters={handleClearFilters}
          />

          {/* View Mode Toggle and Results Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ViewModeToggle 
                currentMode={viewMode} 
                onModeChange={setViewMode} 
              />
              <p className="text-sm text-muted-foreground">
                {events.length} event{events.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {/* Event Content */}
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <br />
                <span className="text-sm">
                  Make sure the Laravel backend is running on http://localhost:8000
                </span>
              </AlertDescription>
            </Alert>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg mb-2">No events found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your filters or search terms to find more events.
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard
                      event={event}
                      onViewDetails={onEventSelect}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'calendar' && (
                <EventCalendar
                  events={events}
                  onEventClick={onEventSelect}
                />
              )}

              {viewMode === 'map' && (
                <EventMap
                  events={events}
                  onEventClick={onEventSelect}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
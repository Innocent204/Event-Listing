import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EventController } from '../../controllers/EventController';
import { CategoryService } from '../../services/CategoryService';
import { EventFilters } from '../components/EventFilters';
import { EventCard } from '../components/EventCard';
import { EventCalendar } from '../components/EventCalendar';
import { Event, ViewMode, Category } from '../../types/event';
import { EventMap } from '../components/EventMap';
import { ViewModeToggle } from '../components/ViewModeToggle';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Input } from '../../components/ui/input';
import { Calendar, Plus, AlertCircle, MapPin } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { Alert, AlertDescription } from '../../components/ui/alert';

export function HomePage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [locationFilter, setLocationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const eventController = new EventController();
  const categoryService = new CategoryService();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [eventsResponse, categoriesData] = await Promise.all([
        eventController.handleEventListing({ status: 'approved' }, 1, 100),
        categoryService.getCategories()
      ]);

      if (!eventsResponse.success) {
        throw new Error(eventsResponse.message);
      }

      // Only show approved events on public page
      const approvedEvents = eventsResponse.data?.data?.filter(event => event.status === 'approved') || [];
      setEvents(approvedEvents);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event: Event) => {
    navigate(`/event/${event.id}`);
  };

  const handleCreateEventClick = () => {
    navigate('/signin');
  };

  const handleSignInClick = () => {
    navigate('/signin');
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    setSelectedDate(undefined);
    setLocationFilter('');
    setPriceFilter('all');
  };

  // Filter events based on current filters
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategories.length === 0 || 
      event.categories.some(category => selectedCategories.includes(category.id));
    const matchesSearch = !searchQuery || 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || 
      new Date(event.startDateTime).toDateString() === selectedDate.toDateString();
    const matchesLocation = !locationFilter ||
      event.venue.name.toLowerCase().includes(locationFilter.toLowerCase()) ||
      event.venue.address.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'free' && event.isFree) ||
      (priceFilter === 'paid' && !event.isFree && event.ticketPrice && event.ticketPrice > 0);
    
    return matchesCategory && matchesSearch && matchesDate && matchesLocation && matchesPrice;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <Skeleton className="h-16 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Logo size="lg" />
              <div>
                <h1>Discover Events in Your City</h1>
                <p className="text-muted-foreground">
                  Find the best events happening around you
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSignInClick} variant="outline">
                Sign In
              </Button>
              <Button onClick={handleCreateEventClick}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filters and View Toggle */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <EventFilters
                categories={categories}
                searchQuery={searchQuery}
                selectedCategories={selectedCategories}
                selectedDate={selectedDate || null}
                priceFilter={priceFilter}
                onSearchChange={setSearchQuery}
                onCategoryToggle={handleCategoryToggle}
                onDateChange={(date) => setSelectedDate(date || undefined)}
                onPriceFilterChange={setPriceFilter}
                onClearFilters={handleClearFilters}
              />
              {/* Location Filter */}
              <div className="relative max-w-md">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
          </div>

          {/* Events Display */}
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3>No events found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or check back later for new events.
                </p>
                <Button onClick={handleCreateEventClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create the first event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard 
                      event={event} 
                      onViewDetails={handleEventSelect}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'calendar' && (
                <EventCalendar 
                  events={filteredEvents}
                  onEventClick={handleEventSelect}
                />
              )}

              {viewMode === 'map' && (
                <EventMap 
                  events={filteredEvents}
                  onEventClick={handleEventSelect}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
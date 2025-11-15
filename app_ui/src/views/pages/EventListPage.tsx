import { useState, useEffect } from 'react';
import { Event, ViewMode, Category } from '../../types/event';
import { EventController } from '../../controllers/EventController';
import CategoryService from '../../services/CategoryService';
import { EventFilters } from '../components/EventFilters';
import { EventCalendar } from '../components/EventCalendar';
import { EventMap } from '../components/EventMap';
import { ViewModeToggle } from '../components/ViewModeToggle';
import { Button } from '../../components/ui/button';
import { Calendar, AlertCircle, LogOut, MapPin, Users, TrendingUp, Star, ArrowRight, Plus } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { Logo } from '../../components/Logo';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../context/AuthContext';
import { EventCard } from '../../components/EventCard';

interface EventListPageProps {
  onEventSelect: (event: Event) => void;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}
export function EventListPage({ onEventSelect, onSignInClick, onSignUpClick }: EventListPageProps) {
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
      {/* Modern Header with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-8">
                <Logo size="lg" className="text-primary" />
                <nav className="hidden md:flex items-center gap-8">
                  <a 
                    href="#featured" 
                    className="relative px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
                  >
                    Featured
                  </a>
                  <a 
                    href="#all-events" 
                    className="relative px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
                  >
                    All Events
                  </a>
                  <a 
                    href="#categories" 
                    className="relative px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
                  >
                    Categories
                  </a>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => window.location.href = '/create-event'}
                      className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Event
                    </Button>
                    <div className="flex items-center gap-3 bg-card border rounded-full px-4 py-2 shadow-sm hover:shadow transition-shadow">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {user?.name}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => logout()}
                      className="rounded-full h-8 w-8 p-0"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost"
                      onClick={onSignInClick}
                      className="hover:text-primary transition-colors"
                    >
                      Sign In
                    </Button>
                    <Button 
                      onClick={onSignUpClick}
                      className="bg-primary hover:bg-primary/90 transition-colors"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Dynamic Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Dynamic Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(var(--primary-rgb),0.1)_0%,transparent_70%)] animate-pulse-slow" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(var(--secondary-rgb),0.1)_0%,transparent_70%)] animate-pulse-slow [animation-delay:1s]" />
        </div>
        {/* Floating Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl animate-float opacity-70" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary/5 rounded-full mix-blend-multiply filter blur-xl animate-float-delayed opacity-70" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-accent/5 rounded-full mix-blend-multiply filter blur-xl animate-float opacity-70" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -left-8 -top-8 w-16 h-16 bg-primary/10 rounded-full blur-lg animate-pulse-slow" />
                <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-secondary/10 rounded-full blur-lg animate-pulse-slow [animation-delay:0.5s]" />
                
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight relative">
                  <span className="inline-block animate-title-slide-up opacity-0 [--slide-delay:200ms] relative">
                    Discover
                    <span className="absolute -top-1 left-0 w-full h-full bg-primary/10 transform -skew-x-12 -z-10 animate-slide-right opacity-0 [--slide-delay:1200ms]"></span>
                  </span>{" "}
                  <span className="inline-block animate-title-slide-up opacity-0 [--slide-delay:400ms] relative">
                    Amazing
                    <span className="absolute -top-1 left-0 w-full h-full bg-secondary/10 transform -skew-x-12 -z-10 animate-slide-right opacity-0 [--slide-delay:1400ms]"></span>
                  </span>{" "}
                  <span className="relative inline-block">
                    <span className="inline-block bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent animate-title-slide-up opacity-0 [--slide-delay:600ms]">
                      Events
                    </span>
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 animate-scale-in [--scale-delay:1000ms] origin-left"></span>
                  </span>
                </h1>

                <div className="relative">
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in opacity-0 [--fade-delay:800ms]">
                    Find and explore exciting events happening in your city. From music concerts to tech meetups, 
                    discover experiences that matter to you.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in opacity-0 [--fade-delay:1000ms]">
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="relative text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:border-primary"
                  onClick={() => window.location.href = '/create-event'}
                >
                  <span className="absolute inset-0 bg-primary/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="relative z-10">Create Event</span>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="relative text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:border-primary"
                  onClick={onSignUpClick}
                >
                  <span className="absolute inset-0 bg-primary/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                  <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">Join Community</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-muted-foreground rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* Featured Events Section with Modern Cards */}
      {featuredEvents.length > 0 && (
        <section id="featured" className="py-24 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
            {/* Decorative circles */}
            <div className="absolute top-20 left-[10%] w-32 h-32 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl animate-float" />
            <div className="absolute top-40 right-[10%] w-40 h-40 bg-secondary/5 rounded-full mix-blend-multiply filter blur-xl animate-float-delayed" />
            {/* Animated patterns */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary rounded-full animate-ping [animation-delay:0s]" />
              <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-secondary rounded-full animate-ping [animation-delay:0.5s]" />
              <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-primary rounded-full animate-ping [animation-delay:1s]" />
              <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-secondary rounded-full animate-ping [animation-delay:1.5s]" />
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary mb-4">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Featured Events</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Upcoming Highlights
              </h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Discover and create amazing events in your city. Join our community of event enthusiasts.
                  </p>
                </div>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Don't miss out on these carefully curated events happening soon in your area.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredEvents.map((event) => (
                <div 
                  key={event.id}
                  className="group relative bg-card rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer backdrop-blur-sm hover:bg-card/90"
                  onClick={() => onEventSelect(event)}
                  style={{
                    transform: "perspective(1000px) rotateX(0deg)",
                    transition: "transform 0.5s ease-out"
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const rotateX = (y - rect.height / 2) / 20;
                    const rotateY = (x - rect.width / 2) / 20;
                    e.currentTarget.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
                  }}
                >
                  {/* Event Image with Overlay */}
                  {event.imageUrl && (
                    <div className="relative aspect-4/3 overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10" />
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:filter group-hover:brightness-110"
                        loading="lazy"
                      />
                      {/* Shine effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out pointer-events-none" />
                      {/* Category Tags */}
                      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                        {event.categories.slice(0, 2).map((category) => (
                          <Badge
                            key={category.id}
                            className="px-2.5 py-1 text-xs font-medium backdrop-blur-md bg-white/10"
                            style={{ borderColor: category.color }}
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                      {/* Price Tag */}
                      <div className="absolute top-4 right-4 z-20">
                        <Badge 
                          variant={event.isFree ? "secondary" : "default"}
                          className="px-2.5 py-1 backdrop-blur-md bg-white/10"
                        >
                          {event.isFree ? "Free" : `$${event.ticketPrice}`}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Event Info */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {event.name}
                    </h3>

                    <p className="text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{new Date(event.startDateTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="line-clamp-1">{event.venue.name}</span>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => document.getElementById('all-events')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Explore All Events
                <TrendingUp className="w-5 h-5 ml-2" />
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

      {/* Modern Footer */}
      <footer className="bg-card border-t relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button size="icon" variant="ghost" className="hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </Button>
                <Button size="icon" variant="ghost" className="hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </Button>
                <Button size="icon" variant="ghost" className="hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#featured" className="text-muted-foreground hover:text-primary transition-colors">Featured Events</a>
                </li>
                <li>
                  <a href="#all-events" className="text-muted-foreground hover:text-primary transition-colors">Browse Events</a>
                </li>
                <li>
                  <a href="/create-event" className="text-muted-foreground hover:text-primary transition-colors">Create Event</a>
                </li>
                <li>
                  <a href="/categories" className="text-muted-foreground hover:text-primary transition-colors">Categories</a>
                </li>
              </ul>
            </div>

            {/* Help & Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQs</a>
                </li>
                <li>
                  <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a>
                </li>
                <li>
                  <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stay Updated</h3>
              <p className="text-muted-foreground">Subscribe to our newsletter for the latest events and updates.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button className="bg-primary hover:bg-primary/90">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} PulseCity. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
                <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

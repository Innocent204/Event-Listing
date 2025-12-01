import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Event } from '../../types/event';
import { EventController } from '../../controllers/EventController';
import { useAuth } from '../../context/AuthContext';
import { EventDetail } from '../../components/EventDetail';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventController = new EventController();

  useEffect(() => {
    if (id) {
      loadEvent(id);
    }
  }, [id]);

  const loadEvent = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await eventController.handleEventDetail(eventId);

      if (!response.success || !response.data) {
        setError(response.message || 'Event not found');
        return;
      }

      const foundEvent = response.data;

      // Check if user can view this event
      const isAdminOrOrganizer = user?.role === 'admin' || user?.role === 'organizer';
      const isEventOrganizer = user?.id === foundEvent.organizer.id;

      // Allow admins and organizers to view pending events, or if user is the event organizer
      if (foundEvent.status !== 'approved' && !isAdminOrOrganizer && !isEventOrganizer) {
        setError('Event not available');
        return;
      }

      setEvent(foundEvent);
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Failed to load event details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Event not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <EventDetail event={event} onBack={handleBack} />
      </div>
    </div>
  );
}
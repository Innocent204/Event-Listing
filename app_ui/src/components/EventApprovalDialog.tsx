import React, { useState } from 'react';
import { Event } from '../types/event';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { CheckCircle, XCircle, Calendar, MapPin, User, DollarSign, Tag, Globe, Ticket, Clock } from 'lucide-react';

interface EventApprovalDialogProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
  onApprove: (eventId: string, notes?: string) => void;
  onReject: (eventId: string, notes?: string) => void;
  loading: boolean;
}

export function EventApprovalDialog({ 
  event, 
  open, 
  onClose, 
  onApprove, 
  onReject, 
  loading 
}: EventApprovalDialogProps) {
  const [adminNotes, setAdminNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hours`;
    return `${hours}h ${minutes}m`;
  };

  const handleAction = (actionType: 'approve' | 'reject') => {
    if (actionType === 'approve') {
      onApprove(event.id, adminNotes.trim() || undefined);
    } else {
      onReject(event.id, adminNotes.trim() || undefined);
    }
  };

  const resetDialog = () => {
    setAdminNotes('');
    setAction(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Event Approval Review
          </DialogTitle>
          <DialogDescription>
            Review the event details below and choose to approve or reject this submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
              <img 
                src={event.imageUrl} 
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Event Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl mb-2">{event.name}</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.startDateTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(event.startDateTime, event.endDateTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">
                      {event.venue.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.venue.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Organizer</p>
                    <p className="text-sm text-muted-foreground">
                      {event.organizer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.organizer.contactEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Pricing</p>
                    <p className="text-sm text-muted-foreground">
                      {event.isFree ? 'Free Event' : `$${event.ticketPrice}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Categories</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.categories.map((category) => (
                        <Badge key={category.id} variant="secondary" className="text-xs">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            {(event.website || event.ticketingLink) && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Links</p>
                <div className="flex flex-wrap gap-2">
                  {event.website && (
                    <a 
                      href={event.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      <Globe className="w-3 h-3" />
                      Website
                    </a>
                  )}
                  {event.ticketingLink && (
                    <a 
                      href={event.ticketingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      <Ticket className="w-3 h-3" />
                      Tickets
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
            <Textarea
              id="admin-notes"
              placeholder="Add any notes about this approval/rejection decision..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={resetDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction('reject')}
            disabled={loading}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Event
          </Button>
          <Button
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
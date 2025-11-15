import { Event } from '../../../types/event';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Clock, Eye, CheckCircle, XCircle } from 'lucide-react';

interface PendingEventsTabProps {
  loading: boolean;
  pendingEvents: Event[];
  approvalLoading: string | null;
  onEventSelect: (event: Event) => void;
  onEventApproval: (eventId: string, approved: boolean) => Promise<void>;
}

export function PendingEventsTab({
  loading,
  pendingEvents,
  approvalLoading,
  onEventSelect,
  onEventApproval,
}: PendingEventsTabProps) {
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

  return (
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
                        onClick={() => onEventApproval(event.id, true)}
                        disabled={approvalLoading === event.id}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEventApproval(event.id, false)}
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
  );
}
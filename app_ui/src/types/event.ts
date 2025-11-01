export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Organizer {
  id: string;
  name: string;
  contactEmail: string;
  website?: string;
}

// Raw event data as it comes from the API
export interface RawEvent {
  id: string | number;
  name: string;
  description: string;
  start_date_time: string;
  end_date_time: string;
  venue: Venue;
  organizer: Organizer;
  categories: Category[];
  ticket_price?: number;
  is_free?: boolean;
  website?: string;
  ticketing_link?: string;
  image_url?: string;
  status: 'draft' | 'pending' | 'approved' | 'cancelled' | 'rejected';
  admin_notes?: string;
  approved_at?: string;
  rejected_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  venue: Venue;
  organizer: Organizer;
  categories: Category[];
  ticketPrice?: number;
  isFree: boolean;
  website?: string;
  ticketingLink?: string;
  imageUrl?: string;
  status: 'draft' | 'pending' | 'approved' | 'cancelled' | 'rejected';
  adminNotes?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Add raw event data for debugging and fallback
  rawEvent?: RawEvent;
}

export interface AttendedEvent extends Event {
  attendedDate: string;
  rating: number;
  reviewed: boolean;
}

export type ViewMode = 'list' | 'calendar' | 'map';
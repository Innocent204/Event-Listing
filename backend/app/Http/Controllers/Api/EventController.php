<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    /**
     * Display a listing of events.
     */
    public function index(Request $request)
    {
        $query = Event::with(['venue', 'organizer', 'categories'])->approved();

        // Apply filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('categories') && is_array($request->categories)) {
            $query->whereHas('categories', function($q) use ($request) {
                $q->whereIn('categories.id', $request->categories);
            });
        }

        if ($request->has('venue')) {
            $query->where('venue_id', $request->venue);
        }

        if ($request->has('organizer')) {
            $query->where('organizer_id', $request->organizer);
        }

        if ($request->has('date')) {
            $query->whereDate('start_date_time', $request->date);
        }

        if ($request->has('price_filter')) {
            if ($request->price_filter === 'free') {
                $query->where('is_free', true);
            } elseif ($request->price_filter === 'paid') {
                $query->where('is_free', false);
            }
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'start_date_time');
        $sortDirection = $request->get('sort_direction', 'asc');

        if ($sortBy === 'name') {
            $query->orderBy('name', $sortDirection);
        } elseif ($sortBy === 'created_at') {
            $query->orderBy('created_at', $sortDirection);
        } else {
            $query->orderBy('start_date_time', $sortDirection);
        }

        // Pagination
        $perPage = min($request->get('per_page', 12), 100);
        $events = $query->paginate($perPage);

        return response()->json($events);
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date_time' => 'required|date',
            'end_date_time' => 'required|date|after:start_date_time',
            'venue_id' => 'required|exists:venues,id',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'ticket_price' => 'nullable|numeric|min:0',
            'is_free' => 'boolean',
            'website' => 'nullable|url',
            'ticketing_link' => 'nullable|url',
            'image_url' => 'nullable|url',
        ]);

        // Determine if event is free based on ticket_price or is_free flag
        $isFree = $request->has('is_free') ? $request->is_free : (!$request->ticket_price || $request->ticket_price == 0);

        $event = DB::transaction(function() use ($request, $isFree) {
            $event = Event::create([
                'name' => $request->name,
                'description' => $request->description,
                'start_date_time' => $request->start_date_time,
                'end_date_time' => $request->end_date_time,
                'venue_id' => $request->venue_id,
                'organizer_id' => $request->user()->id,
                'ticket_price' => $request->ticket_price,
                'is_free' => $isFree,
                'website' => $request->website,
                'ticketing_link' => $request->ticketing_link,
                'image_url' => $request->image_url,
                'status' => 'pending', // Events require approval
            ]);

            // Attach categories
            $event->categories()->attach($request->category_ids);

            return $event;
        });

        // Load relationships after transaction
        $event->load(['venue', 'organizer', 'categories']);

        return response()->json([
            'message' => 'Event created successfully and submitted for approval',
            'event' => $event,
        ], 201);
    }

    /**
     * Display the specified event.
     */
    public function show(Event $event)
    {
        $event->load(['venue', 'organizer', 'categories']);
        return response()->json($event);
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, Event $event)
    {
        // Check if user can update this event
        if ($event->organizer_id !== $request->user()->id && !$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized to update this event',
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'start_date_time' => 'sometimes|required|date',
            'end_date_time' => 'sometimes|required|date|after:start_date_time',
            'venue_id' => 'sometimes|required|exists:venues,id',
            'category_ids' => 'sometimes|array',
            'category_ids.*' => 'exists:categories,id',
            'ticket_price' => 'nullable|numeric|min:0',
            'is_free' => 'boolean',
            'website' => 'nullable|url',
            'ticketing_link' => 'nullable|url',
            'image_url' => 'nullable|url',
            'status' => Rule::in(['draft', 'pending', 'approved', 'cancelled', 'rejected']),
        ]);

        // Determine if event is free based on ticket_price or is_free flag
        $isFree = $request->has('is_free') ? $request->is_free : (!$request->ticket_price || $request->ticket_price == 0);

        DB::transaction(function() use ($request, $event, $isFree) {
            $event->update([
                'name' => $request->name ?? $event->name,
                'description' => $request->description ?? $event->description,
                'start_date_time' => $request->start_date_time ?? $event->start_date_time,
                'end_date_time' => $request->end_date_time ?? $event->end_date_time,
                'venue_id' => $request->venue_id ?? $event->venue_id,
                'ticket_price' => $request->ticket_price,
                'is_free' => $isFree,
                'website' => $request->website,
                'ticketing_link' => $request->ticketing_link,
                'image_url' => $request->image_url,
                'status' => $request->status ?? $event->status,
            ]);

            // Update categories if provided
            if ($request->has('category_ids')) {
                $event->categories()->sync($request->category_ids);
            }
        });

        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $event->load(['venue', 'organizer', 'categories']),
        ]);
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Event $event)
    {
        // Check if user can delete this event
        if ($event->organizer_id !== $request->user()->id && !$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized to delete this event',
            ], 403);
        }

        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully',
        ]);
    }

    /**
     * Get events for calendar view.
     */
    public function calendar(Request $request)
    {
        $request->validate([
            'year' => 'required|integer|min:2020|max:2030',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $startDate = now()->setYear($request->year)->setMonth($request->month)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $events = Event::with(['venue', 'categories'])
            ->approved()
            ->whereBetween('start_date_time', [$startDate, $endDate])
            ->orderBy('start_date_time')
            ->get();

        return response()->json($events);
    }

    /**
     * Get events created by the authenticated user.
     */
    public function myEvents(Request $request)
    {
        $query = Event::with(['venue', 'categories'])
            ->byOrganizer($request->user()->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $events = $query->orderBy('created_at', 'desc')->paginate(12);

        return response()->json($events);
    }

    /**
     * Approve an event (admin only).
     */
    public function approve(Event $event)
    {
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $event->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Event approved successfully',
            'event' => $event->load(['venue', 'organizer', 'categories']),
        ]);
    }

    /**
     * Reject an event (admin only).
     */
    public function reject(Request $request, Event $event)
    {
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'reason' => 'required|string',
        ]);

        $event->update([
            'status' => 'rejected',
            'admin_notes' => $request->reason,
            'rejected_at' => now(),
        ]);

        return response()->json([
            'message' => 'Event rejected',
            'event' => $event->load(['venue', 'organizer', 'categories']),
        ]);
    }
}

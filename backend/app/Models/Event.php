<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'start_date_time',
        'end_date_time',
        'venue_id',
        'organizer_id',
        'ticket_price',
        'is_free',
        'website',
        'ticketing_link',
        'image_url',
        'status',
        'admin_notes',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'start_date_time' => 'datetime',
        'end_date_time' => 'datetime',
        'ticket_price' => 'decimal:2',
        'is_free' => 'boolean',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * Get the venue that owns the event.
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    /**
     * Get the organizer (user) that owns the event.
     */
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    /**
     * The categories that belong to the event.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    /**
     * Scope a query to only include approved events.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include events by a specific organizer.
     */
    public function scopeByOrganizer($query, $organizerId)
    {
        return $query->where('organizer_id', $organizerId);
    }

    /**
     * Scope a query to only include events in a specific venue.
     */
    public function scopeInVenue($query, $venueId)
    {
        return $query->where('venue_id', $venueId);
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Check if the event is free.
     */
    public function isFree(): bool
    {
        return $this->is_free;
    }

    /**
     * Get the formatted ticket price.
     */
    public function getFormattedPriceAttribute(): string
    {
        if ($this->is_free) {
            return 'Free';
        }

        return '$' . number_format($this->ticket_price, 2);
    }

    /**
     * Check if the event is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the event is pending approval.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the event is in draft state.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }
}

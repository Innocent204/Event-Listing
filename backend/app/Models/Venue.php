<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venue extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'latitude',
        'longitude',
        'capacity',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'capacity' => 'integer',
    ];

    /**
     * Get the events for the venue.
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * Get the formatted capacity.
     */
    public function getFormattedCapacityAttribute(): string
    {
        if (!$this->capacity) {
            return 'No capacity limit';
        }

        return number_format($this->capacity) . ' people';
    }

    /**
     * Get the Google Maps URL for the venue.
     */
    public function getMapsUrlAttribute(): string
    {
        return "https://www.google.com/maps/search/?api=1&query={$this->latitude},{$this->longitude}";
    }

    /**
     * Scope a query to only include venues with events.
     */
    public function scopeWithEvents($query)
    {
        return $query->has('events');
    }

    /**
     * Scope a query to filter venues by capacity.
     */
    public function scopeWithMinCapacity($query, $minCapacity)
    {
        return $query->where('capacity', '>=', $minCapacity);
    }
}

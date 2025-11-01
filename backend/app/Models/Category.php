<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'color',
    ];

    /**
     * The events that belong to the category.
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class);
    }

    /**
     * Get the color as a hex color code.
     */
    public function getColorAttribute($value): string
    {
        // Ensure color starts with #
        if ($value && !str_starts_with($value, '#')) {
            return '#' . $value;
        }
        return $value;
    }

    /**
     * Set the color attribute and ensure it has # prefix.
     */
    public function setColorAttribute($value): void
    {
        if ($value && !str_starts_with($value, '#')) {
            $this->attributes['color'] = '#' . $value;
        } else {
            $this->attributes['color'] = $value;
        }
    }

    /**
     * Scope a query to only include categories with events.
     */
    public function scopeWithEvents($query)
    {
        return $query->has('events');
    }

    /**
     * Get popular categories (with most events).
     */
    public function scopePopular($query, $limit = 10)
    {
        return $query->withCount('events')
                    ->orderBy('events_count', 'desc')
                    ->limit($limit);
    }
}

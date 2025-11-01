import { useState } from 'react';
import { Category } from '../types/event';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Search, Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';

interface EventFiltersProps {
  categories: Category[];
  searchQuery: string;
  selectedCategories: string[];
  selectedDate: Date | null;
  priceFilter: 'all' | 'free' | 'paid';
  onSearchChange: (query: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onDateChange: (date: Date | null) => void;
  onPriceFilterChange: (filter: 'all' | 'free' | 'paid') => void;
  onClearFilters: () => void;
}

export function EventFilters({
  categories,
  searchQuery,
  selectedCategories,
  selectedDate,
  priceFilter,
  onSearchChange,
  onCategoryToggle,
  onDateChange,
  onPriceFilterChange,
  onClearFilters,
}: EventFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || selectedDate || priceFilter !== 'all';

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Date Filter */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant={selectedDate ? "default" : "outline"} size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              {selectedDate ? formatDate(selectedDate) : 'Select Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => {
                onDateChange(date || null);
                setIsCalendarOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Price Filter */}
        <Select value={priceFilter} onValueChange={(value: 'all' | 'free' | 'paid') => onPriceFilterChange(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Categories</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <Badge
                key={category.id}
                variant="outline"
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'hover:opacity-80' : 'hover:bg-muted'
                }`}
                style={isSelected ? { backgroundColor: category.color, color: 'white', borderColor: category.color } : {}}
                onClick={() => onCategoryToggle(category.id)}
              >
                {category.name}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Upload, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Event, Venue, Category, Organizer } from '../../types/event';
import { EventController } from '../../controllers/EventController';
import VenueService from '../../services/VenueService';
import CategoryService from '../../services/CategoryService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';

interface CreateEventPageProps {
  onBack: () => void;
  onEventCreated: (event: Event) => void;
}

interface NewVenue {
  name: string;
  address: string;
  capacity: number;
}

export function CreateEventPage({ onBack, onEventCreated }: CreateEventPageProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data state
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organizers] = useState<Organizer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [, setLoading] = useState(true);
  
  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    venueId: '',
    organizerId: user?.role === 'organizer' ? user.id : '',
    selectedCategories: [] as string[],
    isFree: true,
    ticketPrice: '',
    website: '',
    ticketingLink: '',
    imageUrl: '',
  });

  // New venue form
  const [showNewVenueForm, setShowNewVenueForm] = useState(false);
  const [newVenue, setNewVenue] = useState<NewVenue>({
    name: '',
    address: '',
    capacity: 0,
  });

  // Services
  const eventController = new EventController();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load venues, categories, and organizers in parallel
        const [venuesData, categoriesData] = await Promise.all([
          VenueService.getVenues(),
          CategoryService.getCategories(),
        ]);

        setVenues(venuesData);
        setCategories(categoriesData);

        // If user is admin, load organizers
        if (user?.role === 'admin') {
          // Add your organizer service call here
          // const organizersData = await OrganizerService.getOrganizers();
          // setOrganizers(organizersData);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user?.role]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle category selection
  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const newCategories = prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId];
      return { ...prev, selectedCategories: newCategories };
    });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setImagePreview(imageUrl);
      setFormData(prev => ({ ...prev, imageUrl }));
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const event = {
        target: {
          files: [file]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  // Upload image to server
  const uploadImageToServer = async (base64Data: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ image: base64Data })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Form validation
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.name.trim()) newErrors.name = 'Event name is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.startTime) newErrors.startTime = 'Start time is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (!formData.endTime) newErrors.endTime = 'End time is required';
    }

    if (stepNumber === 2) {
      if (!formData.venueId) newErrors.venueId = 'Venue is required';
      if (formData.selectedCategories.length === 0) newErrors.categories = 'At least one category is required';
      if (user?.role === 'admin' && !formData.organizerId) newErrors.organizerId = 'Organizer is required';
    }

    if (stepNumber === 3 && !formData.isFree) {
      if (!formData.ticketPrice || isNaN(parseFloat(formData.ticketPrice))) {
        newErrors.ticketPrice = 'Valid ticket price is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    if (step < 3) {
      handleNext();
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image if it's a new one
      let imageUrl = formData.imageUrl;
      if (imagePreview && imagePreview.startsWith('data:image/')) {
        setIsUploading(true);
        setImageUploadProgress(50);
        imageUrl = await uploadImageToServer(imagePreview);
        setImageUploadProgress(100);
      }

      // Prepare event data
      const eventData = {
        name: formData.name,
        description: formData.description,
        start_date_time: `${formData.startDate}T${formData.startTime}`,
        end_date_time: `${formData.endDate}T${formData.endTime}`,
        venue_id: formData.venueId,
        category_ids: formData.selectedCategories,
        is_free: formData.isFree,
        ...(formData.isFree ? {} : { ticket_price: parseFloat(formData.ticketPrice) }),
        ...(formData.website && { website: formData.website }),
        ...(formData.ticketingLink && { ticketing_link: formData.ticketingLink }),
        ...(imageUrl && { image_url: imageUrl }),
      };

      // Submit event with proper type conversions
      const result = await eventController.handleEventCreation({
        ...eventData,
        venue_id: parseInt(formData.venueId, 10), // Convert venueId to number
        category_ids: formData.selectedCategories.map(id => parseInt(id, 10)) // Convert category IDs to numbers
      });

      if (result.success && result.data) {
        toast.success('Event created successfully!');
        // The event is nested inside result.data.event
        const createdEvent = result.data.event;
        onEventCreated(createdEvent);
      } else {
        throw new Error(result.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Render step 1: Basic info
  const renderStep1 = () => (
    <>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Event Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Image Upload */}
        <div>
          <Label>Event Image</Label>
          {imagePreview ? (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md mt-2"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center mt-2 cursor-pointer hover:border-primary transition-colors ${
                isUploading ? 'opacity-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Drag and drop an image here, or click to select
                </p>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
          )}
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${imageUploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className={errors.startTime ? 'border-red-500' : ''}
            />
            {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={errors.endDate ? 'border-red-500' : ''}
              min={formData.startDate}
            />
            {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
          </div>
          <div>
            <Label htmlFor="endTime">End Time *</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className={errors.endTime ? 'border-red-500' : ''}
            />
            {errors.endTime && <p className="text-sm text-red-500 mt-1">{errors.endTime}</p>}
          </div>
        </div>
      </div>
    </>
  );

  // Render step 2: Venue and categories
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Venue *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNewVenueForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add New Venue
          </Button>
        </div>
        
        <Select
          value={formData.venueId}
          onValueChange={(value) => handleInputChange('venueId', value)}
        >
          <SelectTrigger className={errors.venueId ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a venue" />
          </SelectTrigger>
          <SelectContent>
            {venues.map((venue) => (
              <SelectItem key={venue.id} value={venue.id}>
                {venue.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.venueId && <p className="text-sm text-red-500 mt-1">{errors.venueId}</p>}
      </div>

      {user?.role === 'admin' && (
        <div>
          <Label>Organizer *</Label>
          <Select
            value={formData.organizerId}
            onValueChange={(value) => handleInputChange('organizerId', value)}
          >
            <SelectTrigger className={errors.organizerId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select an organizer" />
            </SelectTrigger>
            <SelectContent>
              {organizers.map((organizer) => (
                <SelectItem key={organizer.id} value={organizer.id}>
                  {organizer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.organizerId && <p className="text-sm text-red-500 mt-1">{errors.organizerId}</p>}
        </div>
      )}

      <div>
        <Label>Categories *</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={formData.selectedCategories.includes(category.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleCategoryToggle(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
        {errors.categories && <p className="text-sm text-red-500 mt-1">{errors.categories}</p>}
      </div>
    </div>
  );

  // Render step 3: Additional details
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="isFree"
          checked={formData.isFree}
          onCheckedChange={(checked) => handleInputChange('isFree', checked)}
        />
        <Label htmlFor="isFree">This is a free event</Label>
      </div>

      {!formData.isFree && (
        <div>
          <Label htmlFor="ticketPrice">Ticket Price ($) *</Label>
          <Input
            id="ticketPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.ticketPrice}
            onChange={(e) => handleInputChange('ticketPrice', e.target.value)}
            className={errors.ticketPrice ? 'border-red-500' : ''}
          />
          {errors.ticketPrice && <p className="text-sm text-red-500 mt-1">{errors.ticketPrice}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="website">Website (optional)</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <Label htmlFor="ticketingLink">Ticketing Link (optional)</Label>
        <Input
          id="ticketingLink"
          type="url"
          value={formData.ticketingLink}
          onChange={(e) => handleInputChange('ticketingLink', e.target.value)}
          placeholder="https://tickets.example.com"
        />
      </div>
    </div>
  );

  // New venue dialog
  const renderNewVenueDialog = () => (
    <Dialog open={showNewVenueForm} onOpenChange={setShowNewVenueForm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Venue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="venueName">Venue Name *</Label>
            <Input
              id="venueName"
              value={newVenue.name}
              onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="venueAddress">Address *</Label>
            <Input
              id="venueAddress"
              value={newVenue.address}
              onChange={(e) => setNewVenue(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="venueCapacity">Capacity (optional)</Label>
            <Input
              id="venueCapacity"
              type="number"
              min="0"
              value={newVenue.capacity || ''}
              onChange={(e) => setNewVenue(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowNewVenueForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  const createdVenue = await VenueService.createVenue({
                    name: newVenue.name,
                    address: newVenue.address,
                    capacity: newVenue.capacity || undefined,
                  });
                  setVenues(prev => [...prev, createdVenue]);
                  setFormData(prev => ({ ...prev, venueId: createdVenue.id }));
                  setShowNewVenueForm(false);
                  setNewVenue({ name: '', address: '', capacity: 0 });
                  toast.success('Venue added successfully');
                } catch (error) {
                  console.error('Error creating venue:', error);
                  toast.error('Failed to create venue');
                }
              }}
              disabled={!newVenue.name.trim() || !newVenue.address.trim()}
            >
              Add Venue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={step === 1 ? onBack : () => setStep(step - 1)}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground">Step {step} of 3</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Progress indicator */}
        <div className="md:col-span-1">
          <div className="space-y-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center space-x-2 p-3 rounded-md cursor-pointer ${
                  step === stepNumber ? 'bg-accent' : 'hover:bg-muted'
                }`}
                onClick={() => stepNumber < step && setStep(stepNumber)}
              >
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full ${
                    step === stepNumber
                      ? 'bg-primary text-primary-foreground'
                      : step > stepNumber
                      ? 'bg-green-500 text-white'
                      : 'bg-muted-foreground/20'
                  }`}
                >
                  {stepNumber}
                </div>
                <span className={step >= stepNumber ? 'font-medium' : 'text-muted-foreground'}>
                  {stepNumber === 1 && 'Basic Info'}
                  {stepNumber === 2 && 'Venue & Categories'}
                  {stepNumber === 3 && 'Additional Details'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && 'Basic Information'}
                {step === 2 && 'Venue & Categories'}
                {step === 3 && 'Additional Details'}
              </CardTitle>
              <CardDescription>
                {step === 1 && 'Enter the basic information about your event.'}
                {step === 2 && 'Select a venue and categories for your event.'}
                {step === 3 && 'Add any additional details for your event.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={step === 1 ? onBack : handlePrevious}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                {step < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Event'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Venue Dialog */}
      {renderNewVenueDialog()}
    </div>
  );
}
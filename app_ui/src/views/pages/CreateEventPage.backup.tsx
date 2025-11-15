import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, DollarSign, Globe, Image as ImageIcon, Plus, Upload, X } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { unsplash_tool } from '../../utils/unsplash';


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
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Services
  const eventController = new EventController();
  const venueService = VenueService;
  const categoryService = CategoryService;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Load venues, categories, and organizers
        const [venuesData, categoriesData] = await Promise.all([
          venueService.getVenues(),
          categoryService.getCategories(),
        ]);

        setVenues(venuesData);
        setCategories(categoriesData);

        // For organizers, if user is admin, load all organizers, otherwise use current user
        if (user?.role === 'admin') {
          // In a real app, you'd have an organizers service or API endpoint
          // For now, we'll use a placeholder
          setOrganizers([]);
        } else if (user) {
          // For organizers, they can only select themselves
          setOrganizers([{
            id: user.id,
            name: user.name,
            contactEmail: user.email,
          }]);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadInitialData();
    }
  }, [user]);
  
  // Form state
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
    imageSearchQuery: '',
    imageUrl: '',
  });

  // Image handling state
  const [isDragging, setIsDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  // New venue form
  const [showNewVenueForm, setShowNewVenueForm] = useState(false);
  const [newVenue, setNewVenue] = useState<NewVenue>({
    name: '',
    address: '',
    capacity: 0,
  });

  const [isSearchingImage, setIsSearchingImage] = useState(false);

  // Handle image search
  const handleImageSearch = async () => {
    if (!formData.imageSearchQuery.trim()) return;
    
    try {
      setIsSearchingImage(true);
      // In a real app, you would call your image search API here
      // For now, we'll simulate a search with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This is a placeholder - in a real app, you would get the image URL from your API
      const mockImageUrl = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(formData.imageSearchQuery)}`;
      
      setFormData(prev => ({
        ...prev,
        imageUrl: mockImageUrl
      }));
      
      toast.success('Image found!');
    } catch (error) {
      console.error('Error searching for image:', error);
      toast.error('Failed to search for image');
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  };

  // Process the selected image file
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setImagePreview(imageUrl);
      setFormData(prev => ({ ...prev, imageUrl }));
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      throw error;
    } finally {
      setIsUploading(false);
      setImageUploadProgress(0);
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.name.trim()) newErrors.name = 'Event name is required';
      if (!formData.description.trim()) newErrors.description = 'Event description is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.startTime) newErrors.startTime = 'Start time is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (!formData.endTime) newErrors.endTime = 'End time is required';

      // Validate that end date/time is after start date/time
      if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        if (endDateTime <= startDateTime) {
          newErrors.endDate = 'End time must be after start time';
        }
      }
    }

    if (stepNumber === 2) {
      if (!formData.venueId) newErrors.venueId = 'Please select a venue';
      if (formData.selectedCategories.length === 0) newErrors.categories = 'Please select at least one category';
      if (user?.role === 'admin' && !formData.organizerId) newErrors.organizerId = 'Please select an organizer';
    }

    if (stepNumber === 3) {
      if (!formData.isFree) {
        if (!formData.ticketPrice || parseFloat(formData.ticketPrice) <= 0) {
          newErrors.ticketPrice = 'Please enter a valid ticket price';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  const handleAddNewVenue = async () => {
    if (!newVenue.name.trim() || !newVenue.address.trim()) return;

    try {
      // Create venue through API
      const venueData = {
        name: newVenue.name,
        address: newVenue.address,
        latitude: 40.7589 + (Math.random() - 0.5) * 0.1, // Mock coordinates for now
        longitude: -73.9851 + (Math.random() - 0.5) * 0.1,
        capacity: newVenue.capacity || undefined,
      };

      const createdVenue = await venueService.createVenue(venueData);

      // Add to venues list
      setVenues(prev => [...prev, createdVenue]);
      setFormData(prev => ({ ...prev, venueId: createdVenue.id }));
      setShowNewVenueForm(false);
      setNewVenue({ name: '', address: '', capacity: 0 });

      toast.success('Venue created successfully');
    } catch (error) {
      console.error('Error creating venue:', error);
      toast.error('Failed to create venue');
    }
  };

  const uploadImageToServer = async (base64Data: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:8000/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          image: base64Data
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      return data.url; // The server should return the URL of the uploaded image
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      // Find selected venue, organizer, and categories
      const selectedVenue = venues.find(v => v.id === formData.venueId);
      const selectedOrganizer = organizers.find(o => o.id === formData.organizerId);
      const selectedCategories = categories.filter(c => formData.selectedCategories.includes(c.id));

      if (!selectedVenue || !selectedOrganizer || selectedCategories.length === 0) {
        throw new Error('Missing required data');
      }

      let imageUrl = formData.imageUrl;
      
      // If image is a base64 data URL, upload it first
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        try {
          setIsUploading(true);
          setImageUploadProgress(50);
          imageUrl = await uploadImageToServer(imageUrl);
          setImageUploadProgress(100);
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image. Please try again.');
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Prepare event data for API
      const eventData = {
        name: formData.name,
        description: formData.description,
        start_date_time: `${formData.startDate}T${formData.startTime}:00`,
        end_date_time: `${formData.endDate}T${formData.endTime}:00`,
        venue_id: parseInt(formData.venueId),
        category_ids: selectedCategories.map(c => parseInt(c.id)),
        is_free: formData.isFree,
        ...(formData.isFree ? {} : { ticket_price: parseFloat(formData.ticketPrice) }),
        ...(formData.website ? { website: formData.website } : {}),
        ...(formData.ticketingLink ? { ticketing_link: formData.ticketingLink } : {}),
        ...(imageUrl ? { image_url: imageUrl } : {}),
      };

      // Log the data being sent for debugging
      console.log('Creating event with data:', eventData);

      // Create event through API
      const result = await eventController.handleEventCreation(eventData);

      if (result.success) {
        toast.success(`Event "${formData.name}" has been created successfully!${
          user?.role === 'organizer' ? ' It is pending admin approval.' : ''
        }`);

        // Reset form
        setFormData({
          name: '',
          description: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          venueId: '',
          organizerId: user?.role === 'organizer' ? user.id : '',
          selectedCategories: [],
          isFree: true,
          ticketPrice: '',
          website: '',
          ticketingLink: '',
          imageSearchQuery: '',
          imageUrl: '',
        });

        setStep(1);

        // Use the real event object from the API response
        if (result.data?.event) {
          onEventCreated(result.data.event);
        } else {
          // Fallback: navigate to dashboard if no event object
          onBack();
        }
      } else {
        throw new Error(result.message);
      }
        } catch (error: any) {
      console.error('Error creating event:', error);
      
      // Check if this is an Axios error with response data
      if (error.response?.data) {
        console.error('Server validation errors:', error.response.data);
        
        // If there are specific field errors, show them
        if (error.response.data.errors) {
          const fieldErrors = error.response.data.errors;
          const errorMessages = Object.entries(fieldErrors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n');
          
          toast.error(`Validation error: ${errorMessages}`);
          setErrors(prev => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(fieldErrors).map(([field, messages]) => [field, (messages as string[])[0]])
            )
          }));
        } else {
          toast.error(error.response.data.message || 'Failed to create event. Please check your input.');
        }
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to create event. Please try again.');
        setErrors({ submit: error instanceof Error ? error.message : 'Failed to create event. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1>Create New Event</h1>
            <p className="text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  stepNumber <= step 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-0.5 ${
                    stepNumber < step ? 'bg-primary' : 'bg-muted-foreground'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <><Calendar className="h-5 w-5" /> Event Details</>}
              {step === 2 && <><MapPin className="h-5 w-5" /> Venue & Categories</>}
              {step === 3 && <><DollarSign className="h-5 w-5" /> Pricing & Additional Info</>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Details */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter event name"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Event Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your event..."
                    rows={4}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Event Image</Label>
                  
                  {/* Image Preview */}
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Event preview"
                        className="h-48 w-full object-cover rounded-md border-2 border-dashed border-muted-foreground/25"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="bg-background/80 rounded-full w-10 h-10"
                          onClick={removeImage}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      {/* Upload Progress */}
                      {isUploading && (
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted">
                          <div 
                            className="h-full bg-primary transition-all duration-300 ease-in-out"
                            style={{ width: `${imageUploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                          <label 
                            htmlFor="image-upload" 
                            className="font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer"
                          >
                            Click to upload
                          </label>{' '}
                          or drag and drop
                        </div>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                  {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={errors.startDate ? 'border-destructive' : ''}
                    />
                    {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className={errors.startTime ? 'border-destructive' : ''}
                    />
                    {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={errors.endDate ? 'border-destructive' : ''}
                    />
                    {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className={errors.endTime ? 'border-destructive' : ''}
                    />
                    {errors.endTime && <p className="text-sm text-destructive">{errors.endTime}</p>}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Venue & Categories */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Venue *</Label>
                    <Dialog open={showNewVenueForm} onOpenChange={setShowNewVenueForm}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Venue
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Venue</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="venueName">Venue Name</Label>
                            <Input
                              id="venueName"
                              value={newVenue.name}
                              onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter venue name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="venueAddress">Address</Label>
                            <Input
                              id="venueAddress"
                              value={newVenue.address}
                              onChange={(e) => setNewVenue(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Enter venue address"
                            />
                          </div>
                          <div>
                            <Label htmlFor="venueCapacity">Capacity (optional)</Label>
                            <Input
                              id="venueCapacity"
                              type="number"
                              value={newVenue.capacity || ''}
                              onChange={(e) => setNewVenue(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                              placeholder="Enter venue capacity"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddNewVenue} className="flex-1">
                              Add Venue
                            </Button>
                            <Button variant="outline" onClick={() => setShowNewVenueForm(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select value={formData.venueId} onValueChange={(value) => handleInputChange('venueId', value)}>
                    <SelectTrigger className={errors.venueId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {loading ? (
                        <div className="p-2 text-sm text-muted-foreground">Loading venues...</div>
                      ) : venues.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No venues available</div>
                      ) : (
                        venues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.id}>
                            <div>
                              <div>{venue.name}</div>
                              <div className="text-sm text-muted-foreground">{venue.address}</div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.venueId && <p className="text-sm text-destructive">{errors.venueId}</p>}
                </div>

                {/* Organizer selection (admin only) */}
                {user?.role === 'admin' && (
                  <div className="space-y-2">
                    <Label>Organizer *</Label>
                    <Select value={formData.organizerId} onValueChange={(value) => handleInputChange('organizerId', value)}>
                      <SelectTrigger className={errors.organizerId ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select an organizer" />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <div className="p-2 text-sm text-muted-foreground">Loading organizers...</div>
                        ) : organizers.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">No organizers available</div>
                        ) : (
                          organizers.map((organizer) => (
                            <SelectItem key={organizer.id} value={organizer.id}>
                              {organizer.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.organizerId && <p className="text-sm text-destructive">{errors.organizerId}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Categories *</Label>
                  <div className="flex flex-wrap gap-2">
                    {loading ? (
                      <div className="p-2 text-sm text-muted-foreground">Loading categories...</div>
                    ) : categories.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No categories available</div>
                    ) : (
                      categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant={formData.selectedCategories.includes(category.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleCategoryToggle(category.id)}
                        >
                          {category.name}
                        </Badge>
                      ))
                    )}
                  </div>
                  {errors.categories && <p className="text-sm text-destructive">{errors.categories}</p>}
                </div>
              </>
            )}

            {/* Step 3: Pricing & Additional Info */}
            {step === 3 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFree"
                      checked={formData.isFree}
                      onCheckedChange={(checked) => handleInputChange('isFree', checked)}
                    />
                    <Label htmlFor="isFree">This is a free event</Label>
                  </div>

                  {!formData.isFree && (
                    <div className="space-y-2">
                      <Label htmlFor="ticketPrice">Ticket Price *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="ticketPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.ticketPrice}
                          onChange={(e) => handleInputChange('ticketPrice', e.target.value)}
                          placeholder="0.00"
                          className={`pl-10 ${errors.ticketPrice ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.ticketPrice && <p className="text-sm text-destructive">{errors.ticketPrice}</p>}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Event Website (optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                {!formData.isFree && (
                  <div className="space-y-2">
                    <Label htmlFor="ticketingLink">Ticketing Link (optional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="ticketingLink"
                        type="url"
                        value={formData.ticketingLink}
                        onChange={(e) => handleInputChange('ticketingLink', e.target.value)}
                        placeholder="https://tickets.example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Event Image (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.imageSearchQuery}
                      onChange={(e) => handleInputChange('imageSearchQuery', e.target.value)}
                      placeholder="Search for an image..."
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleImageSearch}
                      disabled={isSearchingImage || !formData.imageSearchQuery.trim()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {isSearchingImage ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.imageUrl} 
                        alt="Event preview" 
                        className="w-full max-w-md h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Error display */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              <div>
                {step > 1 && (
                  <Button variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                )}
              </div>
              <div>
                {step < 3 ? (
                  <Button onClick={handleNext}>Next</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Event...' : 'Create Event'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
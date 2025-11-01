# City Events - Full MVC Architecture

A comprehensive city event listing system built with React and TypeScript, following a full MVC (Model-View-Controller) architectural pattern.

## Architecture Overview

This application implements a proper MVC structure adapted for React, providing clear separation of concerns between data access, business logic, and presentation layers.

### 📁 Project Structure

```
├── services/           # Model Layer - Data Access & API Communication
│   ├── BaseService.ts      # Base service with common API functionality
│   ├── EventService.ts     # Event data operations
│   ├── VenueService.ts     # Venue data operations
│   ├── CategoryService.ts  # Category data operations
│   └── AuthService.ts      # Authentication & user management
│
├── controllers/        # Controller Layer - Business Logic & Coordination
│   ├── EventController.ts  # Event business logic & validation
│   ├── AdminController.ts  # Admin-specific operations
│   └── AuthController.ts   # Authentication logic & user management
│
├── views/             # View Layer - UI Components & Pages
│   ├── pages/             # Page-level components
│   │   └── EventListPage.tsx
│   └── components/        # Reusable UI components
│       ├── EventCard.tsx
│       ├── EventFilters.tsx
│       ├── EventCalendar.tsx
│       ├── EventMap.tsx
│       └── ViewModeToggle.tsx
│
├── components/        # Original UI Components (legacy structure)
├── types/            # TypeScript type definitions
├── data/             # Mock data for development
└── App.tsx           # Main application router
```

## 🏗️ MVC Implementation

### Model Layer (Services)
- **BaseService**: Common API communication patterns
- **EventService**: All event-related data operations (CRUD, filtering, search)
- **VenueService**: Venue management and geospatial operations
- **CategoryService**: Category management
- **AuthService**: User authentication and profile management

### Controller Layer
- **EventController**: Business logic for event operations, validation, and formatting
- **AdminController**: Admin-specific operations like event approval, analytics
- **AuthController**: Authentication flow, user management, authorization

### View Layer
- **Pages**: Complete page components that coordinate multiple UI components
- **Components**: Reusable UI elements that focus purely on presentation
- Clean separation between data logic and presentation logic

## 🚀 Key Features

### Event Management
- ✅ Event listing with advanced filtering
- ✅ Search functionality
- ✅ Calendar view
- ✅ Map view
- ✅ Event details with full information
- ✅ Category-based filtering
- ✅ Price filtering (free vs paid events)

### Admin Features (Ready for Implementation)
- 🔄 Event approval workflow
- 🔄 Batch operations
- 🔄 Analytics and reporting
- 🔄 Category management
- 🔄 Venue management

### Authentication (Ready for Implementation)
- 🔄 User registration and login
- 🔄 Role-based access control (Admin, Organizer, Public)
- 🔄 Profile management
- 🔄 JWT token management

## 🛠️ Technical Implementation

### Data Flow Pattern
1. **User Interaction** → View components handle UI events
2. **Business Logic** → Controllers process requests and validate data
3. **Data Access** → Services communicate with APIs/database
4. **Response** → Data flows back through the same layers

### Error Handling
- Centralized error handling in controllers
- User-friendly error messages
- Loading states and proper feedback
- Graceful fallbacks for failed operations

### Validation
- Client-side validation in controllers
- Type safety with TypeScript
- Business rule validation
- Input sanitization

## 🔌 API Integration Ready

The architecture is designed to easily integrate with a Laravel backend:

### Expected API Endpoints
```
GET    /api/v1/events              # List events with filters
GET    /api/v1/events/{id}         # Get single event
POST   /api/v1/events              # Create event
PUT    /api/v1/events/{id}         # Update event
DELETE /api/v1/events/{id}         # Delete event

GET    /api/v1/categories          # List categories
GET    /api/v1/venues              # List venues
POST   /api/v1/auth/login          # User login
POST   /api/v1/auth/register       # User registration
```

### Mock Implementation
Currently uses mock services that simulate API calls with realistic delays and responses. Simply replace the mock implementations in services with actual HTTP calls.

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with desktop optimization
- **Modern Interface**: Clean, professional design using shadcn/ui components
- **Accessibility**: Proper ARIA labels, keyboard navigation, screen reader support
- **Performance**: Optimized rendering with proper React patterns
- **Loading States**: Skeleton loaders and proper feedback
- **Error Handling**: User-friendly error messages and recovery options

## 🚀 Getting Started

1. The application is ready to run as-is with mock data
2. To integrate with a real backend:
   - Update the `baseUrl` in `BaseService.ts`
   - Replace mock implementations in services with actual HTTP calls
   - Configure authentication token storage
   - Set up environment variables for API endpoints

## 🔮 Future Enhancements

- Real-time updates with WebSocket integration
- Advanced search with Elasticsearch
- Geospatial features with PostGIS
- Email notifications for event updates
- Social media integration
- Event analytics dashboard
- Mobile app with React Native

This architecture provides a solid foundation for scaling from a simple event listing to a comprehensive event management platform.
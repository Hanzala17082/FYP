# Architecture Documentation - Tripster Frontend

## Overview

This is a production-ready Next.js frontend built for scale, following industry best practices for a billion-user application.

## Architecture Principles

### 1. Feature-Based Organization
- Each feature is self-contained with its own components, hooks, services, and types
- Features can be developed and tested independently
- Easy to scale and maintain

### 2. Type Safety First
- All API responses use DTOs (Data Transfer Objects)
- Domain entities separate from API DTOs
- Full TypeScript coverage

### 3. Server Components by Default
- Next.js 14+ App Router with Server Components
- Client Components only when interactivity is needed
- Better performance and SEO

### 4. SEO Optimized
- Dynamic metadata generation
- Structured data (JSON-LD)
- Sitemap and robots.txt
- Open Graph and Twitter Cards

## Folder Structure Explained

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (login, register, forgot password)
│   ├── (traveler)/               # Route group for traveler-facing pages (e.g. /trips)
│   ├── traveler/                 # Traveler dashboard routes
│   ├── agency/                   # Agency dashboard routes
│   ├── admin/                    # Admin routes (dashboard, admin login)
│   ├── agencies/                 # Agency catalog and profiles
│   ├── trips/                    # Trip detail routes
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── sitemap.ts                # Dynamic sitemap
│   └── robots.ts                 # Robots.txt
│
├── features/                     # Feature modules
│   ├── auth/                     # Authentication feature
│   │   ├── components/           # Auth-specific components
│   │   ├── hooks/                # Auth hooks
│   │   ├── services/             # Auth API calls
│   │   └── types/                # Auth types
│   ├── trips/                    # Trips feature
│   ├── agencies/                 # Agencies feature
│   └── bookings/                 # Bookings feature
│
├── shared/                       # Shared across features
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base components (Button, Input, etc.)
│   │   └── layout/                # Layout components (Header, Footer)
│   ├── utils/                    # Utility functions
│   └── lib/                      # Third-party configurations
│
├── types/                        # Global TypeScript types
│   ├── api/                      # API DTOs
│   └── entities/                 # Domain entities
│
├── services/                     # API service layer
│   ├── api-client.ts             # Axios instance
│   ├── auth.service.ts
│   ├── trips.service.ts
│   └── bookings.service.ts
│
└── config/                       # Configuration
    ├── constants.ts
    └── env.ts
```

## Data Flow

1. **Page Component** (Server Component)
   - Fetches data or renders static content
   - Generates metadata for SEO

2. **Client Component** (if needed)
   - Handles interactivity
   - Uses hooks for state management
   - Calls services for API requests

3. **Service Layer**
   - Uses api-client for HTTP requests
   - Returns typed DTOs

4. **API Client**
   - Axios instance with interceptors
   - Handles authentication tokens
   - Error handling

## SEO Strategy

### Metadata
- Each page exports metadata using `generateMetadata` utility
- Dynamic metadata based on content (trips, agencies)
- Open Graph and Twitter Card support

### Structured Data
- JSON-LD schema for Organization, Trip, Agency
- Improves search engine understanding

### Sitemap
- Dynamic sitemap generation
- Includes all public routes
- Updates automatically

### Performance
- Server-side rendering for SEO
- Image optimization with Next.js Image
- Code splitting for faster loads

## State Management

### Server State
- React Query / SWR for server state
- Automatic caching and refetching

### Client State
- Zustand for global client state
- React useState for component state

## Styling Approach

- **Tailwind CSS** for utility-first styling
- **Custom Design System** matching UI designs
- **Dark Mode** support with class-based switching
- **Responsive** mobile-first design

## API Integration

### Service Layer Pattern
```typescript
// services/trips.service.ts
export const tripsService = {
  getTrips: async (filters) => {
    return apiClient.get<TripListResponseDTO>('/trips', { params: filters })
  }
}
```

### Usage in Components
```typescript
// In Client Component
const { data, isLoading } = useQuery({
  queryKey: ['trips', filters],
  queryFn: () => tripsService.getTrips(filters)
})
```

## Security Considerations

1. **Authentication**
   - JWT tokens stored in localStorage
   - Automatic token refresh
   - Protected routes

2. **API Security**
   - HTTPS only in production
   - CORS configuration
   - Input validation with Zod

3. **XSS Prevention**
   - React's built-in escaping
   - Sanitize user inputs

## Performance Optimizations

1. **Code Splitting**
   - Route-based splitting
   - Dynamic imports for heavy components

2. **Image Optimization**
   - Next.js Image component
   - Lazy loading
   - Responsive images

3. **Caching**
   - ISR for public content
   - React Query caching
   - Browser caching headers

4. **Bundle Size**
   - Tree shaking
   - Analyze bundle regularly

## Testing Strategy (Future)

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Component testing
- **E2E Tests**: Playwright or Cypress
- **Visual Regression**: Chromatic or Percy

## Deployment

### Recommended Platforms
- **Vercel** (optimal for Next.js)
- **AWS Amplify**
- **Netlify**

### Environment Setup
- Production environment variables
- CDN for static assets
- Edge caching

## Scalability Considerations

1. **Horizontal Scaling**
   - Stateless application
   - CDN for assets
   - Edge functions for API routes

2. **Database Optimization**
   - Efficient queries
   - Pagination
   - Caching strategies

3. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Analytics

## Next Steps

1. ✅ Project structure created
2. ✅ Base components implemented
3. ✅ Auth pages implemented
4. ✅ Trip listings page implemented
5. 🔄 Dashboard pages (in progress)
6. ⏳ Connect to Django backend
7. ⏳ Add form validation
8. ⏳ Implement state management
9. ⏳ Add error boundaries
10. ⏳ Write tests

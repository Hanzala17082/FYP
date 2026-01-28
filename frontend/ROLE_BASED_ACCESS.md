# Role-Based Access Control (RBAC) System

This document explains the role-based navigation and access control system implemented in the Tripster application.

## Overview

The application has three user roles:
1. **Admin** - Full system access
2. **Agency** - Can manage trips and bookings
3. **Traveler** - Can browse trips and make bookings

## Architecture

### 1. Authentication Context (`AuthContext`)
- Manages user authentication state
- Stores user information in localStorage
- Provides role checking utilities
- Located at: `shared/contexts/AuthContext.tsx`

### 2. Protected Routes
- `ProtectedRoute` component wraps protected pages
- Checks authentication and role permissions
- Automatically redirects unauthorized users
- Located at: `shared/components/auth/ProtectedRoute.tsx`

### 3. Middleware
- Server-side route protection
- Checks cookies for authentication
- Redirects based on user role
- Located at: `middleware.ts` (root level)

### 4. Role-Based Utilities
- Helper functions for authentication
- Cookie management for middleware
- Dashboard route mapping
- Located at: `shared/utils/auth.ts`

## Route Protection

### Admin Routes
- `/admin/dashboard` - Admin only
- Protected with: `<ProtectedRoute allowedRoles={['Admin']}>`

### Agency Routes
- `/agency/dashboard` - Agency only
- Protected with: `<ProtectedRoute allowedRoles={['Agency']}>`

### Traveler Routes
- `/traveler/dashboard` - Traveler only
- Protected with: `<ProtectedRoute allowedRoles={['Traveler']}>`

### Admin Routes
- `/admin/dashboard` - Admin only
- Protected with: `<ProtectedRoute allowedRoles={['Admin']}>`

### Shared Protected Routes
- `/travelers/[id]` - Traveler profile, accessible to Agency and Admin only
- Protected with: `<ProtectedRoute allowedRoles={[USER_ROLES.AGENCY, USER_ROLES.ADMIN]}>`

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/admin/login` - Admin login page
- `/register` - Registration page
- `/forgot-password` - Password reset page
- `/trips` - Trip listings
- `/trips/[slug]` - Trip detail pages
- `/agencies` - Agency listings
- `/agencies/[id]` - Agency profile pages
- `/agencies/[id]/trips` - Trips for a specific agency

## Usage Examples

### Protecting a Page

```tsx
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminDashboardClient />
    </ProtectedRoute>
  )
}
```

### Using Auth Context

```tsx
import { useAuth } from '@/shared/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, hasRole, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  if (hasRole('Admin')) {
    return <div>Admin content</div>
  }
  
  return <div>Regular content</div>
}
```

### Using Role Guard Hook

```tsx
import { useRoleGuard } from '@/shared/hooks/useRoleGuard'

function AdminComponent() {
  const { hasAccess, isLoading, user } = useRoleGuard(['Admin'])
  
  if (isLoading) return <div>Loading...</div>
  if (!hasAccess) return <div>Access denied</div>
  
  return <div>Admin content</div>
}
```

## Login Flow

1. User selects role (Traveler, Agency, or Admin)
2. User enters credentials
3. On successful login:
   - User data stored in localStorage
   - Auth token stored in localStorage and cookies
   - User role stored in cookies (for middleware)
   - User redirected to appropriate dashboard based on role

## Automatic Redirects

- **Unauthenticated users** → Redirected to `/login`
- **Admin accessing Agency routes** → Redirected to `/admin/dashboard`
- **Agency accessing Admin routes** → Redirected to `/agency/dashboard`
- **Traveler accessing Admin routes** → Redirected to `/traveler/dashboard`

## Security Features

1. **Client-side protection**: ProtectedRoute component checks authentication
2. **Server-side protection**: Middleware validates routes on server
3. **Cookie-based auth**: Middleware can check authentication without client-side code
4. **Role validation**: Both client and server validate user roles
5. **Automatic redirects**: Users are redirected to appropriate pages based on their role

## Testing

To test different roles:

1. **Admin**: Select "Admin" role on login page, use any email/password
2. **Agency**: Select "Agency" role on login page, use any email/password
3. **Traveler**: Select "Traveler" role on login page, use any email/password

After login, try accessing different routes to see the protection in action.

## Files Modified/Created

- `shared/contexts/AuthContext.tsx` - Authentication context
- `shared/components/auth/ProtectedRoute.tsx` - Route protection component
- `shared/components/auth/RoleLayout.tsx` - Role-based layout wrapper
- `shared/utils/auth.ts` - Authentication utilities
- `shared/hooks/useRoleGuard.ts` - Role guard hook
- `middleware.ts` - Server-side route protection
- `app/layout.tsx` - Added AuthProvider
- `app/admin/dashboard/page.tsx` - Added protection
- `app/agency/dashboard/page.tsx` - Added protection
- `app/traveler/dashboard/page.tsx` - Added protection
- `app/(auth)/login/page.tsx` - Added authentication logic

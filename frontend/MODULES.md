## Tripster – Functional Modules Overview

This document explains the **main functional modules** of the Tripster app so other devs can quickly understand responsibilities, routes, and related backend/DB pieces.

For DB details, see `DB_SCHEMA_GUIDE.md`. For routes, see `ROUTES.md`. For architecture, see `ARCHITECTURE.md`.

---

## 1. Auth & RBAC Module

**Responsibility**

- Authentication (login, register, forgot/reset password).
- Role-based access control (Traveler, Agency, Admin).
- Session management and redirects to the correct dashboard.

**Frontend surface**

- Pages:
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/admin/login`
- Shared components:
  - `shared/contexts/AuthContext.tsx`
  - `shared/components/auth/ProtectedRoute.tsx`
  - `shared/components/auth/RoleLayout.tsx`
- Middleware:
  - `middleware.ts` (protects dashboards by role).

**Backend / DB link**

- Tables: `users`, `agencies`, `traveler_profiles`, `refresh_tokens`, `password_reset_tokens`.
- DTOs: `auth.dto.ts`.
- Endpoints (planned): `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`.

---

## 2. User & Profile Module

**Responsibility**

- Managing user identities and profiles for Travelers and Agencies.
- Showing traveler and agency profiles with role‑aware access.

**Frontend surface**

- Pages:
  - `/travelers/[id]` (Traveler profile; Agency/Admin only)
  - `/agencies` (agency listing)
  - `/agencies/[id]` (single agency profile)
  - `/agencies/[id]/trips` (all trips for an agency)
- DTOs:
  - `AgencyDTO` (in `trips.dto.ts`)
  - `UserDTO` (in `auth.dto.ts`).

**Backend / DB link**

- Tables: `users`, `agencies`, `traveler_profiles`, `reviews`.
- Endpoints (planned):
  - `/agencies`
  - `/agencies/:slug`
  - `/agencies/:slug/trips`
  - `/users/:id` or `/travelers/:id`.

---

## 3. Trips & Discovery Module

**Responsibility**

- Public trip discovery and detailed trip information.
- Trip metadata for agencies and dashboards.

**Frontend surface**

- Pages:
  - `/trips` (trip listings with filters)
  - `/trips/[slug]` (trip detail)
- Components:
  - `features/trips/components/*`
  - `shared/components/trips/*` (TripCard, TripImageGallery, etc.).
- DTOs:
  - `trips.dto.ts` (TripDTO, filters, schedule, activities, recreational activities).

**Backend / DB link**

- Tables: `trips`, `trip_highlights`, `trip_schedules`, `trip_schedule_activities`, `trip_recreational_activities`, `reviews`.
- Endpoints (planned):
  - `GET /trips` (with filters)
  - `GET /trips/:slug`
  - `POST /trips` / `PATCH /trips/:id` (Agency/Admin).

---

## 4. Booking Module

**Responsibility**

- Creating and managing bookings between Travelers and Trips.
- Exposing booking data to Traveler and Agency dashboards.

**Frontend surface**

- UI components:
  - `shared/components/ui/BookingCard.tsx`
  - Booking sections in Traveler/Agency dashboards.
- DTOs:
  - `bookings.dto.ts` (BookingRequestDTO, BookingDTO, list response).

**Backend / DB link**

- Tables: `bookings`, `trips`, `users`.
- Endpoints (planned):
  - `POST /bookings` (create booking).
  - `GET /bookings` (list for current user by role).
  - `PATCH /bookings/:id` (status updates by Agency/Admin).

---

## 5. Review & Rating Module

**Responsibility**

- Collecting and displaying ratings and text reviews for Trips and Agencies.
- Computing/displaying aggregate rating and review counts.

**Frontend surface**

- Components:
  - `shared/components/trips/TripReviewCard.tsx`
  - Ratings in Trip and Agency cards.
- DTOs:
  - `reviews.dto.ts` (ReviewDTO, ReviewRequestDTO).

**Backend / DB link**

- Tables: `reviews`, `trips`, `agencies`, `users`.
- Endpoints (planned):
  - `POST /reviews`
  - `GET /trips/:id/reviews`
  - `GET /agencies/:id/reviews`.

---

## 6. Dashboard Module (Traveler / Agency / Admin)

**Responsibility**

- Role-specific overviews and management screens:
  - Traveler: my trips, wishlist, past trips.
  - Agency: trip performance, booking pipeline, traveler insights.
  - Admin: system‑level stats, users, agencies.

**Frontend surface**

- Pages:
  - `/traveler/dashboard`
  - `/agency/dashboard`
  - `/admin/dashboard`
- Client components:
  - `TravelerDashboardClient.tsx`
  - `AgencyDashboardClient.tsx`
  - `AdminDashboardClient.tsx`
- Shared UI:
  - `shared/components/ui/StatCard.tsx`
  - `shared/components/ui/QuickActionGrid.tsx`
  - `shared/components/ui/ActionButton.tsx`
  - `shared/components/ui/PastTripItem.tsx`

**Backend / DB link**

- Tables: `users`, `agencies`, `trips`, `bookings`, `reviews`.
- Endpoints (planned):
  - Aggregated “dashboard” endpoints per role, e.g.:
    - `/dashboard/traveler`
    - `/dashboard/agency`
    - `/dashboard/admin`.

---

## 7. Layout, Navigation & Shell Module

**Responsibility**

- Global layout, navigation, and theming:
  - Header, bottom navigation, logo, theme toggle.
  - Error boundaries and 404.

**Frontend surface**

- App shell:
  - `app/layout.tsx`
  - `app/error.tsx`
  - `app/not-found.tsx`
  - `app/global-error.tsx`
- Shared layout components:
  - `shared/components/layout/Header.tsx`
  - `shared/components/layout/BottomNavigation.tsx`
  - `shared/components/layout/Logo.tsx`
  - `shared/components/ui/ThemeToggle.tsx`

**Backend / DB link**

- None directly; consumes all modules (auth, trips, bookings, etc.) for navigation affordances.

---

## 8. Shared UI & Design System Module

**Responsibility**

- Centralised design system used across all features and dashboards.

**Frontend surface**

- `shared/components/ui/*` (Button, Card, StatusBadge, Avatar, Input, IconButton, AlertBox, etc.).
- Documented in `COMPONENTS.md`.

**Backend / DB link**

- None; pure frontend concern, but strongly shapes how data is presented from other modules.

---

## 9. Infrastructure & SEO Module

**Responsibility**

- Cross‑cutting infrastructure: API client, configuration, SEO helpers, static assets.

**Frontend surface**

- Config:
  - `config/env.ts`
  - `config/constants.ts`
- API client & services:
  - `shared/lib/api-client.ts`
  - `services/*.ts` (auth, trips, bookings).
- SEO:
  - `shared/utils/seo.ts`
  - `app/sitemap.ts`
  - `app/robots.ts`

**Backend / DB link**

- Central point where backend base URL is configured and DTOs are consumed.

---

## 10. How to Use This Module Map

When adding a new feature or endpoint:

1. **Identify the module** it belongs to (Auth, Trips, Bookings, etc.).
2. **Update or add DTOs** in `types/api/` for request/response shapes.
3. **Implement service functions** in `services/` that call the backend for that module.
4. **Use shared UI components** from `shared/components` to keep the UX consistent.
5. **Update `DB_SCHEMA_GUIDE.md`** if you introduce new tables/relations.
6. **Update `ROUTES.md`** if you add/remove routes or pages in that module.


## Tripster – PostgreSQL Schema & Backend Guide

This document is a **blueprint for designing your PostgreSQL database and backend** to match the current Tripster frontend (users, roles, trips, bookings, reviews, agencies).

Use it as a checklist when creating tables, enums, relations, and backend modules.

---

## 1. Core Domain Overview

High‑level entities (from your TypeScript types):

- **User / Traveler / Agency / Admin**
- **Trip**
- **Booking**
- **Review**
- **Agency profile & stats**
- **Trip schedule & activities**
- **Recreational activities**

Key relationships:

- A **User** has a **role**: `Traveler | Agency | Admin`.
- An **Agency** is a specialized **User** with extra fields (name, slug, verified, etc.).
- A **Traveler** is a **User** who can make **Bookings** for **Trips**.
- A **Trip** belongs to one **Agency**.
- A **Booking** links one **Trip** and one **Traveler (User)**.
- A **Review** can target either a **Trip** or an **Agency** and is authored by a **Traveler (User)**.

---

## 2. Recommended PostgreSQL Enums

Create enums to keep values in sync with the frontend types.

```sql
CREATE TYPE user_role AS ENUM ('Traveler', 'Agency', 'Admin');

CREATE TYPE trip_status AS ENUM ('active', 'pending', 'completed', 'cancelled');

CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
```

---

## 3. Users & Roles

### 3.1 `users` table

Represents all users, including Travelers, Agencies, and Admins.

**Columns**

- `id UUID PK` – primary key.
- `email TEXT UNIQUE NOT NULL`.
- `full_name TEXT NOT NULL`.
- `role user_role NOT NULL`.
- `city TEXT NULL`.
- `avatar_url TEXT NULL`.
- `password_hash TEXT NOT NULL` – hashed password.
- `is_email_verified BOOLEAN NOT NULL DEFAULT FALSE`.
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.

**Indexes**

- `UNIQUE(email)`.
- `INDEX(role)` – for dashboards / filtering by role.

**Example DDL**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  city TEXT,
  avatar_url TEXT,
  password_hash TEXT NOT NULL,
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.2 `agencies` table (extends user)

Based on `Agency extends User` in the frontend.

**Columns**

- `id UUID PRIMARY KEY` – same as `users.id`.
- `user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE`.
- `agency_name TEXT NOT NULL`.
- `agency_slug TEXT NOT NULL UNIQUE`.
- `description TEXT`.
- `location TEXT`.
- `logo_url TEXT`.
- `rating NUMERIC(2,1) NOT NULL DEFAULT 0.0`.
- `review_count INT NOT NULL DEFAULT 0`.
- `verified BOOLEAN NOT NULL DEFAULT FALSE`.
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.

**Example DDL**

```sql
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  agency_name TEXT NOT NULL,
  agency_slug TEXT NOT NULL UNIQUE,
  description TEXT,
  location TEXT,
  logo_url TEXT,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0.0,
  review_count INT NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> **Validation:** when inserting into `agencies`, ensure `users.role = 'Agency'`.

### 3.3 `traveler_profiles` table (optional but recommended)

Additional data for Traveler users (e.g. `cnic` from `RegisterRequestDTO`).

**Columns**

- `id UUID PRIMARY KEY`.
- `user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE`.
- `cnic TEXT UNIQUE`.
- `preferences JSONB` – optional structured preferences.
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.

**Example DDL**

```sql
CREATE TABLE traveler_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  cnic TEXT UNIQUE,
  preferences JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> **Validation:** ensure `users.role = 'Traveler'` when inserting.

---

## 4. Trips & Related Tables

Frontend `Trip` and `TripDTO` shape:

- id, title, slug, description, shortDescription, destination
- price, duration, images[], tags[]
- agencyId / agency
- rating, reviewCount
- availableDates[], startDate, endDate
- status: `'active' | 'pending' | 'completed' | 'cancelled'`
- optional: highlights, schedule (days & activities), recreationalActivities

### 4.1 `trips` table

**Columns**

- `id UUID PK`.
- `agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT`.
- `title TEXT NOT NULL`.
- `slug TEXT NOT NULL UNIQUE`.
- `description TEXT NOT NULL`.
- `short_description TEXT NOT NULL`.
- `destination TEXT NOT NULL`.
- `price NUMERIC(10,2) NOT NULL`.
- `duration_days INT NOT NULL`.
- `images TEXT[] NOT NULL DEFAULT '{}'` – or JSONB.
- `rating NUMERIC(2,1) NOT NULL DEFAULT 0.0`.
- `review_count INT NOT NULL DEFAULT 0`.
- `available_dates DATE[] NOT NULL DEFAULT '{}'` – or JSONB.
- `start_date DATE NOT NULL`.
- `end_date DATE NOT NULL`.
- `status trip_status NOT NULL DEFAULT 'pending'`.
- `tags TEXT[] NOT NULL DEFAULT '{}'`.
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.

**Indexes**

- `INDEX(destination)`.
- `INDEX(agency_id)`.
- Composite index `(destination, start_date, price)` for search.

**Example DDL**

```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  destination TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration_days INT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0.0,
  review_count INT NOT NULL DEFAULT 0,
  available_dates DATE[] NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status trip_status NOT NULL DEFAULT 'pending',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.2 `trip_highlights`

Optional marketing bullet points for trips.

```sql
CREATE TABLE trip_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_trip_highlights_trip_id ON trip_highlights(trip_id);
```

### 4.3 `trip_schedules` & `trip_schedule_activities`

From `TripScheduleDTO` and `ActivityDTO`.

```sql
CREATE TABLE trip_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day SMALLINT NOT NULL,          -- Day number (1, 2, 3, ...)
  date DATE NOT NULL,
  title TEXT NOT NULL
);
CREATE INDEX idx_trip_schedules_trip_id ON trip_schedules(trip_id);

CREATE TABLE trip_schedule_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  activity TEXT NOT NULL
);
CREATE INDEX idx_trip_schedule_activities_schedule_id ON trip_schedule_activities(schedule_id);
```

### 4.4 `trip_recreational_activities`

From `RecreationalActivityDTO`.

```sql
CREATE TABLE trip_recreational_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,          -- e.g. '2 hours'
  included BOOLEAN NOT NULL DEFAULT FALSE,
  additional_cost NUMERIC(10,2),
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_trip_recreational_activities_trip_id ON trip_recreational_activities(trip_id);
```

---

## 5. Bookings

From `Booking` entity and `BookingDTO`:

- Link between `Trip` and Traveler (`User` with role Traveler).
- Has `startDate`, `endDate`, `numberOfTravelers`, `status`, `specialRequests`.

### 5.1 `bookings` table

**Columns**

- `id UUID PK`.
- `trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE RESTRICT`.
- `traveler_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT`.
- `start_date DATE NOT NULL`.
- `end_date DATE NOT NULL`.
- `number_of_travelers INT NOT NULL CHECK (number_of_travelers > 0)`.
- `status booking_status NOT NULL DEFAULT 'pending'`.
- `special_requests TEXT`.
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.

**Indexes**

- `INDEX(trip_id)`.
- `INDEX(traveler_id)`.
- `INDEX(status)`.

**Example DDL**

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE RESTRICT,
  traveler_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  number_of_travelers INT NOT NULL CHECK (number_of_travelers > 0),
  status booking_status NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 6. Reviews

From `ReviewDTO`:

- Review can be for a **Trip** or an **Agency** (or both nullable, but at least one required).
- Authored by a Traveler (`UserDTO`) with `rating` and `comment`.

### 6.1 `reviews` table

**Columns**

- `id UUID PK`.
- `trip_id UUID NULL REFERENCES trips(id) ON DELETE CASCADE`.
- `agency_id UUID NULL REFERENCES agencies(id) ON DELETE CASCADE`.
- `traveler_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT`.
- `rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5)`.
- `comment TEXT NOT NULL`.
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.

**Constraint**

At least one of `trip_id`, `agency_id` must be non‑null:

```sql
ALTER TABLE reviews
ADD CONSTRAINT chk_review_target
CHECK (
  (trip_id IS NOT NULL) OR (agency_id IS NOT NULL)
);
```

**Indexes**

- `INDEX(trip_id)`.
- `INDEX(agency_id)`.
- `INDEX(traveler_id)`.

---

## 7. Auth & Security Tables

These tables support the flows from `auth.dto.ts` (`accessToken`, `refreshToken`, forgot/reset password).

### 7.1 `refresh_tokens`

Stores long‑lived refresh tokens.

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

### 7.2 `password_reset_tokens`

For forgot/reset password flows.

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```

---

## 8. Backend Module Guide (High Level)

Use the schema above to structure backend modules / services. A typical separation:

- **Auth module**
  - Tables: `users`, `traveler_profiles`, `agencies`, `refresh_tokens`, `password_reset_tokens`.
  - Endpoints:
    - `POST /auth/register` – create Traveler/Agency user, optional profile.
    - `POST /auth/login` – issue access + refresh tokens.
    - `POST /auth/refresh` – rotate refresh tokens.
    - `POST /auth/forgot-password` – write to `password_reset_tokens`.
    - `POST /auth/reset-password` – verify token, update `users.password_hash`.

- **Trips module**
  - Tables: `trips`, `trip_highlights`, `trip_schedules`, `trip_schedule_activities`, `trip_recreational_activities`.
  - Endpoints:
    - `GET /trips` – filters from `TripFiltersDTO` (destination, price range, duration, agencyId, sorting).
    - `GET /trips/:slug` – join `trips` + related tables.
    - `POST /trips` (Agency only).
    - `PATCH /trips/:id` (Agency / Admin).

- **Agencies module**
  - Tables: `agencies`, `users`, `trips`, `reviews`.
  - Endpoints:
    - `GET /agencies` – list + rating aggregates.
    - `GET /agencies/:slug` – single profile + stats.
    - `GET /agencies/:slug/trips` – list trips for that agency.

- **Bookings module**
  - Tables: `bookings`, `trips`, `users`.
  - Endpoints:
    - `POST /bookings` – create booking (use `BookingRequestDTO`).
    - `GET /bookings` – list bookings for Traveler or Agency.
    - `PATCH /bookings/:id` – update status by Agency/Admin.

- **Reviews module**
  - Tables: `reviews`, `trips`, `agencies`, `users`.
  - Endpoints:
    - `POST /reviews` – traveler posts review for a trip or agency.
    - `GET /trips/:id/reviews`, `GET /agencies/:id/reviews`.

---

## 9. Implementation Checklist

When you actually build the DB and backend:

1. **Create enums**: `user_role`, `trip_status`, `booking_status`.
2. **Create tables** in this order (to satisfy FKs):
   - `users`
   - `agencies`, `traveler_profiles`
   - `trips`
   - `trip_highlights`, `trip_schedules`, `trip_schedule_activities`, `trip_recreational_activities`
   - `bookings`
   - `reviews`
   - `refresh_tokens`, `password_reset_tokens`
3. **Add indexes** as noted to keep `/trips`, `/agencies`, dashboards fast.
4. **Map DTOs**:
   - Align `*DTO` interfaces to select clauses in your queries.
   - Keep naming consistent (e.g. `availableDates` ↔ `available_dates`).
5. **Wire RBAC**:
   - Use `users.role` to enforce access on backend routes (matching the frontend `ProtectedRoute` / middleware behavior).

This file should give another backend dev enough detail to design the full PostgreSQL schema and implement services that line up exactly with your current frontend. 


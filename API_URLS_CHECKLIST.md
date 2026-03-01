# API URLs that must work (frontend ↔ backend)

Base URL: `http://localhost:8000/api` (or your `NEXT_PUBLIC_API_URL`).

Use these to verify the backend is connected. Test with browser, curl, or Postman.

---

## Auth (`/api/auth/...`)

| Method | URL | Used by |
|--------|-----|--------|
| POST | `/api/auth/login` | Login (traveler + admin) |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/refresh` | Token refresh |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Forgot password |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/users/<uuid>` | Admin: user detail; traveler profile by id |

---

## Trips (`/api/trips/...`)

| Method | URL | Used by |
|--------|-----|--------|
| GET | `/api/trips` | Trips list (home, discover), filters/pagination |
| GET | `/api/trips/featured` | Featured trips |
| GET | `/api/trips/search?q=...` | Search trips |
| GET | `/api/trips/<slug>` | Trip detail page (e.g. `new-york-to-niagara-falls-weekend`) |
| POST | `/api/trips` | Agency/Admin: create trip |
| PATCH | `/api/trips/<uuid>` | Agency/Admin: update trip |
| GET | `/api/trips/<uuid>/reviews` | Trip reviews |

---

## Bookings (`/api/bookings/...`)

| Method | URL | Used by |
|--------|-----|--------|
| GET | `/api/bookings` | Traveler dashboard, profile; Admin with `?traveler_id=` |
| GET | `/api/bookings/<uuid>` | Booking detail |
| POST | `/api/bookings` | Create booking (trip detail page) |
| PATCH | `/api/bookings/<uuid>/status` | Update booking status |

---

## Agencies (`/api/agencies/...`)

| Method | URL | Used by |
|--------|-----|--------|
| GET | `/api/agencies` | Agencies list page |
| GET | `/api/agencies/<id-or-slug>` | Agency profile, agency trips page |
| GET | `/api/agencies/<id-or-slug>/trips` | Agency trips tab |
| GET | `/api/agencies/<id-or-slug>/reviews` | Agency reviews |

---

## Dashboard (`/api/dashboard/...`)

| Method | URL | Used by |
|--------|-----|--------|
| GET | `/api/dashboard/traveler` | Traveler dashboard |
| GET | `/api/dashboard/agency` | Agency dashboard / profile |
| GET | `/api/dashboard/admin` | Admin dashboard |

---

## Reviews (`/api/reviews/...`)

| Method | URL | Used by |
|--------|-----|--------|
| POST | `/api/reviews` | Create review (trip or agency) |

---

## Quick smoke test (copy-paste)

```bash
# From project root; backend must be running on port 8000
BASE="http://localhost:8000/api"

# Auth (should return JSON, not HTML)
curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"email":"traveler@example.com","password":"password"}' | head -c 200

# Trips list
curl -s "$BASE/trips?limit=5" | head -c 300

# Trip by slug (use a slug that exists in your database)
curl -s "$BASE/trips/new-york-to-niagara-falls-weekend" | head -c 300

# Agencies list
curl -s "$BASE/agencies?limit=5" | head -c 300

# Dashboard (requires valid Bearer token)
# curl -s -H "Authorization: Bearer YOUR_ACCESS_TOKEN" "$BASE/dashboard/traveler"
```

---

## Frontend env

- `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `frontend/.env.local`
- Restart Next.js dev server after changing env.

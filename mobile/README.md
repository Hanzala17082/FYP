# Tripster Mobile (Ionic React)

Uses the same Django API as the Next.js frontend. Point `VITE_API_URL` at your backend (e.g. `http://localhost:8000/api`).

## Setup

```bash
cp .env.example .env
# Edit .env and set VITE_API_URL if needed (default: http://localhost:8000/api)
npm install
npm run dev
```

## Routes

- `/trips` – Trip list (GET /api/trips)
- `/trips/:slug` – Trip detail (GET /api/trips/:slug)
- `/login` – Login (POST /api/auth/login); stores JWT in localStorage

Run the Django backend and ensure CORS allows the dev server origin (e.g. `http://localhost:5173` for Vite).

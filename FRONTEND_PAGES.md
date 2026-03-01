# Frontend pages – clickable URLs

Use **http://localhost:3000** or **http://localhost:3001** (see the port in the terminal when you run `npm run dev`).

---

## Public

- [Home](http://localhost:3000/)
- [Trips (Discover)](http://localhost:3000/trips)
- [Trip: New York to Niagara Falls](http://localhost:3000/trips/new-york-to-niagara-falls-weekend)
- [Trip: Singapore & Bali](http://localhost:3000/trips/singapore-bali-highlights)
- [Trip: London & Paris](http://localhost:3000/trips/london-paris-4-day)
- [Trip: Masai Mara Safari](http://localhost:3000/trips/masai-mara-safari)
- [Trip: Rocky Mountain Hike](http://localhost:3000/trips/rocky-mountain-3-day-hike)
- [Agencies](http://localhost:3000/agencies)

---

## Auth (no login required to open)

- [Login](http://localhost:3000/login)
- [Admin login](http://localhost:3000/admin/login)
- [Register](http://localhost:3000/register)
- [Forgot password](http://localhost:3000/forgot-password)

---

## After login (Traveler / Agency / Admin)

- [Dashboard (Traveler or Agency)](http://localhost:3000/dashboard)
- [Admin dashboard](http://localhost:3000/admin/dashboard)
- [Profile (current user)](http://localhost:3000/profile)

---

## Agency & traveler profiles (replace `ID` with real id/slug from your DB)

- [Agency profile – e.g. Global Travel Co](http://localhost:3000/agencies/global-travel-co)
- [Agency trips](http://localhost:3000/agencies/global-travel-co/trips)
- [Traveler profile (use real UUID)](http://localhost:3000/travelers/00000000-0000-0000-0000-000000000001)
- [Admin: agency profile (use real UUID)](http://localhost:3000/admin/agencies/00000000-0000-0000-0000-000000000001)

---

**Tip:** If a link returns 404, the slug or ID may not exist. Create data via Django admin or the API, then use slugs/IDs from your database.

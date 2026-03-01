# API types (database-backed)

These types describe the shape of data returned by or sent to the **Django API**. All persistent data is stored in **Supabase** (PostgreSQL). The backend reads from and writes to Supabase; the frontend does not store data in types—it receives it from the API and types it with these interfaces.

- **Reads**: API fetches from Supabase → returns JSON → frontend types with these interfaces.
- **Writes**: Frontend sends JSON to API → API validates and writes to Supabase.

No data is “saved into” these type files; they are TypeScript interfaces only.

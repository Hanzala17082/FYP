# Tripster Backend (Django)

Django modular-monolith API for Tripster. Uses **PostgreSQL** (e.g. Supabase) as the database; all access is via the Django ORM.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com). In the dashboard go to **Project Settings → Database**. Copy the **Connection string** (URI). Use **Transaction** mode (port **6543**) for the pooler, or **Session** (5432) for direct. Replace `[YOUR-PASSWORD]` with your database password.

2. **Create a virtualenv and install dependencies:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set **DATABASE_URL** to your Supabase URI, for example:
   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   **If DATABASE_URL is empty or missing, Django uses SQLite** and no tables are created in Supabase.

4. **Create tables in Supabase (run migrations):**
   ```bash
   python manage.py migrate
   ```
   This creates all tables in your Supabase database. In Supabase go to **Table Editor** and you should see: `users`, `agencies`, `trips`, `bookings`, `reviews`, `traveler_profiles`, `refresh_tokens`, `password_reset_tokens`, plus Django’s `django_migrations`, `auth_*`, etc.

5. **Create a superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```
   Create users, agencies, and trips via Django admin at `/admin/` or via the API.

6. **Run the server (REST + WebSocket chat):**
   ```bash
   daphne -b 0.0.0.0 -p 8000 config.asgi:application
   ```
   For REST-only without live chat: `python manage.py runserver`

7. **Chat setup (trip group live chat):**
   - Set `SUPABASE_JWT_SECRET` in `.env` (Supabase Dashboard → Project Settings → API → JWT Secret).
   - Run migrations against Supabase Postgres: `python manage.py migrate`
   - Backfill existing confirmed bookings: `python manage.py sync_chat_memberships`
   - On Supabase, if the booking trigger was not applied via migrate, run [`../supabase/chat_membership_trigger.sql`](../supabase/chat_membership_trigger.sql) in the SQL Editor.
   - Optional: set `REDIS_URL` for production WebSocket scaling (omit for in-memory dev layer).

8. **Frontend env** (in `frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

   API base URL: `http://localhost:8000/api/`

**Quick run:** Ensure `DATABASE_URL` is set, run `python manage.py migrate`, then start Daphne. Set `NEXT_PUBLIC_API_URL` and `SUPABASE_JWT_SECRET` in env. Create data via Django admin at `/admin/` or the API.

## API base URL

The frontend expects `NEXT_PUBLIC_API_URL=http://localhost:8000/api`. All routes are under `/api/`:

- `POST /api/auth/login`, `/api/auth/register`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- `GET /api/trips`, `GET /api/trips/featured`, `GET /api/trips/search`, `GET /api/trips/<slug>`
- `GET/POST /api/bookings`, `GET /api/bookings/<id>`, `PATCH /api/bookings/<id>/status`
- `GET /api/chat/groups`, `GET /api/chat/groups/<id>/messages`, `PATCH /api/chat/groups/<id>/policy`
- WebSocket: `ws://localhost:8000/ws/chat/<group_id>/?token=<supabase_access_token>`
- `GET /api/agencies`, `GET /api/agencies/<slug>`, `GET /api/agencies/<slug>/trips`, `GET /api/agencies/<slug>/reviews`
- `GET /api/trips/<id>/reviews`, `POST /api/reviews`
- `GET /api/dashboard/traveler`, `GET /api/dashboard/agency`, `GET /api/dashboard/admin`

## Database (Supabase)

Use Supabase only as **PostgreSQL**. Set `DATABASE_URL` in `.env` to the Supabase connection string. Django creates and updates tables via migrations; you do not need to run SQL manually.

**Why don’t I see any tables in Supabase?**  
Tables are created only when **both** are true:

1. **`DATABASE_URL`** in `.env` is set to your **Supabase** Postgres URI (from Project Settings → Database). If it’s missing or empty, Django uses SQLite and nothing is created in Supabase.
2. You run **`python manage.py migrate`** from the backend folder (with that `.env` loaded). Migrations create the tables in the database `DATABASE_URL` points to.

**Check:**

- **Which DB am I using?** Run `python manage.py migrate` and look at the first line; it will show the database engine (e.g. `postgresql` for Supabase, or `sqlite3` if `DATABASE_URL` is not set).
- **Connection errors?** Supabase requires SSL. The project sets `sslmode=require` for Postgres. If you still get connection errors, ensure the URI is correct (password, host, port 6543 for pooler) and that your Supabase project allows connections (no pause, correct region).
- **After fixing `DATABASE_URL`:** Run `python manage.py migrate` again; tables will then appear in Supabase Table Editor.
- **"could not translate host name ... to address":** The direct connection (`db.xxx.supabase.co`) uses **IPv6**; many networks don’t resolve it. Use the **Session pooler** instead (IPv4-friendly):
  1. In [Supabase Dashboard](https://supabase.com/dashboard) open your project.
  2. Click **Connect** (or **Project Settings → Database**).
  3. Under **Connection string**, choose **Session** (not “Direct”).
  4. Copy the URI. Replace `[YOUR-PASSWORD]` with your database password (if the password contains `@` or `#`, use `%40` for `@` and `%23` for `#`).
  5. Put that URI in `.env` as `DATABASE_URL`, then run `python manage.py migrate` again.
- **"Tenant or user not found"** on the pooler: The region in the URI is wrong. Use the **exact** Session URI from the dashboard (it includes the correct region, e.g. `aws-0-ap-southeast-1.pooler.supabase.com`).

**Why do I see "Unrestricted" in front of every table?**  
In the Supabase Table Editor, each table shows a **Row Level Security (RLS)** badge. "Unrestricted" means RLS is either **disabled** for that table or no restrictive policies are applied, so all rows are visible to the database role Supabase uses. Django connects with your project’s database user and can read/write all tables. This is normal when you use Supabase only as PostgreSQL and enforce access in your app (e.g. via Django REST API and JWT). If you later enable Supabase Auth or direct Postgres access from the client, you’d enable RLS and add policies per table; until then, "Unrestricted" is expected.

**Supabase Database Linter: "RLS Disabled in Public" or "Sensitive Columns Exposed" (e.g. `public.users` / password)?**  
Run the RLS script so only your backend role can access data (PostgREST/anon get no rows):

1. In Supabase go to **SQL Editor** → **New query**.
2. Paste the contents of **`supabase_enable_rls.sql`**.
3. If your `DATABASE_URL` uses a different role (e.g. pooler `postgres.PROJECT_REF`), set `backend_role` in the script to that role.
4. Click **Run**. RLS is enabled on all `public` tables with a policy for your backend role only; Django keeps working and the security linter is satisfied.

**Linter: "Duplicate Index" on bookings, reviews, trips, refresh_tokens, password_reset_tokens?**  
Either run **`supabase_drop_duplicate_indexes.sql`** once in the SQL Editor, or run Django migrations: `python manage.py migrate` (after pulling the latest code that removes redundant index definitions from the models).

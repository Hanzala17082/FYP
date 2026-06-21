# REHNUM — Demo accounts & passwords

Quick reference for testing. All accounts are real Supabase Auth users — log in at
http://localhost:3000 with the email and password below.

To reset and recreate this data:

```bash
cd REHNUM/frontend
npm run seed:demo
```

---

## Admin

| Field | Value |
|-------|-------|
| **Email** | `admin@rehnum.pk` |
| **Password** | `Rehnum@Admin1` |
| **Name** | REHNUM Admin |
| **Login page** | `/admin/login` |

The admin dashboard revenue is the **platform fees** collected from agencies
(verification subscriptions + per-trip listing fees), not traveler booking
payments. Open the **Pending Verifications** card to approve or reject agencies
that applied for the verified badge.

---

## Agency fees & verification

Agencies pay the platform two kinds of fees, both deducted from the **agency wallet**:

| Fee | Amount (PKR) | When |
|-----|--------------|------|
| Verified agency subscription | 10,000 / month | Opt-in at signup, then admin approval |
| Trip listing fee | 500 | Each time a trip is posted |

How it works:

- On the registration page, an agency can tick **"Apply for Verified Agency badge"**.
  The Rs 10,000 fee is charged immediately and the agency enters
  `pending_approval`. An admin must approve it before the verified badge shows.
- Posting a trip charges Rs 500 from the agency wallet. If the balance is too low,
  the trip is not created.
- In development there is no real payment gateway, so agencies can top up their
  wallet with demo funds from the **Earnings** tab (Add Rs. 10,000), and the
  verification fee at signup is auto-funded.

Seeded agencies start with a leftover demo balance of Rs 25,000 after their
verification and listing fees are deducted.

---

## Agency 1 — Alpine Hunza Tours

| Field | Value |
|-------|-------|
| **Email** | `hunza.tours@rehnum.pk` |
| **Password** | `Rehnum@Agency1` |
| **Location** | Islamabad, Pakistan |
| **Verified** | Yes |
| **Login page** | `/login` (select **Agency** role) |

### Trips (4 active)

| # | Trip | Destination | Price (PKR) | Days |
|---|------|-------------|-------------|------|
| 1 | Hunza Cherry Blossom Escape | Hunza | 65,000 | 6 |
| 2 | Khunjerab Pass Adventure | Hunza | 82,000 | 7 |
| 3 | Naltar Valley Snow Trip | Naltar | 54,000 | 4 |
| 4 | Phander Valley Hidden Gem | Phander | 71,000 | 6 |

---

## Agency 2 — Karakoram Expeditions

| Field | Value |
|-------|-------|
| **Email** | `karakoram@rehnum.pk` |
| **Password** | `Rehnum@Agency2` |
| **Location** | Skardu, Pakistan |
| **Verified** | Yes |
| **Login page** | `/login` (select **Agency** role) |

### Trips (4 active)

| # | Trip | Destination | Price (PKR) | Days |
|---|------|-------------|-------------|------|
| 1 | Skardu & Shangrila Lakes | Skardu | 78,000 | 7 |
| 2 | Deosai National Park Safari | Deosai | 95,000 | 5 |
| 3 | Fairy Meadows & Nanga Parbat | Fairy Meadows | 88,000 | 6 |
| 4 | Khaplu & Shyok Valley | Khaplu | 73,000 | 5 |

---

## Agency 3 — Swat Trails Co.

| Field | Value |
|-------|-------|
| **Email** | `swat.trails@rehnum.pk` |
| **Password** | `Rehnum@Agency3` |
| **Location** | Mingora, Pakistan |
| **Verified** | No |
| **Login page** | `/login` (select **Agency** role) |

### Trips (4 active)

| # | Trip | Destination | Price (PKR) | Days |
|---|------|-------------|-------------|------|
| 1 | Kalam Valley Getaway | Kalam | 42,000 | 4 |
| 2 | Malam Jabba Ski & Snow | Malam Jabba | 38,000 | 3 |
| 3 | Swat Heritage & Buddhist Trail | Swat | 46,000 | 4 |
| 4 | Gabin Jabba Forest Retreat | Gabin Jabba | 40,000 | 3 |

---

## Travelers

All travelers log in at `/login` (select **Traveler** role). Each has **PKR 500,000** wallet balance.

| Name | Email | Password | City | CNIC |
|------|-------|----------|------|------|
| Sara Khan | `sara.khan@rehnum.pk` | `Rehnum@Travel1` | Lahore | 35202-1234567-1 |
| Ali Ahmed | `ali.ahmed@rehnum.pk` | `Rehnum@Travel2` | Karachi | 42101-7654321-9 |
| Fatima Riaz | `fatima.riaz@rehnum.pk` | `Rehnum@Travel3` | Peshawar | 61101-9876543-2 |
| Usman Malik | `usman.malik@rehnum.pk` | `Rehnum@Travel4` | Rawalpindi | 37405-4567890-3 |

---

## Pre-made bookings (for chat testing)

| Traveler | Email | Password | Booked trip | Status |
|----------|-------|----------|-------------|--------|
| Sara Khan | `sara.khan@rehnum.pk` | `Rehnum@Travel1` | Hunza Cherry Blossom Escape | Confirmed |
| Ali Ahmed | `ali.ahmed@rehnum.pk` | `Rehnum@Travel2` | Skardu & Shangrila Lakes | Confirmed |

Log in as Sara or Ali to access group chat for those trips.

---

## Copy-paste cheat sheet

```
ADMIN
  admin@rehnum.pk          /  Rehnum@Admin1

AGENCIES
  hunza.tours@rehnum.pk    /  Rehnum@Agency1   (Alpine Hunza Tours)
  karakoram@rehnum.pk      /  Rehnum@Agency2   (Karakoram Expeditions)
  swat.trails@rehnum.pk    /  Rehnum@Agency3   (Swat Trails Co.)

TRAVELERS
  sara.khan@rehnum.pk       /  Rehnum@Travel1
  ali.ahmed@rehnum.pk       /  Rehnum@Travel2
  fatima.riaz@rehnum.pk     /  Rehnum@Travel3
  usman.malik@rehnum.pk     /  Rehnum@Travel4
```

---

## Notes

- Pick the correct **role** on the login page (Traveler / Agency / Admin).
- Trips appear on `/trips` when seeded with `status: active`.
- Before using the fee/verification features, run `supabase/platform_fees.sql` in the Supabase SQL Editor (adds the `verification_status` columns, the `platform_fees` table, and the fee RPCs). Run it after `supabase/wallet_booking_rpc.sql`.
- If Explore is empty while logged out, run `supabase/scripts/ensure_explore_anon_read.sql` in Supabase SQL Editor.
- If login fails with a profile/RLS error, run `supabase/scripts/fix_login_rls.sql` in Supabase SQL Editor, or restart the frontend after pulling the latest code (profile loads via `/api/auth/me`).

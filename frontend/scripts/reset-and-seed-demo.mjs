/**
 * DESTRUCTIVE: wipes ALL Supabase app data + auth users + avatar storage,
 * then seeds a fresh, loginable demo dataset (1 admin, 3 agencies, 4 travelers,
 * 12 active trips with images/highlights/schedules, and 2 confirmed bookings).
 *
 * Usage (from REHNUM/frontend):
 *   node scripts/reset-and-seed-demo.mjs --confirm
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Without --confirm the script prints what it would do and exits.
 *
 * Credentials are documented in REHNUM/DEMO_USERS.md.
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile(resolve(root, '.env.local'))
loadEnvFile(resolve(root, '.env'))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const confirmed = process.argv.includes('--confirm')

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const NIL = '00000000-0000-0000-0000-000000000000'
const now = () => new Date().toISOString()

// Platform fee amounts (PKR) — keep in sync with frontend/config/fees.ts.
const VERIFICATION_FEE = 10000
const TRIP_LISTING_FEE = 500

// Tables deleted in FK-safe order (children before parents).
const WIPE_ORDER = [
  'chat_moderation_flags',
  'chat_messages',
  'chat_group_members',
  'chat_groups',
  'platform_fees',
  'wallet_transactions',
  'bookings',
  'reviews',
  'trip_schedule_activities',
  'trip_schedules',
  'trip_highlights',
  'trip_recreational_activities',
  'trips',
  'wallets',
  'traveler_profiles',
  'agencies',
  'refresh_tokens',
  'password_reset_tokens',
  'users',
]

async function wipeTable(name) {
  const { error } = await admin.from(name).delete().neq('id', NIL)
  if (error) {
    // Missing tables (e.g. token tables never created) are non-fatal.
    if (/does not exist|relation|schema cache/i.test(error.message)) {
      console.log(`  - ${name}: skipped (${error.message})`)
      return
    }
    throw new Error(`Failed wiping ${name}: ${error.message}`)
  }
  console.log(`  - ${name}: cleared`)
}

async function wipeAuthUsers() {
  let page = 1
  let deleted = 0
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw new Error(`Failed listing auth users: ${error.message}`)
    const users = data?.users ?? []
    if (users.length === 0) break
    for (const u of users) {
      const { error: delErr } = await admin.auth.admin.deleteUser(u.id)
      if (delErr) console.error(`  ! could not delete auth user ${u.email}: ${delErr.message}`)
      else deleted += 1
    }
    if (users.length < 200) break
    page += 1
  }
  console.log(`  - auth.users: deleted ${deleted}`)
}

async function wipeAvatars() {
  const { data: folders, error } = await admin.storage.from('avatars').list('', { limit: 1000 })
  if (error) {
    console.log(`  - avatars bucket: skipped (${error.message})`)
    return
  }
  const paths = []
  for (const entry of folders ?? []) {
    if (entry.id === null) {
      const { data: files } = await admin.storage.from('avatars').list(entry.name, { limit: 1000 })
      for (const f of files ?? []) paths.push(`${entry.name}/${f.name}`)
    } else {
      paths.push(entry.name)
    }
  }
  if (paths.length) {
    const { error: rmErr } = await admin.storage.from('avatars').remove(paths)
    if (rmErr) console.error(`  ! avatars remove: ${rmErr.message}`)
  }
  console.log(`  - avatars bucket: removed ${paths.length} object(s)`)
}

// ---------------------------------------------------------------------------
// Demo data definitions
// ---------------------------------------------------------------------------

const TRIP_IMG = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=80',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=900&q=80',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=900&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=80',
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=900&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=80',
  'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=900&q=80',
]

const ADMIN = {
  email: 'admin@rehnum.pk',
  password: 'Rehnum@Admin1',
  fullName: 'REHNUM Admin',
  city: 'Islamabad',
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
}

const AGENCIES = [
  {
    email: 'hunza.tours@rehnum.pk',
    password: 'Rehnum@Agency1',
    name: 'Alpine Hunza Tours',
    slug: 'alpine-hunza-tours',
    description:
      'Specialists in Hunza, Nagar and the Karakoram. We craft small-group journeys with local guides, cosy guesthouses and unforgettable mountain views. Reach us through the in-app chat to plan your trip.',
    location: 'Islamabad, Pakistan',
    city: 'Islamabad',
    logoUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=300&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80',
    verified: true,
    verificationStatus: 'approved',
    rating: 4.8,
    reviewCount: 124,
  },
  {
    email: 'karakoram@rehnum.pk',
    password: 'Rehnum@Agency2',
    name: 'Karakoram Expeditions',
    slug: 'karakoram-expeditions',
    description:
      'Adventure operator for Skardu, Deosai and the high glaciers. Trekking, jeep safaris and lakeside camping run by certified mountain leaders. Message us in-app for custom itineraries.',
    location: 'Skardu, Pakistan',
    city: 'Skardu',
    logoUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    verified: true,
    verificationStatus: 'approved',
    rating: 4.7,
    reviewCount: 98,
  },
  {
    email: 'swat.trails@rehnum.pk',
    password: 'Rehnum@Agency3',
    name: 'Swat Trails Co.',
    slug: 'swat-trails-co',
    description:
      'Family-friendly tours across Swat, Kalam and Malam Jabba. Comfortable transport, riverside hotels and seasonal snow trips. Connect via in-app chat to book your seats.',
    location: 'Mingora, Pakistan',
    city: 'Mingora',
    logoUrl: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    verified: false,
    verificationStatus: 'none',
    rating: 4.5,
    reviewCount: 61,
  },
]

const TRAVELERS = [
  {
    email: 'sara.khan@rehnum.pk',
    password: 'Rehnum@Travel1',
    fullName: 'Sara Khan',
    cnic: '35202-1234567-1',
    city: 'Lahore',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
  },
  {
    email: 'ali.ahmed@rehnum.pk',
    password: 'Rehnum@Travel2',
    fullName: 'Ali Ahmed',
    cnic: '42101-7654321-9',
    city: 'Karachi',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
  },
  {
    email: 'fatima.riaz@rehnum.pk',
    password: 'Rehnum@Travel3',
    fullName: 'Fatima Riaz',
    cnic: '61101-9876543-2',
    city: 'Peshawar',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
  },
  {
    email: 'usman.malik@rehnum.pk',
    password: 'Rehnum@Travel4',
    fullName: 'Usman Malik',
    cnic: '37405-4567890-3',
    city: 'Rawalpindi',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
  },
]

function img(...idx) {
  return idx.map((i) => TRIP_IMG[i % TRIP_IMG.length])
}

// 12 trips, 4 per agency (agency index 0..2).
const TRIPS = [
  // Agency 0 — Alpine Hunza Tours
  {
    agency: 0,
    title: 'Hunza Cherry Blossom Escape',
    destination: 'Hunza',
    price: 65000,
    durationDays: 6,
    images: img(0, 1, 2),
    tags: ['mountains', 'spring', 'photography'],
    short: 'Spring blossoms across Hunza and Nagar with views of Rakaposhi.',
    description:
      'Witness the pink-and-white cherry blossom season in Hunza Valley. This six-day journey covers Karimabad, Altit and Baltit forts, Attabad Lake and the Hopper Glacier viewpoint, with cosy guesthouse stays throughout.',
    highlights: ['Baltit & Altit Forts', 'Attabad Lake boating', 'Rakaposhi base viewpoint', 'Local cherry orchards'],
  },
  {
    agency: 0,
    title: 'Khunjerab Pass Adventure',
    destination: 'Hunza',
    price: 82000,
    durationDays: 7,
    images: img(3, 7, 5),
    tags: ['adventure', 'border', 'roadtrip'],
    short: 'Drive to the highest paved border crossing in the world.',
    description:
      'A high-altitude road journey from Hunza to the Pakistan-China border at Khunjerab Pass (4,693m). Includes Passu Cones, Sost and the Khunjerab National Park where marmots and ibex roam.',
    highlights: ['Khunjerab Pass 4,693m', 'Passu Cones', 'Khunjerab National Park wildlife', 'Sost border town'],
  },
  {
    agency: 0,
    title: 'Naltar Valley Snow Trip',
    destination: 'Naltar',
    price: 54000,
    durationDays: 4,
    images: img(7, 5, 0),
    tags: ['snow', 'lakes', 'winter'],
    short: 'Colourful Naltar lakes and pine forests by jeep.',
    description:
      'Escape to the alpine meadows and turquoise lakes of Naltar Valley. Jeep safari through pine forests, visit the famous Naltar ski slopes and the three coloured lakes.',
    highlights: ['Naltar coloured lakes', 'Pine forest jeep safari', 'Ski slope visit', 'Mountain village stay'],
  },
  {
    agency: 0,
    title: 'Phander Valley Hidden Gem',
    destination: 'Phander',
    price: 71000,
    durationDays: 6,
    images: img(8, 4, 1),
    tags: ['lakes', 'fishing', 'offbeat'],
    short: 'Trout fishing and golden meadows in the Ghizer district.',
    description:
      'Discover the serene Phander Valley with its blue-green river bends and trout-rich waters. A relaxed itinerary for those seeking quiet, untouched landscapes off the usual tourist trail.',
    highlights: ['Phander Lake', 'Trout fishing', 'Gupis riverside', 'Golden autumn meadows'],
  },
  // Agency 1 — Karakoram Expeditions
  {
    agency: 1,
    title: 'Skardu & Shangrila Lakes',
    destination: 'Skardu',
    price: 78000,
    durationDays: 7,
    images: img(1, 8, 9),
    tags: ['lakes', 'desert', 'culture'],
    short: 'Lower Kachura, Upper Kachura and the cold desert.',
    description:
      'Explore Skardu the gateway to the great peaks. Visit Shangrila (Lower Kachura) Lake, the deep Upper Kachura Lake, the Katpana cold desert and Kharpocho Fort overlooking the Indus.',
    highlights: ['Shangrila Resort lake', 'Upper Kachura Lake', 'Katpana cold desert', 'Kharpocho Fort'],
  },
  {
    agency: 1,
    title: 'Deosai National Park Safari',
    destination: 'Deosai',
    price: 95000,
    durationDays: 5,
    images: img(6, 5, 3),
    tags: ['wildlife', 'plateau', 'camping'],
    short: 'The Land of Giants — second highest plateau on earth.',
    description:
      'Camp on the Deosai Plains (4,114m), home to the Himalayan brown bear, golden marmots and a sea of summer wildflowers. Includes Sheosar Lake and a full day of wildlife spotting.',
    highlights: ['Sheosar Lake', 'Himalayan brown bear spotting', 'Wildflower plains', 'High-altitude camping'],
  },
  {
    agency: 1,
    title: 'Fairy Meadows & Nanga Parbat',
    destination: 'Fairy Meadows',
    price: 88000,
    durationDays: 6,
    images: img(5, 7, 2),
    tags: ['trekking', 'basecamp', 'iconic'],
    short: 'Trek to the base camp viewpoint of the Killer Mountain.',
    description:
      'Jeep to Tato then trek through pine forest to Fairy Meadows, with the towering 8,126m face of Nanga Parbat ahead. Optional day hike to Beyal Camp and the Nanga Parbat base camp viewpoint.',
    highlights: ['Fairy Meadows alpine camp', 'Nanga Parbat base camp view', 'Beyal Camp hike', 'Raikot bridge jeep track'],
  },
  {
    agency: 1,
    title: 'Khaplu & Shyok Valley',
    destination: 'Khaplu',
    price: 73000,
    durationDays: 5,
    images: img(2, 1, 4),
    tags: ['heritage', 'valley', 'culture'],
    short: 'Royal palaces and the emerald Shyok River.',
    description:
      'Travel east of Skardu to Khaplu, home to the restored Khaplu Palace and centuries-old wooden mosques. Follow the Shyok River through Ghanche to dramatic confluence viewpoints.',
    highlights: ['Khaplu Palace', 'Chaqchan Mosque', 'Shyok River drive', 'Saling village walk'],
  },
  // Agency 2 — Swat Trails Co.
  {
    agency: 2,
    title: 'Kalam Valley Getaway',
    destination: 'Kalam',
    price: 42000,
    durationDays: 4,
    images: img(4, 0, 8),
    tags: ['family', 'river', 'forest'],
    short: 'Riverside hotels and the pine forests of upper Swat.',
    description:
      'A relaxed family trip to Kalam in upper Swat. Visit Mahodand Lake by jeep, stroll the Ushu forest and enjoy riverside dining along the Swat River.',
    highlights: ['Mahodand Lake', 'Ushu pine forest', 'Swat River walk', 'Local trout lunch'],
  },
  {
    agency: 2,
    title: 'Malam Jabba Ski & Snow',
    destination: 'Malam Jabba',
    price: 38000,
    durationDays: 3,
    images: img(7, 5, 6),
    tags: ['snow', 'ski', 'winter'],
    short: 'Pakistan’s premier ski resort and chairlift rides.',
    description:
      'A short winter break at Malam Jabba, Pakistan’s top ski resort. Chairlift rides, beginner ski lessons, zipline and snow play with comfortable resort lodging.',
    highlights: ['Ski resort slopes', 'Chairlift ride', 'Zipline adventure', 'Snow play area'],
  },
  {
    agency: 2,
    title: 'Swat Heritage & Buddhist Trail',
    destination: 'Swat',
    price: 46000,
    durationDays: 4,
    images: img(2, 4, 0),
    tags: ['heritage', 'history', 'culture'],
    short: 'Gandhara stupas, museums and the green Swat plains.',
    description:
      'Trace the Gandharan Buddhist heritage of Swat, including the Butkara stupa, Swat Museum and the rock carvings of Jahanabad Buddha, with stays in Mingora and Saidu Sharif.',
    highlights: ['Butkara Stupa', 'Swat Museum', 'Jahanabad Buddha carving', 'Saidu Sharif gardens'],
  },
  {
    agency: 2,
    title: 'Gabin Jabba Forest Retreat',
    destination: 'Gabin Jabba',
    price: 40000,
    durationDays: 3,
    images: img(5, 4, 9),
    tags: ['offbeat', 'forest', 'camping'],
    short: 'Untouched meadows and dense forest above Swat.',
    description:
      'A peaceful retreat to the lesser-known Gabin Jabba plateau, reached by jeep through thick forest. Open meadows, mountain views and bonfire camping under clear skies.',
    highlights: ['Forest jeep track', 'Open meadow camp', 'Bonfire night', 'Sunrise viewpoint'],
  },
]

// ---------------------------------------------------------------------------
// Seeding helpers
// ---------------------------------------------------------------------------

async function createAuthUser({ email, password, fullName, role }) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })
  if (error) throw new Error(`createUser ${email}: ${error.message}`)
  const uid = data.user?.id
  if (!uid) throw new Error(`createUser ${email}: no user id returned`)
  return uid
}

async function insertUserRow({ uid, email, fullName, role, city, avatarUrl, isAdmin }) {
  const ts = now()
  const { error } = await admin.from('users').insert({
    id: uid,
    email,
    password: '!managed_by_supabase_auth',
    full_name: fullName,
    role,
    city: city ?? null,
    avatar_url: avatarUrl ?? null,
    is_email_verified: true,
    is_active: true,
    is_staff: !!isAdmin,
    is_superuser: !!isAdmin,
    last_login: null,
    created_at: ts,
    updated_at: ts,
  })
  if (error) throw new Error(`users insert ${email}: ${error.message}`)
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function seedAdmin() {
  const uid = await createAuthUser({ ...ADMIN, role: 'Admin' })
  await insertUserRow({
    uid,
    email: ADMIN.email,
    fullName: ADMIN.fullName,
    role: 'Admin',
    city: ADMIN.city,
    avatarUrl: ADMIN.avatarUrl,
    isAdmin: true,
  })
  console.log(`  - admin: ${ADMIN.email}`)
  return uid
}

async function seedAgency(a) {
  const uid = await createAuthUser({ email: a.email, password: a.password, fullName: a.name, role: 'Agency' })
  await insertUserRow({
    uid,
    email: a.email,
    fullName: a.name,
    role: 'Agency',
    city: a.city,
    avatarUrl: a.avatarUrl,
  })
  const ts = now()
  const agencyId = randomUUID()
  const { error } = await admin.from('agencies').insert({
    id: agencyId,
    user_id: uid,
    agency_name: a.name,
    agency_slug: `${a.slug}-${uid.slice(0, 8)}`,
    description: a.description,
    location: a.location,
    logo_url: a.logoUrl,
    rating: a.rating,
    review_count: a.reviewCount,
    verified: a.verified,
    verification_status: a.verificationStatus ?? 'none',
    verification_paid_until: a.verified
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null,
    created_at: ts,
    updated_at: ts,
  })
  if (error) throw new Error(`agencies insert ${a.email}: ${error.message}`)

  // Agency wallet starts at zero; platform fees + demo top-up are applied later.
  const walletId = randomUUID()
  const { error: wErr } = await admin.from('wallets').insert({
    id: walletId,
    user_id: uid,
    wallet_type: 'agency',
    balance: 0,
    currency: 'PKR',
    created_at: ts,
    updated_at: ts,
  })
  if (wErr) throw new Error(`agency wallet ${a.email}: ${wErr.message}`)

  console.log(`  - agency: ${a.email} (${a.name})`)
  return { uid, agencyId, walletId, verified: a.verified }
}

async function seedTraveler(t) {
  const uid = await createAuthUser({ email: t.email, password: t.password, fullName: t.fullName, role: 'Traveler' })
  await insertUserRow({
    uid,
    email: t.email,
    fullName: t.fullName,
    role: 'Traveler',
    city: t.city,
    avatarUrl: t.avatarUrl,
  })
  const ts = now()
  const { error } = await admin.from('traveler_profiles').insert({
    id: randomUUID(),
    user_id: uid,
    cnic: t.cnic,
    preferences: {},
    created_at: ts,
    updated_at: ts,
  })
  if (error) throw new Error(`traveler_profiles insert ${t.email}: ${error.message}`)

  // Fixed PKR 500,000 welcome balance for easy booking tests.
  const { error: rpcErr } = await admin.rpc('credit_wallet', {
    p_user_id: uid,
    p_amount: 500000,
    p_type: 'seed',
    p_description: 'Demo welcome balance',
    p_wallet_type: 'traveler',
  })
  if (rpcErr) throw new Error(`traveler wallet ${t.email}: ${rpcErr.message}`)

  console.log(`  - traveler: ${t.email} (${t.fullName})`)
  return uid
}

function futureDate(daysFromNow) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

async function seedTrip(trip, agencyId, startOffset) {
  const tripId = randomUUID()
  const slug = `${slugify(trip.title)}-${tripId.slice(0, 8)}`
  const startDate = futureDate(startOffset)
  const endDate = futureDate(startOffset + trip.durationDays)
  const ts = now()

  const { error } = await admin.from('trips').insert({
    id: tripId,
    agency_id: agencyId,
    title: trip.title,
    slug,
    description: trip.description,
    short_description: trip.short.slice(0, 500),
    destination: trip.destination,
    price: trip.price,
    duration_days: trip.durationDays,
    images: trip.images,
    rating: 0,
    review_count: 0,
    available_dates: [startDate],
    start_date: startDate,
    end_date: endDate,
    status: 'active',
    tags: trip.tags,
    created_at: ts,
    updated_at: ts,
  })
  if (error) throw new Error(`trips insert ${trip.title}: ${error.message}`)

  let sort = 0
  for (const text of trip.highlights) {
    const { error: hErr } = await admin.from('trip_highlights').insert({
      id: randomUUID(),
      trip_id: tripId,
      text,
      sort_order: sort++,
    })
    if (hErr) throw new Error(`highlight ${trip.title}: ${hErr.message}`)
  }

  // Two-day sample schedule with activities for the detail page.
  const schedule = [
    {
      day: 1,
      title: 'Arrival & Orientation',
      activities: [
        { time: '09:00:00', activity: `Departure towards ${trip.destination}` },
        { time: '16:00:00', activity: 'Check-in and welcome briefing' },
        { time: '19:30:00', activity: 'Group dinner' },
      ],
    },
    {
      day: 2,
      title: `Exploring ${trip.destination}`,
      activities: [
        { time: '08:00:00', activity: 'Breakfast' },
        { time: '09:30:00', activity: trip.highlights[0] ?? 'Guided sightseeing' },
        { time: '14:00:00', activity: trip.highlights[1] ?? 'Local exploration' },
      ],
    },
  ]
  for (const s of schedule) {
    const schId = randomUUID()
    const { error: sErr } = await admin.from('trip_schedules').insert({
      id: schId,
      trip_id: tripId,
      day: s.day,
      date: futureDate(startOffset + s.day - 1),
      title: s.title,
    })
    if (sErr) throw new Error(`schedule ${trip.title}: ${sErr.message}`)
    for (const act of s.activities) {
      const { error: aErr } = await admin.from('trip_schedule_activities').insert({
        id: randomUUID(),
        schedule_id: schId,
        time: act.time,
        activity: act.activity,
      })
      if (aErr) throw new Error(`activity ${trip.title}: ${aErr.message}`)
    }
  }

  const recreational = [
    { name: 'Photography Walk', description: 'Guided sunrise photography session.', duration: '2 hours', included: true, additionalCost: null },
    { name: 'Bonfire Evening', description: 'Music and barbecue around the campfire.', duration: '3 hours', included: true, additionalCost: null },
    { name: 'Local Cultural Tour', description: 'Visit nearby villages and craft markets.', duration: 'Half day', included: false, additionalCost: 3500 },
  ]
  let rSort = 0
  for (const r of recreational) {
    const { error: rErr } = await admin.from('trip_recreational_activities').insert({
      id: randomUUID(),
      trip_id: tripId,
      name: r.name,
      description: r.description,
      duration: r.duration,
      included: r.included,
      additional_cost: r.additionalCost,
      sort_order: rSort++,
    })
    if (rErr) throw new Error(`recreational ${trip.title}: ${rErr.message}`)
  }

  return { tripId, startDate, endDate, price: trip.price }
}

// Records the platform fees agencies pay: verification subscription (verified
// agencies) + a listing fee per trip. Also tops up each agency wallet with demo
// funds so balances stay positive after the fees are deducted.
async function seedPlatformFees(agencyRefs, seededTrips) {
  const LEFTOVER_BALANCE = 25000

  for (let i = 0; i < agencyRefs.length; i++) {
    const ref = agencyRefs[i]
    const tripsForAgency = seededTrips.filter((t) => t.agency === i)
    const verificationFee = ref.verified ? VERIFICATION_FEE : 0
    const listingTotal = tripsForAgency.length * TRIP_LISTING_FEE
    const topUp = verificationFee + listingTotal + LEFTOVER_BALANCE

    const txns = [
      {
        id: randomUUID(),
        wallet_id: ref.walletId,
        type: 'topup',
        amount: topUp,
        description: 'Demo top-up',
        booking_id: null,
        created_at: now(),
      },
    ]
    const fees = []

    if (ref.verified) {
      txns.push({
        id: randomUUID(),
        wallet_id: ref.walletId,
        type: 'debit',
        amount: -VERIFICATION_FEE,
        description: 'Verified agency fee',
        booking_id: null,
        created_at: now(),
      })
      fees.push({
        id: randomUUID(),
        agency_id: ref.agencyId,
        trip_id: null,
        fee_type: 'verification',
        amount: VERIFICATION_FEE,
        created_at: now(),
      })
    }

    for (const t of tripsForAgency) {
      txns.push({
        id: randomUUID(),
        wallet_id: ref.walletId,
        type: 'debit',
        amount: -TRIP_LISTING_FEE,
        description: 'Trip listing fee',
        booking_id: null,
        created_at: now(),
      })
      fees.push({
        id: randomUUID(),
        agency_id: ref.agencyId,
        trip_id: t.tripId,
        fee_type: 'trip_listing',
        amount: TRIP_LISTING_FEE,
        created_at: now(),
      })
    }

    const { error: txErr } = await admin.from('wallet_transactions').insert(txns)
    if (txErr) throw new Error(`agency wallet txns ${ref.agencyId}: ${txErr.message}`)

    if (fees.length > 0) {
      const { error: feeErr } = await admin.from('platform_fees').insert(fees)
      if (feeErr) throw new Error(`platform fees ${ref.agencyId}: ${feeErr.message}`)
    }

    const { error: balErr } = await admin
      .from('wallets')
      .update({ balance: LEFTOVER_BALANCE, updated_at: now() })
      .eq('id', ref.walletId)
    if (balErr) throw new Error(`agency wallet balance ${ref.agencyId}: ${balErr.message}`)
  }
}

async function seedBooking(travelerId, trip) {
  const ts = now()
  const total = trip.price // 1 traveler
  const { error } = await admin.from('bookings').insert({
    id: randomUUID(),
    trip_id: trip.tripId,
    traveler_id: travelerId,
    start_date: trip.startDate,
    end_date: trip.endDate,
    number_of_travelers: 1,
    status: 'confirmed',
    special_requests: 'Window seat preferred.',
    total_amount: total,
    payment_status: 'paid',
    agency_payout_status: 'pending',
    created_at: ts,
    updated_at: ts,
  })
  if (error) throw new Error(`booking insert: ${error.message}`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nTarget Supabase project: ${url}`)
  console.log('This will DELETE all app data, all auth users, and all avatar files,')
  console.log('then seed 1 admin, 3 agencies, 4 travelers, 12 trips and 2 bookings.\n')

  if (!confirmed) {
    console.log('Dry run: pass --confirm to actually wipe and seed.')
    console.log('  node scripts/reset-and-seed-demo.mjs --confirm\n')
    process.exit(0)
  }

  console.log('Phase 1 — Wiping existing data...')
  for (const table of WIPE_ORDER) await wipeTable(table)
  await wipeAuthUsers()
  await wipeAvatars()

  console.log('\nPhase 2 — Seeding demo data...')
  await seedAdmin()

  const agencyRefs = []
  for (const a of AGENCIES) agencyRefs.push(await seedAgency(a))

  const travelerIds = []
  for (const t of TRAVELERS) travelerIds.push(await seedTraveler(t))

  console.log('  - seeding trips...')
  const seededTrips = []
  let offset = 7
  for (const trip of TRIPS) {
    const ref = await seedTrip(trip, agencyRefs[trip.agency].agencyId, offset)
    seededTrips.push({ ...ref, agency: trip.agency, title: trip.title })
    offset += 3
  }
  console.log(`  - trips: ${seededTrips.length} active`)

  await seedPlatformFees(agencyRefs, seededTrips)
  console.log('  - platform fees: verification + per-trip listing recorded')

  // Two confirmed bookings -> DB trigger creates chat groups.
  const bookingTripA = seededTrips.find((t) => t.agency === 0)
  const bookingTripB = seededTrips.find((t) => t.agency === 1)
  if (bookingTripA) await seedBooking(travelerIds[0], bookingTripA)
  if (bookingTripB) await seedBooking(travelerIds[1], bookingTripB)
  console.log(`  - bookings: 2 confirmed (chat groups created via trigger)`)

  console.log('\nDone. Demo data is ready. See REHNUM/DEMO_USERS.md for logins.\n')
}

main().catch((e) => {
  console.error('\nSeed failed:', e.message)
  process.exit(1)
})

# Component Library Documentation

## Overview

This document describes all reusable components in the Tripster frontend. All components are designed to be conditionally styled and highly reusable.

## UI Components

### StatusBadge
Displays status badges with different variants (pending, confirmed, reviewing, etc.)

```tsx
<StatusBadge status="pending" size="md" />
<StatusBadge status="confirmed" size="sm" />
<StatusBadge status="trending" size="lg" />
```

**Props:**
- `status`: 'pending' | 'confirmed' | 'reviewing' | 'cancelled' | 'completed' | 'trending' | 'approved' | 'rejected'
- `size`: 'sm' | 'md' | 'lg'
- `className`: Additional classes

### Avatar
Circular avatar component with optional status indicator

```tsx
<Avatar src="/user.jpg" name="John Doe" size="md" status="online" />
<Avatar name="Jane Smith" size="lg" />
```

**Props:**
- `src`: Image URL
- `name`: User name (for initials fallback)
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `status`: 'online' | 'offline' | 'away' | 'busy'
- `alt`: Alt text
- `fallback`: Fallback text if no image/name

### RoundedBox
Reusable rounded container with multiple variants

```tsx
<RoundedBox variant="default" rounded="lg" padding="md" shadow="sm">
  Content
</RoundedBox>
```

**Props:**
- `variant`: 'default' | 'dark' | 'glass' | 'light' | 'outline'
- `rounded`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `shadow`: 'none' | 'sm' | 'md' | 'lg' | 'xl'

### StatCard
Dashboard statistics card

```tsx
<StatCard
  title="Total Revenue"
  value="$124,500"
  subtitle="vs. last month"
  trend={{ value: "+12%", isPositive: true }}
  icon={<span className="material-symbols-outlined">payments</span>}
/>
```

**Props:**
- `title`: Card title
- `value`: Main value (string or number)
- `subtitle`: Optional subtitle
- `icon`: Optional icon element
- `trend`: Optional trend object
- `variant`: 'default' | 'highlight'

### IconButton
Circular icon button with badge support

```tsx
<IconButton
  icon={<span className="material-symbols-outlined">notifications</span>}
  variant="default"
  size="md"
  badge={true}
/>
```

**Props:**
- `icon`: ReactNode icon
- `variant`: 'default' | 'primary' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `badge`: number | boolean
- All standard button props

### AlertBox
Alert/notification box component

```tsx
<AlertBox
  title="Approval Required"
  message="Your business trip requires manager approval."
  variant="info"
  icon={<span className="material-symbols-outlined">verified_user</span>}
  action={{ label: "Review Details", onClick: handleReview }}
/>
```

**Props:**
- `title`: Alert title
- `message`: Alert message
- `icon`: Optional icon
- `variant`: 'info' | 'warning' | 'success' | 'error'
- `action`: Optional action button

### ImageCard
Card with image, used for wishlist items

```tsx
<ImageCard
  image="/bali.jpg"
  title="Bali Retreat"
  subtitle="Est. $1,200"
  imageHeight="md"
/>

<ImageCard variant="add" onClick={handleAdd} />
```

**Props:**
- `image`: Image URL
- `title`: Card title
- `subtitle`: Optional subtitle
- `overlay`: Optional overlay content
- `variant`: 'default' | 'wishlist' | 'add'
- `imageHeight`: 'sm' | 'md' | 'lg'
- `onClick`: Click handler

### TripCard
Trip listing card component

```tsx
<TripCard
  id="1"
  title="Tech Conference 2024"
  agency={{ name: "Global Corp Travel" }}
  startDate="Oct 12"
  endDate="Oct 16"
  duration={4}
  price={1250}
  image="/trip.jpg"
  badge={{ text: "Company Approved", status: "approved" }}
/>
```

**Props:**
- `id`: Trip ID
- `title`: Trip title
- `agency`: Agency object
- `startDate`, `endDate`: Date strings
- `duration`: Number of days
- `price`: Price in USD
- `image`: Image URL
- `badge`: Optional badge

### BookingCard
Booking request card

```tsx
<BookingCard
  id="1"
  traveler={{
    name: "Sarah Jenkins",
    avatar: "/avatar.jpg",
    status: "online"
  }}
  trip={{
    destination: "Bali Retreat",
    dates: "Oct 12-19"
  }}
  status="pending"
  timeAgo="2h ago"
  onClick={handleClick}
/>
```

**Props:**
- `id`: Booking ID
- `traveler`: Traveler object with name, avatar, status
- `trip`: Trip object with destination and dates
- `status`: Booking status
- `timeAgo`: Time string
- `onClick`: Click handler

### ActionButton
Quick action button for grids

```tsx
<ActionButton
  icon="search"
  label="Search"
  variant="default"
  size="md"
  onClick={handleSearch}
/>
```

**Props:**
- `icon`: Material icon name
- `label`: Button label
- `variant`: 'default' | 'primary'
- `size`: 'sm' | 'md' | 'lg'

### QuickActionGrid
Grid of action buttons

```tsx
<QuickActionGrid
  actions={[
    { icon: "search", label: "Search", onClick: handleSearch },
    { icon: "airplane_ticket", label: "My Trips", onClick: handleTrips },
  ]}
  columns={4}
/>
```

**Props:**
- `actions`: Array of action objects
- `columns`: 2 | 3 | 4

### SectionHeader
Section header with optional action link

```tsx
<SectionHeader
  title="Upcoming Trips"
  action={{ label: "See all", href: "/trips" }}
/>
```

**Props:**
- `title`: Section title
- `action`: Optional action link

### PastTripItem
Past trip list item

```tsx
<PastTripItem
  image="/berlin.jpg"
  title="Berlin Conference"
  dates="Sept 14 - Sept 18, 2023"
  onViewReceipt={handleReceipt}
/>
```

**Props:**
- `image`: Image URL
- `title`: Trip title
- `dates`: Date string
- `onViewReceipt`: Optional handler

## Layout Components

### Header
Page header component

```tsx
<Header
  title="Tripster"
  subtitle="Agency Dashboard"
  variant="light"
  rightAction={<CustomButton />}
/>
```

**Props:**
- `title`: Header title
- `subtitle`: Optional subtitle
- `showLogo`: Show logo instead of title
- `variant`: 'light' | 'dark'
- `rightAction`: Custom right action element

### BottomNavigation
Bottom navigation bar

```tsx
<BottomNavigation
  items={[
    { href: "/", icon: "home", label: "Home" },
    { href: "/trips", icon: "work_history", label: "Trips" },
  ]}
  variant="default"
/>
```

**Props:**
- `items`: Array of navigation items
- `variant`: 'default' | 'agency'

### Logo
Logo component

```tsx
<Logo variant="light" showTagline={true} />
```

**Props:**
- `variant`: 'light' | 'dark'
- `showTagline`: Show "Travel Smarter" tagline

## Usage Best Practices

1. **Always use shared components** instead of creating new ones
2. **Use conditional styling** via props rather than custom CSS
3. **Compose components** to build complex UIs
4. **Follow the design system** - use predefined variants and sizes
5. **Keep components focused** - one responsibility per component

## Component Composition Examples

### Dashboard Stats
```tsx
<div className="grid grid-cols-2 gap-4">
  <StatCard title="Revenue" value="$124,500" trend={{ value: "+12%", isPositive: true }} />
  <StatCard title="Bookings" value="84" />
</div>
```

### Booking List
```tsx
<div className="flex flex-col gap-1">
  {bookings.map(booking => (
    <BookingCard key={booking.id} {...booking} />
  ))}
</div>
```

### Quick Actions
```tsx
<QuickActionGrid
  actions={[
    { icon: "search", label: "Search", onClick: () => {} },
    { icon: "airplane_ticket", label: "My Trips", onClick: () => {} },
  ]}
/>
```

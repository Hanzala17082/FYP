import { redirect } from 'next/navigation'

export default function TravelerDashboardPage() {
  // Traveler dashboard is now unified at /dashboard
  // Keep this route as an alias so old links still work.
  redirect('/dashboard')
}

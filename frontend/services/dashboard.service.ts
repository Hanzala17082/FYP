import { apiClient } from '@/shared/lib/api-client'
import { BookingDTO } from '@/types/api/bookings.types'
import { TripDTO, AgencyDTO } from '@/types/api/trips.types'
import { UserDTO } from '@/types/api/auth.types'

export interface TravelerDashboardStats {
  totalBookings: number
  upcomingCount: number
  pastCount: number
}

export interface TravelerDashboardResponse {
  stats: TravelerDashboardStats
  upcomingBookings: BookingDTO[]
  pastBookings: BookingDTO[]
}

export interface AgencyDashboardStats {
  totalTrips: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
}

export interface AgencyDashboardResponse {
  stats: AgencyDashboardStats
  recentBookings: BookingDTO[]
  agency: AgencyDTO
}

export interface AdminDashboardStats {
  totalUsers: number
  totalAgencies: number
  totalTrips: number
  totalBookings: number
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats
  recentUsers: UserDTO[]
  recentTrips: TripDTO[]
  recentAgencies: AgencyDTO[]
}

export const dashboardService = {
  getTravelerDashboard: async () => {
    const res = await apiClient.get<TravelerDashboardResponse>('/dashboard/traveler')
    return res.data
  },

  getAgencyDashboard: async () => {
    const res = await apiClient.get<AgencyDashboardResponse>('/dashboard/agency')
    return res.data
  },

  getAdminDashboard: async () => {
    const res = await apiClient.get<AdminDashboardResponse>('/dashboard/admin')
    return res.data
  },
}

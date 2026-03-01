/** Trip API types. Data from API → Supabase. */
export interface TripDTO {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  destination: string
  price: number
  duration: number
  images: string[]
  agency: AgencyDTO
  rating: number
  reviewCount: number
  availableDates: string[]
  startDate: string
  endDate: string
  status: 'active' | 'pending' | 'completed' | 'cancelled'
  tags: string[]
  createdAt: string
  updatedAt: string
  highlights?: string[]
  schedule?: TripScheduleDTO[]
  recreationalActivities?: RecreationalActivityDTO[]
}

export interface TripListResponseDTO {
  trips: TripDTO[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TripFiltersDTO {
  destination?: string
  startDate?: string
  endDate?: string
  minPrice?: number
  maxPrice?: number
  duration?: number
  agencyId?: string
  sortBy?: 'price' | 'date' | 'rating' | 'popularity'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateTripRequestDTO {
  title: string
  description: string
  shortDescription: string
  destination: string
  price: number
  duration: number
  images: string[]
  availableDates: string[]
  startDate: string
  endDate: string
  tags: string[]
  highlights?: string[]
  schedule?: TripScheduleDTO[]
  recreationalActivities?: RecreationalActivityDTO[]
}

export interface UpdateTripRequestDTO extends Partial<CreateTripRequestDTO> {
  id: string
  status?: 'active' | 'pending' | 'completed' | 'cancelled'
}

export interface TripScheduleDTO {
  day: number
  date: string
  title: string
  activities: ActivityDTO[]
}

export interface ActivityDTO {
  time: string
  activity: string
}

export interface RecreationalActivityDTO {
  name: string
  description: string
  duration: string
  included: boolean
  additionalCost?: number
}

export interface AgencyDTO {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  rating: number
  reviewCount: number
  location: string
  verified: boolean
  avatar?: string
}

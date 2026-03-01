/** DTOs aligned with Django API (camelCase). */

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: 'Traveler' | 'Agency' | 'Admin';
  city?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

export interface AgencyDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  rating: number;
  reviewCount: number;
  location: string;
  verified: boolean;
  avatar?: string;
}

export interface TripDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  destination: string;
  price: number;
  duration: number;
  images: string[];
  agency: AgencyDTO;
  rating: number;
  reviewCount: number;
  availableDates: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TripListResponseDTO {
  trips: TripDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { User } from '@/types/entities/user.entity'

export interface DummyUser extends User {
  password: string
}

/**
 * Dummy users for testing authentication flow
 * TODO: Replace with actual database integration
 */
export const dummyUsers: DummyUser[] = [
  // Admin Users
  {
    id: 'admin-1',
    email: 'admin@tripster.com',
    fullName: 'Admin User',
    role: 'Admin',
    password: 'admin123',
    city: 'New York',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=3B82F6&color=fff',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'admin-2',
    email: 'superadmin@tripster.com',
    fullName: 'Super Admin',
    role: 'Admin',
    password: 'superadmin123',
    city: 'San Francisco',
    avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=8B5CF6&color=fff',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },

  // Agency Users
  {
    id: 'agency-1',
    email: 'agency@globaltravels.com',
    fullName: 'Global Travels Inc',
    role: 'Agency',
    password: 'agency123',
    city: 'London',
    avatar: 'https://ui-avatars.com/api/?name=Global+Travels&background=10B981&color=fff',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'agency-2',
    email: 'contact@asiatours.com',
    fullName: 'Asia Tours',
    role: 'Agency',
    password: 'agency123',
    city: 'Tokyo',
    avatar: 'https://ui-avatars.com/api/?name=Asia+Tours&background=F59E0B&color=fff',
    createdAt: new Date('2024-02-05').toISOString(),
    updatedAt: new Date('2024-02-05').toISOString(),
  },
  {
    id: 'agency-3',
    email: 'info@luxuryescapes.com',
    fullName: 'Luxury Escapes',
    role: 'Agency',
    password: 'agency123',
    city: 'Dubai',
    avatar: 'https://ui-avatars.com/api/?name=Luxury+Escapes&background=EF4444&color=fff',
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString(),
  },
  {
    id: 'agency-4',
    email: 'hello@budgettravel.com',
    fullName: 'Budget Travel Co',
    role: 'Agency',
    password: 'agency123',
    city: 'Bangkok',
    avatar: 'https://ui-avatars.com/api/?name=Budget+Travel&background=6366F1&color=fff',
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date('2024-02-15').toISOString(),
  },

  // Traveler Users
  {
    id: 'traveler-1',
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    role: 'Traveler',
    password: 'traveler123',
    city: 'New York',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3B82F6&color=fff',
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date('2024-03-01').toISOString(),
  },
  {
    id: 'traveler-2',
    email: 'jane.smith@example.com',
    fullName: 'Jane Smith',
    role: 'Traveler',
    password: 'traveler123',
    city: 'Los Angeles',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=EC4899&color=fff',
    createdAt: new Date('2024-03-05').toISOString(),
    updatedAt: new Date('2024-03-05').toISOString(),
  },
  {
    id: 'traveler-3',
    email: 'mike.johnson@example.com',
    fullName: 'Mike Johnson',
    role: 'Traveler',
    password: 'traveler123',
    city: 'Chicago',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=14B8A6&color=fff',
    createdAt: new Date('2024-03-10').toISOString(),
    updatedAt: new Date('2024-03-10').toISOString(),
  },
  {
    id: 'traveler-4',
    email: 'sarah.williams@example.com',
    fullName: 'Sarah Williams',
    role: 'Traveler',
    password: 'traveler123',
    city: 'Miami',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=F97316&color=fff',
    createdAt: new Date('2024-03-15').toISOString(),
    updatedAt: new Date('2024-03-15').toISOString(),
  },
  {
    id: 'traveler-5',
    email: 'david.brown@example.com',
    fullName: 'David Brown',
    role: 'Traveler',
    password: 'traveler123',
    city: 'Seattle',
    avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=6366F1&color=fff',
    createdAt: new Date('2024-03-20').toISOString(),
    updatedAt: new Date('2024-03-20').toISOString(),
  },
]

/**
 * Find user by email and password
 */
export function findUserByCredentials(email: string, password: string, role?: 'Traveler' | 'Agency' | 'Admin'): DummyUser | null {
  const user = dummyUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )

  if (!user) return null

  // If role is specified, verify it matches
  if (role && user.role !== role) {
    return null
  }

  return user
}

/**
 * Find user by email only
 */
export function findUserByEmail(email: string): DummyUser | null {
  return dummyUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

/**
 * Get all users by role
 */
export function getUsersByRole(role: 'Traveler' | 'Agency' | 'Admin'): DummyUser[] {
  return dummyUsers.filter((u) => u.role === role)
}

/**
 * Convert DummyUser to User (remove password)
 */
export function toUser(dummyUser: DummyUser): User {
  const { password, ...user } = dummyUser
  return user
}

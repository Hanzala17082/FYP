/**
 * Dummy agency data with detailed profiles, ratings, and reviews
 * TODO: Replace with actual database integration
 */

export interface AgencyReview {
  id: string
  user: {
    name: string
    avatar?: string
  }
  rating: number
  comment: string
  date: string
  tripTitle?: string
}

export interface AgencyProfile {
  id: string
  name: string
  email: string
  verified: boolean
  avatar: string
  city: string
  country: string
  description: string
  specialties: string[]
  rating: number
  reviewCount: number
  tripsCount: number
  yearsExperience: number
  languages: string[]
  contact: {
    phone?: string
    website?: string
    address?: string
  }
  reviews: AgencyReview[]
  stats: {
    totalTrips: number
    totalTravelers: number
    responseRate: number
    responseTime: string
  }
}

export const dummyAgencies: AgencyProfile[] = [
  {
    id: 'agency-1',
    name: 'Global Travels Inc',
    email: 'agency@globaltravels.com',
    verified: true,
    avatar: 'https://ui-avatars.com/api/?name=Global+Travels&background=10B981&color=fff',
    city: 'London',
    country: 'United Kingdom',
    description:
      'Global Travels Inc is a premier travel agency specializing in corporate and luxury travel experiences. With over 15 years of experience, we curate exceptional journeys tailored to your needs.',
    specialties: ['Corporate Travel', 'Luxury Escapes', 'Business Conferences', 'Group Tours'],
    rating: 4.8,
    reviewCount: 124,
    tripsCount: 45,
    yearsExperience: 15,
    languages: ['English', 'French', 'Spanish', 'German'],
    contact: {
      phone: '+44 20 7123 4567',
      website: 'www.globaltravels.com',
      address: '123 Travel Street, London, UK',
    },
    stats: {
      totalTrips: 45,
      totalTravelers: 1200,
      responseRate: 98,
      responseTime: '< 2 hours',
    },
    reviews: [
      {
        id: '1',
        user: {
          name: 'Sarah Johnson',
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAtQvhVyGhF9vZ2gsk0k12yfZjV1oZtLzZ-UIRwC7O2kA_1CnL84yqN4ftXTib6f6aBfGO1OG7wLhddpC-l-wmrR_Tii_i_F9pcGhCN8mwO9RE95-e4aJ-PHyJmofmLaxf3ihyT0R7BU4nCj-lhB6p0g0kx-hno1eWq0yCT4LNRuKILXyFBKIWGhDM-B9FUuGE4_PfSLjFqlA_X9XHaz4UYKbONkatEm6R5uqz-YIda0WwyqPS-5KuUpewqj8m--XOBZEnQGTO0QDc',
        },
        rating: 5,
        comment:
          'Outstanding service! Global Travels organized our corporate conference flawlessly. Every detail was perfect, from transportation to accommodations. Highly recommend!',
        date: '2 weeks ago',
        tripTitle: 'Tech Conference 2024 - San Francisco',
      },
      {
        id: '2',
        user: {
          name: 'Michael Chen',
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuATYwzdYgoDurSA5EH6Pm04tANR6UPaa_aOVipElVmXyAgkCf4DF_fqxYhWUDLfFqdHsn07JHCSqpSb2DqcLvzruuNL_hoxCxAvaeFAndRVP789U07vC7mviQ96GGOxeT2p5S_Kx1XeheYnsHormkDpxC4zHE--WfkLa2Vnbl2GkbT5BaU5azS1ZivjD0wBZtLu_JJ6_6FXL_eUm5MxaBtUoKFXdTZqYby-hETTYruaCb6FX7sGTP2NiDoBk4n78yA4JmkLrpLS3PE',
        },
        rating: 5,
        comment:
          'Professional, responsive, and detail-oriented. They made our business trip to Tokyo seamless. The team was always available to help with any questions.',
        date: '1 month ago',
        tripTitle: 'Tokyo Business Conference',
      },
      {
        id: '3',
        user: {
          name: 'Emily Davis',
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDhCf_efRLPO2bQY0ZveeU6AMPr1d4FAfhALp7SU9CMjkhxHa6DVOh59KJSZS_msTrjRef96S0OCAUNIkBAhFV3UBTxUzwcSrNQcgo2hIz0-aDXG0I5vEqsni87c-lleXZsOWP-BUuaOpRzYCCnYzf2g8yNiHljxNz7eu5TjL9JNfMHFipaxGOONzg1oXGFMb6MtwNktsKuzDQptcaWJ1DPE_uPsp1AgpCnzCcrdfXYniovXGDWs48x5-P1dNKCBFRObZCcbCZuET0',
        },
        rating: 4,
        comment:
          'Great experience overall. The itinerary was well-planned and the accommodations were excellent. Minor communication delays but nothing major.',
        date: '2 months ago',
        tripTitle: 'European Adventure',
      },
      {
        id: '4',
        user: {
          name: 'David Kim',
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBzUsDXs7q9xlpRA5MQqiQ2l7826rinDU44Mrntu0P9mfbCY8ULA5qLYOlNHtKweEyQPBR35czzP2S3C7zcCmwhJ5KZAea43ZUUwOIcGGQ3vO8Bbjx69-7SrY8AJOA8aHxKsAyGVainntUTpd0pZQw1u6GWqg9XwNyIo6axrB35iW9Xqn1fwK459d4gKM6uRoklapacCDyusQGR-pIveDQon59K-I2JFLdHt5YOva_G7uqh2TlZN7o8rcyPe7m5eOxJvn4Os8Xy4fI',
        },
        rating: 5,
        comment:
          'Exceptional service! They handled everything from flights to hotel bookings. The team is knowledgeable and always goes the extra mile.',
        date: '3 months ago',
        tripTitle: 'London Business Summit',
      },
    ],
  },
]

/**
 * Find agency by ID
 */
export function findAgencyById(id: string): AgencyProfile | null {
  return dummyAgencies.find((a) => a.id === id) || null
}

/**
 * Find agency by email
 */
export function findAgencyByEmail(email: string): AgencyProfile | null {
  return dummyAgencies.find((a) => a.email.toLowerCase() === email.toLowerCase()) || null
}

/**
 * Get all agencies
 */
export function getAllAgencies(): AgencyProfile[] {
  return dummyAgencies
}

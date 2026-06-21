export interface SuggestedTripDTO {
  slug: string
  title: string
  destination: string
  price: number
  startDate: string
  endDate: string
}

export interface TripAssistantResponseDTO {
  reply: string
  suggestedTrips: SuggestedTripDTO[]
}

export interface TripAssistantTurn {
  role: 'user' | 'assistant'
  content: string
}

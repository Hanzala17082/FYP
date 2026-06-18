export type ChatGroupSection = 'upcoming' | 'past' | 'agency'

export interface ChatUserDTO {
  id: string
  fullName: string
  avatarUrl: string
  role: string
}

export interface ChatGroupDTO {
  id: string
  tripId: string
  title: string
  subtitle: string
  policyText: string
  memberRole: 'admin' | 'member'
  section: ChatGroupSection
  tripStartDate: string
  tripEndDate: string
  agencyName: string
}

export interface ChatMessageDTO {
  id: string
  groupId: string
  body: string
  createdAt: string
  sender: ChatUserDTO
}

export interface ChatGroupListResponseDTO {
  groups: ChatGroupDTO[]
}

export interface ChatMessageListResponseDTO {
  messages: ChatMessageDTO[]
  nextCursor: string | null
}

export interface UpdateChatPolicyRequestDTO {
  policyText?: string
  subtitle?: string
}

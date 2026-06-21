import type { ChatUserDTO } from '@/types/api/chat.types'

export type ModerationCategory = 'adult' | 'hate' | 'harassment' | 'violence'

export interface ModerationFlagDTO {
  id: string
  groupId: string
  groupTitle: string
  agencyId: string | null
  agencyName: string
  sender: ChatUserDTO
  messageExcerpt: string
  categories: Partial<Record<ModerationCategory, number>>
  provider: string
  status: 'pending' | 'reviewed'
  createdAt: string
}

export interface ModerationFlagListResponseDTO {
  flags: ModerationFlagDTO[]
}

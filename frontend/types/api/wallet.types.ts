export type WalletTransactionType = 'seed' | 'topup' | 'debit' | 'refund' | 'earning'

export interface WalletTransactionDTO {
  id: string
  type: WalletTransactionType
  amount: number
  description: string
  bookingId?: string
  createdAt: string
}

export interface WalletSummaryDTO {
  accountType: 'traveler' | 'agency'
  balance: number
  currency: string
  totalSpent: number
  upcomingPayments: number
  totalEarned?: number
  pendingEarnings?: number
  transactions: WalletTransactionDTO[]
}

export interface WalletApiResponse {
  ok: boolean
  data?: WalletSummaryDTO
  error?: string
}

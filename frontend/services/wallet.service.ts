import type { WalletSummaryDTO, WalletTransactionDTO } from '@/types/api/wallet.types'

async function parseJson<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'Request failed.')
  }
  return body as T
}

export const walletService = {
  getWallet: async (): Promise<WalletSummaryDTO> => {
    const res = await fetch('/api/wallet', { credentials: 'include' })
    const body = await parseJson<{ data: WalletSummaryDTO }>(res)
    return body.data
  },

  seedDemoBalance: async (amount = 10000): Promise<WalletSummaryDTO> => {
    const res = await fetch('/api/wallet/seed', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
    const body = await parseJson<{ data: WalletSummaryDTO }>(res)
    return body.data
  },
}

export type { WalletSummaryDTO, WalletTransactionDTO }

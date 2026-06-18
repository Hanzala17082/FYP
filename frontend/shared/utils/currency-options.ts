export type CurrencyCode =
  | 'PKR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AED'
  | 'SAR'
  | 'INR'
  | 'CAD'
  | 'AUD'
  | 'CNY'
  | 'TRY'

export interface CurrencyOption {
  code: CurrencyCode
  label: string
  symbol: string
  /** How many PKR equal 1 unit of this currency (approximate display rates). */
  pkrPerUnit: number
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'PKR', label: 'Pakistani Rupee', symbol: 'Rs.', pkrPerUnit: 1 },
  { code: 'USD', label: 'US Dollar', symbol: '$', pkrPerUnit: 280 },
  { code: 'EUR', label: 'Euro', symbol: '€', pkrPerUnit: 305 },
  { code: 'GBP', label: 'British Pound', symbol: '£', pkrPerUnit: 355 },
  { code: 'AED', label: 'UAE Dirham', symbol: 'AED', pkrPerUnit: 76 },
  { code: 'SAR', label: 'Saudi Riyal', symbol: 'SAR', pkrPerUnit: 75 },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', pkrPerUnit: 3.35 },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$', pkrPerUnit: 205 },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$', pkrPerUnit: 185 },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '¥', pkrPerUnit: 39 },
  { code: 'TRY', label: 'Turkish Lira', symbol: '₺', pkrPerUnit: 8.5 },
]

export const DEFAULT_CURRENCY: CurrencyCode = 'PKR'

const STORAGE_KEY = 'tripster_display_currency'

export function getCurrencyOption(code: CurrencyCode): CurrencyOption {
  return CURRENCY_OPTIONS.find((c) => c.code === code) ?? CURRENCY_OPTIONS[0]
}

export function loadStoredCurrency(userId?: string | null): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY
  const key = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
  const raw = localStorage.getItem(key) as CurrencyCode | null
  if (raw && CURRENCY_OPTIONS.some((c) => c.code === raw)) return raw
  return DEFAULT_CURRENCY
}

export function saveStoredCurrency(code: CurrencyCode, userId?: string | null): void {
  if (typeof window === 'undefined') return
  const key = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
  localStorage.setItem(key, code)
}

/** Convert an amount stored in PKR to the selected display currency. */
export function convertFromPkr(amountPkr: number, code: CurrencyCode): number {
  const opt = getCurrencyOption(code)
  if (code === 'PKR') return amountPkr
  return amountPkr / opt.pkrPerUnit
}

/** Convert display-currency amount to PKR (stored in database). */
export function convertToPkr(amount: number, code: CurrencyCode): number {
  const opt = getCurrencyOption(code)
  if (code === 'PKR') return amount
  return amount * opt.pkrPerUnit
}

export function formatMoneyInCurrency(amountPkr: number, code: CurrencyCode): string {
  const converted = convertFromPkr(amountPkr, code)
  const opt = getCurrencyOption(code)

  if (code === 'PKR') {
    return `Rs. ${Math.round(converted).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
  }

  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'INR' || code === 'PKR' ? 0 : 2,
    }).format(converted)
  } catch {
    return `${opt.symbol} ${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }
}

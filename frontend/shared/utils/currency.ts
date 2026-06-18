export const TRIP_PRICE_MIN_PKR = 20_000
export const TRIP_PRICE_MAX_PKR = 200_000

export function getWalletSeedBalance(): number {
  const raw = process.env.WALLET_SEED_BALANCE?.trim()
  if (raw) {
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return getRandomWalletSeedBalance()
}

export function getRandomWalletSeedBalance(): number {
  const min = Number(process.env.WALLET_SEED_MIN ?? 10_000_000)
  const max = Number(process.env.WALLET_SEED_MAX ?? 25_000_000)
  const lo = Number.isFinite(min) && min > 0 ? min : 10_000_000
  const hi = Number.isFinite(max) && max >= lo ? max : 25_000_000
  return Math.floor(Math.random() * (hi - lo + 1)) + lo
}

export function getWalletCurrency(): string {
  return process.env.WALLET_CURRENCY?.trim() || 'PKR'
}

export function formatPkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

/** Estimate per-person trip price in PKR from duration and destination. */
export function estimateTripPricePkr(durationDays: number, destination = ''): number {
  const days = Math.max(1, durationDays)
  const dest = destination.toLowerCase()

  const premium = [
    'dubai', 'europe', 'london', 'paris', 'usa', 'america', 'bahamas', 'maldives',
    'switzerland', 'tokyo', 'singapore', 'turkey', 'istanbul', 'bali', 'thailand',
  ]
  const adventure = [
    'hunza', 'skardu', 'gilgit', 'naran', 'swat', 'chitral', 'fairy', 'kaghan',
    'neelum', 'astore', 'deosai', 'kalash',
  ]
  const local = [
    'lahore', 'karachi', 'islamabad', 'murree', 'rawalpindi', 'multan', 'peshawar',
    'faisalabad', 'quetta', 'hyderabad', 'sialkot',
  ]

  let dailyRate = 9_000
  if (premium.some((k) => dest.includes(k))) dailyRate = 14_000
  else if (adventure.some((k) => dest.includes(k))) dailyRate = 11_000
  else if (local.some((k) => dest.includes(k))) dailyRate = 7_000

  const raw = dailyRate * days
  const rounded = Math.round(raw / 1_000) * 1_000
  return clampTripPricePkr(rounded)
}

export function clampTripPricePkr(price: number): number {
  if (!Number.isFinite(price)) return TRIP_PRICE_MIN_PKR
  return Math.min(TRIP_PRICE_MAX_PKR, Math.max(TRIP_PRICE_MIN_PKR, Math.round(price)))
}

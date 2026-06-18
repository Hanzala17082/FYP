/**
 * Randomize TRAVELER wallet balances only (PKR 10M–25M). Agency wallets are not touched.
 * Usage: node scripts/randomize-wallet-balances.mjs
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile(resolve(root, '.env.local'))
loadEnvFile(resolve(root, '.env'))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const min = Number(process.env.WALLET_SEED_MIN ?? 10_000_000)
const max = Number(process.env.WALLET_SEED_MAX ?? 25_000_000)

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function randomBalance() {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const { data: wallets, error } = await admin
  .from('wallets')
  .select('id, user_id, balance')
  .eq('wallet_type', 'traveler')

if (error) {
  console.error('Failed to load wallets:', error.message)
  process.exit(1)
}

if (!wallets?.length) {
  console.log('No traveler wallets found.')
  process.exit(0)
}

let updated = 0
for (const wallet of wallets) {
  const newBalance = randomBalance()
  const oldBalance = Number(wallet.balance)
  const { error: updateErr } = await admin
    .from('wallets')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', wallet.id)

  if (updateErr) {
    console.error(`Failed wallet ${wallet.id}:`, updateErr.message)
    continue
  }

  await admin.from('wallet_transactions').insert({
    id: crypto.randomUUID(),
    wallet_id: wallet.id,
    type: 'seed',
    amount: newBalance - oldBalance,
    description: 'Demo balance adjustment (10M–25M random)',
    booking_id: null,
    created_at: new Date().toISOString(),
  })

  console.log(`Traveler ${wallet.user_id}: Rs. ${oldBalance.toLocaleString()} → Rs. ${newBalance.toLocaleString()}`)
  updated += 1
}

console.log(`\nUpdated ${updated}/${wallets.length} traveler wallet(s). Agency wallets were skipped.`)

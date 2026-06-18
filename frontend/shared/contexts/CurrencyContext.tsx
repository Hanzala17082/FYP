'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/shared/contexts/AuthContext'
import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY,
  formatMoneyInCurrency,
  loadStoredCurrency,
  saveStoredCurrency,
  type CurrencyCode,
} from '@/shared/utils/currency-options'

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  /** Format a PKR-stored amount in the user's chosen display currency. */
  formatPrice: (amountPkr: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrencyState(loadStoredCurrency(user?.id))
  }, [user?.id])

  const setCurrency = useCallback(
    (code: CurrencyCode) => {
      setCurrencyState(code)
      saveStoredCurrency(code, user?.id)
    },
    [user?.id]
  )

  const formatPrice = useCallback(
    (amountPkr: number) => formatMoneyInCurrency(amountPkr, currency),
    [currency]
  )

  const value = useMemo(
    () => ({ currency, setCurrency, formatPrice }),
    [currency, setCurrency, formatPrice]
  )

  if (!mounted) {
    return (
      <CurrencyContext.Provider
        value={{
          currency: DEFAULT_CURRENCY,
          setCurrency: () => {},
          formatPrice: (amount) => formatMoneyInCurrency(amount, DEFAULT_CURRENCY),
        }}
      >
        {children}
      </CurrencyContext.Provider>
    )
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

export { CURRENCY_OPTIONS, type CurrencyCode }

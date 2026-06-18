'use client'

import { memo } from 'react'
import { useCurrency } from '@/shared/contexts/CurrencyContext'

function FormattedPriceInner({ amount }: { amount: number }) {
  const { formatPrice } = useCurrency()
  return <>{formatPrice(amount)}</>
}

export const FormattedPrice = memo(FormattedPriceInner)

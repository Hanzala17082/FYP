'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface CityAutocompleteProps {
  value: string
  onChange: (city: string) => void
  placeholder?: string
  required?: boolean
  inputClassName?: string
}

interface NominatimResult {
  display_name: string
  type?: string
  class?: string
  importance?: number
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    state?: string
    country?: string
  }
}

const CITY_PLACE_TYPES = new Set(['city', 'town', 'village', 'municipality', 'borough'])

function formatCityLabel(item: NominatimResult): string {
  const address = item.address
  const name =
    address?.city ||
    address?.town ||
    address?.municipality ||
    address?.village ||
    item.display_name.split(',')[0]?.trim()
  if (!name) return item.display_name
  const parts = [name]
  if (address?.state && address.state !== name) parts.push(address.state)
  if (address?.country) parts.push(address.country)
  return parts.join(', ')
}

function isCityLike(item: NominatimResult): boolean {
  if (item.class === 'place' && item.type && CITY_PLACE_TYPES.has(item.type)) {
    return true
  }
  if (item.class === 'boundary' && item.type === 'administrative') {
    return !!(item.address?.city || item.address?.town || item.address?.municipality)
  }
  return false
}

function cityMatchScore(label: string, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0

  const primary = label.split(',')[0]?.trim().toLowerCase() ?? ''
  if (primary === q) return 200
  if (primary.startsWith(q)) return 150
  if (primary.includes(q)) return 100

  const full = label.toLowerCase()
  if (full.includes(q)) return 50

  return 0
}

export function CityAutocomplete({
  value,
  onChange,
  placeholder = 'Search city…',
  required,
  inputClassName,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pickedFromList, setPickedFromList] = useState(!!value)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    setQuery(value)
    setPickedFromList(!!value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchCities = useCallback(async (term: string) => {
    const q = term.trim()
    if (q.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const requestId = ++requestIdRef.current
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        q,
        format: 'json',
        addressdetails: '1',
        limit: '15',
        dedupe: '1',
      })

      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          Accept: 'application/json',
        },
      })
      if (!res.ok) throw new Error('City search failed')

      const data = (await res.json()) as NominatimResult[]
      if (requestId !== requestIdRef.current) return

      const ranked = data
        .filter(isCityLike)
        .map((item) => ({
          label: formatCityLabel(item),
          score: cityMatchScore(formatCityLabel(item), q) + (item.importance ?? 0),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)

      const labels = Array.from(new Set(ranked.map((item) => item.label))).slice(0, 8)

      setSuggestions(labels)
      setIsOpen(labels.length > 0)
    } catch {
      if (requestId === requestIdRef.current) {
        setSuggestions([])
        setIsOpen(false)
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  const handleInputChange = (next: string) => {
    setQuery(next)
    setPickedFromList(false)
    onChange('')

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void searchCities(next)
    }, 350)
  }

  const selectCity = (city: string) => {
    setQuery(city)
    onChange(city)
    setPickedFromList(true)
    setIsOpen(false)
    setSuggestions([])
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        className={inputClassName}
        placeholder={placeholder}
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true)
        }}
        required={required}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
      />
      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none">
        {isLoading ? 'progress_activity' : 'location_on'}
      </span>

      {isOpen && suggestions.length > 0 && (
        <ul
          className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto rounded-none border border-slate-200 dark:border-white/20 bg-white dark:bg-slate-900 shadow-lg"
          role="listbox"
        >
          {suggestions.map((city) => (
            <li key={city}>
              <button
                type="button"
                role="option"
                className="w-full px-4 py-2.5 text-left text-sm text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectCity(city)}
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!pickedFromList && query.trim().length >= 2 && !isLoading && suggestions.length === 0 && (
        <p className="mt-1 ml-1 text-xs text-amber-600 dark:text-amber-400">
          No matching city found. Keep typing or pick a suggestion.
        </p>
      )}
    </div>
  )
}

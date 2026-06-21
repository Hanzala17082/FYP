'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { tripAssistantService } from '@/services/trip-assistant.service'
import { getErrorMessage } from '@/shared/utils/error-message'
import { useCurrency } from '@/shared/contexts/CurrencyContext'
import type { SuggestedTripDTO, TripAssistantTurn } from '@/types/api/assistant.types'

interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
  suggestedTrips?: SuggestedTripDTO[]
}

const WELCOME: AssistantMessage = {
  role: 'assistant',
  content:
    "Hi! I'm your Tripster assistant. Ask me things like \"Which trips are under Rs. 50,000?\" or \"What trips run in July?\" and I'll find the best matches for you.",
}

export function TripAssistant() {
  const { formatPrice } = useCurrency()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([WELCOME])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || sending) return
    setError('')
    setDraft('')

    const history: TripAssistantTurn[] = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(1) // drop the static welcome
      .map((m) => ({ role: m.role, content: m.content }))

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setSending(true)

    try {
      const res = await tripAssistantService.ask(text, history)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.reply, suggestedTrips: res.suggestedTrips },
      ])
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'The assistant is unavailable right now.')
      setError(msg)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, I ran into a problem: ${msg}` },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating toggle button (bottom-right) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close trip assistant' : 'Open trip assistant'}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-blue-600 transition-colors"
      >
        <span className="material-symbols-outlined text-[26px]">{open ? 'close' : 'forum'}</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[560px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-none overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-primary text-white shrink-0">
            <span className="material-symbols-outlined">smart_toy</span>
            <div className="min-w-0">
              <p className="font-semibold leading-tight">Tripster Assistant</p>
              <p className="text-xs text-white/80 leading-tight">Ask about trips, dates & budgets</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50 dark:bg-slate-900/60">
            {messages.map((msg, idx) => {
              const mine = msg.role === 'user'
              return (
                <div key={idx} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${mine ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                        mine
                          ? 'bg-primary text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {msg.suggestedTrips && msg.suggestedTrips.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.suggestedTrips.map((trip) => (
                          <Link
                            key={trip.slug}
                            href={`/trips/${trip.slug}`}
                            className="block text-left p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors"
                          >
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {trip.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {trip.destination} • {trip.startDate} – {trip.endDate}
                            </p>
                            <p className="text-xs font-semibold text-primary mt-0.5">
                              {formatPrice(trip.price)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {sending && (
              <div className="flex justify-start">
                <div className="inline-block px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-t border-red-200 dark:border-red-500/30">
              {error}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-2 flex gap-2 shrink-0">
            <input
              className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
              placeholder="Ask about trips…"
              value={draft}
              maxLength={500}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void handleSend()
                }
              }}
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={sending || !draft.trim()}
              className="flex items-center justify-center w-10 h-10 bg-primary text-white disabled:opacity-50 hover:bg-blue-600 transition-colors shrink-0"
              aria-label="Send"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

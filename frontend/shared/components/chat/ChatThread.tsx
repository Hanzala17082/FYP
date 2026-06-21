'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { Avatar, Button, RoundedBox } from '@/shared/components/ui'
import { chatService } from '@/services/chat.service'
import { getErrorMessage } from '@/shared/utils/error-message'
import type { ChatGroupDTO, ChatMessageDTO } from '@/types/api/chat.types'
import { useAuth } from '@/shared/contexts/AuthContext'

interface ChatThreadProps {
  group: ChatGroupDTO
  onBack?: () => void
  onPolicyUpdated?: (group: ChatGroupDTO) => void
}

export const ChatThread = memo(ChatThreadInner)

function ChatThreadInner({ group, onBack, onPolicyUpdated }: ChatThreadProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessageDTO[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [blockedNotice, setBlockedNotice] = useState('')
  const [editingPolicy, setEditingPolicy] = useState(false)
  const [policyText, setPolicyText] = useState(group.policyText)
  const [subtitle, setSubtitle] = useState(group.subtitle)
  const bottomRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const isAdmin = group.memberRole === 'admin'

  useEffect(() => {
    setPolicyText(group.policyText)
    setSubtitle(group.subtitle)
  }, [group.id, group.policyText, group.subtitle])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    chatService
      .getMessages(group.id)
      .then((res) => {
        if (!cancelled) setMessages(res.data?.messages ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load messages.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    chatService
      .createChatSocket(group.id, {
        onMessage: (msg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        },
        onBlocked: ({ reason }) => {
          setBlockedNotice(
            `Your message was blocked for ${reason}. Please keep the chat respectful.`
          )
        },
      })
      .then((ws) => {
        if (cancelled) {
          ws.close()
          return
        }
        wsRef.current = ws
      })
      .catch(() => {
        if (!cancelled) setError('Live connection unavailable.')
      })

    return () => {
      cancelled = true
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [group.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const body = draft.trim()
    if (!body || !wsRef.current) return
    setBlockedNotice('')
    setSending(true)
    chatService.sendMessage(wsRef.current, body)
    setDraft('')
    setSending(false)
  }

  const handleSavePolicy = async () => {
    try {
      const res = await chatService.updatePolicy(group.id, { policyText, subtitle })
      if (res.data) onPolicyUpdated?.(res.data)
      setEditingPolicy(false)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save policies.'))
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[420px]">
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-start gap-3">
        {onBack && (
          <button type="button" onClick={onBack} className="md:hidden mt-1 text-slate-500">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">{group.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle || group.subtitle}</p>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => setEditingPolicy((v) => !v)}>
            Policies
          </Button>
        )}
      </div>

      {policyText && !editingPolicy && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Group policies</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{policyText}</p>
        </div>
      )}

      {editingPolicy && isAdmin && (
        <RoundedBox padding="md" className="m-3 space-y-3">
          <label className="block text-xs font-semibold text-slate-500">Sub-heading</label>
          <input
            className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
          <label className="block text-xs font-semibold text-slate-500">Group policies</label>
          <textarea
            className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm min-h-[100px]"
            value={policyText}
            onChange={(e) => setPolicyText(e.target.value)}
            placeholder="Set rules for this trip group (like WhatsApp group description)..."
          />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => void handleSavePolicy()}>
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditingPolicy(false)}>
              Cancel
            </Button>
          </div>
        </RoundedBox>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading messages…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {messages.map((msg) => {
          const mine = msg.sender.id === user?.id
          return (
            <div key={msg.id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
              <Avatar src={msg.sender.avatarUrl} name={msg.sender.fullName} size="sm" />
              <div className={`max-w-[75%] ${mine ? 'text-right' : ''}`}>
                <p className="text-xs text-slate-500 mb-0.5">{mine ? 'You' : msg.sender.fullName}</p>
                <div
                  className={`inline-block px-3 py-2 text-sm ${
                    mine
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {blockedNotice && (
        <div className="mx-3 mb-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] mt-0.5">block</span>
          <span>{blockedNotice}</span>
        </div>
      )}

      <div className="border-t border-slate-200 dark:border-slate-800 p-3 flex gap-2">
        <input
          className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <Button variant="primary" disabled={sending || !draft.trim()} onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  )
}

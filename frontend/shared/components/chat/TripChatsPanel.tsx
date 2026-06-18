'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import { RoundedBox } from '@/shared/components/ui'
import { ChatGroupAccordion } from './ChatGroupAccordion'
import { ChatThread } from './ChatThread'
import { chatService } from '@/services/chat.service'
import { getErrorMessage } from '@/shared/utils/error-message'
import type { ChatGroupDTO } from '@/types/api/chat.types'
import { USER_ROLES } from '@/config/constants'
import { useAuth } from '@/shared/contexts/AuthContext'

interface TripChatsPanelProps {
  initialGroupId?: string | null
}

export const TripChatsPanel = memo(TripChatsPanelInner)

function TripChatsPanelInner({ initialGroupId }: TripChatsPanelProps) {
  const { user } = useAuth()
  const [groups, setGroups] = useState<ChatGroupDTO[]>([])
  const [selected, setSelected] = useState<ChatGroupDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileShowThread, setMobileShowThread] = useState(false)

  const loadGroups = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await chatService.getGroups()
      const list = res.data?.groups ?? []
      setGroups(list)
      if (initialGroupId) {
        const match = list.find((g) => g.id === initialGroupId)
        if (match) {
          setSelected(match)
          setMobileShowThread(true)
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load trip chats.'))
    } finally {
      setLoading(false)
    }
  }, [initialGroupId])

  useEffect(() => {
    void loadGroups()
  }, [loadGroups])

  const handleSelect = (group: ChatGroupDTO) => {
    setSelected(group)
    setMobileShowThread(true)
  }

  const handlePolicyUpdated = (updated: ChatGroupDTO) => {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
    setSelected(updated)
  }

  const isAgency = user?.role === USER_ROLES.AGENCY

  return (
    <RoundedBox padding="none" className="overflow-hidden min-h-[480px]">
      {loading && <p className="p-4 text-sm text-slate-500">Loading trip chats…</p>}
      {error && <p className="p-4 text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[480px]">
          <div className={`border-r border-slate-200 dark:border-slate-800 ${mobileShowThread ? 'hidden md:block' : 'block'}`}>
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">Trip Chats</h3>
              <p className="text-xs text-slate-500">Groups for confirmed bookings only</p>
            </div>
            <ChatGroupAccordion
              groups={groups}
              selectedGroupId={selected?.id ?? null}
              onSelect={handleSelect}
              isAgency={isAgency}
            />
          </div>

          <div className={`${mobileShowThread ? 'block' : 'hidden md:block'}`}>
            {selected ? (
              <ChatThread
                group={selected}
                onBack={() => setMobileShowThread(false)}
                onPolicyUpdated={handlePolicyUpdated}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-sm text-slate-500">
                Select a trip group to start chatting.
              </div>
            )}
          </div>
        </div>
      )}
    </RoundedBox>
  )
}

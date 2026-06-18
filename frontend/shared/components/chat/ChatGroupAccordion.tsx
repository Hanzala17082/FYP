'use client'

import { memo, useState } from 'react'
import { cn } from '@/shared/utils/cn'
import type { ChatGroupDTO, ChatGroupSection } from '@/types/api/chat.types'

const SECTION_LABELS: Record<ChatGroupSection, string> = {
  upcoming: 'Upcoming Trips',
  past: 'Past Trips',
  agency: 'My Trip Groups',
}

interface ChatGroupAccordionProps {
  groups: ChatGroupDTO[]
  selectedGroupId: string | null
  onSelect: (group: ChatGroupDTO) => void
  isAgency?: boolean
}

export const ChatGroupAccordion = memo(ChatGroupAccordionInner)

function ChatGroupAccordionInner({ groups, selectedGroupId, onSelect, isAgency }: ChatGroupAccordionProps) {
  const sections: ChatGroupSection[] = isAgency ? ['agency'] : ['upcoming', 'past']
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    upcoming: true,
    past: false,
    agency: true,
  })

  if (groups.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
        No trip chats yet. Book a trip and wait for agency confirmation to join a group.
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {sections.map((section) => {
        const sectionGroups = groups.filter((g) => g.section === section)
        if (sectionGroups.length === 0) return null
        const open = expanded[section] ?? true
        return (
          <div key={section}>
            <button
              type="button"
              onClick={() => setExpanded((prev) => ({ ...prev, [section]: !open }))}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <span className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                {SECTION_LABELS[section]}
              </span>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">
                {open ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {open && (
              <div className="pb-2">
                {sectionGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => onSelect(group)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-l-4 transition-colors',
                      selectedGroupId === group.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{group.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {group.subtitle} • {group.agencyName}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {group.tripStartDate} – {group.tripEndDate}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

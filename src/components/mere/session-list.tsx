'use client'

import { useState } from 'react'
import { PlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface Session {
  id: string
  title: string
  timestamp: string
  isActive: boolean
}

const mockSessions: Session[] = [
  {
    id: '1',
    title: 'Research on AI Memory Systems',
    timestamp: '2 hours ago',
    isActive: true,
  },
  {
    id: '2',
    title: 'Project Planning',
    timestamp: 'Yesterday',
    isActive: false,
  },
  {
    id: '3',
    title: 'Meeting Notes',
    timestamp: '2 days ago',
    isActive: false,
  },
]

interface SessionListProps {
  isCollapsed: boolean
}

export function SessionList({ isCollapsed }: SessionListProps) {
  const [sessions] = useState<Session[]>(mockSessions)

  return (
    <div className="space-y-2">
      <div className={cn('flex items-center justify-between px-2', isCollapsed ? 'sr-only' : '')}>
        <h2 className="text-lg font-semibold">Sessions</h2>
        <button className="rounded-lg p-1 hover:bg-accent">
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      <nav className="grid gap-1">
        {sessions.map((session) => (
          <a
            key={session.id}
            href={`/chat/${session.id}`}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
              session.isActive && 'bg-accent text-accent-foreground',
              isCollapsed ? 'justify-center' : ''
            )}
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
            {!isCollapsed && (
              <div className="flex flex-1 flex-col">
                <span className="text-sm">{session.title}</span>
                <span className="text-xs text-gray-400">{session.timestamp}</span>
              </div>
            )}
          </a>
        ))}
      </nav>
    </div>
  )
} 
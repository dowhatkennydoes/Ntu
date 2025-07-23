'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface Session {
  id: string
  title: string
  timestamp: string
  isActive: boolean
  tokenCount: number
}

const SESSION_STORAGE_KEY = 'mere_sessions_v1';

function loadSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
  }
}

interface SessionListProps {
  isCollapsed: boolean
  visible?: boolean // for future use, default true
  onSessionSelect?: (id: string) => void
  selectedSessionId?: string
}

export function SessionList({ isCollapsed, visible = true, onSessionSelect, selectedSessionId }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const handleSelect = (id: string) => {
    if (onSessionSelect) onSessionSelect(id);
  };

  const handleCreate = () => {
    const newSession: Session = {
      id: Date.now().toString(),
      title: 'New Session',
      timestamp: new Date().toLocaleString(),
      isActive: false,
      tokenCount: 0,
    };
    setSessions(prev => [newSession, ...prev]);
    if (onSessionSelect) onSessionSelect(newSession.id);
  };

  const handleRename = (id: string) => {
    const newTitle = prompt('Rename session:');
    if (newTitle) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this session?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (onSessionSelect && sessions.length > 1) {
        const next = sessions.find(s => s.id !== id);
        if (next) onSessionSelect(next.id);
      }
    }
  };

  const handleDuplicate = (id: string) => {
    const orig = sessions.find(s => s.id === id);
    if (orig) {
      const newSession: Session = {
        ...orig,
        id: Date.now().toString(),
        title: orig.title + ' (Copy)',
        timestamp: new Date().toLocaleString(),
        isActive: false,
      };
      setSessions(prev => [newSession, ...prev]);
    }
  };

  if (!visible) return null;
  return (
    <div className="space-y-2">
      <div className={cn('flex items-center justify-between px-2', isCollapsed ? 'sr-only' : '')}>
        <h2 className="text-lg font-semibold">Sessions</h2>
        <button className="rounded-lg p-1 hover:bg-accent" onClick={handleCreate} title="New Session">
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      <nav className="grid gap-1">
        {sessions.map((session) => (
          <div key={session.id} className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
            session.id === selectedSessionId && 'bg-accent text-accent-foreground',
            isCollapsed ? 'justify-center' : ''
          )}>
            <button onClick={() => handleSelect(session.id)} className="flex items-center gap-2 flex-1 text-left">
              <ChatBubbleLeftIcon className="h-5 w-5" />
              {!isCollapsed && (
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold">{session.title}</span>
                  <span className="text-xs text-gray-400">{session.timestamp}</span>
                  <span className="text-xs text-gray-400">Tokens: {session.tokenCount}</span>
                </div>
              )}
            </button>
            {!isCollapsed && (
              <div className="flex gap-1">
                <button onClick={() => handleRename(session.id)} className="text-xs text-blue-500 hover:underline" title="Rename">✏️</button>
                <button onClick={() => handleDuplicate(session.id)} className="text-xs text-green-500 hover:underline" title="Duplicate">⧉</button>
                <button onClick={() => handleDelete(session.id)} className="text-xs text-red-500 hover:underline" title="Delete">🗑️</button>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
} 
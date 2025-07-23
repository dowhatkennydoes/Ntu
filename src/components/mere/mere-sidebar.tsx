'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { AppList } from './app-list'
import { SessionList } from './session-list'

interface MereSidebarProps {
  onViewChange?: (view: 'dashboard' | 'chat') => void
  currentView?: 'dashboard' | 'chat'
}

export function MereSidebar({ onViewChange, currentView }: MereSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? '4rem' : '20rem' }}
      className="relative flex h-full flex-col border-r bg-card"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-8 z-50 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-4 w-4" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-auto p-4">
        {!isCollapsed && onViewChange && (
          <div className="space-y-2">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`w-full text-left p-2 rounded-lg transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onViewChange('chat')}
              className={`w-full text-left p-2 rounded-lg transition-colors ${
                currentView === 'chat' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent'
              }`}
            >
              Chat with Mere
            </button>
          </div>
        )}
        <AppList isCollapsed={isCollapsed} />
        <SessionList isCollapsed={isCollapsed} />
      </div>
    </motion.div>
  )
} 
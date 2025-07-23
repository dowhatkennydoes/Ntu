'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { AppList } from './app-list'
import { SessionList } from './session-list'

interface MereSidebarProps {
  onViewChange?: (view: 'dashboard' | 'chat') => void
  currentView?: 'dashboard' | 'chat'
  appName?: string
  externallyCollapsed?: boolean // allow external control if needed
}

export function MereSidebar({ onViewChange, currentView, appName, externallyCollapsed }: MereSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const collapsed = externallyCollapsed !== undefined ? externallyCollapsed : isCollapsed;

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? '4rem' : '20rem' }}
      className="relative flex h-full flex-col border-r bg-card"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-8 z-50 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm"
      >
        {collapsed ? (
          <ChevronRightIcon className="h-4 w-4" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4" />
        )}
      </button>

      {/* NTU Logo at top */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="App Logo" width={40} height={40} className="rounded-lg flex-shrink-0" />
          {!collapsed && (
            <span className="font-semibold text-xl">NTU</span>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-auto p-4">
        {!collapsed && onViewChange && (
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
              Chat
            </button>
          </div>
        )}
        <AppList isCollapsed={isCollapsed} />
        {appName === 'Mere' && <SessionList isCollapsed={isCollapsed} />}
      </div>
    </motion.div>
  )
} 
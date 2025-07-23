'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { AppList } from './mere/app-list'

export function AppSidebar() {
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

      {/* NTU Logo at top */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">NTU</span>
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-xl">NTU</span>
          )}
        </Link>
      </div>

      {/* Content - Only App List, no sessions */}
      <div className="flex-1 space-y-4 overflow-auto p-4">
        <AppList isCollapsed={isCollapsed} />
      </div>
    </motion.div>
  )
}
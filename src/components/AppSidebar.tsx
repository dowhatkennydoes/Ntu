'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import GoogleCalendarStatus from './GoogleCalendarStatus'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  SparklesIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  FolderIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon,
  PlusIcon,
  ChevronRightIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { 
  SparklesIcon as SparklesIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  MicrophoneIcon as MicrophoneIconSolid,
  ClockIcon as ClockIconSolid,
  BoltIcon as BoltIconSolid
} from '@heroicons/react/24/solid'

interface App {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  iconSolid: React.ComponentType<any>
  href: string
  gradient: string
  status: 'active' | 'beta' | 'coming-soon'
  badge?: string
}

interface Session {
  id: string
  title: string
  timestamp: string
  preview: string
}

const APPS: App[] = [
  {
    id: 'mere',
    name: 'Mere',
    description: 'AI Assistant & Memory Hub',
    icon: SparklesIcon,
    iconSolid: SparklesIconSolid,
    href: '/',
    gradient: 'from-purple-500 to-blue-600',
    status: 'active'
  },
  {
    id: 'junction',
    name: 'Junction',
    description: 'AI-Powered Document Processing',
    icon: DocumentTextIcon,
    iconSolid: DocumentTextIconSolid,
    href: '/junction',
    gradient: 'from-blue-500 to-cyan-500',
    status: 'active'
  },
  {
    id: 'yonder',
    name: 'Yonder',
    description: 'Voice Intelligence & Transcription',
    icon: MicrophoneIcon,
    iconSolid: MicrophoneIconSolid,
    href: '/yonder',
    gradient: 'from-red-500 to-pink-500',
    status: 'active'
  },
  {
    id: 'punctual',
    name: 'Punctual',
    description: 'Intelligent Task Management',
    icon: ClockIcon,
    iconSolid: ClockIconSolid,
    href: '/punctual',
    gradient: 'from-green-500 to-emerald-500',
    status: 'active'
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Visual Workflow Automation',
    icon: BoltIcon,
    iconSolid: BoltIconSolid,
    href: '/marathon',
    gradient: 'from-orange-500 to-yellow-500',
    status: 'active'
  }
]

const RECENT_SESSIONS: Session[] = [
  {
    id: '1',
    title: 'Project Planning Discussion',
    timestamp: '2 hours ago',
    preview: 'Discussed quarterly goals and resource allocation...'
  },
  {
    id: '2',
    title: 'Research on AI Workflows',
    timestamp: '1 day ago',
    preview: 'Explored automation opportunities in current processes...'
  },
  {
    id: '3',
    title: 'Team Sync Notes',
    timestamp: '2 days ago',
    preview: 'Weekly team meeting with status updates...'
  }
]

export function AppSidebar() {
  const pathname = usePathname()
  const [showSessions, setShowSessions] = useState(true)
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <SparklesIconSolid className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">NTU</h1>
            <p className="text-sm text-white/60">Neural Task Universe</p>
          </div>
        </motion.div>
      </div>

      {/* Apps Section */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Apps</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <PlusIcon className="w-4 h-4 text-white/60" />
            </motion.button>
          </div>
          
          <div className="space-y-2">
            {APPS.map((app, index) => {
              const isActive = pathname === app.href
              const Icon = isActive ? app.iconSolid : app.icon
              
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={app.href}>
                    <motion.div
                      whileHover={{ x: 4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative p-4 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg'
                          : 'hover:bg-white/10 border border-transparent hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${app.gradient} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-medium truncate ${
                              isActive ? 'text-white' : 'text-white/90 group-hover:text-white'
                            }`}>
                              {app.name}
                            </h3>
                            {app.badge && (
                              <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 text-xs rounded-full">
                                {app.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm truncate mt-0.5 ${
                            isActive ? 'text-white/70' : 'text-white/50 group-hover:text-white/70'
                          }`}>
                            {app.description}
                          </p>
                        </div>
                        {!isActive && (
                          <ChevronRightIcon className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                        )}
                      </div>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"
                        />
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Sessions Section - Only show on Mere */}
        {pathname === '/' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSessions(!showSessions)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <motion.div
                  animate={{ rotate: showSessions ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRightIcon className="w-4 h-4 text-white/60" />
                </motion.div>
              </motion.button>
            </div>

            <AnimatePresence>
              {showSessions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {RECENT_SESSIONS.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 4, scale: 1.02 }}
                      className="p-3 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <SparklesIcon className="w-4 h-4 text-purple-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white/90 text-sm truncate">
                            {session.title}
                          </h4>
                          <p className="text-xs text-white/50 truncate mt-0.5">
                            {session.preview}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {session.timestamp}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/10">
        {/* User Profile */}
        {user && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm">
                  {(profile?.email || user.email)?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.email || user.email}
                </p>
                <p className="text-xs text-white/60">Authenticated</p>
              </div>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 text-white/60" />
              </motion.button>
            </div>
            
            {/* Google Calendar Status */}
            <GoogleCalendarStatus />
          </div>
        )}
        
        {/* System Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <span className="text-sm text-white/60">All systems operational</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <CogIcon className="w-4 h-4 text-white/60" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
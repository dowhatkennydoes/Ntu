'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  MicrophoneIcon, 
  CheckCircleIcon, 
  BoltIcon,
  CalendarIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import ProfileCompletionBanner from './ProfileCompletionBanner'

interface DashboardStats {
  totalSessions: number
  documentsProcessed: number
  tasksCompleted: number
  voiceRecordings: number
}

const applications = [
  {
    id: 'mere',
    name: 'Mere',
    description: 'AI Assistant & Memory Hub',
    icon: SparklesIcon,
    href: '/',
    color: 'from-purple-500 to-blue-600',
    features: ['Natural conversations', 'Memory management', 'Smart insights'],
    isActive: true
  },
  {
    id: 'junction',
    name: 'Junction',
    description: 'Document Processing & Analysis',
    icon: DocumentTextIcon,
    href: '/junction',
    color: 'from-emerald-500 to-teal-600',
    features: ['Document analysis', 'AI extraction', 'Smart organization'],
    isActive: true
  },
  {
    id: 'yonder',
    name: 'Yonder',
    description: 'Voice Intelligence & Transcription',
    icon: MicrophoneIcon,
    href: '/yonder',
    color: 'from-orange-500 to-red-600',
    features: ['Voice transcription', 'Speaker identification', 'Audio analytics'],
    isActive: true
  },
  {
    id: 'punctual',
    name: 'Punctual',
    description: 'Smart Task Management',
    icon: CheckCircleIcon,
    href: '/punctual',
    color: 'from-blue-500 to-indigo-600',
    features: ['AI scheduling', 'Priority management', 'Calendar sync'],
    isActive: true
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Workflow Automation',
    icon: BoltIcon,
    href: '/marathon',
    color: 'from-pink-500 to-rose-600',
    features: ['Workflow creation', 'Task automation', 'Performance analytics'],
    isActive: true
  }
]

const quickActions = [
  {
    name: 'Start AI Chat',
    description: 'Begin a conversation with Mere',
    icon: SparklesIcon,
    href: '/',
    color: 'bg-purple-500'
  },
  {
    name: 'Upload Document',
    description: 'Process a new document',
    icon: DocumentTextIcon,
    href: '/junction',
    color: 'bg-emerald-500'
  },
  {
    name: 'Record Voice',
    description: 'Start voice recording',
    icon: MicrophoneIcon,
    href: '/yonder',
    color: 'bg-orange-500'
  },
  {
    name: 'Create Task',
    description: 'Add a new task',
    icon: CheckCircleIcon,
    href: '/punctual',
    color: 'bg-blue-500'
  }
]

export default function DashboardOverview() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    documentsProcessed: 0,
    tasksCompleted: 0,
    voiceRecordings: 0
  })
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    // Check if user is new (created within last 24 hours)
    if (user?.created_at) {
      const createdAt = new Date(user.created_at)
      const now = new Date()
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      setIsNewUser(hoursSinceCreation < 24)
    }

    // Load user stats (in real implementation, this would come from API)
    setStats({
      totalSessions: Math.floor(Math.random() * 10) + 1,
      documentsProcessed: Math.floor(Math.random() * 5),
      tasksCompleted: Math.floor(Math.random() * 15),
      voiceRecordings: Math.floor(Math.random() * 8)
    })
  }, [user])

  const userName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="space-y-8">
      {/* Profile Completion Banner */}
      <ProfileCompletionBanner />
      
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-white/70">
              {isNewUser 
                ? "Welcome to your Neural Task Universe! Let's get you started." 
                : "Ready to boost your productivity today?"
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
              <p className="text-sm text-white/60">AI Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.documentsProcessed}</p>
              <p className="text-sm text-white/60">Documents</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.tasksCompleted}</p>
              <p className="text-sm text-white/60">Tasks Done</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <MicrophoneIcon className="w-5 h-5 text-orange-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.voiceRecordings}</p>
              <p className="text-sm text-white/60">Recordings</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.name} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-white text-sm">{action.name}</h3>
                <p className="text-xs text-white/60 mt-1">{action.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Applications Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-white">Your NTU Applications</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {applications.map((app, index) => (
            <Link key={app.id} href={app.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center`}>
                      <app.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                      <p className="text-sm text-white/60">{app.description}</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                </div>
                
                <div className="space-y-2">
                  {app.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                      <p className="text-sm text-white/70">{feature}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        {stats.totalSessions === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60">No recent activity yet</p>
            <p className="text-sm text-white/40 mt-1">Start using NTU to see your activity here</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-purple-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">Started AI conversation</p>
                <p className="text-xs text-white/50">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">Processed document</p>
                <p className="text-xs text-white/50">5 hours ago</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { 
  MicrophoneIcon,
  PlusIcon,
  PlayIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import ModernLayout from '@/components/ModernLayout'
import { motion } from 'framer-motion'

function YonderInterface() {
  // TODO: Replace with real data fetching
  const [recentRecordings, setRecentRecordings] = useState<any[]>([])

  const quickActions = [
    { id: 'record', title: 'Start Recording', icon: MicrophoneIcon, description: 'Record voice notes with AI transcription' },
    { id: 'upload', title: 'Upload Audio', icon: DocumentTextIcon, description: 'Process existing audio files' },
    { id: 'analyze', title: 'Voice Analytics', icon: ChartBarIcon, description: 'Analyze speaking patterns and insights' }
  ]

  const [stats, setStats] = useState([
    { label: 'Total Recordings', value: '0', completed: '0 transcribed', icon: MicrophoneIcon },
    { label: 'Speaking Time', value: '0h', completed: 'This month', icon: ClockIcon },
    { label: 'Speakers Identified', value: '0', completed: 'Unique voices', icon: UserGroupIcon }
  ])

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 sm:py-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <MicrophoneIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Yonder</h1>
          <p className="text-white/70 mb-6 sm:mb-8 text-sm sm:text-base">Voice processing and intelligent transcription</p>
          
          <motion.button
            className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-medium text-white hover:bg-white/30 transition-all shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center space-x-2">
              <PlayIcon className="w-5 h-5" />
              <span>Start Recording</span>
            </span>
          </motion.button>
        </motion.section>
        {/* Stats Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-white/60" />
                  <span className="text-2xl font-bold text-white">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm text-white/70 mb-1">
                  {stat.label}
                </p>
                <p className="text-xs text-red-300">
                  {stat.completed}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.id}
                className="group text-left p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-white/30 hover:bg-white/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-white/70">
                  {action.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Recent Recordings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Recordings</h2>
            {recentRecordings.length > 0 && (
              <motion.button
                className="text-sm text-red-300 hover:text-red-200 font-medium flex items-center space-x-1"
                whileHover={{ x: 4 }}
              >
                <span>View all</span>
                <ArrowRightIcon className="w-4 h-4" />
              </motion.button>
            )}
          </div>
          {recentRecordings.length === 0 ? (
            <div className="text-center py-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MicrophoneIcon className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No recordings yet</h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Start recording voice notes, meetings, or upload audio files to begin transcribing and analyzing your content.
              </p>
              <div className="flex justify-center space-x-3">
                <motion.button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Recording
                </motion.button>
                <motion.button
                  className="px-4 py-2 bg-white/20 backdrop-blur-xl text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Upload Audio
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecordings.map((recording, index) => (
                <motion.div
                  key={recording.id}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-white/30 hover:bg-white/20 transition-all cursor-pointer group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MicrophoneIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white group-hover:text-red-300 transition-colors">
                        {recording.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-xs text-white/50">
                          <ClockIcon className="w-3 h-3" />
                          <span>{recording.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-white/50">
                          <UserGroupIcon className="w-3 h-3" />
                          <span>{recording.speakers} speakers</span>
                        </div>
                        <span className="text-xs text-white/50">{recording.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-500/30 text-green-200 text-xs rounded-full">
                        Transcribed
                      </span>
                      <ArrowRightIcon className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* AI Features Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-gradient-to-br from-red-500/20 via-pink-500/20 to-rose-500/20 backdrop-blur-xl rounded-2xl p-8 border border-white/20 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <SpeakerWaveIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">AI Voice Processing</h3>
                  <p className="text-white/70">Advanced transcription and analysis</p>
                </div>
              </div>
              <p className="text-white/80 mb-6">
                Experience next-level voice processing with speaker identification, sentiment analysis, and automatic summary generation.
              </p>
              <motion.button
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all backdrop-blur-sm text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try AI Features
              </motion.button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default function YonderPage() {
  return (
    <ModernLayout 
      title="Yonder"
      subtitle="Voice Processing & Transcription"
      showSidebar={true}
      glassmorphism={true}
    >
      <YonderInterface />
    </ModernLayout>
  )
}

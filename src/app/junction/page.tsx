'use client'

import { useState } from 'react'
import { 
  DocumentTextIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  FolderIcon,
  StarIcon,
  ClockIcon,
  TagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import ModernLayout from '@/components/ModernLayout'
import { motion } from 'framer-motion'

function JunctionInterface() {
  // TODO: Replace with real data fetching
  const [recentDocuments, setRecentDocuments] = useState<any[]>([])

  const quickActions = [
    { id: 'create', title: 'Create Document', icon: PlusIcon, description: 'Start writing a new document' },
    { id: 'search', title: 'Search Documents', icon: MagnifyingGlassIcon, description: 'Find content across all files' },
    { id: 'organize', title: 'Organize Files', icon: FolderIcon, description: 'Manage folders and tags' }
  ]

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 sm:py-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <DocumentTextIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Junction</h1>
          <p className="text-white/70 mb-6 sm:mb-8 text-sm sm:text-base">Document processing and intelligent analysis</p>
          
          <motion.button
            className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-medium text-white hover:bg-white/30 transition-all shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>New Document</span>
            </span>
          </motion.button>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.id}
                className="group text-left p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-white/30 hover:bg-white/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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

        {/* Recent Documents */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Documents</h2>
            {recentDocuments.length > 0 && (
              <motion.button
                className="text-sm text-blue-300 hover:text-blue-200 font-medium flex items-center space-x-1"
                whileHover={{ x: 4 }}
              >
                <span>View all</span>
                <ArrowRightIcon className="w-4 h-4" />
              </motion.button>
            )}
          </div>
          {recentDocuments.length === 0 ? (
            <div className="text-center py-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No documents yet</h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Start by creating your first document or uploading an existing file to begin organizing your knowledge.
              </p>
              <div className="flex justify-center space-x-3">
                <motion.button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Document
                </motion.button>
                <motion.button
                  className="px-4 py-2 bg-white/20 backdrop-blur-xl text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Upload File
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-white/30 hover:bg-white/20 transition-all cursor-pointer group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                        {doc.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-white/70">{doc.type}</p>
                        <div className="flex items-center space-x-1 text-xs text-white/50">
                          <ClockIcon className="w-3 h-3" />
                          <span>{doc.lastModified}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {doc.tags?.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-500/30 text-blue-200 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
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
          transition={{ delay: 0.3 }}
        >
          <div className="bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 backdrop-blur-xl rounded-2xl p-8 border border-white/20 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">AI Document Processing</h3>
                  <p className="text-white/70">Intelligent analysis and insights</p>
                </div>
              </div>
              <p className="text-white/80 mb-6">
                Let AI help you analyze documents, extract key insights, and organize your knowledge base automatically.
              </p>
              <motion.button
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all backdrop-blur-sm text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try AI Analysis
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

export default function JunctionPage() {
  return (
    <ModernLayout 
      title="Junction"
      subtitle="Document Processing & Analysis"
      showSidebar={true}
      glassmorphism={true}
    >
      <JunctionInterface />
    </ModernLayout>
  )
}
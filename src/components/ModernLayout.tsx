'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThreeBackground from './ThreeBackground'
import { AppSidebar } from './AppSidebar'
import {
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid'

interface ModernLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  glassmorphism?: boolean
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  currentView?: 'overview' | 'mere'
  onViewChange?: (view: 'overview' | 'mere') => void
}

const ModernLayout = memo(function ModernLayout({ 
  children, 
  showSidebar = true, 
  glassmorphism = true,
  title,
  subtitle,
  actions,
  currentView,
  onViewChange
}: ModernLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sidebarVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Three.js Background - Lazy loaded for better performance */}
      <ThreeBackground disabled={!mounted} />
      
      {/* Main Layout */}
      <div className="relative z-10 min-h-screen flex">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sidebarVariants}
            className={`hidden lg:flex w-72 xl:w-80 ${
              glassmorphism 
                ? 'bg-white/10 backdrop-blur-xl border-r border-white/20' 
                : 'bg-slate-900/90 border-r border-slate-700'
            }`}
          >
            <AppSidebar />
          </motion.div>
        )}

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && showSidebar && (
            <>
              {/* Backdrop */}
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={overlayVariants}
                className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              
              {/* Mobile Sidebar */}
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={sidebarVariants}
                className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 sm:w-80 ${
                  glassmorphism 
                    ? 'bg-white/20 backdrop-blur-xl border-r border-white/30' 
                    : 'bg-slate-900/95 border-r border-slate-700'
                }`}
              >
                <div className="p-4 border-b border-white/20">
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
                <AppSidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Navigation Bar */}
          <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`${
              glassmorphism
                ? 'bg-white/10 backdrop-blur-xl border-b border-white/20'
                : 'bg-slate-900/90 border-b border-slate-700'
            } sticky top-0 z-30`}
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                  {/* Mobile Menu Button */}
                  {showSidebar && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Bars3Icon className="w-6 h-6 text-white" />
                    </button>
                  )}
                  
                  {/* NTU Logo */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <SparklesIconSolid className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">
                        {title || 'NTU'}
                      </h1>
                      {subtitle && (
                        <p className="text-sm text-white/70">{subtitle}</p>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-3">
                  {/* View Switcher - Only show on dashboard */}
                  {onViewChange && currentView && (
                    <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
                      <button
                        onClick={() => onViewChange('overview')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                          currentView === 'overview'
                            ? 'bg-white/20 text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => onViewChange('mere')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                          currentView === 'mere'
                            ? 'bg-white/20 text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Mere Chat
                      </button>
                    </div>
                  )}
                  
                  {/* Custom Actions */}
                  {actions}
                  
                  {/* Notifications */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
                  >
                    <BellIcon className="w-5 h-5 text-white/80" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  </motion.button>

                  {/* Settings */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <CogIcon className="w-5 h-5 text-white/80" />
                  </motion.button>

                  {/* User Profile */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <UserCircleIcon className="w-6 h-6 text-white/80" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Main Content */}
          <main className="flex-1 relative min-h-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className={`h-full overflow-hidden ${
                glassmorphism 
                  ? 'bg-white/5 backdrop-blur-sm' 
                  : 'bg-transparent'
              }`}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Simplified floating elements for better performance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  )
})

export default ModernLayout
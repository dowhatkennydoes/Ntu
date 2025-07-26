'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/SimpleAuthContext'
import {
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
  BellIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface ProfileCompletionStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  isCompleted: boolean
  action: () => void
}

export default function ProfileCompletionBanner() {
  const { user, profile } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      // Check completion status of various profile aspects
      const completed: string[] = []
      
      // Basic profile info
      if (profile?.name || user.user_metadata?.name) {
        completed.push('profile')
      }
      
      // Check if user has dismissed the banner
      const isDismissed = localStorage.getItem('ntu-profile-banner-dismissed') === 'true'
      
      // Show banner if not all steps are completed and not dismissed
      const allStepsCompleted = completed.length >= 3 // Adjust based on total steps
      setIsVisible(!allStepsCompleted && !isDismissed)
      setCompletedSteps(completed)
    }
  }, [user, profile])

  const steps: ProfileCompletionStep[] = [
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add your name and preferences',
      icon: UserCircleIcon,
      isCompleted: completedSteps.includes('profile'),
      action: () => {
        // Open profile settings modal (to be implemented)
        console.log('Open profile settings')
      }
    },
    {
      id: 'calendar',
      title: 'Connect Calendar',
      description: 'Sync with Google Calendar',
      icon: CalendarIcon,
      isCompleted: completedSteps.includes('calendar'),
      action: () => {
        // Redirect to calendar setup
        window.location.href = '/punctual?setup=calendar'
      }
    },
    {
      id: 'notifications',
      title: 'Setup Notifications',
      description: 'Configure your alerts',
      icon: BellIcon,
      isCompleted: completedSteps.includes('notifications'),
      action: () => {
        // Open notification settings
        console.log('Open notification settings')
      }
    }
  ]

  const incompleteSteps = steps.filter(step => !step.isCompleted)
  const completionPercentage = ((steps.length - incompleteSteps.length) / steps.length) * 100

  const handleDismiss = () => {
    localStorage.setItem('ntu-profile-banner-dismissed', 'true')
    setIsVisible(false)
  }

  if (!isVisible || incompleteSteps.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="mx-4 sm:mx-6 mt-4 mb-6"
      >
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Complete Your Profile</h3>
              <p className="text-white/70 text-sm">
                {Math.round(completionPercentage)}% complete • {incompleteSteps.length} steps remaining
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white/60 hover:text-white/80" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border transition-all ${
                  step.isCompleted
                    ? 'bg-green-500/20 border-green-500/30'
                    : 'bg-white/5 border-white/20 hover:bg-white/10 cursor-pointer'
                }`}
                onClick={step.isCompleted ? undefined : step.action}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    step.isCompleted
                      ? 'bg-green-500/20'
                      : 'bg-white/10'
                  }`}>
                    {step.isCompleted ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-300" />
                    ) : (
                      <step.icon className="w-5 h-5 text-white/70" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium text-sm ${
                        step.isCompleted ? 'text-green-300' : 'text-white'
                      }`}>
                        {step.title}
                      </h4>
                      {!step.isCompleted && (
                        <ArrowRightIcon className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      step.isCompleted ? 'text-green-200/80' : 'text-white/60'
                    }`}>
                      {step.isCompleted ? 'Completed' : step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          {incompleteSteps.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-white/60 text-sm">
                Complete these steps to get the most out of NTU
              </p>
              <button
                onClick={incompleteSteps[0]?.action}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium rounded-lg transition-all"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
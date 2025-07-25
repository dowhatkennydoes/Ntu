'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'

interface ModernWorkflowLayoutProps {
  children: ReactNode
  title: string
  description: string
  icon?: React.ComponentType<any>
  gradient?: string
  steps?: Array<{
    id: string
    title: string
    description?: string
  }>
  currentStep?: string
  onBack?: () => void
}

export function ModernWorkflowLayout({
  children,
  title,
  description,
  icon: Icon = SparklesIcon,
  gradient = 'from-blue-500 to-purple-600',
  steps = [],
  currentStep,
  onBack
}: ModernWorkflowLayoutProps) {
  // Note: exitWorkflow function would be implemented in the workflow context
  const exitWorkflow = () => {
    // Placeholder for workflow exit functionality
    console.log('Exiting workflow')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-white/20 dark:border-zinc-800/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onBack || exitWorkflow}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeftIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h1>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            {steps.length > 0 && (
              <div className="hidden lg:flex items-center space-x-2">
                {steps.map((step, index) => {
                  const isActive = currentStep === step.id
                  const isCompleted = steps.findIndex(s => s.id === currentStep) > index
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <motion.div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative ${
                          isActive 
                            ? `bg-gradient-to-br ${gradient} text-white shadow-lg` :
                          isCompleted 
                            ? 'bg-green-500 text-white' :
                            'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {isCompleted ? '✓' : index + 1}
                        {isActive && (
                          <motion.div 
                            className="absolute inset-0 rounded-full bg-white/20"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                      {index < steps.length - 1 && (
                        <div className={`w-8 h-0.5 mx-2 ${
                          isCompleted ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* AI Badge */}
            <motion.div 
              className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full border border-purple-200 dark:border-purple-800/50"
              whileHover={{ scale: 1.05 }}
            >
              <SparklesIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI-Powered</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-zinc-100/50 dark:bg-grid-zinc-800/50" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}

// Step indicator component for mobile
export function MobileStepIndicator({ 
  steps, 
  currentStep 
}: { 
  steps: Array<{ id: string; title: string }>, 
  currentStep?: string 
}) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)
  
  return (
    <div className="lg:hidden px-6 py-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">
          Step {currentIndex + 1} of {steps.length}
        </span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {steps[currentIndex]?.title}
        </span>
      </div>
      <div className="mt-2 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1">
        <motion.div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )
}

// Modern card wrapper for workflow content
export function WorkflowCard({ 
  children, 
  className = ""
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <motion.div 
      className={`modern-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  )
}
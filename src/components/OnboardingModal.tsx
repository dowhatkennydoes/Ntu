'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  MicrophoneIcon, 
  CheckCircleIcon, 
  BoltIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  content: React.ReactNode
  color: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to NTU!',
    description: 'Your Neural Task Universe awaits',
    icon: SparklesIcon,
    color: 'from-purple-500 to-blue-600',
    content: (
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto">
          <SparklesIcon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white">Welcome to your Neural Task Universe!</h3>
        <p className="text-white/70 max-w-md mx-auto">
          NTU is your AI-powered productivity ecosystem, designed to transform how you work, think, and create. 
          Let's take a quick tour of what makes NTU special.
        </p>
      </div>
    )
  },
  {
    id: 'mere',
    title: 'Meet Mere',
    description: 'Your AI Assistant & Memory Hub',
    icon: SparklesIcon,
    color: 'from-purple-500 to-blue-600',
    content: (
      <div className="space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
          <SparklesIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white text-center">Mere - Your AI Companion</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
            <div>
              <p className="text-white font-medium">Natural Conversations</p>
              <p className="text-white/60 text-sm">Chat naturally about anything - work, ideas, or questions</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
            <div>
              <p className="text-white font-medium">Memory Management</p>
              <p className="text-white/60 text-sm">Mere remembers context across conversations and learns your preferences</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
            <div>
              <p className="text-white font-medium">Smart Insights</p>
              <p className="text-white/60 text-sm">Get proactive suggestions and insights based on your workflow</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'applications',
    title: 'Explore Applications',
    description: 'Five powerful tools at your fingertips',
    icon: BoltIcon,
    color: 'from-emerald-500 to-teal-600',
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white text-center">Your NTU Ecosystem</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Junction</p>
              <p className="text-white/60 text-sm">Document processing & AI analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <MicrophoneIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Yonder</p>
              <p className="text-white/60 text-sm">Voice intelligence & transcription</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Punctual</p>
              <p className="text-white/60 text-sm">Smart task management & scheduling</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Marathon</p>
              <p className="text-white/60 text-sm">Workflow automation & optimization</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'integration',
    title: 'Connected Experience',
    description: 'Everything works together seamlessly',
    icon: BoltIcon,
    color: 'from-blue-500 to-indigo-600',
    content: (
      <div className="space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <BoltIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white text-center">Seamless Integration</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
            <div>
              <p className="text-white font-medium">Cross-App Intelligence</p>
              <p className="text-white/60 text-sm">Data flows intelligently between applications</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2" />
            <div>
              <p className="text-white font-medium">Google Calendar Sync</p>
              <p className="text-white/60 text-sm">Your schedule integrates with task management</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
            <div>
              <p className="text-white font-medium">Unified Memory</p>
              <p className="text-white/60 text-sm">Context is shared across all your interactions</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'start',
    title: 'Ready to Begin',
    description: 'Your journey starts now',
    icon: PlayIcon,
    color: 'from-green-500 to-emerald-600',
    content: (
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
          <PlayIcon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white">You're All Set!</h3>
        <p className="text-white/70 max-w-md mx-auto">
          Your Neural Task Universe is ready. Start with a conversation with Mere, 
          or dive into any of the applications. The AI will learn and adapt to your workflow.
        </p>
        <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-300 font-medium text-sm">💡 Pro Tip</p>
          <p className="text-green-200/80 text-xs mt-1">
            Try saying "Help me get organized" to Mere for a personalized introduction!
          </p>
        </div>
      </div>
    )
  }
]

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    // Mark onboarding as completed (in real app, save to user preferences)
    localStorage.setItem('ntu-onboarding-completed', 'true')
    onClose()
  }

  const currentStepData = onboardingSteps[currentStep]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${currentStepData.color} rounded-xl flex items-center justify-center`}>
                    <currentStepData.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{currentStepData.title}</h2>
                    <p className="text-sm text-white/60">{currentStepData.description}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-white/60" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 flex space-x-2">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      index <= currentStep ? 'bg-white/80' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStepData.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 text-white" />
                <span className="text-white">Back</span>
              </button>

              <span className="text-sm text-white/60">
                {currentStep + 1} of {onboardingSteps.length}
              </span>

              {currentStep === onboardingSteps.length - 1 ? (
                <button
                  onClick={handleFinish}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg transition-all"
                >
                  <span className="text-white font-medium">Get Started</span>
                  <PlayIcon className="w-4 h-4 text-white" />
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-lg transition-all"
                >
                  <span className="text-white">Next</span>
                  <ArrowRightIcon className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
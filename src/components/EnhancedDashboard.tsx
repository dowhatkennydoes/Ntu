'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ModernLayout from './ModernLayout'
import DashboardOverview from './DashboardOverview'
import OnboardingModal from './OnboardingModal'
import MereInterface from './MereInterface'

interface DashboardView {
  view: 'overview' | 'mere'
}

export function EnhancedDashboard() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<'overview' | 'mere'>('overview')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    // Check if user is new and hasn't completed onboarding
    if (user?.created_at) {
      const createdAt = new Date(user.created_at)
      const now = new Date()
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      const isUserNew = hoursSinceCreation < 24
      const hasCompletedOnboarding = localStorage.getItem('ntu-onboarding-completed') === 'true'
      
      setIsNewUser(isUserNew)
      
      if (isUserNew && !hasCompletedOnboarding) {
        // Small delay to let the dashboard load first
        setTimeout(() => {
          setShowOnboarding(true)
        }, 1000)
      }
    }
  }, [user])

  const handleViewChange = (view: 'overview' | 'mere') => {
    setCurrentView(view)
  }

  return (
    <>
      <ModernLayout 
        title={currentView === 'overview' ? 'Dashboard' : 'Mere'}
        subtitle={currentView === 'overview' ? 'Your Neural Task Universe' : 'AI Assistant & Memory Hub'}
        showSidebar={true}
        glassmorphism={true}
        currentView={currentView}
        onViewChange={handleViewChange}
      >
        {currentView === 'overview' ? (
          <DashboardOverview />
        ) : (
          <MereInterface />
        )}
      </ModernLayout>

      <OnboardingModal 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  )
}
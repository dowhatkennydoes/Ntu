'use client'

import ModernLayout from './ModernLayout'
import MereInterface from './MereInterface'

export function ModernDashboard() {
  return (
    <ModernLayout 
      title="Mere"
      subtitle="AI Assistant & Memory Hub"
      showSidebar={true}
      glassmorphism={true}
    >
      <MereInterface />
    </ModernLayout>
  )
}
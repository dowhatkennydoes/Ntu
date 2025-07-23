'use client'

import { useState } from 'react'
import { MereChat } from '@/components/mere/mere-chat'
import { MereSidebar } from '@/components/mere/mere-sidebar'
import { WorkflowDashboard } from '@/components/WorkflowDashboard'
import { useWorkflow } from '@/components/WorkflowProvider'

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'chat'>('dashboard')
  const { currentWorkflow } = useWorkflow()

  // If there's an active workflow, show the chat interface for AI assistance
  if (currentWorkflow) {
    return (
      <div className="flex h-screen bg-background">
        <MereSidebar onViewChange={setCurrentView} currentView={currentView} />
        <main className="flex-1 overflow-hidden">
          <div className="flex h-full">
            <div className="flex-1 overflow-y-auto">
              <WorkflowDashboard />
            </div>
            <div className="w-96 border-l">
              <MereChat />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <MereSidebar onViewChange={setCurrentView} currentView={currentView} />
      <main className="flex-1 overflow-y-auto">
        {currentView === 'dashboard' ? <WorkflowDashboard /> : <MereChat />}
      </main>
    </div>
  )
} 
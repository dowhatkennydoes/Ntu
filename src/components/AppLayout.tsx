'use client'

import { ReactNode } from 'react'
import { MereSidebar } from './mere/mere-sidebar'

interface AppLayoutProps {
  children: ReactNode
  appName?: string
}

export function AppLayout({ children, appName }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <MereSidebar appName={appName} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
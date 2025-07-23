'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { WorkflowProvider } from './WorkflowProvider'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <WorkflowProvider>
          <Toaster position="bottom-right" />
          {children}
        </WorkflowProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
} 
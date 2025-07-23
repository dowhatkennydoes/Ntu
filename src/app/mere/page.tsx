'use client'

import { SparklesIcon } from '@heroicons/react/24/outline'
import { AppLayout } from '@/components/AppLayout'

export default function MerePage() {
  return (
    <AppLayout appName="Mere">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mere</h1>
          <p className="text-gray-600 mb-4">AI assistant and workflow orchestration</p>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </AppLayout>
  )
}
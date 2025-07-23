'use client'

import { BoltIcon } from '@heroicons/react/24/outline'
import { AppLayout } from '@/components/AppLayout'

export default function MarathonPage() {
  return (
    <AppLayout appName="Marathon">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BoltIcon className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marathon</h1>
          <p className="text-gray-600 mb-4">Workflow automation and process management</p>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </AppLayout>
  )
}
'use client'

import { MicrophoneIcon } from '@heroicons/react/24/outline'
import { AppLayout } from '@/components/AppLayout'

export default function YonderPage() {
  return (
    <AppLayout appName="Yonder">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MicrophoneIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Yonder</h1>
          <p className="text-gray-600 mb-4">Audio processing and transcription</p>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </AppLayout>
  )
}
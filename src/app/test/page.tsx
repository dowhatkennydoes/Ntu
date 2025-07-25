import AuthTest from '@/components/AuthTest'
import MeetingIntegrationTest from '@/components/MeetingIntegrationTest'
import DebugEnv from '@/components/DebugEnv'
import SimpleTest from '@/components/SimpleTest'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">NTU App - Supabase Integration Tests</h1>
        
        <div className="space-y-12">
          {/* Simple Test */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">0. Simple JavaScript Test</h2>
            <SimpleTest />
          </section>

          {/* Debug Environment Variables */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Environment Variables Debug</h2>
            <DebugEnv />
          </section>

          {/* Authentication Test */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Authentication Test</h2>
            <AuthTest />
          </section>

          {/* Meeting Integration Test */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Meeting Integration Test</h2>
            <MeetingIntegrationTest />
          </section>
        </div>
      </div>
    </div>
  )
} 
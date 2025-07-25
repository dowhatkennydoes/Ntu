'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'

export default function AuthTestPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkConfiguration = async () => {
    setLoading(true)
    try {
      // Check if Google OAuth is configured
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      console.log('OAuth test result:', { data, error })
      
      setConfig({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        error: error?.message,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('Configuration check failed:', err)
      setConfig({
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6">Google OAuth Configuration Test</h1>
          
          <div className="space-y-4 mb-8">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-medium text-blue-300 mb-2">Configuration Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Supabase URL:</span>
                  <span className="text-white font-mono text-xs">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Supabase Anon Key:</span>
                  <span className="text-white font-mono text-xs">
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Google Client ID:</span>
                  <span className="text-white font-mono text-xs">
                    {process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Missing'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
              <h3 className="font-medium text-orange-300 mb-2">Setup Requirements</h3>
              <div className="text-sm text-orange-200/80 space-y-1">
                <p>• Google Cloud Console project with OAuth 2.0 credentials</p>
                <p>• Google Calendar API enabled</p>
                <p>• Supabase Google OAuth provider configured</p>
                <p>• Correct redirect URIs in Google Cloud Console</p>
              </div>
            </div>
          </div>

          <button
            onClick={checkConfiguration}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Testing Configuration...' : 'Test Google OAuth'}
          </button>

          {config && (
            <div className="mt-8 bg-gray-900/50 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Test Results</h3>
              <pre className="text-sm text-gray-300 overflow-auto">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <h3 className="font-medium text-white">Next Steps:</h3>
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <ol className="text-sm text-green-200/80 space-y-2 list-decimal list-inside">
                <li>Follow the setup guide in <code>SETUP_GOOGLE_OAUTH.md</code></li>
                <li>Configure Google Cloud Console with OAuth credentials</li>
                <li>Enable Google OAuth provider in Supabase dashboard</li>
                <li>Add calendar scopes to Supabase provider settings</li>
                <li>Test the login flow</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/auth/login"
              className="text-purple-300 hover:text-purple-200 underline"
            >
              ← Back to Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
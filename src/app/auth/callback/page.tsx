'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { SparklesIcon, CalendarIcon, BoltIcon } from '@heroicons/react/24/outline'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing authentication...')
  const isMagicLink = searchParams?.get('type') === 'magiclink'

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (isMagicLink) {
          setStatus('Verifying magic link...')
        } else {
          setStatus('Verifying your credentials...')
        }
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=callback_error')
          return
        }

        if (data.session) {
          const { user, provider_token, provider_refresh_token } = data.session
          
          console.log('Auth callback: Session found, user:', user.email)
          
          // If this is a Google OAuth login and we have tokens, store them for Calendar access
          if (user.app_metadata?.provider === 'google' && provider_token) {
            setStatus('Setting up Google Calendar access...')
            
            try {
              // Store the Google OAuth tokens for Calendar API access
              const response = await fetch('/api/google/oauth/store-tokens', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.session.access_token}`
                },
                body: JSON.stringify({
                  user_id: user.id,
                  google_user_id: user.user_metadata?.sub || user.id,
                  google_email: user.email,
                  access_token: provider_token,
                  refresh_token: provider_refresh_token,
                  expires_in: 3600 // Default 1 hour, will be refreshed as needed
                })
              })

              if (response.ok) {
                setStatus('Google Calendar access configured successfully!')
              } else {
                console.warn('Failed to store Google tokens, but authentication succeeded')
              }
            } catch (tokenError) {
              console.warn('Failed to setup Google Calendar access:', tokenError)
              // Don't fail the whole auth process for this
            }
          }

          setStatus('Redirecting to your dashboard...')
          console.log('Auth callback: Redirecting to dashboard...')
          // Force a page reload to ensure auth state is properly synchronized
          setTimeout(() => {
            window.location.href = '/'
          }, 1500)
        } else {
          // No session, redirect to login
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/login?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          {status.includes('Calendar') ? (
            <CalendarIcon className="w-8 h-8 text-white animate-pulse" />
          ) : isMagicLink ? (
            <BoltIcon className="w-8 h-8 text-white animate-pulse" />
          ) : (
            <SparklesIcon className="w-8 h-8 text-white animate-pulse" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          {isMagicLink ? 'Magic Link Authentication' : 'Setting Up Your Account'}
        </h2>
        <p className="text-white/70 mb-4">{status}</p>
        
        {isMagicLink && status.includes('Verifying') && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <BoltIcon className="w-5 h-5 text-blue-300" />
              <span className="text-sm font-medium text-blue-300">Magic Link Success</span>
            </div>
            <p className="text-xs text-blue-200/80">
              Your magic link was verified successfully! You're being logged in now.
            </p>
          </div>
        )}
        
        {status.includes('Calendar') && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CalendarIcon className="w-5 h-5 text-blue-300" />
              <span className="text-sm font-medium text-blue-300">Google Calendar Integration</span>
            </div>
            <p className="text-xs text-blue-200/80">
              Your Google Calendar is being connected to enable meeting management, 
              scheduling assistance, and intelligent workflow automation.
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
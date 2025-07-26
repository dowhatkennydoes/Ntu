'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/SimpleAuthContext'
import {
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface CalendarConnection {
  connected: boolean
  email?: string
  lastSync?: string
  error?: string
}

export default function GoogleCalendarStatus() {
  const { user } = useAuth()
  const [calendarStatus, setCalendarStatus] = useState<CalendarConnection>({
    connected: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    checkCalendarConnection()
  }, [user])

  const checkCalendarConnection = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/google/accounts', {
        headers: {
          'Authorization': `Bearer ${user.id}` // Using user ID for demo, in real app use session token
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.accounts && data.accounts.length > 0) {
          const account = data.accounts[0]
          setCalendarStatus({
            connected: true,
            email: account.google_email,
            lastSync: account.created_at
          })
        } else {
          setCalendarStatus({ connected: false })
        }
      } else {
        setCalendarStatus({ 
          connected: false, 
          error: 'Failed to check connection status' 
        })
      }
    } catch (error) {
      console.error('Error checking calendar connection:', error)
      setCalendarStatus({ 
        connected: false, 
        error: 'Unable to verify connection' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReconnect = async () => {
    // Redirect to Google OAuth flow
    window.location.href = '/api/google/oauth/url'
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-white/10">
        <ArrowPathIcon className="w-4 h-4 text-white/60 animate-spin" />
        <span className="text-sm text-white/70">Checking calendar connection...</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg border flex items-center space-x-3 ${
        calendarStatus.connected
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-orange-500/10 border-orange-500/30'
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        calendarStatus.connected 
          ? 'bg-green-500/20' 
          : 'bg-orange-500/20'
      }`}>
        {calendarStatus.connected ? (
          <CheckCircleIcon className="w-4 h-4 text-green-400" />
        ) : (
          <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-white/60" />
          <span className="text-sm font-medium text-white">
            Google Calendar
          </span>
        </div>
        
        {calendarStatus.connected ? (
          <div>
            <p className="text-xs text-green-300">
              Connected as {calendarStatus.email}
            </p>
            {calendarStatus.lastSync && (
              <p className="text-xs text-white/50">
                Connected {new Date(calendarStatus.lastSync).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-xs text-orange-300">
              {calendarStatus.error || 'Not connected'}
            </p>
            <button
              onClick={handleReconnect}
              className="text-xs text-blue-300 hover:text-blue-200 underline"
            >
              Connect now
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
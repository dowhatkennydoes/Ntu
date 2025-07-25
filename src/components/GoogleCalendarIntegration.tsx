import React, { useState, useEffect } from 'react'
import { 
  CalendarDaysIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface GoogleAccount {
  id: string
  google_user_id: string
  google_email: string
  is_active: boolean
  created_at: string
  last_sync_at?: string
}

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
  }>
  conferenceData?: {
    entryPoints?: Array<{
      uri: string
      entryPointType: string
    }>
  }
  htmlLink: string
}

interface GoogleCalendarIntegrationProps {
  userId: string
  onMeetingSelected?: (meeting: CalendarEvent) => void
}

export default function GoogleCalendarIntegration({ userId, onMeetingSelected }: GoogleCalendarIntegrationProps) {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

  useEffect(() => {
    loadConnectedAccounts()
  }, [])

  useEffect(() => {
    if (selectedAccount) {
      loadCalendarEvents(selectedAccount)
    }
  }, [selectedAccount])

  const loadConnectedAccounts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/google/accounts?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
        if (data.accounts?.length > 0) {
          setSelectedAccount(data.accounts[0].id)
        }
      } else {
        throw new Error('Failed to load connected accounts')
      }
    } catch (error) {
      setError('Failed to load connected accounts')
      console.error('Error loading accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCalendarEvents = async (accountId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/google/calendar?userId=${userId}&accountId=${accountId}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        throw new Error('Failed to load calendar events')
      }
    } catch (error) {
      setError('Failed to load calendar events')
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectGoogleAccount = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/google/oauth/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Google OAuth
        window.location.href = data.authUrl
      } else {
        throw new Error('Failed to generate OAuth URL')
      }
    } catch (error) {
      setError('Failed to connect Google account')
      console.error('Error connecting account:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectAccount = async (accountId: string) => {
    try {
      const response = await fetch('/api/google/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, accountId }),
      })

      if (response.ok) {
        await loadConnectedAccounts()
        if (selectedAccount === accountId) {
          setSelectedAccount(null)
          setEvents([])
        }
      } else {
        throw new Error('Failed to disconnect account')
      }
    } catch (error) {
      setError('Failed to disconnect account')
      console.error('Error disconnecting account:', error)
    }
  }

  const refreshEvents = async () => {
    if (selectedAccount) {
      await loadCalendarEvents(selectedAccount)
    }
  }

  const formatEventTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatEventDate = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMeetingUrl = (event: CalendarEvent) => {
    if (event.conferenceData?.entryPoints) {
      const videoEntry = event.conferenceData.entryPoints.find(
        entry => entry.entryPointType === 'video'
      )
      return videoEntry?.uri || event.htmlLink
    }
    return event.htmlLink
  }

  const hasVideoConference = (event: CalendarEvent) => {
    return event.conferenceData?.entryPoints?.some(
      entry => entry.entryPointType === 'video'
    ) || false
  }

  if (loading && accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading Google Calendar...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Google Calendar</h2>
          <p className="text-gray-600">Connect your Google Calendar to import meetings</p>
        </div>
        
        {accounts.length > 0 && (
          <button
            onClick={refreshEvents}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h3>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{account.google_email}</p>
                    <p className="text-sm text-gray-600">
                      Connected {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedAccount(account.id)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedAccount === account.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {selectedAccount === account.id ? 'Selected' : 'Select'}
                  </button>
                  
                  <button
                    onClick={() => disconnectAccount(account.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Disconnect account"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connect New Account */}
      {accounts.length === 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Google Calendar</h3>
          <p className="text-gray-600 mb-6">
            Connect your Google Calendar to automatically import meetings and enable AI-powered transcription.
          </p>
          <button
            onClick={connectGoogleAccount}
            disabled={isConnecting}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <PlusIcon className="w-5 h-5" />
                <span>Connect Google Calendar</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Calendar Events */}
      {selectedAccount && events.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Meetings</h3>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{event.summary}</h4>
                    {hasVideoConference(event) && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Video
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>{formatEventDate(event.start.dateTime)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span>{formatEventTime(event.start.dateTime)} - {formatEventTime(event.end.dateTime)}</span>
                    </div>
                    
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span>{event.attendees.length} attendees</span>
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {hasVideoConference(event) && onMeetingSelected && (
                    <button
                      onClick={() => onMeetingSelected(event)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ArrowRightIcon className="w-4 h-4" />
                      <span>Join</span>
                    </button>
                  )}
                  
                  <a
                    href={event.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>View</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Events */}
      {selectedAccount && events.length === 0 && !loading && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
          <p className="text-gray-600">
            No meetings found in your Google Calendar for the next 7 days.
          </p>
        </div>
      )}

      {/* Loading Events */}
      {selectedAccount && loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading calendar events...</span>
          </div>
        </div>
      )}
    </div>
  )
} 
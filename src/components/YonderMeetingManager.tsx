import React, { useState, useEffect } from 'react'
import { 
  CalendarDaysIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TagIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import GoogleCalendarIntegration from './GoogleCalendarIntegration'

interface Meeting {
  id: string
  title: string
  start_time: string
  end_time?: string
  attendees: string[]
  status: 'upcoming' | 'live' | 'completed' | 'processed'
  platform: 'google-meet' | 'zoom' | 'teams'
  join_url: string
  custom_labels?: string[]
  auto_transcribe: boolean
  created_at: string
  updated_at: string
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

interface YonderMeetingManagerProps {
  userId: string
}

export default function YonderMeetingManager({ userId }: YonderMeetingManagerProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCalendarIntegration, setShowCalendarIntegration] = useState(false)

  // Mock data for demonstration
  const mockMeetings: Meeting[] = [
    {
      id: '1',
      title: 'Team Standup',
      start_time: '2024-01-15T09:00:00Z',
      attendees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      status: 'upcoming',
      platform: 'google-meet',
      join_url: 'https://meet.google.com/abc-defg-hij',
      auto_transcribe: true,
      created_at: '2024-01-14T10:00:00Z',
      updated_at: '2024-01-14T10:00:00Z'
    },
    {
      id: '2',
      title: 'Product Review',
      start_time: '2024-01-15T14:00:00Z',
      attendees: ['Sarah Wilson', 'Tom Brown', 'Lisa Davis'],
      status: 'upcoming',
      platform: 'google-meet',
      join_url: 'https://meet.google.com/xyz-uvw-rst',
      auto_transcribe: false,
      created_at: '2024-01-14T11:00:00Z',
      updated_at: '2024-01-14T11:00:00Z'
    },
    {
      id: '3',
      title: 'Weekly Sync',
      start_time: '2024-01-14T10:00:00Z',
      end_time: '2024-01-14T11:00:00Z',
      attendees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      status: 'completed',
      platform: 'google-meet',
      join_url: 'https://meet.google.com/def-ghi-jkl',
      auto_transcribe: true,
      created_at: '2024-01-13T09:00:00Z',
      updated_at: '2024-01-14T11:00:00Z'
    }
  ]

  useEffect(() => {
    // Simulate loading meetings
    setLoading(true)
    setTimeout(() => {
      setMeetings(mockMeetings)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredMeetings = meetings.filter(meeting => {
    const matchesFilter = filter === 'all' || meeting.status === filter
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const joinMeeting = async (meeting: Meeting) => {
    setLoading(true)
    try {
      // Simulate joining meeting
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSelectedMeeting(meeting)
      setError(null)
    } catch (error) {
      setError('Failed to join meeting')
    } finally {
      setLoading(false)
    }
  }

  const disconnectFromMeeting = async () => {
    setLoading(true)
    try {
      // Simulate disconnecting
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSelectedMeeting(null)
      setError(null)
    } catch (error) {
      setError('Failed to disconnect from meeting')
    } finally {
      setLoading(false)
    }
  }

  const handleCalendarMeetingSelected = (event: CalendarEvent) => {
    // Convert Google Calendar event to meeting format
    const meeting: Meeting = {
      id: event.id,
      title: event.summary,
      start_time: event.start.dateTime,
      end_time: event.end.dateTime,
      attendees: event.attendees?.map(a => a.displayName || a.email) || [],
      status: 'upcoming',
      platform: 'google-meet',
      join_url: event.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri || event.htmlLink,
      auto_transcribe: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setSelectedMeeting(meeting)
    setShowCalendarIntegration(false)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'live':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (selectedMeeting) {
    return (
      <div className="space-y-6">
        {/* Meeting Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedMeeting.title}</h2>
              <p className="text-gray-600">{formatDate(selectedMeeting.start_time)} at {formatTime(selectedMeeting.start_time)}</p>
            </div>
            <button
              onClick={disconnectFromMeeting}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <StopIcon className="w-4 h-4" />
              <span>Leave Meeting</span>
            </button>
          </div>

          {/* Meeting Controls */}
          <div className="grid md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <MicrophoneIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Transcription Active</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <UserGroupIcon className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">{selectedMeeting.attendees.length} Participants</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <ClockIcon className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Live</span>
            </button>
          </div>
        </div>

        {/* Live Transcription */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Transcription</h3>
          <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-sm font-medium text-blue-600">John Doe:</span>
                <p className="text-sm text-gray-700">Good morning everyone, let's start with our daily standup.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-sm font-medium text-green-600">Jane Smith:</span>
                <p className="text-sm text-gray-700">I completed the user authentication feature yesterday and will be working on the dashboard today.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-sm font-medium text-purple-600">Mike Johnson:</span>
                <p className="text-sm text-gray-700">I'm still working on the API integration and should have it ready by tomorrow.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <DocumentTextIcon className="w-5 h-5" />
            <span>Generate Summary</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <ChartBarIcon className="w-5 h-5" />
            <span>View Analytics</span>
          </button>
        </div>
      </div>
    )
  }

  if (showCalendarIntegration) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Google Calendar Integration</h2>
          <button
            onClick={() => setShowCalendarIntegration(false)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span>Back to Meetings</span>
          </button>
        </div>
        
        <GoogleCalendarIntegration 
          userId={userId} 
          onMeetingSelected={handleCalendarMeetingSelected}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CalendarDaysIcon className="w-5 h-5 inline mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <DocumentTextIcon className="w-5 h-5 inline mr-2" />
            List
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Meetings</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading meetings...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Meetings List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12">
              <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => setShowCalendarIntegration(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <CalendarDaysIcon className="w-5 h-5" />
                <span>Connect Google Calendar</span>
              </button>
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatDate(meeting.start_time)} at {formatTime(meeting.start_time)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{meeting.attendees.length} participants</span>
                      </div>
                      
                      {meeting.auto_transcribe && (
                        <div className="flex items-center space-x-1">
                          <MicrophoneIcon className="w-4 h-4" />
                          <span>Auto-transcribe</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {meeting.status === 'upcoming' && (
                      <button
                        onClick={() => joinMeeting(meeting)}
                        disabled={loading}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <PlayIcon className="w-4 h-4" />
                        <span>Join</span>
                      </button>
                    )}
                    
                    {meeting.status === 'completed' && (
                      <button className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>View Summary</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick Add Meeting */}
      <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
        <div className="text-center">
          <PlusIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Add New Meeting</h3>
          <p className="text-gray-600 mb-4">Connect your Google Calendar or manually add a meeting</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowCalendarIntegration(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CalendarDaysIcon className="w-4 h-4" />
              <span>Connect Google Calendar</span>
            </button>
            <button className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>Add Manually</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  MicrophoneIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface Meeting {
  id: string
  title: string
  description?: string
  platform: 'zoom' | 'google-meet' | 'teams' | 'webex'
  startTime: Date
  endTime: Date
  duration: number // minutes
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  participants: Participant[]
  recordingUrl?: string
  transcriptUrl?: string
  autoTranscribe: boolean
  autoJoin: boolean
  permissions: {
    canRecord: boolean
    canTranscribe: boolean
    canShare: boolean
    visibility: 'private' | 'team' | 'public'
  }
  metadata: {
    meetingId: string
    joinUrl: string
    password?: string
    hostEmail: string
    timezone: string
    recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'
  }
  transcription?: Transcription
  summary?: MeetingSummary
  actionItems: ActionItem[]
  tags: string[]
}

interface Participant {
  id: string
  name: string
  email: string
  role: 'host' | 'co-host' | 'participant'
  joinTime?: Date
  leaveTime?: Date
  speakingTime: number // seconds
  status: 'invited' | 'accepted' | 'declined' | 'joined' | 'left'
}

interface Transcription {
  id: string
  status: 'processing' | 'completed' | 'failed'
  content: TranscriptSegment[]
  speakers: Speaker[]
  confidence: number
  language: string
  wordCount: number
  duration: number
  createdAt: Date
  updatedAt: Date
}

interface TranscriptSegment {
  id: string
  speakerId: string
  startTime: number
  endTime: number
  text: string
  confidence: number
  sentiment: number
  intent?: string
  emotion?: string
}

interface Speaker {
  id: string
  name: string
  email?: string
  color: string
  totalSpeakingTime: number
  segments: number
  averageConfidence: number
}

interface MeetingSummary {
  id: string
  overview: string
  keyPoints: string[]
  decisions: string[]
  nextSteps: string[]
  sentiment: number
  participants: number
  duration: number
  createdAt: Date
}

interface ActionItem {
  id: string
  description: string
  assignee: string
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
  sourceSegment?: string
  createdAt: Date
}

interface CalendarIntegration {
  google: {
    enabled: boolean
    lastSync: Date | null
    accessToken?: string
    calendarId: string
  }
  outlook: {
    enabled: boolean
    lastSync: Date | null
    accessToken?: string
    calendarId: string
  }
  autoSync: boolean
  syncInterval: number // minutes
}

export default function MeetingIntegrationWorkflow() {
  const [currentView, setCurrentView] = useState<'overview' | 'calendar' | 'recordings' | 'transcriptions' | 'settings'>('overview')
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [calendarIntegration, setCalendarIntegration] = useState<CalendarIntegration>({
    google: { enabled: false, lastSync: null, calendarId: 'primary' },
    outlook: { enabled: false, lastSync: null, calendarId: 'primary' },
    autoSync: true,
    syncInterval: 15
  })
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [autoJoinEnabled, setAutoJoinEnabled] = useState(false)
  const [autoTranscribeEnabled, setAutoTranscribeEnabled] = useState(true)

  // Sample meetings for demonstration
  const sampleMeetings: Meeting[] = [
    {
      id: '1',
      title: 'Q4 Strategy Review',
      description: 'Review Q4 performance and plan for next quarter',
      platform: 'zoom',
      startTime: new Date('2024-12-15T10:00:00'),
      endTime: new Date('2024-12-15T11:00:00'),
      duration: 60,
      status: 'scheduled',
      participants: [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@company.com',
          role: 'host',
          speakingTime: 0,
          status: 'accepted'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@company.com',
          role: 'participant',
          speakingTime: 0,
          status: 'accepted'
        }
      ],
      autoTranscribe: true,
      autoJoin: false,
      permissions: {
        canRecord: true,
        canTranscribe: true,
        canShare: true,
        visibility: 'team'
      },
      metadata: {
        meetingId: '123456789',
        joinUrl: 'https://zoom.us/j/123456789',
        hostEmail: 'alice@company.com',
        timezone: 'America/New_York'
      },
      actionItems: [],
      tags: ['strategy', 'q4', 'review']
    },
    {
      id: '2',
      title: 'Product Development Sync',
      description: 'Weekly sync on product development progress',
      platform: 'google-meet',
      startTime: new Date('2024-12-14T14:00:00'),
      endTime: new Date('2024-12-14T15:00:00'),
      duration: 60,
      status: 'completed',
      participants: [
        {
          id: '3',
          name: 'Carol Davis',
          email: 'carol@company.com',
          role: 'host',
          joinTime: new Date('2024-12-14T14:00:00'),
          leaveTime: new Date('2024-12-14T15:00:00'),
          speakingTime: 1800,
          status: 'joined'
        }
      ],
      recordingUrl: 'https://drive.google.com/file/d/abc123',
      transcriptUrl: 'https://yonder.ntu.com/transcript/abc123',
      autoTranscribe: true,
      autoJoin: true,
      permissions: {
        canRecord: true,
        canTranscribe: true,
        canShare: true,
        visibility: 'team'
      },
      metadata: {
        meetingId: 'meet-abc123',
        joinUrl: 'https://meet.google.com/abc-defg-hij',
        hostEmail: 'carol@company.com',
        timezone: 'America/New_York'
      },
      transcription: {
        id: 'trans-1',
        status: 'completed',
        content: [
          {
            id: 'seg-1',
            speakerId: 'speaker-1',
            startTime: 0,
            endTime: 30,
            text: 'Welcome everyone to our weekly product development sync.',
            confidence: 0.95,
            sentiment: 0.8,
            intent: 'greeting',
            emotion: 'positive'
          }
        ],
        speakers: [
          {
            id: 'speaker-1',
            name: 'Carol Davis',
            color: '#3B82F6',
            totalSpeakingTime: 1800,
            segments: 45,
            averageConfidence: 0.92
          }
        ],
        confidence: 0.92,
        language: 'en',
        wordCount: 2500,
        duration: 3600,
        createdAt: new Date('2024-12-14T15:00:00'),
        updatedAt: new Date('2024-12-14T15:05:00')
      },
      summary: {
        id: 'sum-1',
        overview: 'Weekly product development sync covering feature updates and roadmap planning.',
        keyPoints: [
          'New user authentication feature is 80% complete',
          'Mobile app beta testing to begin next week',
          'API performance improvements implemented'
        ],
        decisions: [
          'Approved new design system implementation',
          'Decided to postpone database migration to next sprint'
        ],
        nextSteps: [
          'Complete user authentication feature by Friday',
          'Prepare mobile app for beta release',
          'Schedule database migration planning session'
        ],
        sentiment: 0.7,
        participants: 8,
        duration: 3600,
        createdAt: new Date('2024-12-14T15:10:00')
      },
      actionItems: [
        {
          id: 'action-1',
          description: 'Complete user authentication feature',
          assignee: 'alice@company.com',
          dueDate: new Date('2024-12-20'),
          priority: 'high',
          status: 'pending',
          createdAt: new Date('2024-12-14T15:00:00')
        }
      ],
      tags: ['product', 'development', 'weekly']
    }
  ]

  useEffect(() => {
    setMeetings(sampleMeetings)
  }, [])

  // Sync calendar
  const syncCalendar = async (provider: 'google' | 'outlook') => {
    console.log(`Syncing ${provider} calendar...`)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newMeetings: Meeting[] = [
      {
        id: Date.now().toString(),
        title: 'New Calendar Meeting',
        platform: 'zoom',
        startTime: new Date(Date.now() + 86400000), // Tomorrow
        endTime: new Date(Date.now() + 86400000 + 3600000), // +1 hour
        duration: 60,
        status: 'scheduled',
        participants: [],
        autoTranscribe: autoTranscribeEnabled,
        autoJoin: autoJoinEnabled,
        permissions: {
          canRecord: true,
          canTranscribe: true,
          canShare: true,
          visibility: 'team'
        },
        metadata: {
          meetingId: 'new-meeting',
          joinUrl: 'https://zoom.us/j/new-meeting',
          hostEmail: 'user@company.com',
          timezone: 'America/New_York'
        },
        actionItems: [],
        tags: ['calendar', 'sync']
      }
    ]
    
    setMeetings(prev => [...newMeetings, ...prev])
    setCalendarIntegration(prev => ({
      ...prev,
      [provider]: { ...prev[provider], lastSync: new Date() }
    }))
  }

  // Join meeting
  const joinMeeting = async (meeting: Meeting) => {
    console.log(`Joining meeting: ${meeting.title}`)
    setShowJoinModal(false)
    
    // Update meeting status
    setMeetings(prev => prev.map(m => 
      m.id === meeting.id ? { ...m, status: 'in-progress' } : m
    ))
    
    // Start recording if enabled
    if (meeting.permissions.canRecord) {
      setIsRecording(true)
    }
    
    // Start transcription if enabled
    if (meeting.autoTranscribe) {
      setIsTranscribing(true)
    }
  }

  // Start recording
  const startRecording = async (meetingId: string) => {
    setIsRecording(true)
    console.log(`Started recording meeting ${meetingId}`)
  }

  // Stop recording
  const stopRecording = async (meetingId: string) => {
    setIsRecording(false)
    console.log(`Stopped recording meeting ${meetingId}`)
    
    // Simulate processing recording
    setTimeout(() => {
      setMeetings(prev => prev.map(m => 
        m.id === meetingId 
          ? { 
              ...m, 
              status: 'completed',
              recordingUrl: 'https://drive.google.com/file/d/recording-123'
            }
          : m
      ))
    }, 3000)
  }

  // Generate transcript
  const generateTranscript = async (meetingId: string) => {
    setIsTranscribing(true)
    console.log(`Generating transcript for meeting ${meetingId}`)
    
    // Simulate transcription process
    setTimeout(() => {
      setIsTranscribing(false)
      setMeetings(prev => prev.map(m => 
        m.id === meetingId 
          ? { 
              ...m, 
              transcriptUrl: 'https://yonder.ntu.com/transcript/trans-123',
              transcription: {
                id: 'trans-123',
                status: 'completed',
                content: [
                  {
                    id: 'seg-1',
                    speakerId: 'speaker-1',
                    startTime: 0,
                    endTime: 30,
                    text: 'Meeting transcript content...',
                    confidence: 0.95,
                    sentiment: 0.8
                  }
                ],
                speakers: [
                  {
                    id: 'speaker-1',
                    name: 'Speaker 1',
                    color: '#3B82F6',
                    totalSpeakingTime: 1800,
                    segments: 45,
                    averageConfidence: 0.92
                  }
                ],
                confidence: 0.92,
                language: 'en',
                wordCount: 2500,
                duration: 3600,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          : m
      ))
    }, 5000)
  }

  // Generate summary
  const generateSummary = async (meetingId: string) => {
    console.log(`Generating summary for meeting ${meetingId}`)
    
    // Simulate AI summary generation
    setTimeout(() => {
      setMeetings(prev => prev.map(m => 
        m.id === meetingId 
          ? { 
              ...m, 
              summary: {
                id: 'sum-123',
                overview: 'AI-generated meeting summary...',
                keyPoints: ['Key point 1', 'Key point 2'],
                decisions: ['Decision 1'],
                nextSteps: ['Next step 1'],
                sentiment: 0.7,
                participants: 5,
                duration: 3600,
                createdAt: new Date()
              }
            }
          : m
      ))
    }, 3000)
  }

  // Extract action items
  const extractActionItems = async (meetingId: string) => {
    console.log(`Extracting action items for meeting ${meetingId}`)
    
    // Simulate action item extraction
    setTimeout(() => {
      setMeetings(prev => prev.map(m => 
        m.id === meetingId 
          ? { 
              ...m, 
              actionItems: [
                {
                  id: 'action-123',
                  description: 'Follow up on project timeline',
                  assignee: 'alice@company.com',
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
                  priority: 'medium',
                  status: 'pending',
                  createdAt: new Date()
                }
              ]
            }
          : m
      ))
    }, 2000)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Meeting Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Scheduled</span>
              <span className="font-semibold">{meetings.filter(m => m.status === 'scheduled').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>In Progress</span>
              <span className="font-semibold text-blue-600">{meetings.filter(m => m.status === 'in-progress').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Completed</span>
              <span className="font-semibold text-green-600">{meetings.filter(m => m.status === 'completed').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Platforms</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Zoom</span>
              <span className="font-semibold">{meetings.filter(m => m.platform === 'zoom').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Google Meet</span>
              <span className="font-semibold">{meetings.filter(m => m.platform === 'google-meet').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Teams</span>
              <span className="font-semibold">{meetings.filter(m => m.platform === 'teams').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Auto Features</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Auto Join</span>
              <span className={`w-2 h-2 rounded-full ${autoJoinEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div className="flex items-center justify-between">
              <span>Auto Transcribe</span>
              <span className={`w-2 h-2 rounded-full ${autoTranscribeEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div className="flex items-center justify-between">
              <span>Calendar Sync</span>
              <span className={`w-2 h-2 rounded-full ${calendarIntegration.autoSync ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setCurrentView('calendar')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded"
            >
              <CalendarIcon className="w-4 h-4 inline mr-2" />
              Sync Calendar
            </button>
            <button 
              onClick={() => setCurrentView('recordings')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded"
            >
              <VideoCameraIcon className="w-4 h-4 inline mr-2" />
              View Recordings
            </button>
            <button 
              onClick={() => setCurrentView('transcriptions')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded"
            >
              <DocumentTextIcon className="w-4 h-4 inline mr-2" />
              View Transcripts
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
        <div className="space-y-3">
          {meetings
            .filter(m => m.status === 'scheduled')
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
            .slice(0, 5)
            .map(meeting => (
              <div key={meeting.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <h4 className="font-medium">{meeting.title}</h4>
                  <p className="text-sm text-gray-600">
                    {meeting.startTime.toLocaleDateString()} at {meeting.startTime.toLocaleTimeString()}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      meeting.platform === 'zoom' ? 'bg-blue-100 text-blue-800' :
                      meeting.platform === 'google-meet' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {meeting.platform}
                    </span>
                    <span className="text-xs text-gray-500">{meeting.duration} min</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {meeting.autoJoin && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Auto Join
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedMeeting(meeting)
                      setShowJoinModal(true)
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar Integration</h2>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Cog6ToothIcon className="w-4 h-4 inline mr-2" />
          Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Google Calendar</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className={`px-2 py-1 rounded text-xs ${
                calendarIntegration.google.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {calendarIntegration.google.enabled ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {calendarIntegration.google.lastSync && (
              <div className="text-sm text-gray-600">
                Last sync: {calendarIntegration.google.lastSync.toLocaleString()}
              </div>
            )}
            <button
              onClick={() => syncCalendar('google')}
              disabled={!calendarIntegration.google.enabled}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Sync Now
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Outlook Calendar</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className={`px-2 py-1 rounded text-xs ${
                calendarIntegration.outlook.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {calendarIntegration.outlook.enabled ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {calendarIntegration.outlook.lastSync && (
              <div className="text-sm text-gray-600">
                Last sync: {calendarIntegration.outlook.lastSync.toLocaleString()}
              </div>
            )}
            <button
              onClick={() => syncCalendar('outlook')}
              disabled={!calendarIntegration.outlook.enabled}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Sync Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRecordings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Meeting Recordings</h2>
      
      <div className="space-y-4">
        {meetings
          .filter(m => m.recordingUrl || m.status === 'in-progress')
          .map(meeting => (
            <div key={meeting.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{meeting.title}</h3>
                  <p className="text-sm text-gray-600">
                    {meeting.startTime.toLocaleDateString()} • {meeting.duration} minutes
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {meeting.status === 'in-progress' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      Live
                    </span>
                  )}
                  {meeting.recordingUrl && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      Recorded
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {meeting.status === 'in-progress' && (
                  <>
                    <button
                      onClick={() => startRecording(meeting.id)}
                      disabled={isRecording}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                    >
                      <PlayIcon className="w-4 h-4 inline mr-2" />
                      Start Recording
                    </button>
                    <button
                      onClick={() => stopRecording(meeting.id)}
                      disabled={!isRecording}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:bg-gray-400"
                    >
                      <StopIcon className="w-4 h-4 inline mr-2" />
                      Stop Recording
                    </button>
                  </>
                )}
                {meeting.recordingUrl && (
                  <>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      <PlayIcon className="w-4 h-4 inline mr-2" />
                      Play
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                      <ArrowDownTrayIcon className="w-4 h-4 inline mr-2" />
                      Download
                    </button>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                      <ShareIcon className="w-4 h-4 inline mr-2" />
                      Share
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  )

  const renderTranscriptions = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Meeting Transcripts</h2>
      
      <div className="space-y-4">
        {meetings
          .filter(m => m.transcription || m.status === 'in-progress')
          .map(meeting => (
            <div key={meeting.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{meeting.title}</h3>
                  <p className="text-sm text-gray-600">
                    {meeting.startTime.toLocaleDateString()} • {meeting.duration} minutes
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {meeting.transcription && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      meeting.transcription.status === 'completed' ? 'bg-green-100 text-green-800' :
                      meeting.transcription.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {meeting.transcription.status}
                    </span>
                  )}
                </div>
              </div>

              {meeting.transcription && (
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Word Count</span>
                      <p className="font-medium">{meeting.transcription.wordCount}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Confidence</span>
                      <p className="font-medium">{(meeting.transcription.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Speakers</span>
                      <p className="font-medium">{meeting.transcription.speakers.length}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                {!meeting.transcription && meeting.status === 'completed' && (
                  <button
                    onClick={() => generateTranscript(meeting.id)}
                    disabled={isTranscribing}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Generate Transcript
                  </button>
                )}
                {meeting.transcription && meeting.transcription.status === 'completed' && (
                  <>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                      View Transcript
                    </button>
                    <button
                      onClick={() => generateSummary(meeting.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Generate Summary
                    </button>
                    <button
                      onClick={() => extractActionItems(meeting.id)}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                      Extract Actions
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Meeting Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Auto Features</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoJoinEnabled}
                onChange={(e) => setAutoJoinEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="ml-2">Auto-join meetings</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoTranscribeEnabled}
                onChange={(e) => setAutoTranscribeEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="ml-2">Auto-transcribe meetings</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={calendarIntegration.autoSync}
                onChange={(e) => setCalendarIntegration(prev => ({ ...prev, autoSync: e.target.checked }))}
                className="rounded"
              />
              <span className="ml-2">Auto-sync calendar</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Permissions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Recording Permission</label>
              <select className="w-full border rounded px-3 py-2">
                <option>Always ask</option>
                <option>Auto-record</option>
                <option>Never record</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Default Transcription Permission</label>
              <select className="w-full border rounded px-3 py-2">
                <option>Always ask</option>
                <option>Auto-transcribe</option>
                <option>Never transcribe</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Integration</h1>
          <p className="text-gray-600">Zoom, Google Meet, calendar sync, and automated meeting management</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: VideoCameraIcon },
              { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
              { id: 'recordings', label: 'Recordings', icon: PlayIcon },
              { id: 'transcriptions', label: 'Transcripts', icon: DocumentTextIcon },
              { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  currentView === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {currentView === 'overview' && renderOverview()}
        {currentView === 'calendar' && renderCalendar()}
        {currentView === 'recordings' && renderRecordings()}
        {currentView === 'transcriptions' && renderTranscriptions()}
        {currentView === 'settings' && renderSettings()}

        {/* Join Meeting Modal */}
        {showJoinModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Join Meeting</h3>
              <p className="text-gray-600 mb-4">
                Join "{selectedMeeting.title}"?
              </p>
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium">Auto-transcribe:</span>
                  <span className={`w-2 h-2 rounded-full ${selectedMeeting.autoTranscribe ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Auto-record:</span>
                  <span className={`w-2 h-2 rounded-full ${selectedMeeting.permissions.canRecord ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => joinMeeting(selectedMeeting)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Join Meeting
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
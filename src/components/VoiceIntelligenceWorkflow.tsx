'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  MicrophoneIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  CloudIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  BellIcon,
  HeartIcon,
  FaceSmileIcon,
  FaceFrownIcon,

} from '@heroicons/react/24/outline'

interface VoiceSession {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime?: Date
  duration: number // seconds
  status: 'recording' | 'processing' | 'completed' | 'failed'
  audioUrl?: string
  transcriptUrl?: string
  model: 'whisper-large' | 'whisper-medium' | 'whisper-small' | 'whisper-tiny'
  processingMode: 'local' | 'cloud' | 'hybrid'
  speakers: Speaker[]
  segments: TranscriptSegment[]
  analytics: VoiceAnalytics
  metadata: VoiceMetadata
  settings: VoiceSettings
}

interface Speaker {
  id: string
  name: string
  color: string
  totalSpeakingTime: number
  segments: number
  averageConfidence: number
  emotionProfile: EmotionProfile
  voiceCharacteristics: VoiceCharacteristics
}

interface TranscriptSegment {
  id: string
  speakerId: string
  startTime: number
  endTime: number
  text: string
  confidence: number
  sentiment: number
  intent: string
  emotion: string
  keywords: string[]
  actionItems: string[]
  topics: string[]
  language: string
  isHighlighted: boolean
}

interface VoiceAnalytics {
  overallSentiment: number
  sentimentTimeline: SentimentPoint[]
  speakerDistribution: Record<string, number>
  topicAnalysis: TopicAnalysis[]
  intentClassification: IntentAnalysis[]
  emotionAnalysis: EmotionAnalysis[]
  speakingPace: number
  silencePercentage: number
  overlapPercentage: number
  keyMoments: KeyMoment[]
  actionItems: ActionItem[]
  summary: string
}

interface SentimentPoint {
  timestamp: number
  sentiment: number
  speakerId: string
}

interface TopicAnalysis {
  topic: string
  frequency: number
  speakers: string[]
  segments: string[]
  sentiment: number
}

interface IntentAnalysis {
  intent: string
  confidence: number
  frequency: number
  examples: string[]
}

interface EmotionAnalysis {
  emotion: string
  frequency: number
  speakers: string[]
  intensity: number
}

interface KeyMoment {
  id: string
  timestamp: number
  type: 'decision' | 'action_item' | 'conflict' | 'agreement' | 'question'
  description: string
  participants: string[]
  sentiment: number
  importance: number
}

interface ActionItem {
  id: string
  description: string
  assignee: string
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  sourceSegment: string
  status: 'pending' | 'in-progress' | 'completed'
}

interface EmotionProfile {
  dominant: string
  distribution: Record<string, number>
  transitions: EmotionTransition[]
}

interface EmotionTransition {
  from: string
  to: string
  frequency: number
  triggers: string[]
}

interface VoiceCharacteristics {
  pitch: number
  pace: number
  volume: number
  clarity: number
  accent?: string
  language: string
}

interface VoiceMetadata {
  fileSize: number
  format: string
  sampleRate: number
  channels: number
  bitrate: number
  quality: 'low' | 'medium' | 'high'
  noiseLevel: number
  recordingEnvironment: string
  device: string
  location?: string
}

interface VoiceSettings {
  autoTranscribe: boolean
  realTimeProcessing: boolean
  speakerIdentification: boolean
  sentimentAnalysis: boolean
  intentClassification: boolean
  emotionDetection: boolean
  actionItemExtraction: boolean
  keyMomentDetection: boolean
  languageDetection: boolean
  noiseReduction: boolean
  qualityOptimization: boolean
  privacyMode: boolean
  complianceLevel: 'public' | 'internal' | 'confidential' | 'restricted'
}

export default function VoiceIntelligenceWorkflow() {
  const [currentView, setCurrentView] = useState<'overview' | 'recording' | 'transcripts' | 'analytics' | 'settings'>('overview')
  const [sessions, setSessions] = useState<VoiceSession[]>([])
  const [selectedSession, setSelectedSession] = useState<VoiceSession | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])

  // Sample sessions for demonstration
  const sampleSessions: VoiceSession[] = [
    {
      id: '1',
      title: 'Q4 Strategy Meeting',
      description: 'Quarterly strategy review and planning session',
      startTime: new Date('2024-12-14T10:00:00'),
      endTime: new Date('2024-12-14T11:00:00'),
      duration: 3600,
      status: 'completed',
      model: 'whisper-large',
      processingMode: 'hybrid',
      speakers: [
        {
          id: 'speaker-1',
          name: 'Alice Johnson',
          color: '#3B82F6',
          totalSpeakingTime: 1800,
          segments: 45,
          averageConfidence: 0.92,
          emotionProfile: {
            dominant: 'positive',
            distribution: { positive: 0.6, neutral: 0.3, negative: 0.1 },
            transitions: []
          },
          voiceCharacteristics: {
            pitch: 0.7,
            pace: 120,
            volume: 0.8,
            clarity: 0.9,
            language: 'en'
          }
        },
        {
          id: 'speaker-2',
          name: 'Bob Smith',
          color: '#10B981',
          totalSpeakingTime: 1200,
          segments: 32,
          averageConfidence: 0.88,
          emotionProfile: {
            dominant: 'neutral',
            distribution: { positive: 0.4, neutral: 0.5, negative: 0.1 },
            transitions: []
          },
          voiceCharacteristics: {
            pitch: 0.5,
            pace: 110,
            volume: 0.7,
            clarity: 0.85,
            language: 'en'
          }
        }
      ],
      segments: [
        {
          id: 'seg-1',
          speakerId: 'speaker-1',
          startTime: 0,
          endTime: 30,
          text: 'Welcome everyone to our Q4 strategy review meeting.',
          confidence: 0.95,
          sentiment: 0.8,
          intent: 'greeting',
          emotion: 'positive',
          keywords: ['welcome', 'strategy', 'review'],
          actionItems: [],
          topics: ['meeting', 'strategy'],
          language: 'en',
          isHighlighted: false
        },
        {
          id: 'seg-2',
          speakerId: 'speaker-2',
          startTime: 30,
          endTime: 60,
          text: 'Thank you Alice. Let\'s start with the revenue projections.',
          confidence: 0.88,
          sentiment: 0.6,
          intent: 'request',
          emotion: 'neutral',
          keywords: ['revenue', 'projections'],
          actionItems: ['review revenue projections'],
          topics: ['revenue', 'projections'],
          language: 'en',
          isHighlighted: true
        }
      ],
      analytics: {
        overallSentiment: 0.7,
        sentimentTimeline: [
          { timestamp: 0, sentiment: 0.8, speakerId: 'speaker-1' },
          { timestamp: 30, sentiment: 0.6, speakerId: 'speaker-2' }
        ],
        speakerDistribution: { 'speaker-1': 60, 'speaker-2': 40 },
        topicAnalysis: [
          {
            topic: 'strategy',
            frequency: 15,
            speakers: ['speaker-1', 'speaker-2'],
            segments: ['seg-1', 'seg-2'],
            sentiment: 0.7
          }
        ],
        intentClassification: [
          {
            intent: 'greeting',
            confidence: 0.9,
            frequency: 3,
            examples: ['Welcome everyone', 'Good morning']
          }
        ],
        emotionAnalysis: [
          {
            emotion: 'positive',
            frequency: 0.6,
            speakers: ['speaker-1'],
            intensity: 0.8
          }
        ],
        speakingPace: 115,
        silencePercentage: 15,
        overlapPercentage: 5,
        keyMoments: [
          {
            id: 'km-1',
            timestamp: 30,
            type: 'action_item',
            description: 'Review revenue projections',
            participants: ['speaker-2'],
            sentiment: 0.6,
            importance: 0.8
          }
        ],
        actionItems: [
          {
            id: 'ai-1',
            description: 'Review revenue projections',
            assignee: 'Bob Smith',
            dueDate: new Date('2024-12-20'),
            priority: 'high',
            sourceSegment: 'seg-2',
            status: 'pending'
          }
        ],
        summary: 'Q4 strategy review meeting focused on revenue projections and planning.'
      },
      metadata: {
        fileSize: 45000000,
        format: 'WAV',
        sampleRate: 44100,
        channels: 2,
        bitrate: 320,
        quality: 'high',
        noiseLevel: 0.1,
        recordingEnvironment: 'conference_room',
        device: 'Zoom H6'
      },
      settings: {
        autoTranscribe: true,
        realTimeProcessing: true,
        speakerIdentification: true,
        sentimentAnalysis: true,
        intentClassification: true,
        emotionDetection: true,
        actionItemExtraction: true,
        keyMomentDetection: true,
        languageDetection: true,
        noiseReduction: true,
        qualityOptimization: true,
        privacyMode: false,
        complianceLevel: 'internal'
      }
    }
  ]

  useEffect(() => {
    setSessions(sampleSessions)
  }, [])

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setRecordingStream(stream)
      
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        processAudio(audioBlob)
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setAudioChunks(chunks)
      
      // Start timer
      const timer = setInterval(() => {
        setCurrentTime(prev => prev + 1)
      }, 1000)
      
      return () => clearInterval(timer)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      recordingStream?.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setMediaRecorder(null)
      setRecordingStream(null)
    }
  }

  // Process audio
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    
    // Simulate processing time
    setTimeout(() => {
      const newSession: VoiceSession = {
        id: Date.now().toString(),
        title: `Voice Session ${new Date().toLocaleString()}`,
        startTime: new Date(),
        endTime: new Date(),
        duration: currentTime,
        status: 'completed',
        model: 'whisper-large',
        processingMode: 'hybrid',
        speakers: [
          {
            id: 'speaker-1',
            name: 'Speaker 1',
            color: '#3B82F6',
            totalSpeakingTime: currentTime * 0.6,
            segments: Math.floor(currentTime / 30),
            averageConfidence: 0.9,
            emotionProfile: {
              dominant: 'neutral',
              distribution: { positive: 0.3, neutral: 0.6, negative: 0.1 },
              transitions: []
            },
            voiceCharacteristics: {
              pitch: 0.6,
              pace: 120,
              volume: 0.8,
              clarity: 0.9,
              language: 'en'
            }
          }
        ],
        segments: [
          {
            id: 'seg-1',
            speakerId: 'speaker-1',
            startTime: 0,
            endTime: currentTime,
            text: 'Processed audio content...',
            confidence: 0.9,
            sentiment: 0.5,
            intent: 'general',
            emotion: 'neutral',
            keywords: ['processed', 'audio'],
            actionItems: [],
            topics: ['general'],
            language: 'en',
            isHighlighted: false
          }
        ],
        analytics: {
          overallSentiment: 0.5,
          sentimentTimeline: [],
          speakerDistribution: { 'speaker-1': 100 },
          topicAnalysis: [],
          intentClassification: [],
          emotionAnalysis: [],
          speakingPace: 120,
          silencePercentage: 20,
          overlapPercentage: 0,
          keyMoments: [],
          actionItems: [],
          summary: 'Voice session processed successfully.'
        },
        metadata: {
          fileSize: audioBlob.size,
          format: 'WAV',
          sampleRate: 44100,
          channels: 1,
          bitrate: 128,
          quality: 'medium',
          noiseLevel: 0.2,
          recordingEnvironment: 'unknown',
          device: 'Browser Microphone'
        },
        settings: {
          autoTranscribe: true,
          realTimeProcessing: true,
          speakerIdentification: true,
          sentimentAnalysis: true,
          intentClassification: true,
          emotionDetection: true,
          actionItemExtraction: true,
          keyMomentDetection: true,
          languageDetection: true,
          noiseReduction: true,
          qualityOptimization: true,
          privacyMode: false,
          complianceLevel: 'internal'
        }
      }
      
      setSessions(prev => [newSession, ...prev])
      setIsProcessing(false)
      setCurrentTime(0)
    }, 3000)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MicrophoneIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <SpeakerWaveIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.reduce((acc, session) => acc + session.duration, 0) / 60} min
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Speakers</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(sessions.flatMap(s => s.speakers.map(sp => sp.id))).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Sentiment</p>
              <p className="text-2xl font-bold text-gray-900">
                {(sessions.reduce((acc, session) => acc + session.analytics.overallSentiment, 0) / sessions.length * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {sessions.slice(0, 5).map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <h4 className="font-medium">{session.title}</h4>
                  <p className="text-sm text-gray-600">
                    {session.startTime.toLocaleDateString()} • {Math.floor(session.duration / 60)} min
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {session.status}
                    </span>
                    <span className="text-xs text-gray-500">{session.speakers.length} speakers</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSession(session)
                      setCurrentView('transcripts')
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Voice Analytics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Processing Models</span>
                <span>Whisper Large</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Real-time Processing</span>
                <span>Enabled</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Speaker Identification</span>
                <span>95% Accuracy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRecording = () => (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold mb-6">Voice Intelligence Recording</h2>
        
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">Recording Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {isRecording ? 'Live' : 'Ready'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-red-600 text-white px-8 py-4 rounded-full hover:bg-red-700 flex items-center space-x-2"
            >
              <MicrophoneIcon className="w-6 h-6" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-gray-600 text-white px-8 py-4 rounded-full hover:bg-gray-700 flex items-center space-x-2"
            >
              <StopIcon className="w-6 h-6" />
              <span>Stop Recording</span>
            </button>
          )}
        </div>

        {isProcessing && (
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-2">
              <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-blue-600">Processing audio with Whisper...</span>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <ComputerDesktopIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Local Processing</h3>
            <p className="text-sm text-gray-600">Whisper models run offline</p>
          </div>
          <div className="text-center">
            <CloudIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold">Cloud Fallback</h3>
            <p className="text-sm text-gray-600">Enhanced processing when needed</p>
          </div>
          <div className="text-center">
            <ChartBarIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold">Real-time Analytics</h3>
            <p className="text-sm text-gray-600">Sentiment, intent, and emotion</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTranscripts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Voice Transcripts</h2>
        <button
          onClick={() => setShowSessionModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 inline mr-2" />
          New Session
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{session.title}</h3>
                <p className="text-sm text-gray-600">
                  {session.startTime.toLocaleDateString()} • {Math.floor(session.duration / 60)} minutes
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs ${
                    session.model === 'whisper-large' ? 'bg-purple-100 text-purple-800' :
                    session.model === 'whisper-medium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {session.model}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    session.processingMode === 'local' ? 'bg-green-100 text-green-800' :
                    session.processingMode === 'cloud' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {session.processingMode}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedSession(session)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            </div>

            {selectedSession?.id === session.id && (
              <div className="mt-4 border-t pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Transcript</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {session.segments.map(segment => (
                        <div key={segment.id} className={`p-3 rounded ${
                          segment.isHighlighted ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm" style={{ color: session.speakers.find(s => s.id === segment.speakerId)?.color }}>
                              {session.speakers.find(s => s.id === segment.speakerId)?.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {Math.floor(segment.startTime / 60)}:{(segment.startTime % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <p className="text-sm">{segment.text}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              segment.sentiment > 0.6 ? 'bg-green-100 text-green-800' :
                              segment.sentiment < 0.4 ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {segment.sentiment > 0.6 ? 'Positive' : segment.sentiment < 0.4 ? 'Negative' : 'Neutral'}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                              {segment.intent}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                              {segment.emotion}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Analytics</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Sentiment</span>
                          <span>{(session.analytics.overallSentiment * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              session.analytics.overallSentiment > 0.6 ? 'bg-green-600' :
                              session.analytics.overallSentiment < 0.4 ? 'bg-red-600' :
                              'bg-yellow-600'
                            }`}
                            style={{ width: `${session.analytics.overallSentiment * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Speaker Distribution</h5>
                        <div className="space-y-2">
                          {session.speakers.map(speaker => (
                            <div key={speaker.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: speaker.color }}
                                />
                                <span className="text-sm">{speaker.name}</span>
                              </div>
                              <span className="text-sm font-medium">
                                {Math.round((speaker.totalSpeakingTime / session.duration) * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Key Moments</h5>
                        <div className="space-y-2">
                          {session.analytics.keyMoments.slice(0, 3).map(moment => (
                            <div key={moment.id} className="text-sm p-2 bg-gray-50 rounded">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{moment.type}</span>
                                <span className="text-gray-500">
                                  {Math.floor(moment.timestamp / 60)}:{(moment.timestamp % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                              <p className="text-gray-600">{moment.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Voice Analytics Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Sentiment Trends</h3>
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{session.title}</p>
                  <p className="text-sm text-gray-600">
                    {session.startTime.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        session.analytics.overallSentiment > 0.6 ? 'bg-green-600' :
                        session.analytics.overallSentiment < 0.4 ? 'bg-red-600' :
                        'bg-yellow-600'
                      }`}
                      style={{ width: `${session.analytics.overallSentiment * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {(session.analytics.overallSentiment * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Processing Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Whisper Large Model</span>
                <span>85% usage</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Real-time Processing</span>
                <span>92% accuracy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Speaker Identification</span>
                <span>95% accuracy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Intent Classification</span>
                <span>88% accuracy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Voice Intelligence Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Processing Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Whisper Model</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="whisper-large">Whisper Large (Best Quality)</option>
                <option value="whisper-medium">Whisper Medium (Balanced)</option>
                <option value="whisper-small">Whisper Small (Fast)</option>
                <option value="whisper-tiny">Whisper Tiny (Fastest)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Processing Mode</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="local">Local Only (Offline)</option>
                <option value="cloud">Cloud Only (Online)</option>
                <option value="hybrid">Hybrid (Recommended)</option>
              </select>
            </div>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Real-time processing</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Noise reduction</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Analytics Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Speaker identification</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Sentiment analysis</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Intent classification</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Emotion detection</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Action item extraction</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Key moment detection</span>
            </label>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Intelligence</h1>
          <p className="text-gray-600">Advanced voice processing with Whisper models, real-time analytics, and AI insights</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'recording', label: 'Recording', icon: MicrophoneIcon },
              { id: 'transcripts', label: 'Transcripts', icon: DocumentTextIcon },
              { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
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
        {currentView === 'recording' && renderRecording()}
        {currentView === 'transcripts' && renderTranscripts()}
        {currentView === 'analytics' && renderAnalytics()}
        {currentView === 'settings' && renderSettings()}
      </div>
    </div>
  )
} 
import React, { useState, useRef, useEffect } from 'react'
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  LanguageIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  BellIcon,
  SparklesIcon,
  ArrowPathIcon,
  CloudIcon,
  ComputerDesktopIcon,
  KeyIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
  StopIcon as StopIconSolid
} from '@heroicons/react/24/outline'

interface AudioSegment {
  id: string
  startTime: number
  endTime: number
  text: string
  speaker: string
  confidence: number
  sentiment: number
  emotion: string
  intent: string
  urgency: number
  actionItems: string[]
}

interface Recording {
  id: string
  title: string
  duration: number
  fileSize: number
  createdAt: Date
  status: 'recording' | 'processing' | 'completed' | 'error'
  segments: AudioSegment[]
  metadata: {
    language: string
    speakers: string[]
    sentiment: number
    emotions: string[]
    intents: string[]
    actionItems: string[]
    keywords: string[]
  }
}

export default function YonderVoiceWorkflow() {
  const [currentView, setCurrentView] = useState<'recording' | 'analysis' | 'library' | 'settings'>('recording')
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null)
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcriptionText, setTranscriptionText] = useState('')
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [settings, setSettings] = useState({
    autoTranscribe: true,
    speakerDetection: true,
    sentimentAnalysis: true,
    emotionDetection: true,
    intentClassification: true,
    actionItemExtraction: true,
    language: 'auto',
    quality: 'high',
    saveToCloud: true
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Mock data for demo
  useEffect(() => {
    const mockRecordings: Recording[] = [
      {
        id: '1',
        title: 'Team Meeting - Q4 Planning',
        duration: 3240, // 54 minutes
        fileSize: 15600000, // 15.6 MB
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        status: 'completed',
        segments: [
          {
            id: '1-1',
            startTime: 0,
            endTime: 120,
            text: "Good morning everyone, welcome to our Q4 planning session. Today we'll be discussing our strategic objectives and key initiatives for the upcoming quarter.",
            speaker: "Sarah Johnson",
            confidence: 0.95,
            sentiment: 0.3,
            emotion: "neutral",
            intent: "inform",
            urgency: 0.7,
            actionItems: ["Review Q3 performance", "Set Q4 goals"]
          },
          {
            id: '1-2',
            startTime: 120,
            endTime: 240,
            text: "I think we should focus on expanding our market presence in the European region. The data shows strong growth potential there.",
            speaker: "Mike Chen",
            confidence: 0.92,
            sentiment: 0.6,
            emotion: "optimistic",
            intent: "suggest",
            urgency: 0.8,
            actionItems: ["Research European market", "Prepare expansion plan"]
          }
        ],
        metadata: {
          language: "en",
          speakers: ["Sarah Johnson", "Mike Chen", "Alex Rodriguez"],
          sentiment: 0.45,
          emotions: ["neutral", "optimistic", "concerned"],
          intents: ["inform", "suggest", "question"],
          actionItems: ["Review Q3 performance", "Set Q4 goals", "Research European market"],
          keywords: ["Q4", "planning", "strategy", "Europe", "growth"]
        }
      }
    ]
    setRecordings(mockRecordings)
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const recording: Recording = {
          id: Date.now().toString(),
          title: `Recording ${recordings.length + 1}`,
          duration: recordingTime,
          fileSize: audioBlob.size,
          createdAt: new Date(),
          status: 'processing',
          segments: [],
          metadata: {
            language: 'en',
            speakers: [],
            sentiment: 0,
            emotions: [],
            intents: [],
            actionItems: [],
            keywords: []
          }
        }
        
        setRecordings(prev => [recording, ...prev])
        setCurrentRecording(recording)
        setCurrentView('analysis')
        
        // Simulate processing
        setTimeout(() => {
          setRecordings(prev => prev.map(r => 
            r.id === recording.id ? { ...r, status: 'completed' } : r
          ))
        }, 3000)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      setRecordingTime(0)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const renderRecordingView = () => (
    <div className="space-y-8">
      {/* Recording Controls */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MicrophoneIcon className="w-16 h-16 text-white" />
          </div>
          
          <div className="text-4xl font-mono font-bold text-gray-900 mb-6">
            {formatTime(recordingTime)}
          </div>
          
          <div className="flex justify-center space-x-4 mb-6">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg flex items-center space-x-2"
              >
                <MicrophoneIcon className="w-5 h-5" />
                Start Recording
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={resumeRecording}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg flex items-center space-x-2"
                  >
                    <PlayIcon className="w-5 h-5" />
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={pauseRecording}
                    className="px-8 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors shadow-lg flex items-center space-x-2"
                  >
                    <PauseIcon className="w-5 h-5" />
                    Pause
                  </button>
                )}
                <button
                  onClick={stopRecording}
                  className="px-8 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-lg flex items-center space-x-2"
                >
                  <StopIcon className="w-5 h-5" />
                  Stop
                </button>
              </>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            {isRecording ? 'Recording in progress...' : 'Click to start recording'}
          </div>
        </div>
      </div>

      {/* Live Transcription */}
      {isRecording && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Live Transcription
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 h-32 overflow-y-auto">
            <p className="text-gray-700">
              {transcriptionText || 'Waiting for speech...'}
            </p>
          </div>
        </div>
      )}
    </div>
  )

  const renderAnalysisView = () => {
    const recording = selectedRecording || currentRecording
    if (!recording) return null

    return (
      <div className="space-y-8">
        {/* Recording Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{recording.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              recording.status === 'completed' ? 'bg-green-100 text-green-800' :
              recording.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {recording.status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Duration:</span>
              <div className="font-semibold">{formatTime(recording.duration)}</div>
            </div>
            <div>
              <span className="text-gray-500">File Size:</span>
              <div className="font-semibold">{(recording.fileSize / 1000000).toFixed(1)} MB</div>
            </div>
            <div>
              <span className="text-gray-500">Speakers:</span>
              <div className="font-semibold">{recording.metadata.speakers.length}</div>
            </div>
            <div>
              <span className="text-gray-500">Language:</span>
              <div className="font-semibold">{recording.metadata.language.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Sentiment & Emotions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Sentiment & Emotions
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Sentiment</span>
                  <span className="font-semibold">{(recording.metadata.sentiment * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      recording.metadata.sentiment > 0.3 ? 'bg-green-500' :
                      recording.metadata.sentiment < -0.3 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.abs(recording.metadata.sentiment * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Detected Emotions:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {recording.metadata.emotions.map((emotion, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Action Items
            </h3>
            
            <div className="space-y-2">
              {recording.metadata.actionItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transcription Segments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Transcription
          </h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recording.segments.map((segment) => (
              <div key={segment.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-700">{segment.speaker}</span>
                  <span className="text-sm text-gray-500">
                    {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{segment.text}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Confidence: {(segment.confidence * 100).toFixed(0)}%</span>
                  <span>Sentiment: {(segment.sentiment * 100).toFixed(0)}%</span>
                  <span>Emotion: {segment.emotion}</span>
                  <span>Intent: {segment.intent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderLibraryView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Recording Library</h2>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          New Recording
        </button>
      </div>
      
      <div className="grid gap-4">
        {recordings.map((recording) => (
          <div 
            key={recording.id}
            onClick={() => setSelectedRecording(recording)}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{recording.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{formatTime(recording.duration)}</span>
                  <span>{(recording.fileSize / 1000000).toFixed(1)} MB</span>
                  <span>{recording.metadata.speakers.length} speakers</span>
                  <span>{recording.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  recording.status === 'completed' ? 'bg-green-100 text-green-800' :
                  recording.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {recording.status}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSettingsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recording Settings</h3>
        
        <div className="space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <p className="text-sm text-gray-500">
                  {key === 'autoTranscribe' && 'Automatically transcribe recordings'}
                  {key === 'speakerDetection' && 'Identify different speakers'}
                  {key === 'sentimentAnalysis' && 'Analyze emotional tone'}
                  {key === 'emotionDetection' && 'Detect specific emotions'}
                  {key === 'intentClassification' && 'Classify conversation intent'}
                  {key === 'actionItemExtraction' && 'Extract action items'}
                  {key === 'language' && 'Primary language for processing'}
                  {key === 'quality' && 'Audio recording quality'}
                  {key === 'saveToCloud' && 'Save recordings to cloud storage'}
                </p>
              </div>
              {typeof value === 'boolean' ? (
                <button
                  onClick={() => setSettings(prev => ({ ...prev, [key]: !value }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              ) : (
                <select
                  value={value}
                  onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-1"
                >
                  {key === 'language' && (
                    <>
                      <option value="auto">Auto Detect</option>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </>
                  )}
                  {key === 'quality' && (
                    <>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </>
                  )}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                <MicrophoneIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yonder</h1>
                <p className="text-sm text-gray-600">Voice Intelligence & Audio Processing</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex space-x-1">
              {[
                { id: 'recording', label: 'Recording', icon: MicrophoneIcon },
                { id: 'analysis', label: 'Analysis', icon: ChartBarIcon },
                { id: 'library', label: 'Library', icon: DocumentTextIcon },
                { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4 inline mr-2" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'recording' && renderRecordingView()}
        {currentView === 'analysis' && renderAnalysisView()}
        {currentView === 'library' && renderLibraryView()}
        {currentView === 'settings' && renderSettingsView()}
      </main>
    </div>
  )
} 
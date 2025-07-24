import React, { useState, useEffect, useRef } from 'react'
import { 
  MicrophoneIcon, 
  StopIcon, 
  PauseIcon, 
  PlayIcon,
  SpeakerWaveIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface TranscriptionUpdate {
  text: string
  speaker?: string
  timestamp: number
  confidence: number
  isPartial: boolean
}

interface LiveTranscriptionDisplayProps {
  meetingId: string
  sessionId: string
  isActive: boolean
  onStopTranscription: () => void
  onPauseTranscription: () => void
  onResumeTranscription: () => void
}

export default function LiveTranscriptionDisplay({
  meetingId,
  sessionId,
  isActive,
  onStopTranscription,
  onPauseTranscription,
  onResumeTranscription,
}: LiveTranscriptionDisplayProps) {
  const [transcriptions, setTranscriptions] = useState<TranscriptionUpdate[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [language, setLanguage] = useState('en')
  
  const transcriptContainerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  // MEET51: Real-time transcription display
  useEffect(() => {
    if (!isActive || !sessionId) return

    // Start timer for current time
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 1)
    }, 1000)

    // Connect to transcription stream
    const connectToStream = async () => {
      try {
        // In a real implementation, this would be WebSocket or Server-Sent Events
        // For now, we'll simulate the connection
        setIsConnected(true)
        setError(null)

        // Simulate receiving transcription updates
        const simulateTranscription = () => {
          if (!isActive || isPaused) return

          const mockUpdate: TranscriptionUpdate = {
            text: `Sample transcription at ${formatTime(currentTime)}`,
            speaker: 'Speaker 1',
            timestamp: currentTime,
            confidence: 0.85 + Math.random() * 0.1,
            isPartial: Math.random() > 0.8,
          }

          setTranscriptions(prev => [...prev, mockUpdate])
          setConfidence(mockUpdate.confidence)
        }

        // Simulate transcription every 3 seconds
        const transcriptionInterval = setInterval(simulateTranscription, 3000)

        return () => {
          clearInterval(transcriptionInterval)
        }

      } catch (error) {
        console.error('Failed to connect to transcription stream:', error)
        setError('Failed to connect to transcription stream')
        setIsConnected(false)
      }
    }

    connectToStream()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, sessionId, isPaused, currentTime])

  // Auto-scroll to bottom when new transcriptions arrive
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight
    }
  }, [transcriptions])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false)
      onResumeTranscription()
    } else {
      setIsPaused(true)
      onPauseTranscription()
    }
  }

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.9) return 'text-green-600'
    if (conf >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 0.9) return <CheckCircleIcon className="w-4 h-4 text-green-600" />
    if (conf >= 0.7) return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
    return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <div className="flex items-center space-x-2">
            <MicrophoneIcon className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Live Transcription</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Current Time */}
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <ClockIcon className="w-4 h-4" />
            <span>{formatTime(currentTime)}</span>
          </div>

          {/* Confidence Score */}
          <div className="flex items-center space-x-1">
            {getConfidenceIcon(confidence)}
            <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
              {Math.round(confidence * 100)}%
            </span>
          </div>

          {/* Language */}
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <SpeakerWaveIcon className="w-4 h-4" />
            <span className="uppercase">{language}</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`text-sm font-medium ${
              isActive && !isPaused ? 'text-green-600' : 
              isPaused ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {isActive && !isPaused ? 'Live' : isPaused ? 'Paused' : 'Stopped'}
            </span>
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Transcription Display */}
      <div 
        ref={transcriptContainerRef}
        className="h-96 overflow-y-auto p-4 space-y-3"
      >
        {transcriptions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MicrophoneIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Waiting for transcription...</p>
              <p className="text-sm">Audio will be transcribed in real-time</p>
            </div>
          </div>
        ) : (
          transcriptions.map((transcript, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${
                transcript.isPartial 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {transcript.speaker && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {transcript.speaker}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTime(transcript.timestamp)}
                    </span>
                    {transcript.isPartial && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        Partial
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 leading-relaxed">
                    {transcript.text}
                  </p>
                </div>
                <div className="ml-2">
                  {getConfidenceIcon(transcript.confidence)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePauseResume}
            disabled={!isActive}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isPaused ? (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <PauseIcon className="w-4 h-4" />
                <span>Pause</span>
              </>
            )}
          </button>

          <button
            onClick={onStopTranscription}
            disabled={!isActive}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <StopIcon className="w-4 h-4" />
            <span>Stop</span>
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {transcriptions.length} transcriptions
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckIcon,
  ClockIcon,
  SpeakerWaveIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface VoiceNote {
  id: string
  title: string
  audioBlob?: Blob
  audioUrl?: string
  duration: number
  transcript: string
  speakers?: Array<{
    id: string
    name: string
    segments: Array<{
      start: number
      end: number
      text: string
    }>
  }>
  summary: string
  tags: string[]
  confidence: number
}

export function VoiceNoteWorkflow() {
  const { updateWorkflowData, finishWorkflow, handleAsyncOperation } = useWorkflow()
  const [voiceNote, setVoiceNote] = useState<VoiceNote>({
    id: `voice-note-${Date.now()}`,
    title: '',
    duration: 0,
    transcript: '',
    summary: '',
    tags: [],
    confidence: 0
  })
  
  const [currentStep, setCurrentStep] = useState<'record' | 'transcribe' | 'enhance'>('record')
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup function
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const audioChunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        setVoiceNote(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          duration: recordingTime
        }))
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      toast.success('Recording started')
    } catch (error) {
      toast.error('Failed to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      toast.success('Recording stopped')
      setTimeout(() => setCurrentStep('transcribe'), 1000)
    }
  }

  const playAudio = () => {
    if (audioRef.current && voiceNote.audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const transcribeAudio = async () => {
    if (!voiceNote.audioBlob) return

    setIsTranscribing(true)
    const result = await handleAsyncOperation(
      async () => {
        // Simulate transcription with speaker detection (Y7 requirement)
        await new Promise(resolve => setTimeout(resolve, 4000))
        
        // Mock transcription with speaker diarization
        const mockTranscript = `Speaker 1: Welcome to our meeting today. I'd like to discuss the quarterly results and our plans for the next phase.

Speaker 2: Thank you for organizing this. I've been looking at the numbers and we're showing strong growth in the mobile segment.

Speaker 1: That's excellent news. Can you share more details about the mobile metrics?

Speaker 2: Certainly. We've seen a 35% increase in mobile engagement and our conversion rates have improved by 12% compared to last quarter.

Speaker 1: Those are impressive results. What do you think is driving this improvement?

Speaker 2: I believe it's the combination of our new UI updates and the enhanced onboarding flow we implemented.`

        const speakers = [
          {
            id: 'speaker-1',
            name: 'Speaker 1',
            segments: [
              { start: 0, end: 8, text: 'Welcome to our meeting today. I\'d like to discuss the quarterly results and our plans for the next phase.' },
              { start: 15, end: 22, text: 'That\'s excellent news. Can you share more details about the mobile metrics?' },
              { start: 35, end: 42, text: 'Those are impressive results. What do you think is driving this improvement?' }
            ]
          },
          {
            id: 'speaker-2', 
            name: 'Speaker 2',
            segments: [
              { start: 8, end: 15, text: 'Thank you for organizing this. I\'ve been looking at the numbers and we\'re showing strong growth in the mobile segment.' },
              { start: 22, end: 35, text: 'Certainly. We\'ve seen a 35% increase in mobile engagement and our conversion rates have improved by 12% compared to last quarter.' },
              { start: 42, end: 50, text: 'I believe it\'s the combination of our new UI updates and the enhanced onboarding flow we implemented.' }
            ]
          }
        ]

        return {
          transcript: mockTranscript,
          speakers,
          confidence: 0.89,
          title: `Meeting Notes - ${new Date().toLocaleDateString()}`
        }
      },
      'Transcribe audio with speaker detection',
      { duration: voiceNote.duration }
    )

    setIsTranscribing(false)
    if (result.success && result.data) {
      const data = result.data as any
      setVoiceNote(prev => ({
        ...prev,
        transcript: data.transcript,
        speakers: data.speakers,
        confidence: data.confidence,
        title: data.title
      }))
      toast.success('Transcription completed with speaker detection!')
      setCurrentStep('enhance')
    }
  }

  const enhanceVoiceNote = async () => {
    if (!voiceNote.transcript) return

    setIsEnhancing(true)
    const result = await handleAsyncOperation(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2500))
        
        // AI enhancement - summary and tags
        const summary = `Meeting focused on quarterly results review with strong mobile segment performance. Key highlights include 35% increase in mobile engagement, 12% improvement in conversion rates, driven by UI updates and enhanced onboarding flow. Discussion covered growth metrics and strategic improvements for mobile platform.`
        
        const tags = ['meeting', 'quarterly-results', 'mobile-growth', 'conversion-rates', 'ui-updates', 'business-review']
        
        return {
          summary,
          tags,
          title: voiceNote.title || `Enhanced Voice Note - ${new Date().toLocaleDateString()}`
        }
      },
      'AI-powered enhancement and formatting',
      { transcriptLength: voiceNote.transcript.length }
    )

    setIsEnhancing(false)
    if (result.success && result.data) {
      const data = result.data as any
      setVoiceNote(prev => ({
        ...prev,
        summary: data.summary,
        tags: data.tags,
        title: data.title
      }))
      toast.success('Voice note enhanced!')
    }
  }

  const completeVoiceNote = () => {
    updateWorkflowData({
      voiceNote: {
        ...voiceNote,
        createdAt: new Date().toISOString()
      }
    })
    
    toast.success('Voice note created successfully!')
    finishWorkflow()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const canProceed = voiceNote.audioUrl || voiceNote.transcript

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {['Record', 'Transcribe', 'Enhance'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === step.toLowerCase() ? 'bg-purple-600 text-white' :
              ['record', 'transcribe', 'enhance'].indexOf(currentStep) > index ? 'bg-green-500 text-white' :
              'bg-gray-200 text-gray-600'
            )}>
              {['record', 'transcribe', 'enhance'].indexOf(currentStep) > index ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">{step}</span>
            {index < 2 && (
              <div className="w-8 h-px bg-gray-300 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Record Audio */}
      {currentStep === 'record' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MicrophoneIcon className="h-5 w-5 text-purple-600" />
            Record Voice Note
          </h4>
          
          <div className="text-center space-y-6">
            {/* Recording Controls */}
            <div className="flex justify-center">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={voiceNote.audioUrl !== undefined}
                  className="w-24 h-24 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 rounded-full flex items-center justify-center transition-colors"
                >
                  <MicrophoneIcon className="h-12 w-12 text-white" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-24 h-24 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors animate-pulse"
                >
                  <StopIcon className="h-12 w-12 text-white" />
                </button>
              )}
            </div>

            {/* Recording Status */}
            <div>
              {isRecording ? (
                <div className="text-lg font-medium text-red-600 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                  Recording: {formatTime(recordingTime)}
                </div>
              ) : voiceNote.audioUrl ? (
                <div className="text-lg font-medium text-green-600 flex items-center justify-center gap-2">
                  <CheckIcon className="h-5 w-5" />
                  Recording Complete: {formatTime(voiceNote.duration)}
                </div>
              ) : (
                <div className="text-lg font-medium text-gray-600">
                  Press to start recording
                </div>
              )}
            </div>

            {/* Audio Playback */}
            {voiceNote.audioUrl && (
              <div className="space-y-4">
                <audio
                  ref={audioRef}
                  src={voiceNote.audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={playAudio}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Duration: {formatTime(voiceNote.duration)}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentStep('transcribe')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Continue to Transcription
                </button>
              </div>
            )}

            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Record your voice note by speaking clearly. The recording will be automatically transcribed and enhanced with AI.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Transcribe */}
      {currentStep === 'transcribe' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-purple-600" />
            Transcribe Audio
          </h4>
          
          <div className="space-y-4">
            {!voiceNote.transcript ? (
              <div className="text-center space-y-4">
                <div className="text-gray-600">
                  Convert your recording to text with AI-powered transcription and speaker detection.
                </div>
                
                <button
                  onClick={transcribeAudio}
                  disabled={isTranscribing}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {isTranscribing ? (
                    <>
                      <ClockIcon className="h-4 w-4 animate-spin" />
                      Transcribing with AI...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      Start Transcription
                    </>
                  )}
                </button>
                
                {isTranscribing && (
                  <div className="text-sm text-gray-600">
                    Analyzing audio, detecting speakers, and generating transcript...
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Transcription Result */}
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckIcon className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">
                      Transcription Complete ({Math.round(voiceNote.confidence * 100)}% confidence)
                    </span>
                  </div>
                  
                  {voiceNote.speakers && voiceNote.speakers.length > 1 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <SpeakerWaveIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Speaker Detection: {voiceNote.speakers.length} speakers identified
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {voiceNote.speakers.map(speaker => (
                          <div key={speaker.id} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            <UserIcon className="h-3 w-3" />
                            {speaker.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="max-h-40 overflow-y-auto">
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {voiceNote.transcript}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep('record')}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back to Recording
                  </button>
                  <button
                    onClick={() => setCurrentStep('enhance')}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Continue to Enhancement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Enhance */}
      {currentStep === 'enhance' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
            AI Enhancement
          </h4>
          
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={voiceNote.title}
                onChange={(e) => setVoiceNote(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter a title for your voice note..."
              />
            </div>

            {!voiceNote.summary ? (
              <div className="text-center space-y-4">
                <div className="text-gray-600">
                  Enhance your voice note with AI-powered summarization and smart tagging.
                </div>
                
                <button
                  onClick={enhanceVoiceNote}
                  disabled={isEnhancing}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {isEnhancing ? (
                    <>
                      <ClockIcon className="h-4 w-4 animate-spin" />
                      Enhancing with AI...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      Enhance Voice Note
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* AI Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Summary
                  </label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm text-green-800">{voiceNote.summary}</div>
                  </div>
                </div>

                {/* Smart Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Smart Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {voiceNote.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Original Transcript */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Transcript
                  </label>
                  <div className="bg-gray-50 border rounded-lg p-3 max-h-40 overflow-y-auto">
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {voiceNote.transcript}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep('transcribe')}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back to Transcript
                  </button>
                  <button
                    onClick={completeVoiceNote}
                    disabled={!voiceNote.title.trim()}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Complete Voice Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
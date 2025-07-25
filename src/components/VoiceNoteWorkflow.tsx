'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
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

  // Add state for engine selection and error
  const [transcriptionEngine, setTranscriptionEngine] = useState<'whisper-local' | 'cloud' | null>(null)
  const [engineError, setEngineError] = useState<string | null>(null)

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

  // Add handlers for Whisper and Cloud transcription
  const handleCloudTranscription = async () => {
    setTranscriptionEngine('cloud')
    setIsTranscribing(true)
    setEngineError(null)
    try {
      // Simulate cloud processing (slightly slower)
      await new Promise(resolve => setTimeout(resolve, 4000))
      await transcribeAudio()
      setTranscriptionEngine('cloud')
    } catch (err) {
      setEngineError('Cloud transcription failed. Please try again.')
      setIsTranscribing(false)
      setTranscriptionEngine(null)
    }
  }

  const handleWhisperTranscription = async () => {
    setTranscriptionEngine('whisper-local')
    setIsTranscribing(true)
    setEngineError(null)
    try {
      // Simulate Whisper processing time (Y14: within 30s for 10-min file)
      const simulatedProcessingTime = Math.min(voiceNote.duration * 0.3, 30000)
      await new Promise(resolve => setTimeout(resolve, simulatedProcessingTime))
      // Simulate success/failure
      if (Math.random() < 0.85) { // 85% success rate
        // Use the existing mock transcript logic
        await transcribeAudio()
        setTranscriptionEngine('whisper-local')
      } else {
        throw new Error('Whisper failed to process audio locally.')
      }
    } catch (err) {
      setEngineError('Whisper local transcription failed. Falling back to cloud...')
      setIsTranscribing(false)
      setTranscriptionEngine(null)
      handleCloudTranscription()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-red-950">
      {/* Progress Steps */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-white/20 dark:border-zinc-800/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {['Record', 'Transcribe', 'Enhance'].map((step, index) => {
              const stepKey = step.toLowerCase() as 'record' | 'transcribe' | 'enhance';
              const isActive = currentStep === stepKey;
              const isCompleted = ['record', 'transcribe', 'enhance'].indexOf(currentStep) > index;
              
              return (
                <motion.div 
                  key={step} 
                  className="flex items-center flex-1"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    <motion.div 
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg relative overflow-hidden',
                        isActive 
                          ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-red-500/25' :
                        isCompleted 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/25' :
                          'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isCompleted ? (
                        <CheckIcon className="h-6 w-6" />
                      ) : (
                        <span className="text-lg">{index + 1}</span>
                      )}
                      {isActive && (
                        <motion.div 
                          className="absolute inset-0 bg-white/20 rounded-2xl"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                    <div className="ml-4">
                      <span className={cn(
                        'text-lg font-semibold block',
                        isActive 
                          ? 'text-red-600 dark:text-red-400' :
                        isCompleted 
                          ? 'text-green-600 dark:text-green-400' :
                          'text-zinc-400 dark:text-zinc-500'
                      )}>
                        {step}
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {step === 'Record' && 'Capture your voice'}
                        {step === 'Transcribe' && 'AI-powered transcription'}
                        {step === 'Enhance' && 'Smart enhancement'}
                      </span>
                    </div>
                  </div>
                  {index < 2 && (
                    <div className="flex-1 mx-8">
                      <div className={cn(
                        'h-1 rounded-full transition-all duration-500',
                        isCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          'bg-zinc-200 dark:bg-zinc-700'
                      )} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6 space-y-8">

        {/* Step 1: Record Audio */}
        {currentStep === 'record' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="modern-card p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MicrophoneIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Record Voice Note</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                Capture your thoughts with high-quality audio recording
              </p>
            </div>
            
            <div className="text-center space-y-8">
              {/* Recording Controls */}
              <div className="flex justify-center">
                {!isRecording ? (
                  <motion.button
                    onClick={startRecording}
                    disabled={voiceNote.audioUrl !== undefined}
                    className="relative w-32 h-32 bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-zinc-400 disabled:to-zinc-500 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl disabled:cursor-not-allowed group"
                    whileHover={{ scale: voiceNote.audioUrl ? 1 : 1.05 }}
                    whileTap={{ scale: voiceNote.audioUrl ? 1 : 0.95 }}
                  >
                    <MicrophoneIcon className="h-16 w-16 text-white group-hover:scale-110 transition-transform" />
                    {!voiceNote.audioUrl && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400/20 to-pink-500/20 animate-ping" />
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={stopRecording}
                    className="relative w-32 h-32 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <StopIcon className="h-16 w-16 text-white" />
                    <div className="absolute inset-0 rounded-full bg-red-400/30 animate-pulse" />
                  </motion.button>
                )}
              </div>

              {/* Recording Status */}
              <motion.div
                key={isRecording ? 'recording' : voiceNote.audioUrl ? 'complete' : 'ready'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {isRecording ? (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-6">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-3 mb-2">
                      <motion.div 
                        className="w-4 h-4 bg-red-500 rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      Recording: {formatTime(recordingTime)}
                    </div>
                    <p className="text-red-600/80 dark:text-red-400/80">Speak clearly for best results</p>
                  </div>
                ) : voiceNote.audioUrl ? (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-2xl p-6">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-3 mb-2">
                      <CheckIcon className="h-6 w-6" />
                      Recording Complete: {formatTime(voiceNote.duration)}
                    </div>
                    <p className="text-green-600/80 dark:text-green-400/80">Ready for transcription</p>
                  </div>
                ) : (
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6">
                    <div className="text-2xl font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                      Ready to Record
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-500">Press the microphone to start capturing audio</p>
                  </div>
                )}
              </motion.div>

              {/* Audio Playback */}
              {voiceNote.audioUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <audio
                    ref={audioRef}
                    src={voiceNote.audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  
                  {/* Audio Waveform Visualization (Mock) */}
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-center h-20 space-x-1">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-gradient-to-t from-red-500 to-pink-500 rounded-full"
                          style={{ height: Math.random() * 60 + 10 }}
                          animate={isPlaying ? {
                            scaleY: [1, Math.random() * 1.5 + 0.5, 1],
                            opacity: [0.7, 1, 0.7]
                          } : {}}
                          transition={{
                            duration: 0.5,
                            repeat: isPlaying ? Infinity : 0,
                            delay: i * 0.05
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex justify-center items-center gap-6 mt-6">
                      <motion.button
                        onClick={playAudio}
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isPlaying ? (
                          <PauseIcon className="h-5 w-5" />
                        ) : (
                          <PlayIcon className="h-5 w-5" />
                        )}
                        {isPlaying ? 'Pause Playback' : 'Play Recording'}
                      </motion.button>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                          {formatTime(voiceNote.duration)}
                        </div>
                        <div className="text-sm text-zinc-500">Duration</div>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => setCurrentStep('transcribe')}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    Continue to Transcription →
                  </motion.button>
                </motion.div>
              )}
              
              <div className="max-w-md mx-auto text-center space-y-2">
                <p className="text-zinc-600 dark:text-zinc-400">
                  🎤 High-quality audio recording with noise reduction
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  Supports up to 30 minutes of continuous recording
                </p>
              </div>
            </div>
          </motion.div>
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
                
                {currentStep === 'transcribe' && !isTranscribing && !voiceNote.transcript && (
                  <div className="flex gap-4 mb-4">
                    <button
                      className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
                      onClick={handleWhisperTranscription}
                      disabled={isTranscribing}
                    >
                      Transcribe with Whisper (Local)
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                      onClick={handleCloudTranscription}
                      disabled={isTranscribing}
                    >
                      Transcribe with Cloud
                    </button>
                  </div>
                )}
                {isTranscribing && (
                  <div className="mb-2 text-sm text-gray-700">
                    {transcriptionEngine === 'whisper-local' ? 'Running Whisper model locally...' : 'Running cloud transcription...'}
                  </div>
                )}
                {engineError && (
                  <div className="mb-2 text-sm text-red-600">{engineError}</div>
                )}
                
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
  </div>
  )
}


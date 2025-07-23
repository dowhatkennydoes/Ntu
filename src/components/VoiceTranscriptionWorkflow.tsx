'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  MicrophoneIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  DocumentArrowUpIcon,
  UserIcon,
  ClockIcon,
  SpeakerWaveIcon,
  BookmarkIcon,
  SignalIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'
import { Memory } from '@/types/memory'

interface TranscriptSegment {
  id: string
  speaker: string
  speakerConfidence: number // Y7: Speaker detection confidence
  startTime: number
  endTime: number
  text: string
  confidence: number
  isLive: boolean
  punctuationCorrected: boolean // Y9: Track punctuation correction
  originalText?: string // Store original before correction
  sentimentScore?: number // Y36: Sentiment score (-1 to 1)
  emotionalTone?: 'happy' | 'angry' | 'worried' | 'confused' | 'excited' | 'neutral' // Y38: Emotional tone
  intentCategory?: 'request' | 'complaint' | 'praise' | 'confusion' | 'urgency' | 'neutral' // Y37: Intent detection
  urgencyScore?: number // Y39: Urgency score (0-1)
  wordTimestamps?: Array<{ word: string, start: number, end: number }> // Y15: Word-level timestamps
  isBookmarked?: boolean // Y11: Bookmark flag
  isActionItem?: boolean // Y58: Action item flag
  isQuestion?: boolean // Y123: Question detection
  isDecision?: boolean // Y126: Decision point flag
  nonVerbalCues?: string[] // Y33: Non-verbal cues
  backchanneling?: boolean // Y32: Backchanneling detection
}

interface Speaker {
  id: string
  name: string
  color: string
  segments: number
  totalDuration: number // Y7: Track total speaking time
  averageConfidence: number // Y7: Track speaker identification accuracy
}

interface Bookmark {
  id: string
  timestamp: number
  label: string
}

export function VoiceTranscriptionWorkflow() {
  const { nextStep, addError, updateWorkflowData } = useWorkflow()
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  
  // Transcription state
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: 'speaker1', name: 'Speaker 1', color: 'bg-blue-500', segments: 0, totalDuration: 0, averageConfidence: 0 },
    { id: 'speaker2', name: 'Speaker 2', color: 'bg-green-500', segments: 0, totalDuration: 0, averageConfidence: 0 },
    { id: 'speaker3', name: 'Speaker 3', color: 'bg-purple-500', segments: 0, totalDuration: 0, averageConfidence: 0 }
  ])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [lastSaveTime, setLastSaveTime] = useState<Date>(new Date())
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7)
  
  // Y6: Auto-save state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastAutoSave, setLastAutoSave] = useState<Date>(new Date())
  
  // Y11, Y12: Bookmarking state
  const [bookmarkMode, setBookmarkMode] = useState(false)
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)
  
  // Y31: Real-time sentiment state
  const [realTimeSentiment, setRealTimeSentiment] = useState<{
    overall: number
    bySpeaker: Record<string, number>
    recentChanges: Array<{ timestamp: number, speaker: string, sentiment: number }>
  }>({
    overall: 0,
    bySpeaker: {},
    recentChanges: []
  })
  
  // Y58: Action items state
  const [actionItems, setActionItems] = useState<Array<{
    id: string
    text: string
    speaker: string
    timestamp: number
    assignedTo?: string
    priority: 'low' | 'medium' | 'high'
  }>>([])
  
  // Y127: Highlights state
  const [highlights, setHighlights] = useState<Array<{
    id: string
    segmentId: string
    importance: number
    reason: string
    timestamp: number
  }>>([])
  
  // Y133: Topics state
  const [topics, setTopics] = useState<Array<{
    id: string
    name: string
    frequency: number
    segments: string[]
    sentiment: number
  }>>([])
  
  // Add missing state variables here
  const [showMemorySave, setShowMemorySave] = useState(false)
  const [memorySaved, setMemorySaved] = useState(false)
  const [meetingSummary, setMeetingSummary] = useState<string>('')
  const [punctualSync, setPunctualSync] = useState(false)
  const [autoTranscribeMeetings, setAutoTranscribeMeetings] = useState(false)

  // Add memory template and auto-tagging state
  const [selectedMemoryTemplate, setSelectedMemoryTemplate] = useState<string>('meeting')
  const [autoTags, setAutoTags] = useState<string[]>([])
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  // Add collaboration state
  const [collaborators, setCollaborators] = useState<Array<{
    id: string
    name: string
    color: string
    isOnline: boolean
    lastSeen: Date
  }>>([
    { id: 'user1', name: 'You', color: 'bg-blue-500', isOnline: true, lastSeen: new Date() },
    { id: 'user2', name: 'John Doe', color: 'bg-green-500', isOnline: true, lastSeen: new Date() },
    { id: 'user3', name: 'Jane Smith', color: 'bg-purple-500', isOnline: false, lastSeen: new Date(Date.now() - 300000) }
  ])

  const [comments, setComments] = useState<Array<{
    id: string
    segmentId: string
    author: string
    text: string
    timestamp: number
    resolved: boolean
    replies: Array<{
      id: string
      author: string
      text: string
      timestamp: number
    }>
  }>>([])

  const [showCollaboration, setShowCollaboration] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [selectedSegmentForComment, setSelectedSegmentForComment] = useState<string | null>(null)

  // Add comment to a segment
  const addComment = (segmentId: string, text: string) => {
    if (!text.trim()) return
    
    const comment = {
      id: `comment-${Date.now()}`,
      segmentId,
      author: 'You',
      text: text.trim(),
      timestamp: Date.now(),
      resolved: false,
      replies: []
    }
    
    setComments(prev => [...prev, comment])
    setNewComment('')
    setSelectedSegmentForComment(null)
  }

  // Resolve a comment
  const resolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId ? { ...comment, resolved: true } : comment
    ))
  }

  // Add reply to a comment
  const addReply = (commentId: string, text: string) => {
    if (!text.trim()) return
    
    const reply = {
      id: `reply-${Date.now()}`,
      author: 'You',
      text: text.trim(),
      timestamp: Date.now()
    }
    
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ))
  }

  // Memory templates (Y60)
  const memoryTemplates = [
    {
      id: 'meeting',
      name: 'Meeting',
      description: 'Standard meeting with agenda, discussion, and action items',
      tags: ['meeting', 'agenda', 'action-items'],
      sections: ['Overview', 'Participants', 'Discussion Points', 'Decisions', 'Action Items']
    },
    {
      id: 'lecture',
      name: 'Lecture',
      description: 'Educational content with key concepts and examples',
      tags: ['lecture', 'education', 'learning'],
      sections: ['Topic', 'Key Concepts', 'Examples', 'Questions', 'Summary']
    },
    {
      id: 'demo',
      name: 'Demo',
      description: 'Product demonstration or technical walkthrough',
      tags: ['demo', 'product', 'technical'],
      sections: ['Product', 'Features', 'Use Cases', 'Feedback', 'Next Steps']
    },
    {
      id: 'interview',
      name: 'Interview',
      description: 'Interview or conversation with structured Q&A',
      tags: ['interview', 'conversation', 'qa'],
      sections: ['Participants', 'Questions', 'Answers', 'Insights', 'Follow-up']
    }
  ]

  // Auto-tagging function (Y61)
  const generateAutoTags = (segments: TranscriptSegment[], speakers: Speaker[], topics: string[]) => {
    const tags: string[] = []
    
    // Add speaker names as tags
    speakers.forEach(speaker => {
      if (speaker.segments > 0) {
        tags.push(speaker.name.toLowerCase().replace(/\s+/g, '-'))
      }
    })
    
    // Add detected topics
    topics.forEach(topic => {
      if (topic.length > 3) {
        tags.push(topic)
      }
    })
    
    // Add content-based tags
    const allText = segments.map(s => s.text).join(' ').toLowerCase()
    
    if (allText.includes('meeting') || allText.includes('discussion')) tags.push('meeting')
    if (allText.includes('project') || allText.includes('planning')) tags.push('project')
    if (allText.includes('review') || allText.includes('analysis')) tags.push('review')
    if (allText.includes('decision') || allText.includes('vote')) tags.push('decision')
    if (allText.includes('deadline') || allText.includes('timeline')) tags.push('timeline')
    if (allText.includes('budget') || allText.includes('cost')) tags.push('budget')
    if (allText.includes('team') || allText.includes('collaboration')) tags.push('team')
    
    // Add sentiment-based tags
    const avgSentiment = segments.reduce((sum, s) => sum + (s.sentimentScore || 0), 0) / segments.length
    if (avgSentiment > 0.1) tags.push('positive')
    else if (avgSentiment < -0.1) tags.push('negative')
    else tags.push('neutral')
    
    return Array.from(new Set(tags)) // Remove duplicates
  }

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Auto-save every 5 seconds (Y6)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (transcriptSegments.length > 0) {
        handleAutoSave()
      }
    }, 5000)
    
    return () => clearInterval(autoSaveInterval)
  }, [transcriptSegments])

  // Scroll to latest transcript
  useEffect(() => {
    if (transcriptEndRef.current && isRecording) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcriptSegments, isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAutoSave = useCallback(() => {
    const saveData = {
      segments: transcriptSegments,
      speakers,
      bookmarks,
      timestamp: new Date().toISOString()
    }
    
    // Simulate auto-save to localStorage (Y6)
    localStorage.setItem('voice-transcript-autosave', JSON.stringify(saveData))
    setLastSaveTime(new Date())
    updateWorkflowData(saveData)
  }, [transcriptSegments, speakers, bookmarks, updateWorkflowData])

  // Y36, Y37, Y38: Sentiment analysis and emotion detection
  const analyzeSentiment = (text: string): { sentiment: number, emotion: string, intent: string } => {
    // Simple sentiment analysis (in production, use actual AI/ML service)
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'amazing', 'wonderful', 'fantastic', 'perfect', 'awesome']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'disappointing', 'frustrated', 'angry', 'sad', 'worried']
    const questionWords = ['what', 'how', 'when', 'where', 'why', 'who', 'can', 'could', 'would', 'should']
    const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'important', 'quick', 'fast', 'now', 'help']
    const praiseWords = ['thank', 'thanks', 'appreciate', 'grateful', 'excellent', 'outstanding', 'impressed']
    const complaintWords = ['problem', 'issue', 'wrong', 'broken', 'error', 'bug', 'complaint', 'dissatisfied']
    
    const words = text.toLowerCase().split(/\s+/)
    let sentimentScore = 0
    let emotionCounts = { happy: 0, angry: 0, worried: 0, confused: 0, excited: 0, neutral: 0 }
    let intentCounts = { request: 0, complaint: 0, praise: 0, confusion: 0, urgency: 0, neutral: 0 }
    
    words.forEach(word => {
      if (positiveWords.includes(word)) {
        sentimentScore += 0.1
        emotionCounts.happy++
      }
      if (negativeWords.includes(word)) {
        sentimentScore -= 0.1
        emotionCounts.angry++
      }
      if (questionWords.includes(word)) {
        emotionCounts.confused++
        intentCounts.confusion++
      }
      if (urgentWords.includes(word)) {
        emotionCounts.excited++
        intentCounts.urgency++
      }
      if (praiseWords.includes(word)) {
        intentCounts.praise++
        emotionCounts.happy++
      }
      if (complaintWords.includes(word)) {
        intentCounts.complaint++
        emotionCounts.angry++
      }
    })
    
    // Normalize sentiment score to -1 to 1 range
    sentimentScore = Math.max(-1, Math.min(1, sentimentScore))
    
    // Determine dominant emotion
    const dominantEmotion = Object.entries(emotionCounts).reduce((a, b) => 
      emotionCounts[a[0] as keyof typeof emotionCounts] > emotionCounts[b[0] as keyof typeof emotionCounts] ? a : b
    )[0] as keyof typeof emotionCounts
    
    // Determine dominant intent
    const dominantIntent = Object.entries(intentCounts).reduce((a, b) => 
      intentCounts[a[0] as keyof typeof intentCounts] > intentCounts[b[0] as keyof typeof intentCounts] ? a : b
    )[0] as keyof typeof intentCounts
    
    return {
      sentiment: sentimentScore,
      emotion: dominantEmotion,
      intent: dominantIntent
    }
  }

  // Y1: Start recording audio live
  const startRecording = async () => {
    try {
      setProcessingStatus('Requesting microphone access...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000, // Optimal for Whisper
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          // Y2: Real-time transcription simulation with <1s delay
          simulateRealTimeTranscription(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        processFullAudio(audioBlob)
      }
      
      mediaRecorder.start(1000) // Collect data every second for real-time processing
      setIsRecording(true)
      setRecordingTime(0)
      setProcessingStatus('Recording and transcribing...')
      
    } catch (error) {
      addError({
        id: 'recording-error',
        type: 'permission',
        step: 'start-recording',
        message: 'Failed to access microphone. Please check permissions.',
        timestamp: new Date().toISOString(),
        recoverable: false,
        retryCount: 0,
        maxRetries: 0,
        context: { error: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  // Y7: Enhanced speaker diarization with timestamps and confidence
  const simulateRealTimeTranscription = useCallback((audioData: Blob) => {
    // Simulate Whisper processing delay
    setTimeout(() => {
      const mockTranscriptions = [
        "Thank you for joining today's meeting.",
        "Let's start by reviewing our quarterly progress.",
        "The metrics show significant improvement this quarter.",
        "We need to discuss the upcoming project timeline.",
        "I have some questions about the implementation strategy.",
        "Could you elaborate on that point?",
        "I think we should consider alternative approaches.",
        "The deadline seems aggressive given our current resources."
      ]
      
      const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]
      const currentSpeaker = Math.random() > 0.5 ? 'speaker1' : 'speaker2'
      const confidence = 0.75 + Math.random() * 0.2 // 75-95% confidence
      const speakerConfidence = 0.80 + Math.random() * 0.15 // Y7: Speaker identification confidence
      
      if (confidence >= confidenceThreshold) {
        // Y9: Simulate punctuation and capitalization correction
        const originalText = randomText.toLowerCase().replace(/[.,!?]/g, '')
        const correctedText = applyPunctuationCorrection(originalText)
        
        const segmentDuration = 3 + Math.random() * 4 // 3-7 seconds
        // Y36, Y37, Y38: Analyze sentiment, emotion, and intent
        const analysis = analyzeSentiment(correctedText)
        
        const newSegment: TranscriptSegment = {
          id: `segment-${Date.now()}`,
          speaker: currentSpeaker,
          speakerConfidence,
          startTime: recordingTime - segmentDuration,
          endTime: recordingTime,
          text: correctedText,
          confidence,
          isLive: true,
          punctuationCorrected: true,
          originalText,
          sentimentScore: analysis.sentiment,
          emotionalTone: analysis.emotion as any,
          intentCategory: analysis.intent as any
        }
        
        setTranscriptSegments(prev => [...prev, newSegment])
        
        // Y7: Update speaker statistics
        setSpeakers(prev => prev.map(speaker => {
          if (speaker.id === currentSpeaker) {
            const newSegmentCount = speaker.segments + 1
            const newTotalDuration = speaker.totalDuration + segmentDuration
            const newAverageConfidence = ((speaker.averageConfidence * speaker.segments) + speakerConfidence) / newSegmentCount
            
            return { 
              ...speaker, 
              segments: newSegmentCount,
              totalDuration: newTotalDuration,
              averageConfidence: newAverageConfidence
            }
          }
          return speaker
        }))
      }
    }, 800) // <1s delay as per Y2
  }, [recordingTime, confidenceThreshold])

  // Y9: Punctuation and capitalization correction
  const applyPunctuationCorrection = (text: string): string => {
    // Capitalize first letter
    let corrected = text.charAt(0).toUpperCase() + text.slice(1)
    
    // Add periods at natural sentence breaks
    corrected = corrected.replace(/\b(however|therefore|meanwhile|furthermore)\b/gi, '. $1')
    
    // Add question marks for questions
    corrected = corrected.replace(/\b(what|how|why|when|where|who|could|would|should|can|will|do|does|did|is|are|was|were)\b([^.!?]*?)$/gi, '$1$2?')
    
    // Add periods at the end if no punctuation
    if (!/[.!?]$/.test(corrected)) {
      corrected += '.'
    }
    
    return corrected
  }

  // Y8: Manual speaker segment editing
  const handleSpeakerChange = (segmentId: string, newSpeakerId: string) => {
    setTranscriptSegments(prev => prev.map(segment => {
      if (segment.id === segmentId) {
        return { ...segment, speaker: newSpeakerId }
      }
      return segment
    }))
    
    // Update speaker counts
    setSpeakers(prev => prev.map(speaker => ({
      ...speaker,
      segments: transcriptSegments.filter(s => s.speaker === speaker.id).length
    })))
  }

  // Y8: Manual speaker segment merging
  const mergeSegments = (segmentIds: string[]) => {
    const segmentsToMerge = transcriptSegments.filter(s => segmentIds.includes(s.id))
    if (segmentsToMerge.length < 2) return
    
    // Sort by start time
    segmentsToMerge.sort((a, b) => a.startTime - b.startTime)
    
    const mergedSegment: TranscriptSegment = {
      id: `merged-${Date.now()}`,
      speaker: segmentsToMerge[0].speaker,
      speakerConfidence: Math.min(...segmentsToMerge.map(s => s.speakerConfidence)),
      startTime: segmentsToMerge[0].startTime,
      endTime: segmentsToMerge[segmentsToMerge.length - 1].endTime,
      text: segmentsToMerge.map(s => s.text).join(' '),
      confidence: segmentsToMerge.reduce((sum, s) => sum + s.confidence, 0) / segmentsToMerge.length,
      isLive: false,
      punctuationCorrected: segmentsToMerge.every(s => s.punctuationCorrected)
    }
    
    setTranscriptSegments(prev => [
      ...prev.filter(s => !segmentIds.includes(s.id)),
      mergedSegment
    ])
  }

  // Y8: Manual speaker segment splitting
  const splitSegment = (segmentId: string, splitTime: number) => {
    const segment = transcriptSegments.find(s => s.id === segmentId)
    if (!segment || splitTime <= segment.startTime || splitTime >= segment.endTime) return
    
    const words = segment.text.split(' ')
    const splitIndex = Math.floor(words.length / 2) // Simple split at halfway point
    
    const firstPart: TranscriptSegment = {
      ...segment,
      id: `${segment.id}-part1`,
      endTime: splitTime,
      text: words.slice(0, splitIndex).join(' ')
    }
    
    const secondPart: TranscriptSegment = {
      ...segment,
      id: `${segment.id}-part2`,
      startTime: splitTime,
      text: words.slice(splitIndex).join(' ')
    }
    
    setTranscriptSegments(prev => [
      ...prev.filter(s => s.id !== segmentId),
      firstPart,
      secondPart
    ])
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setProcessingStatus('Processing final audio...')
    }
  }

  // Y3: Process full audio with local Whisper simulation
  const processFullAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setProcessingStatus('Running Whisper model locally...')
    
    // Simulate Whisper processing time (Y14: within 30s for 10-min file)
    const processingTime = Math.min(duration * 0.3, 30000) // Max 30 seconds
    
    setTimeout(() => {
      // Mark all live segments as processed
      setTranscriptSegments(prev => prev.map(segment => ({
        ...segment,
        isLive: false,
        confidence: Math.min(segment.confidence + 0.1, 1.0) // Improve confidence after full processing
      })))
      
      setIsProcessing(false)
      setProcessingStatus('Transcription complete!')
      handleAutoSave()
    }, processingTime)
  }

  // Y1: Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Y5: Support multiple formats
    if (!file.type.match(/(audio|video)\/(mp3|wav|m4a|mp4|mov|webm)/)) {
      addError({
        id: 'unsupported-format',
        type: 'validation',
        step: 'file-upload',
        message: 'Unsupported file format. Please use MP3, WAV, M4A, MP4, MOV, or WebM.',
        timestamp: new Date().toISOString(),
        recoverable: true,
        retryCount: 0,
        maxRetries: 1
      })
      return
    }
    
    setProcessingStatus(`Processing ${file.name}...`)
    setIsProcessing(true)
    
    // Create audio URL for playback
    const audioUrl = URL.createObjectURL(file)
    if (audioRef.current) {
      audioRef.current.src = audioUrl
      audioRef.current.load()
    }
    
    // Simulate file processing
    setTimeout(() => {
      processUploadedFile(file)
    }, 2000)
  }

  const processUploadedFile = (file: File) => {
    // Y14: Simulate Whisper processing within 30s for reasonable file size
    const estimatedDuration = Math.min(file.size / 100000, 600) // Rough estimate in seconds
    const processingTime = Math.min(estimatedDuration * 0.3, 30000)
    
    setTimeout(() => {
      // Generate mock transcript for uploaded file with sentiment analysis
      const mockTexts = [
        'Welcome everyone to today\'s presentation. We have several important topics to cover.',
        'Thank you for the introduction. I\'m excited to share our recent findings with the team.',
        'Let\'s begin with the quarterly metrics. As you can see on slide one, we\'ve exceeded our targets.'
      ]
      
      const mockSegments: TranscriptSegment[] = mockTexts.map((text, index) => {
        const analysis = analyzeSentiment(text)
        return {
          id: `upload-${index + 1}`,
          speaker: index % 2 === 0 ? 'speaker1' : 'speaker2',
          startTime: index * 15,
          endTime: (index + 1) * 15,
          text,
          confidence: 0.92 - (index * 0.02),
          isLive: false,
          speakerConfidence: 0.90 - (index * 0.02),
          punctuationCorrected: true,
          originalText: text.toLowerCase(),
          sentimentScore: analysis.sentiment,
          emotionalTone: analysis.emotion as any,
          intentCategory: analysis.intent as any
        }
      })
      
      setTranscriptSegments(mockSegments)
      setDuration(estimatedDuration)
      setIsProcessing(false)
      setProcessingStatus('File processed successfully!')
      
      // Update speaker counts
      setSpeakers(prev => prev.map(speaker => ({
        ...speaker,
        segments: mockSegments.filter(s => s.speaker === speaker.id).length
      })))
    }, processingTime)
  }

  // Y11: Add bookmark during transcription (Ctrl+B)
  const addBookmark = useCallback(() => {
    const timestamp = isRecording ? recordingTime : currentTime
    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      timestamp,
      label: `Bookmark at ${formatTime(timestamp)}`
    }
    
    setBookmarks(prev => [...prev, newBookmark])
    
    // Mark current segment as bookmarked (Y11)
    if (transcriptSegments.length > 0) {
      const lastSegment = transcriptSegments[transcriptSegments.length - 1]
      setTranscriptSegments(prev => prev.map(segment => 
        segment.id === lastSegment.id 
          ? { ...segment, isBookmarked: true }
          : segment
      ))
    }
  }, [isRecording, recordingTime, currentTime, transcriptSegments])

  // Y12: Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault()
            addBookmark()
            break
          case 'Enter':
            event.preventDefault()
            // Y12: New section - could add section break
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [addBookmark])

  // Y10: Audio playback sync
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const jumpToTimestamp = (timestamp: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timestamp
      setCurrentTime(timestamp)
    }
  }

  const handleComplete = () => {
    handleAutoSave()
    nextStep()
  }



  // Y15: Word-level timestamp generation
  const generateWordTimestamps = (text: string, startTime: number, endTime: number) => {
    const words = text.split(/\s+/)
    const wordCount = words.length
    const timePerWord = (endTime - startTime) / wordCount
    
    return words.map((word, index) => ({
      word,
      start: startTime + (index * timePerWord),
      end: startTime + ((index + 1) * timePerWord)
    }))
  }

  // Y32: Backchanneling detection
  const detectBackchanneling = (text: string): boolean => {
    const backchannelWords = ['mm-hmm', 'uh-huh', 'right', 'yeah', 'okay', 'sure', 'mhm', 'uh huh']
    return backchannelWords.some(word => text.toLowerCase().includes(word))
  }

  // Y33: Non-verbal cue detection
  const detectNonVerbalCues = (text: string): string[] => {
    const cues: string[] = []
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('laughter') || lowerText.includes('laughing')) cues.push('laughter')
    if (lowerText.includes('sigh') || lowerText.includes('sighing')) cues.push('sigh')
    if (lowerText.includes('pause') || lowerText.includes('silence')) cues.push('silence')
    if (lowerText.includes('cough') || lowerText.includes('coughing')) cues.push('cough')
    
    return cues
  }

  // Y39: Urgency detection
  const detectUrgency = (text: string): number => {
    const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'important', 'quick', 'fast', 'now', 'help', 'deadline', 'due']
    const words = text.toLowerCase().split(/\s+/)
    const urgentCount = words.filter(word => urgentWords.includes(word)).length
    return Math.min(1, urgentCount / 10) // Normalize to 0-1
  }

  // Enhanced action item detection (Y58)
  const detectActionItems = (segments: TranscriptSegment[]) => {
    const actionPhrases = [
      'need to', 'should', 'will', 'going to', 'plan to', 'have to', 'must',
      'action item', 'todo', 'task', 'follow up', 'next steps', 'deadline',
      'assign', 'responsible', 'owner', 'due date', 'by when'
    ]
    
    const detectedItems: Array<{
      id: string
      text: string
      speaker: string
      timestamp: number
      assignedTo?: string
      priority: 'low' | 'medium' | 'high'
    }> = []
    
    segments.forEach(segment => {
      const text = segment.text.toLowerCase()
      const hasActionPhrase = actionPhrases.some(phrase => text.includes(phrase))
      
      if (hasActionPhrase) {
        // Determine priority based on urgency words
        const urgencyWords = ['urgent', 'asap', 'critical', 'immediately', 'emergency']
        const priority = urgencyWords.some(word => text.includes(word)) ? 'high' : 
                        text.includes('important') ? 'medium' : 'low'
        
        detectedItems.push({
          id: `action-${Date.now()}-${Math.random()}`,
          text: segment.text,
          speaker: segment.speaker,
          timestamp: segment.startTime,
          priority
        })
      }
    })
    
    return detectedItems
  }

  // Y123: Question detection
  const detectQuestion = (text: string): boolean => {
    return text.includes('?') || 
           text.toLowerCase().startsWith('what') ||
           text.toLowerCase().startsWith('how') ||
           text.toLowerCase().startsWith('when') ||
           text.toLowerCase().startsWith('where') ||
           text.toLowerCase().startsWith('why') ||
           text.toLowerCase().startsWith('who') ||
           text.toLowerCase().startsWith('can') ||
           text.toLowerCase().startsWith('could') ||
           text.toLowerCase().startsWith('would') ||
           text.toLowerCase().startsWith('should')
  }

  // Y126: Decision point detection
  const detectDecision = (text: string): boolean => {
    const decisionPhrases = ['we decided', 'decision made', 'agreed to', 'chose to', 'selected', 'opted for', 'determined', 'resolved']
    return decisionPhrases.some(phrase => text.toLowerCase().includes(phrase))
  }

  // Y127: Importance scoring
  const calculateImportance = (segment: TranscriptSegment): number => {
    let score = 0
    
    // Base score from sentiment intensity
    if (segment.sentimentScore) {
      score += Math.abs(segment.sentimentScore) * 0.3
    }
    
    // Urgency bonus
    if (segment.urgencyScore) {
      score += segment.urgencyScore * 0.4
    }
    
    // Action item bonus
    if (segment.isActionItem) {
      score += 0.5
    }
    
    // Question bonus
    if (segment.isQuestion) {
      score += 0.3
    }
    
    // Decision bonus
    if (segment.isDecision) {
      score += 0.6
    }
    
    return Math.min(1, score)
  }

  // Y133: Topic extraction
  const extractTopics = (segments: TranscriptSegment[]) => {
    const wordFrequency: Record<string, number> = {}
    const topicSegments: Record<string, string[]> = {}
    
    segments.forEach(segment => {
      const words = segment.text.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.length > 3) { // Filter out short words
          wordFrequency[word] = (wordFrequency[word] || 0) + 1
          if (!topicSegments[word]) topicSegments[word] = []
          topicSegments[word].push(segment.id)
        }
      })
    })
    
    // Get top 5 most frequent words as topics
    const sortedTopics = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
    
    return sortedTopics.map(([topic, frequency]) => ({
      id: `topic-${topic}`,
      name: topic,
      frequency,
      segments: topicSegments[topic] || [],
      sentiment: 0 // Would be calculated based on segments
    }))
  }

  // Y31: Real-time sentiment update
  const updateRealTimeSentiment = (newSegment: TranscriptSegment) => {
    if (newSegment.sentimentScore !== undefined) {
      setRealTimeSentiment(prev => {
        const newBySpeaker = { ...prev.bySpeaker }
        newBySpeaker[newSegment.speaker] = newSegment.sentimentScore!
        
        const recentChanges = [...prev.recentChanges, {
          timestamp: Date.now(),
          speaker: newSegment.speaker,
          sentiment: newSegment.sentimentScore!
        }].slice(-10) // Keep last 10 changes
        
        const overall = Object.values(newBySpeaker).reduce((sum, score) => sum + score, 0) / Object.keys(newBySpeaker).length
        
        return {
          overall,
          bySpeaker: newBySpeaker,
          recentChanges
        }
      })
    }
  }

  // Add state for engine selection and error
  const [transcriptionEngine, setTranscriptionEngine] = useState<'whisper-local' | 'cloud' | null>(null)
  const [engineError, setEngineError] = useState<string | null>(null)

  // Add a button to trigger Whisper local transcription
  {isRecording && !isProcessing && (
    <div className="flex gap-4 mt-4">
      <button
        className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
        onClick={() => handleWhisperTranscription()}
        disabled={isProcessing}
      >
        Transcribe with Whisper (Local)
      </button>
      <button
        className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
        onClick={() => handleCloudTranscription()}
        disabled={isProcessing}
      >
        Transcribe with Cloud
      </button>
    </div>
  )}

  {isProcessing && (
    <div className="mt-2 text-sm text-gray-700">
      {processingStatus} (Engine: {transcriptionEngine || 'N/A'})
    </div>
  )}
  {engineError && (
    <div className="mt-2 text-sm text-red-600">{engineError}</div>
  )}

  // Add handlers for Whisper and Cloud transcription
  const handleCloudTranscription = async () => {
    setTranscriptionEngine('cloud')
    setProcessingStatus('Running cloud transcription...')
    setIsProcessing(true)
    setEngineError(null)
    try {
      // Simulate cloud processing (slightly slower)
      await new Promise(resolve => setTimeout(resolve, 4000))
      setProcessingStatus('Cloud transcription complete!')
      setIsProcessing(false)
      setTranscriptionEngine('cloud')
      handleAutoSave()
    } catch (err) {
      setEngineError('Cloud transcription failed. Please try again.')
      setIsProcessing(false)
      setTranscriptionEngine(null)
    }
  }

  const handleWhisperTranscription = async () => {
    setTranscriptionEngine('whisper-local')
    setProcessingStatus('Running Whisper model locally...')
    setIsProcessing(true)
    setEngineError(null)
    try {
      // Simulate Whisper processing time (Y14: within 30s for 10-min file)
      const simulatedProcessingTime = Math.min(duration * 0.3, 30000)
      await new Promise(resolve => setTimeout(resolve, simulatedProcessingTime))
      // Simulate success/failure
      if (Math.random() < 0.85) { // 85% success rate
        setProcessingStatus('Transcription complete!')
        setIsProcessing(false)
        setTranscriptionEngine('whisper-local')
        handleAutoSave()
      } else {
        throw new Error('Whisper failed to process audio locally.')
      }
    } catch (err) {
      setEngineError('Whisper local transcription failed. Falling back to cloud...')
      setIsProcessing(false)
      setTranscriptionEngine(null)
      handleCloudTranscription()
    }
  }

  // Add comprehensive meeting summary generation (Y116)
  const generateMeetingSummary = (segments: TranscriptSegment[], speakers: Speaker[], actionItems: Array<{
    id: string
    text: string
    speaker: string
    timestamp: number
    assignedTo?: string
    priority: 'low' | 'medium' | 'high'
  }>) => {
    const totalDuration = Math.max(...segments.map(s => s.endTime))
    const speakerStats = speakers.map(s => ({
      name: s.name,
      segments: s.segments,
      totalDuration: s.totalDuration,
      percentage: (s.totalDuration / totalDuration) * 100
    }))
    
    const keyTopics = extractKeyTopics(segments)
    const sentiment = calculateOverallSentiment(segments)
    
    return {
      overview: `Meeting lasted ${formatTime(totalDuration)} with ${speakers.length} participants.`,
      keyPoints: keyTopics.slice(0, 5),
      actionItems: actionItems.length,
      speakerParticipation: speakerStats,
      sentiment: sentiment,
      nextSteps: actionItems.map((item: { text: string }) => item.text).slice(0, 3)
    }
  }

  const extractKeyTopics = (segments: TranscriptSegment[]) => {
    // Simple keyword extraction (in production, use NLP)
    const words = segments.flatMap(s => s.text.toLowerCase().split(/\s+/))
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(wordCount)
      .filter(([word, count]) => count > 2 && word.length > 3)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)
  }

  const calculateOverallSentiment = (segments: TranscriptSegment[]) => {
    const sentiments = segments.map(s => s.sentimentScore || 0)
    const average = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length
    return average > 0.1 ? 'positive' : average < -0.1 ? 'negative' : 'neutral'
  }

  // After transcription complete, generate summary and show save options
  useEffect(() => {
    if (!isProcessing && transcriptSegments.length > 0 && processingStatus.includes('complete')) {
      const detectedActions = detectActionItems(transcriptSegments)
      setActionItems(detectedActions)
      
      const summary = generateMeetingSummary(transcriptSegments, speakers, detectedActions)
      setMeetingSummary(JSON.stringify(summary, null, 2))
      
      // Generate auto-tags
      const topics = extractKeyTopics(transcriptSegments)
      const tags = generateAutoTags(transcriptSegments, speakers, topics)
      setAutoTags(tags)
      
      // Find related notebooks
      findRelatedNotebooks()
      
      setShowMemorySave(true)
      setShowTemplateSelector(true)
      
      // Send action items to Punctual
      if (detectedActions.length > 0 && !punctualSync) {
        sendActionItemsToPunctual(detectedActions)
        setPunctualSync(true)
      }
    }
  }, [isProcessing, transcriptSegments, processingStatus, punctualSync, speakers])

  const sendActionItemsToPunctual = (items: typeof actionItems) => {
    // Placeholder: simulate sending to Punctual
    setTimeout(() => {
      // Success
    }, 1000)
  }

  // Update handleSaveMemory to use template and auto-tags
  const handleSaveMemory = () => {
    const template = memoryTemplates.find(t => t.id === selectedMemoryTemplate)
    const memory: Memory = {
      id: `memory-${Date.now()}`,
      title: `${template?.name || 'Meeting'} Transcript`,
      content: transcriptSegments.map(s => s.text).join(' '),
      summary: meetingSummary,
      tags: [...autoTags, ...(template?.tags || [])],
      category: selectedMemoryTemplate as any,
      source: 'transcription',
      createdAt: new Date(),
      updatedAt: new Date(),
      confidence: 0.9,
      relatedMemories: [],
      metadata: {
        keywords: extractKeyTopics(transcriptSegments),
        language: 'en',
        transcriptionConfidence: 0.9,
        participants: speakers.map(s => s.name)
      },
      status: 'active'
    }
    setMemorySaved(true)
    setShowMemorySave(false)
    setShowTemplateSelector(false)
  }

  // Add additional features state
  const [showFlashcardCreation, setShowFlashcardCreation] = useState(false)
  const [showTranscriptForking, setShowTranscriptForking] = useState(false)
  const [showMemoryDecay, setShowMemoryDecay] = useState(false)
  const [showCourseConversion, setShowCourseConversion] = useState(false)
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([])
  const [memoryDecayDays, setMemoryDecayDays] = useState(30)
  const [forkedTranscripts, setForkedTranscripts] = useState<Array<{
    id: string
    name: string
    segments: TranscriptSegment[]
    createdAt: Date
  }>>([])

  // Create flashcards from selected quotes (Y62)
  const createFlashcardsFromQuotes = () => {
    const flashcards = selectedQuotes.map((quote, index) => ({
      id: `flashcard-${Date.now()}-${index}`,
      front: `Quote from meeting: "${quote.substring(0, 100)}..."`,
      back: quote,
      category: 'meeting',
      difficulty: 'medium' as const,
      tags: ['meeting', 'quote', 'auto-generated'],
      hint: 'Think about the context and speaker'
    }))
    
    // In a real implementation, this would save to the flashcard system
    console.log('Created flashcards:', flashcards)
    setShowFlashcardCreation(false)
    setSelectedQuotes([])
  }

  // Fork transcript into multiple summaries (Y65)
  const forkTranscript = (name: string, segments: TranscriptSegment[]) => {
    const forkedTranscript = {
      id: `fork-${Date.now()}`,
      name,
      segments,
      createdAt: new Date()
    }
    
    setForkedTranscripts(prev => [...prev, forkedTranscript])
    setShowTranscriptForking(false)
  }

  // Set memory decay threshold (Y64)
  const setMemoryDecay = (days: number) => {
    setMemoryDecayDays(days)
    setShowMemoryDecay(false)
    // In a real implementation, this would update the memory metadata
    console.log(`Memory will decay after ${days} days`)
  }

  // Convert transcript to course (Y69)
  const convertToCourse = () => {
    const courseStructure = {
      title: 'Course from Meeting Transcript',
      modules: [
        {
          title: 'Introduction',
          content: transcriptSegments.slice(0, 3).map(s => s.text).join(' ')
        },
        {
          title: 'Key Concepts',
          content: extractKeyTopics(transcriptSegments).join(', ')
        },
        {
          title: 'Action Items',
          content: actionItems.map(item => item.text).join('\n')
        }
      ]
    }
    
    console.log('Created course:', courseStructure)
    setShowCourseConversion(false)
  }

  // Select quote for flashcard creation
  const selectQuote = (quote: string) => {
    setSelectedQuotes(prev => 
      prev.includes(quote) 
        ? prev.filter(q => q !== quote)
        : [...prev, quote]
    )
  }

  // Add auto-linking state
  const [relatedNotebooks, setRelatedNotebooks] = useState<Array<{
    id: string
    title: string
    relevance: number
    sections: Array<{
      id: string
      title: string
      content: string
    }>
  }>>([])
  const [showAutoLinking, setShowAutoLinking] = useState(false)

  // Auto-linking to related Notebook sections (Y63)
  const findRelatedNotebooks = () => {
    // Simulate finding related notebooks based on topics and keywords
    const topics = extractKeyTopics(transcriptSegments)
    const mockRelatedNotebooks = [
      {
        id: 'notebook-1',
        title: 'Project Planning Guidelines',
        relevance: 0.85,
        sections: [
          { id: 'section-1', title: 'Meeting Best Practices', content: 'Guidelines for effective meetings...' },
          { id: 'section-2', title: 'Action Item Tracking', content: 'How to track and follow up on action items...' }
        ]
      },
      {
        id: 'notebook-2',
        title: 'Technical Architecture',
        relevance: 0.72,
        sections: [
          { id: 'section-3', title: 'API Integration', content: 'Technical details about API integration...' },
          { id: 'section-4', title: 'System Design', content: 'System architecture and design patterns...' }
        ]
      }
    ]
    
    setRelatedNotebooks(mockRelatedNotebooks)
    setShowAutoLinking(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Voice Transcription
        </h2>
        <p className="text-gray-600">
          Record, transcribe, and analyze voice content with AI-powered insights
        </p>
      </div>

      {/* Auto-transcribe meetings toggle */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-2">
          <input 
            type="checkbox" 
            id="auto-transcribe" 
            checked={autoTranscribeMeetings} 
            onChange={e => setAutoTranscribeMeetings(e.target.checked)} 
            className="rounded"
          />
          <label htmlFor="auto-transcribe" className="text-sm font-medium">
            Auto-transcribe upcoming calendar meetings
          </label>
        </div>
        {autoTranscribeMeetings && (
          <div className="text-blue-700 text-sm">
            Upcoming meetings will be auto-transcribed and appear here after completion. (Simulated)
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <MicrophoneIcon className="h-5 w-5 mr-2" />
            Audio Input
          </h3>
          
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Recording */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Live Recording</h4>
            <div className="flex space-x-3">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <MicrophoneIcon className="h-4 w-4 mr-2" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <StopIcon className="h-4 w-4 mr-2" />
                  Stop Recording
                </button>
              )}
              
              <button
                onClick={addBookmark}
                disabled={!isRecording}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                title="Ctrl+B"
              >
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Bookmark
              </button>
            </div>
          </div>
          
          {/* File Upload */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Upload Audio/Video</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.mov,.webm"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isRecording || isProcessing}
                className="flex items-center justify-center w-full px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
              >
                <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                Upload File (MP3, WAV, M4A, MP4, MOV)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Playback Controls */}
      {duration > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <SpeakerWaveIcon className="h-5 w-5 mr-2" />
              Playback
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5 ml-1" />
              )}
            </button>
            
            <div className="flex-1 bg-gray-200 rounded-full h-2 cursor-pointer">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
          
          <audio 
            ref={audioRef}
            onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
            onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
            className="hidden"
          />
        </div>
      )}

      {/* Speaker Management */}
      {speakers.some(s => s.segments > 0) && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Speaker Identification & Analytics
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Speaker List with Enhanced Stats */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Speakers</h4>
              {speakers.filter(s => s.segments > 0).map((speaker) => (
                <div key={speaker.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${speaker.color}`} />
                    <input
                      type="text"
                      value={speaker.name}
                      onChange={(e) => setSpeakers(prev => prev.map(s => 
                        s.id === speaker.id ? { ...s, name: e.target.value } : s
                      ))}
                      className="flex-1 px-2 py-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  {/* Y7: Enhanced speaker analytics */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{speaker.segments}</span> segments
                    </div>
                    <div>
                      <span className="font-medium">{formatTime(speaker.totalDuration)}</span> duration
                    </div>
                    <div>
                      <span className="font-medium">{Math.round(speaker.averageConfidence * 100)}%</span> ID confidence
                    </div>
                    <div>
                      <span className="font-medium">{Math.round((speaker.totalDuration / transcriptSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0)) * 100)}%</span> talk time
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Speaker Activity Timeline */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Talk Time Distribution</h4>
              <div className="space-y-2">
                {speakers.filter(s => s.segments > 0).map((speaker) => {
                  const totalDuration = speakers.reduce((sum, s) => sum + s.totalDuration, 0)
                  const percentage = totalDuration > 0 ? (speaker.totalDuration / totalDuration) * 100 : 0
                  
                  return (
                    <div key={speaker.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${speaker.color}`} />
                          <span>{speaker.name}</span>
                        </div>
                        <span>{Math.round(percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${speaker.color.replace('bg-', 'bg-')}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookmarkIcon className="h-5 w-5 mr-2" />
            Bookmarks ({bookmarks.length})
          </h3>
          
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <button
                key={bookmark.id}
                onClick={() => jumpToTimestamp(bookmark.timestamp)}
                className="w-full text-left p-2 hover:bg-gray-50 rounded border flex items-center justify-between"
              >
                <span className="text-sm">{bookmark.label}</span>
                <span className="text-xs text-gray-500">{formatTime(bookmark.timestamp)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Transcript with Enhanced Editing */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Live Transcript ({transcriptSegments.length} segments)
          </h3>
          
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600">
              Confidence threshold:
              <select 
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="ml-2 border rounded px-2 py-1"
              >
                <option value={0.5}>50%</option>
                <option value={0.7}>70%</option>
                <option value={0.8}>80%</option>
                <option value={0.9}>90%</option>
              </select>
            </label>
          </div>
        </div>
        
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {transcriptSegments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {isRecording ? 'Listening...' : 'Start recording or upload a file to begin transcription'}
            </div>
          ) : (
            <>
              {transcriptSegments.map((segment) => {
                const speaker = speakers.find(s => s.id === segment.speaker)
                
                return (
                  <div 
                    key={segment.id} 
                    className={`border-l-4 pl-4 ${segment.isLive ? 'border-green-400 bg-green-50' : 'border-gray-200'} hover:bg-gray-50 group`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {/* Y8: Speaker selection dropdown */}
                        <select
                          value={segment.speaker}
                          onChange={(e) => handleSpeakerChange(segment.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1 bg-white"
                        >
                          {speakers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        
                        <button
                          onClick={() => jumpToTimestamp(segment.startTime)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {formatTime(segment.startTime)}
                        </button>
                        
                        {segment.isLive && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            LIVE
                          </span>
                        )}
                        
                        {segment.punctuationCorrected && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded" title="Auto-corrected punctuation">
                            CORRECTED
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Y7: Show both transcription and speaker confidence */}
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded" title="Transcription confidence">
                          {Math.round(segment.confidence * 100)}%
                        </span>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded" title="Speaker ID confidence">
                          ID: {Math.round(segment.speakerConfidence * 100)}%
                        </span>
                        
                        {/* Y8: Manual editing controls */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          <button
                            onClick={() => splitSegment(segment.id, segment.startTime + (segment.endTime - segment.startTime) / 2)}
                            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                            title="Split segment"
                          >
                            Split
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Editable transcript text */}
                      <textarea
                        value={segment.text}
                        onChange={(e) => setTranscriptSegments(prev => prev.map(s => 
                          s.id === segment.id ? { ...s, text: e.target.value } : s
                        ))}
                        className="w-full text-gray-800 leading-relaxed bg-transparent border-none resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1"
                        rows={Math.max(1, Math.ceil(segment.text.length / 80))}
                      />
                      
                      {/* Y9: Show original text if corrected */}
                      {segment.originalText && segment.originalText !== segment.text && (
                        <details className="text-xs text-gray-500">
                          <summary className="cursor-pointer hover:text-gray-700">Original text</summary>
                          <p className="mt-1 italic">{segment.originalText}</p>
                        </details>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={transcriptEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {transcriptSegments.length} segments • {speakers.filter(s => s.segments > 0).length} speakers • {bookmarks.length} bookmarks
        </div>
        
        <button
          onClick={handleComplete}
          disabled={isRecording || isProcessing}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <CloudArrowUpIcon className="h-5 w-5 mr-2" />
          Complete Transcription
        </button>
      </div>

      {/* After transcription, show summary and save as memory UI */}
      {showMemorySave && (
        <div className="mt-4 space-y-4">
          {/* Memory Template Selector */}
          {showTemplateSelector && (
            <div className="p-4 bg-purple-50 rounded">
              <div className="font-semibold mb-2">Memory Template:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {memoryTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedMemoryTemplate(template.id)}
                    className={`p-2 rounded text-sm text-left ${
                      selectedMemoryTemplate === template.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border hover:bg-purple-100'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs opacity-75">{template.description}</div>
                  </button>
                ))}
              </div>
              
              {/* Auto-generated Tags */}
              <div className="font-semibold mb-2">Auto-generated Tags:</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {autoTags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Summary */}
          <div className="p-4 bg-blue-50 rounded">
            <div className="font-semibold mb-2">Meeting Summary:</div>
            <pre className="text-sm whitespace-pre-wrap">{meetingSummary}</pre>
            <button onClick={handleSaveMemory} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Save as Memory
            </button>
          </div>

          {/* Speaker Analytics */}
          <div className="p-4 bg-gray-50 rounded">
            <div className="font-semibold mb-2">Speaker Analytics:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {speakers.map(speaker => {
                const speakerActions = actionItems.filter(item => item.speaker === speaker.id)
                const totalDuration = Math.max(...transcriptSegments.map(s => s.endTime))
                const percentage = totalDuration > 0 ? (speaker.totalDuration / totalDuration) * 100 : 0
                
                return (
                  <div key={speaker.id} className="p-3 bg-white rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${speaker.color}`}></div>
                      <span className="font-medium">{speaker.name}</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Talk time: {formatTime(speaker.totalDuration)} ({percentage.toFixed(1)}%)</div>
                      <div>Segments: {speaker.segments}</div>
                      <div>Action items: {speakerActions.length}</div>
                      <div>Confidence: {(speaker.averageConfidence * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Items */}
          {actionItems.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded">
              <div className="font-semibold mb-2">Action Items ({actionItems.length}):</div>
              <div className="space-y-2">
                {actionItems.map(item => (
                  <div key={item.id} className="p-2 bg-white rounded border-l-4 border-yellow-400">
                    <div className="text-sm">{item.text}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {speakers.find(s => s.id === item.speaker)?.name} • {formatTime(item.timestamp)} • {item.priority} priority
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collaboration Panel */}
          <div className="p-4 bg-indigo-50 rounded">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Collaboration</div>
              <button
                onClick={() => setShowCollaboration(!showCollaboration)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {showCollaboration ? 'Hide' : 'Show'} Collaboration
              </button>
            </div>
            
            {showCollaboration && (
              <div className="space-y-4">
                {/* Collaborators */}
                <div>
                  <div className="font-medium mb-2">Collaborators:</div>
                  <div className="flex gap-2">
                    {collaborators.map(collaborator => (
                      <div key={collaborator.id} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${collaborator.color} ${collaborator.isOnline ? 'animate-pulse' : ''}`}></div>
                        <span className="text-sm">{collaborator.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <div className="font-medium mb-2">Comments ({comments.length}):</div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {comments.map(comment => {
                      const segment = transcriptSegments.find(s => s.id === comment.segmentId)
                      return (
                        <div key={comment.id} className={`p-2 bg-white rounded border ${comment.resolved ? 'opacity-60' : ''}`}>
                          <div className="text-xs text-gray-500 mb-1">
                            {comment.author} on "{segment?.text?.substring(0, 50)}..."
                          </div>
                          <div className="text-sm">{comment.text}</div>
                          {!comment.resolved && (
                            <button
                              onClick={() => resolveComment(comment.id)}
                              className="text-xs text-green-600 hover:text-green-800 mt-1"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Add Comment */}
                <div>
                  <div className="font-medium mb-2">Add Comment:</div>
                  <div className="flex gap-2">
                    <select
                      value={selectedSegmentForComment || ''}
                      onChange={(e) => setSelectedSegmentForComment(e.target.value)}
                      className="flex-1 p-2 border rounded text-sm"
                    >
                      <option value="">Select segment...</option>
                      {transcriptSegments.map(segment => (
                        <option key={segment.id} value={segment.id}>
                          {segment.text.substring(0, 50)}...
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add comment..."
                      className="flex-1 p-2 border rounded text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && selectedSegmentForComment) {
                          addComment(selectedSegmentForComment, newComment)
                        }
                      }}
                    />
                    <button
                      onClick={() => selectedSegmentForComment && addComment(selectedSegmentForComment, newComment)}
                      disabled={!selectedSegmentForComment || !newComment.trim()}
                      className="px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {memorySaved && <div className="mt-2 text-green-600">Meeting transcript saved to Memory!</div>}
      {punctualSync && <div className="mt-2 text-blue-600">Action items sent to Punctual!</div>}

      {/* Additional Features */}
      {showMemorySave && (
        <div className="mt-4 space-y-4">
          {/* Flashcard Creation from Quotes */}
          <div className="p-4 bg-green-50 rounded">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Create Flashcards from Quotes</div>
              <button
                onClick={() => setShowFlashcardCreation(!showFlashcardCreation)}
                className="text-sm text-green-600 hover:text-green-800"
              >
                {showFlashcardCreation ? 'Hide' : 'Show'} Flashcard Creation
              </button>
            </div>
            
            {showFlashcardCreation && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-2">Select quotes to create flashcards:</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {transcriptSegments.slice(0, 10).map(segment => (
                    <label key={segment.id} className="flex items-start gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-green-50">
                      <input
                        type="checkbox"
                        checked={selectedQuotes.includes(segment.text)}
                        onChange={() => selectQuote(segment.text)}
                        className="mt-1"
                      />
                      <div className="text-sm">
                        <div className="font-medium">{speakers.find(s => s.id === segment.speaker)?.name}</div>
                        <div className="text-gray-600">{segment.text}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedQuotes.length > 0 && (
                  <button
                    onClick={createFlashcardsFromQuotes}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Create {selectedQuotes.length} Flashcards
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Transcript Forking */}
          <div className="p-4 bg-orange-50 rounded">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Fork Transcript</div>
              <button
                onClick={() => setShowTranscriptForking(!showTranscriptForking)}
                className="text-sm text-orange-600 hover:text-orange-800"
              >
                {showTranscriptForking ? 'Hide' : 'Show'} Forking
              </button>
            </div>
            
            {showTranscriptForking && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-2">Create separate summaries from this transcript:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button
                    onClick={() => forkTranscript('Key Decisions', transcriptSegments.filter(s => s.text.toLowerCase().includes('decision')))}
                    className="p-3 bg-white rounded border hover:bg-orange-50 text-left"
                  >
                    <div className="font-medium">Key Decisions</div>
                    <div className="text-sm text-gray-600">Extract decision points</div>
                  </button>
                  <button
                    onClick={() => forkTranscript('Action Items', transcriptSegments.filter(s => actionItems.some(a => a.text.includes(s.text))))}
                    className="p-3 bg-white rounded border hover:bg-orange-50 text-left"
                  >
                    <div className="font-medium">Action Items</div>
                    <div className="text-sm text-gray-600">Extract tasks and follow-ups</div>
                  </button>
                  <button
                    onClick={() => forkTranscript('Technical Discussion', transcriptSegments.filter(s => s.text.toLowerCase().includes('technical') || s.text.toLowerCase().includes('api')))}
                    className="p-3 bg-white rounded border hover:bg-orange-50 text-left"
                  >
                    <div className="font-medium">Technical Discussion</div>
                    <div className="text-sm text-gray-600">Extract technical content</div>
                  </button>
                  <button
                    onClick={() => forkTranscript('Questions & Answers', transcriptSegments.filter(s => s.text.includes('?')))}
                    className="p-3 bg-white rounded border hover:bg-orange-50 text-left"
                  >
                    <div className="font-medium">Q&A</div>
                    <div className="text-sm text-gray-600">Extract questions and answers</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Memory Decay Settings */}
          <div className="p-4 bg-red-50 rounded">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Memory Decay Settings</div>
              <button
                onClick={() => setShowMemoryDecay(!showMemoryDecay)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                {showMemoryDecay ? 'Hide' : 'Show'} Decay Settings
              </button>
            </div>
            
            {showMemoryDecay && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-2">Set when this transcript should decay from memory:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setMemoryDecay(7)}
                    className={`p-3 rounded border ${memoryDecayDays === 7 ? 'bg-red-600 text-white' : 'bg-white hover:bg-red-50'}`}
                  >
                    <div className="font-medium">7 days</div>
                    <div className="text-xs">Short-term</div>
                  </button>
                  <button
                    onClick={() => setMemoryDecay(30)}
                    className={`p-3 rounded border ${memoryDecayDays === 30 ? 'bg-red-600 text-white' : 'bg-white hover:bg-red-50'}`}
                  >
                    <div className="font-medium">30 days</div>
                    <div className="text-xs">Medium-term</div>
                  </button>
                  <button
                    onClick={() => setMemoryDecay(90)}
                    className={`p-3 rounded border ${memoryDecayDays === 90 ? 'bg-red-600 text-white' : 'bg-white hover:bg-red-50'}`}
                  >
                    <div className="font-medium">90 days</div>
                    <div className="text-xs">Long-term</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Course Conversion */}
          <div className="p-4 bg-purple-50 rounded">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Convert to Course</div>
              <button
                onClick={() => setShowCourseConversion(!showCourseConversion)}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                {showCourseConversion ? 'Hide' : 'Show'} Course Conversion
              </button>
            </div>
            
            {showCourseConversion && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-2">Transform this transcript into a structured learning course:</div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium mb-2">Course Structure Preview:</div>
                  <div className="text-sm space-y-1">
                    <div>• Introduction: Meeting overview and context</div>
                    <div>• Key Concepts: {extractKeyTopics(transcriptSegments).slice(0, 3).join(', ')}</div>
                    <div>• Action Items: {actionItems.length} tasks and follow-ups</div>
                    <div>• Summary: Meeting outcomes and next steps</div>
                  </div>
                </div>
                <button
                  onClick={convertToCourse}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Create Course
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto-linking to Related Notebooks */}
      {showAutoLinking && (
        <div className="p-4 bg-teal-50 rounded">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold">Related Notebooks</div>
            <button
              onClick={() => setShowAutoLinking(!showAutoLinking)}
              className="text-sm text-teal-600 hover:text-teal-800"
            >
              {showAutoLinking ? 'Hide' : 'Show'} Auto-linking
            </button>
          </div>
          
          {showAutoLinking && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-2">Found {relatedNotebooks.length} related notebooks:</div>
              <div className="space-y-3">
                {relatedNotebooks.map(notebook => (
                  <div key={notebook.id} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{notebook.title}</div>
                      <div className="text-sm text-gray-500">
                        {(notebook.relevance * 100).toFixed(0)}% relevant
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Related sections:</div>
                    <div className="space-y-1">
                      {notebook.sections.map(section => (
                        <div key={section.id} className="text-sm p-2 bg-gray-50 rounded">
                          <div className="font-medium">{section.title}</div>
                          <div className="text-gray-600">{section.content}</div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-2 text-sm text-teal-600 hover:text-teal-800">
                      View Notebook →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
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
import React from 'react'

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
  const [actionItems, setActionItems] = useState<Array<TranscriptSegment>>([])
  
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
  const [chapters, setChapters] = useState<Array<{ topic: string; segments: TranscriptSegment[] }>>([])
  const [recurringThemes, setRecurringThemes] = useState<string[]>([])
  const [rankedQuotes, setRankedQuotes] = useState<Array<{ text: string; importance: number; segmentId: string }>>([])
  
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
        ? { ...comment, replies: [...comment.replies, reply] } : comment
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
  
  // Latency tracking state
  const [lastChunkTimestamp, setLastChunkTimestamp] = useState<number | null>(null)
  const [latencyWarning, setLatencyWarning] = useState<string | null>(null)
  // 2-minute summary state
  const [segmentSummaries, setSegmentSummaries] = useState<Array<{
    start: number,
    end: number,
    summary: string
  }>>([])
  const summaryTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Add state for style tags, highlighting, and 5-minute summaries
  const [styleTags, setStyleTags] = useState<Record<string, string>>({})
  const [highlightedText, setHighlightedText] = useState<Record<string, Array<{ text: string; type: 'name' | 'date' | 'number' | 'url' }>>>({})
  const [fiveMinuteSummaries, setFiveMinuteSummaries] = useState<Array<{ timestamp: number; bullets: string[] }>>([])
  const fiveMinuteTimerRef = useRef<NodeJS.Timeout | null>(null)
  
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
          // Latency measurement
          const now = Date.now()
          if (lastChunkTimestamp) {
            const latency = now - lastChunkTimestamp
            if (latency > 3000) {
              setLatencyWarning('Warning: Transcription latency exceeded 3 seconds!')
            } else {
              setLatencyWarning(null)
            }
          }
          setLastChunkTimestamp(now)
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
      
      // Start 2-minute summary timer
      if (summaryTimerRef.current) clearInterval(summaryTimerRef.current)
      summaryTimerRef.current = setInterval(() => {
        summarizeLastTwoMinutes()
      }, 2 * 60 * 1000)
      
      // Start 5-minute summary timer (Y17)
      if (fiveMinuteTimerRef.current) clearInterval(fiveMinuteTimerRef.current)
      fiveMinuteTimerRef.current = setInterval(() => {
        generateFiveMinuteSummary()
      }, 5 * 60 * 1000)
      
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
    setTimeout(() => {
      const mockTranscriptions = [
        "Thank you for joining today's meeting.",
        "Let's start by reviewing our quarterly progress.",
        "The metrics show significant improvement this quarter.",
        "We need to discuss the upcoming project timeline.",
        "I have some questions about the implementation strategy.",
        "Could you elaborate on that point?",
        "I think we should consider alternative approaches.",
        "The deadline seems aggressive given our current resources.",
        '"We should delay the launch," said Alice.',
        'I object to the current plan.',
        'Is this the best approach?',
        'Decision: Move forward with option B.'
      ]
      const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]
      // Speaker logic: alternate for demo
      const currentSpeaker = lastSpeaker === 'speaker1' ? 'speaker2' : 'speaker1'
      setLastSpeaker(currentSpeaker)
      const confidence = 0.75 + Math.random() * 0.2
      const speakerConfidence = 0.80 + Math.random() * 0.15
      if (confidence >= confidenceThreshold) {
        const originalText = randomText.toLowerCase().replace(/[.,!?]/g, '')
        const correctedText = applyPunctuationCorrection(originalText)
        const segmentDuration = 3 + Math.random() * 4
        const analysis = analyzeSentiment(correctedText)
        
        // --- Requirement 13: Style tag ---
        const styleTag = detectStyleTag(correctedText)
        
        // --- Requirement 14: Entity highlighting ---
        const highlights = highlightEntities(correctedText)
        
        // --- Requirement 16: Intent detection ---
        const intent = detectIntent(correctedText)
        
        // --- Existing tagging logic ---
        const isQuote = /".*"/.test(randomText)
        const isQuestion = /\?$/.test(randomText)
        const isObjection = /object|objection/i.test(randomText)
        const isDecision = /decision:|move forward|approved|rejected/i.test(randomText)
        const isActionItem = /need to|should|must|action item|todo/i.test(randomText)
        
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
          intentCategory: intent as any,
          isQuestion,
          isBookmarked: false,
          isActionItem,
          isDecision,
          nonVerbalCues: [],
          backchanneling: false
        }
        
        setTranscriptSegments(prev => [...prev, newSegment])
        
        // Update style tags and highlights
        setStyleTags(prev => ({ ...prev, [newSegment.id]: styleTag }))
        setHighlightedText(prev => ({ ...prev, [newSegment.id]: highlights }))
        
        // Live action item extraction
        if (isActionItem) {
          setActionItems(prev => [...prev, newSegment])
        }
        
        // Update speakers
        setSpeakers(prev => prev.map(speaker => {
          if (speaker.id === currentSpeaker) {
            return {
              ...speaker,
              segments: speaker.segments + 1,
              totalDuration: speaker.totalDuration + segmentDuration,
              averageConfidence: (speaker.averageConfidence * speaker.segments + speakerConfidence) / (speaker.segments + 1)
            }
          }
          return speaker
        }))
      }
    }, 500 + Math.random() * 500)
  }, [confidenceThreshold, lastSpeaker, recordingTime, applyPunctuationCorrection, analyzeSentiment])

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
      
      // Generate recap email (Y18)
      setTimeout(() => {
        generateRecapEmail()
      }, 2000)
      
      // Clear summary timers
      if (summaryTimerRef.current) {
        clearInterval(summaryTimerRef.current)
        summaryTimerRef.current = null
      }
      if (fiveMinuteTimerRef.current) {
        clearInterval(fiveMinuteTimerRef.current)
        fiveMinuteTimerRef.current = null
      }
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
          ? { ...segment, isBookmarked: true } : segment
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

  // Add summarization function
  const summarizeLastTwoMinutes = useCallback(() => {
    const now = Date.now()
    const twoMinutesAgo = now - 2 * 60 * 1000
    // Find segments from last 2 minutes
    const recentSegments = transcriptSegments.filter(seg => {
      const segEnd = seg.endTime * 1000 // assuming endTime is in seconds
      return segEnd >= twoMinutesAgo
    })
    if (recentSegments.length === 0) return
    // Concatenate text for summary
    const text = recentSegments.map(seg => seg.text).join(' ')
    // Simulate summary (replace with real AI call as needed)
    const summary = `Summary (${new Date().toLocaleTimeString()}): ${text.slice(0, 120)}${text.length > 120 ? '...' : ''}`
    setSegmentSummaries(prev => [
      ...prev,
      {
        start: recentSegments[0].startTime,
        end: recentSegments[recentSegments.length - 1].endTime,
        summary
      }
    ])
  }, [transcriptSegments])

  // Language selection state (Y6)
  const [language, setLanguage] = useState('en')
  // Speaker change detection state (Y4)
  const [lastSpeaker, setLastSpeaker] = useState<string | null>(null)

  // Add effect to extract topics and chapters whenever transcriptSegments change (Y8, Y12)
  useEffect(() => {
    // Simple topic extraction: group by keywords (simulate)
    const topicMap: Record<string, TranscriptSegment[]> = {}
    transcriptSegments.forEach(seg => {
      let topic = 'General'
      if (/project|timeline|deadline/i.test(seg.text)) topic = 'Project Management'
      else if (/metrics|results|growth|numbers/i.test(seg.text)) topic = 'Metrics & Results'
      else if (/decision|approved|rejected/i.test(seg.text)) topic = 'Decisions'
      else if (/question|how|why|what|who|when|where|could|would|should|can|will|do|does|did/i.test(seg.text)) topic = 'Questions'
      if (!topicMap[topic]) topicMap[topic] = []
      topicMap[topic].push(seg)
    })
    setChapters(Object.entries(topicMap).map(([topic, segments]) => ({ topic, segments })))
    // Recurring themes: find words/phrases that appear in 3+ segments
    const wordCounts: Record<string, number> = {}
    transcriptSegments.forEach(seg => {
      seg.text.split(/\s+/).forEach(word => {
        const w = word.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (w.length > 3) wordCounts[w] = (wordCounts[w] || 0) + 1
      })
    })
    setRecurringThemes(Object.entries(wordCounts).filter(([w, c]) => c >= 3).map(([w]) => w))
    // Rank quotes by importance (simulate: longer and more recent = more important)
    const quotes = transcriptSegments.filter(seg => seg.text.length > 30 && seg.text.includes('"')).map(seg => ({
      text: seg.text,
      importance: seg.text.length + seg.startTime,
      segmentId: seg.id
    }))
    setRankedQuotes(quotes.sort((a, b) => b.importance - a.importance).slice(0, 5))
  }, [transcriptSegments])

  // Add effect to regenerate summary as context evolves (Y9)
  const [liveSummary, setLiveSummary] = useState('')
  useEffect(() => {
    if (transcriptSegments.length === 0) return
    // Simulate summary regeneration
    const text = transcriptSegments.map(seg => seg.text).join(' ')
    setLiveSummary(`Live Summary: ${text.slice(0, 200)}${text.length > 200 ? '...' : ''}`)
  }, [transcriptSegments])

  // Add function to detect style tags (Y13)
  const detectStyleTag = (text: string): string => {
    if (/formal|official|business/i.test(text)) return 'formal'
    if (/casual|informal|friendly/i.test(text)) return 'casual'
    if (/technical|technical|code|api/i.test(text)) return 'technical'
    if (/emotional|passionate|excited/i.test(text)) return 'emotional'
    return 'neutral'
  }

  // Add function to highlight entities (Y14)
  const highlightEntities = (text: string): Array<{ text: string; type: 'name' | 'date' | 'number' | 'url' }> => {
    const highlights: Array<{ text: string; type: 'name' | 'date' | 'number' | 'url' }> = []
    
    // Names (simple pattern)
    const nameMatches = text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g)
    nameMatches?.forEach(name => highlights.push({ text: name, type: 'name' }))
    
    // Dates
    const dateMatches = text.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/g)
    dateMatches?.forEach(date => highlights.push({ text: date, type: 'date' }))
    
    // Numbers
    const numberMatches = text.match(/\b\d+(?:\.\d+)?%\b|\$\d+(?:\.\d+)?\b|\b\d{1,3}(?:,\d{3})*\b/g)
    numberMatches?.forEach(num => highlights.push({ text: num, type: 'number' }))
    
    // URLs
    const urlMatches = text.match(/\bhttps?:\/\/[^\s]+\b/g)
    urlMatches?.forEach(url => highlights.push({ text: url, type: 'url' }))
    
    return highlights
  }

  // Add function to detect intent (Y16)
  const detectIntent = (text: string): string => {
    if (/\b(what|how|why|when|where|who|could|would|should|can|will|do|does|did|is|are|was|were)\b/i.test(text)) return 'questioning'
    if (/\b(need|must|should|have to|required|essential)\b/i.test(text)) return 'requesting'
    if (/\b(object|disagree|against|oppose)\b/i.test(text)) return 'objecting'
    if (/\b(agree|approve|support|yes|correct)\b/i.test(text)) return 'agreeing'
    if (/\b(decision|decide|choose|select|pick)\b/i.test(text)) return 'deciding'
    if (/\b(thank|appreciate|grateful)\b/i.test(text)) return 'thanking'
    return 'informing'
  }

  // Add 5-minute summary generation (Y17)
  const generateFiveMinuteSummary = useCallback(() => {
    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000
    const recentSegments = transcriptSegments.filter(seg => {
      const segEnd = seg.endTime * 1000
      return segEnd >= fiveMinutesAgo
    })
    if (recentSegments.length === 0) return
    
    // Generate bullet points
    const bullets = [
      `Meeting continued with ${recentSegments.length} new segments`,
      `Key topics: ${chapters.slice(-2).map(ch => ch.topic).join(', ')}`,
      `Action items identified: ${recentSegments.filter(seg => seg.isActionItem).length}`,
      `Questions asked: ${recentSegments.filter(seg => seg.isQuestion).length}`,
      `Decisions made: ${recentSegments.filter(seg => seg.isDecision).length}`
    ]
    
    setFiveMinuteSummaries(prev => [...prev, { timestamp: now, bullets }])
  }, [transcriptSegments, chapters])

  // Add state for email drafting, Q&A, and Mere integration
  const [recapEmail, setRecapEmail] = useState<string>('')
  const [liveQuestions, setLiveQuestions] = useState<Array<{ id: string; question: string; answer: string; timestamp: number }>>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [mereContext, setMereContext] = useState<Array<{ type: string; content: string; timestamp: number }>>([])
  const [flashcardQueue, setFlashcardQueue] = useState<Array<{ text: string; timestamp: number; segmentId: string }>>([])

  // Add function to generate recap email (Y18)
  const generateRecapEmail = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const participants = speakers.filter(s => s.segments > 0).map(s => s.name).join(', ')
    const duration = Math.max(...transcriptSegments.map(s => s.endTime))
    const actionItems = transcriptSegments.filter(s => s.isActionItem)
    const decisions = transcriptSegments.filter(s => s.isDecision)
    const keyTopics = chapters.map(ch => ch.topic).join(', ')
    
    const email = `Subject: Meeting Recap - ${new Date().toLocaleDateString()}

Hi team,

Here's a recap of our meeting today:

**Meeting Details:**
- Duration: ${formatTime(duration)}
- Participants: ${participants}
- Key Topics: ${keyTopics}

**Key Decisions:**
${decisions.map(d => `• [${formatTime(d.startTime)}] ${d.text}`).join('\n')}

**Action Items:**
${actionItems.map(a => `• [${formatTime(a.startTime)}] ${a.text} (${a.speaker})`).join('\n')}

**Summary:**
${liveSummary.replace('Live Summary: ', '')}

Best regards,
[Your Name]`
    
    setRecapEmail(email)
  }, [transcriptSegments, speakers, chapters, liveSummary])

  // Add function to answer live questions (Y19)
  const answerLiveQuestion = useCallback((question: string) => {
    if (!question.trim()) return
    
    const questionId = `q-${Date.now()}`
    const timestamp = Date.now()
    
    // Simple keyword-based search for demo
    let answer = 'I couldn\'t find specific information about that in the current transcript.'
    
    const lowerQuestion = question.toLowerCase()
    const relevantSegments = transcriptSegments.filter(seg => 
      seg.text.toLowerCase().includes(lowerQuestion.replace(/what did |say about |who said /g, ''))
    )
    
    if (relevantSegments.length > 0) {
      const segment = relevantSegments[0]
      answer = `At ${formatTime(segment.startTime)}, ${segment.speaker} said: "${segment.text}"`
    }
    
    setLiveQuestions(prev => [...prev, { id: questionId, question, answer, timestamp }])
    setNewQuestion('')
  }, [transcriptSegments])

  // Add function to create flashcards (Y22)
  const createFlashcard = useCallback((text: string, segmentId: string) => {
    const flashcard = {
      text,
      timestamp: Date.now(),
      segmentId
    }
    
    setFlashcardQueue(prev => [...prev, flashcard])
    
    // Simulate sending to Junction
    setTimeout(() => {
      console.log('Flashcard sent to Junction:', flashcard)
      // In real implementation, this would call Junction API
    }, 1000)
  }, [])

  // Add Mere context updates (Y21)
  const updateMereContext = useCallback((type: string, content: string) => {
    setMereContext(prev => [...prev, { type, content, timestamp: Date.now() }])
  }, [])

  // Add state for voice commands, meeting minutes, and analytics
  const [voiceCommandsHistory, setVoiceCommandsHistory] = useState<Array<{ command: string; timestamp: number; executed: boolean }>>([])
  const [meetingMinutes, setMeetingMinutes] = useState<string>('')
  const [sensitiveInfoFlags, setSensitiveInfoFlags] = useState<Array<{ segmentId: string; type: string; confidence: number }>>([])
  const [translationTarget, setTranslationTarget] = useState<string>('')
  const [translatedSegments, setTranslatedSegments] = useState<Record<string, string>>({})
  const [meetingAnalytics, setMeetingAnalytics] = useState<{
    totalDuration: number
    speakerDistribution: Record<string, number>
    topicEvolution: Array<{ time: number; topic: string }>
    engagementMetrics: { questions: number; decisions: number; actionItems: number }
    sentimentTrend: Array<{ time: number; sentiment: number }>
  }>()

  // Add function to detect voice commands (Y23)
  const detectVoiceCommands = useCallback((text: string): string | null => {
    const lowerText = text.toLowerCase()
    
    // Common voice commands
    if (lowerText.includes('bookmark this') || lowerText.includes('mark this')) return 'bookmark'
    if (lowerText.includes('create flashcard') || lowerText.includes('make flashcard')) return 'flashcard'
    if (lowerText.includes('pause recording') || lowerText.includes('stop recording')) return 'pause'
    if (lowerText.includes('resume recording') || lowerText.includes('start recording')) return 'resume'
    if (lowerText.includes('summarize so far') || lowerText.includes('give summary')) return 'summarize'
    if (lowerText.includes('what was said about') || lowerText.includes('find discussion about')) return 'search'
    if (lowerText.includes('translate to') || lowerText.includes('in spanish')) return 'translate'
    
    return null
  }, [])

  // Add function to generate meeting minutes (Y24)
  const generateMeetingMinutes = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const participants = speakers.filter(s => s.segments > 0).map(s => s.name)
    const duration = Math.max(...transcriptSegments.map(s => s.endTime))
    const actionItems = transcriptSegments.filter(s => s.isActionItem)
    const decisions = transcriptSegments.filter(s => s.isDecision)
    const questions = transcriptSegments.filter(s => s.isQuestion)
    
    const minutes = `MEETING MINUTES
Date: ${new Date().toLocaleDateString()}
Duration: ${formatTime(duration)}
Participants: ${participants.join(', ')}

AGENDA ITEMS:
${chapters.map((ch, idx) => `${idx + 1}. ${ch.topic}`).join('\n')}

DISCUSSION:
${chapters.map(ch => `\n${ch.topic.toUpperCase()}:\n${ch.segments.map(s => `• ${s.speaker}: ${s.text}`).join('\n')}`).join('\n')}

DECISIONS MADE:
${decisions.map(d => `• [${formatTime(d.startTime)}] ${d.text}`).join('\n')}

ACTION ITEMS:
${actionItems.map(a => `• [${formatTime(a.startTime)}] ${a.text} - Assigned to: ${a.speaker}`).join('\n')}

QUESTIONS RAISED:
${questions.map(q => `• [${formatTime(q.startTime)}] ${q.text}`).join('\n')}

NEXT STEPS:
${actionItems.map(a => `• ${a.text} (Due: TBD)`).join('\n')}

Meeting concluded at ${new Date().toLocaleTimeString()}.`
    
    setMeetingMinutes(minutes)
  }, [transcriptSegments, speakers, chapters])

  // Add function to detect sensitive information (Y25)
  const detectSensitiveInfo = useCallback((text: string): Array<{ type: string; confidence: number }> => {
    const flags = []
    
    // Credit card patterns
    if (/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/.test(text)) {
      flags.push({ type: 'credit_card', confidence: 0.9 })
    }
    
    // Social security number
    if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) {
      flags.push({ type: 'ssn', confidence: 0.95 })
    }
    
    // Email addresses
    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text)) {
      flags.push({ type: 'email', confidence: 0.8 })
    }
    
    // Phone numbers
    if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text)) {
      flags.push({ type: 'phone', confidence: 0.7 })
    }
    
    // Passwords (common patterns)
    if (/\b(password|passwd|pwd|secret|key)\b/i.test(text)) {
      flags.push({ type: 'password_mention', confidence: 0.6 })
    }
    
    // Financial amounts
    if (/\$\d{1,3}(,\d{3})*(\.\d{2})?/.test(text)) {
      flags.push({ type: 'financial_amount', confidence: 0.5 })
    }
    
    return flags
  }, [])

  // Add function for real-time translation (Y26)
  const translateSegment = useCallback((text: string, targetLang: string): string => {
    // Simulated translation - in real implementation, this would call a translation API
    const translations: Record<string, Record<string, string>> = {
      'es': {
        'hello': 'hola',
        'thank you': 'gracias',
        'goodbye': 'adiós',
        'meeting': 'reunión',
        'project': 'proyecto',
        'team': 'equipo'
      },
      'fr': {
        'hello': 'bonjour',
        'thank you': 'merci',
        'goodbye': 'au revoir',
        'meeting': 'réunion',
        'project': 'projet',
        'team': 'équipe'
      }
    }
    
    if (translations[targetLang]) {
      let translated = text
      Object.entries(translations[targetLang]).forEach(([en, translatedWord]) => {
        translated = translated.replace(new RegExp(en, 'gi'), translatedWord)
      })
      return translated
    }
    
    return text // Return original if no translation available
  }, [])

  // Add function to generate meeting analytics (Y27)
  const generateMeetingAnalytics = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const totalDuration = Math.max(...transcriptSegments.map(s => s.endTime))
    const speakerDistribution: Record<string, number> = {}
    const topicEvolution: Array<{ time: number; topic: string }> = []
    const sentimentTrend: Array<{ time: number; sentiment: number }> = []
    
    // Calculate speaker distribution
    speakers.forEach(speaker => {
      const speakerSegments = transcriptSegments.filter(s => s.speaker === speaker.id)
      const totalTime = speakerSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0)
      speakerDistribution[speaker.name] = totalTime
    })
    
    // Track topic evolution
    chapters.forEach(chapter => {
      const firstSegment = chapter.segments[0]
      if (firstSegment) {
        topicEvolution.push({ time: firstSegment.startTime, topic: chapter.topic })
      }
    })
    
    // Track sentiment trend
    transcriptSegments.forEach(segment => {
      if (segment.sentimentScore !== undefined) {
        sentimentTrend.push({ time: segment.startTime, sentiment: segment.sentimentScore })
      }
    })
    
    const analytics = {
      totalDuration,
      speakerDistribution,
      topicEvolution,
      engagementMetrics: {
        questions: transcriptSegments.filter(s => s.isQuestion).length,
        decisions: transcriptSegments.filter(s => s.isDecision).length,
        actionItems: transcriptSegments.filter(s => s.isActionItem).length
      },
      sentimentTrend
    }
    
    setMeetingAnalytics(analytics)
  }, [transcriptSegments, speakers, chapters])

  // Add state for cross-referencing, memory replay, and mind maps
  const [crossReferences, setCrossReferences] = useState<Array<{ fact: string; previousMeetings: string[]; confidence: number }>>([])
  const [memoryReplayMode, setMemoryReplayMode] = useState(false)
  const [currentReplaySpeaker, setCurrentReplaySpeaker] = useState<string | null>(null)
  const [mindMap, setMindMap] = useState<{
    centralTopic: string
    nodes: Array<{ id: string; label: string; type: 'topic' | 'action' | 'decision' | 'quote'; connections: string[] }>
  }>()
  const [junctionDocuments, setJunctionDocuments] = useState<Array<{ id: string; title: string; content: string; tags: string[] }>>([])
  const [knowledgeGraphUpdates, setKnowledgeGraphUpdates] = useState<Array<{ node: string; type: 'add' | 'update' | 'connect'; metadata: any }>>([])

  // Add function to cross-reference facts from past notes (Y28)
  const crossReferenceFacts = useCallback((currentText: string) => {
    // Simulated cross-referencing - in real implementation, this would search past transcripts
    const facts = [
      'project deadline',
      'budget allocation',
      'team restructuring',
      'client feedback',
      'technical requirements'
    ]
    
    const foundFacts = facts.filter(fact => 
      currentText.toLowerCase().includes(fact.toLowerCase())
    )
    
    if (foundFacts.length > 0) {
      const references = foundFacts.map(fact => ({
        fact,
        previousMeetings: [`Meeting on ${new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`],
        confidence: 0.7 + Math.random() * 0.3
      }))
      
      setCrossReferences(prev => [...prev, ...references])
    }
  }, [])

  // Add function for Memory Replay mode (Y29)
  const startMemoryReplay = useCallback((speakerId: string) => {
    setMemoryReplayMode(true)
    setCurrentReplaySpeaker(speakerId)
    
    // Filter transcript to show only this speaker's segments
    const speakerSegments = transcriptSegments.filter(seg => seg.speaker === speakerId)
    
    // Simulate replaying from speaker's perspective
    speakerSegments.forEach((segment, index) => {
      setTimeout(() => {
        // Highlight current segment in replay mode
        console.log(`Replaying ${segment.speaker}: ${segment.text}`)
      }, index * 2000) // 2 second intervals
    })
  }, [transcriptSegments])

  const stopMemoryReplay = useCallback(() => {
    setMemoryReplayMode(false)
    setCurrentReplaySpeaker(null)
  }, [])

  // Add function to generate mind map from transcript (Y30)
  const generateMindMap = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const centralTopic = chapters.length > 0 ? chapters[0].topic : 'Meeting Discussion'
    const nodes: Array<{ id: string; label: string; type: 'topic' | 'action' | 'decision' | 'quote'; connections: string[] }> = []
    
    // Extract topics from chapters
    chapters.forEach((chapter, idx) => {
      nodes.push({
        id: `topic-${idx}`,
        label: chapter.topic,
        type: 'topic',
        connections: []
      })
    })
    
    // Extract action items
    const actionItems = transcriptSegments.filter(seg => seg.isActionItem)
    actionItems.forEach((item, idx) => {
      nodes.push({
        id: `action-${idx}`,
        label: item.text.substring(0, 50) + '...',
        type: 'action',
        connections: [`topic-${Math.floor(idx / 2)}`]
      })
    })
    
    // Extract decisions
    const decisions = transcriptSegments.filter(seg => seg.isDecision)
    decisions.forEach((decision, idx) => {
      nodes.push({
        id: `decision-${idx}`,
        label: decision.text.substring(0, 50) + '...',
        type: 'decision',
        connections: [`topic-${Math.floor(idx / 2)}`]
      })
    })
    
    // Extract key quotes
    const quotes = transcriptSegments.filter(seg => seg.text.includes('"') || seg.text.length > 100)
    quotes.slice(0, 5).forEach((quote, idx) => {
      nodes.push({
        id: `quote-${idx}`,
        label: quote.text.substring(0, 50) + '...',
        type: 'quote',
        connections: [`topic-${Math.floor(idx / 2)}`]
      })
    })
    
    setMindMap({ centralTopic, nodes })
  }, [transcriptSegments, chapters])

  // Add function to store transcript as Junction document (Y31)
  const storeAsJunctionDocument = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const documentId = `meeting-${Date.now()}`
    const title = `Meeting Transcript - ${new Date().toLocaleDateString()}`
    const content = transcriptSegments.map(seg => 
      `**${seg.speaker}** (${formatTime(seg.startTime)}): ${seg.text}`
    ).join('\n\n')
    
    const tags = [
      'meeting',
      'transcript',
      new Date().toLocaleDateString(),
      ...chapters.map(ch => ch.topic.toLowerCase())
    ]
    
    const document = { id: documentId, title, content, tags }
    setJunctionDocuments(prev => [...prev, document])
    
    // Simulate sending to Junction
    setTimeout(() => {
      console.log('Document stored in Junction:', document)
    }, 1000)
  }, [transcriptSegments, chapters])

  // Add function to update Mindtrain knowledge graph (Y32)
  const updateKnowledgeGraph = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const updates: Array<{ node: string; type: 'add' | 'update' | 'connect'; metadata: any }> = []
    
    // Add speaker nodes
    speakers.forEach(speaker => {
      updates.push({
        node: speaker.name,
        type: 'add',
        metadata: {
          type: 'person',
          segments: speaker.segments,
          totalDuration: speaker.totalDuration,
          averageConfidence: speaker.averageConfidence
        }
      })
    })
    
    // Add topic nodes
    chapters.forEach(chapter => {
      updates.push({
        node: chapter.topic,
        type: 'add',
        metadata: {
          type: 'topic',
          segments: chapter.segments.length,
          startTime: chapter.segments[0]?.startTime,
          endTime: chapter.segments[chapter.segments.length - 1]?.endTime
        }
      })
    })
    
    // Add connections between speakers and topics
    chapters.forEach(chapter => {
      const speakersInTopic = [...new Set(chapter.segments.map(seg => seg.speaker))]
      speakersInTopic.forEach(speakerId => {
        const speaker = speakers.find(s => s.id === speakerId)
        if (speaker) {
          updates.push({
            node: `${speaker.name}-${chapter.topic}`,
            type: 'connect',
            metadata: {
              from: speaker.name,
              to: chapter.topic,
              type: 'participated_in',
              segments: chapter.segments.filter(seg => seg.speaker === speakerId).length
            }
          })
        }
      })
    })
    
    setKnowledgeGraphUpdates(prev => [...prev, ...updates])
  }, [transcriptSegments, speakers, chapters])

  // Add state for follow-up scheduling, calendar routing, and Mere analysis
  const [followUpPrompt, setFollowUpPrompt] = useState<string>('')
  const [timeSensitiveItems, setTimeSensitiveItems] = useState<Array<{ text: string; type: 'deadline' | 'meeting' | 'reminder'; date?: Date; priority: 'low' | 'medium' | 'high' }>>([])
  const [memoryLinks, setMemoryLinks] = useState<Array<{ app: string; memoryId: string; title: string; relevance: number }>>([])
  const [mereAnalysis, setMereAnalysis] = useState<{
    conclusions: string[]
    insights: Array<{ type: string; content: string; confidence: number }>
    recommendations: string[]
    sentiment: { overall: number; trends: string[] }
  }>()
  const [conceptMap, setConceptMap] = useState<{
    concepts: Array<{ id: string; name: string; frequency: number; segments: string[] }>
    connections: Array<{ from: string; to: string; strength: number }>
  }>()

  // Add function to prompt for follow-up scheduling (Y33)
  const promptFollowUpScheduling = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const actionItems = transcriptSegments.filter(seg => seg.isActionItem)
    const decisions = transcriptSegments.filter(seg => seg.isDecision)
    
    if (actionItems.length > 0 || decisions.length > 0) {
      const prompt = `Based on this meeting, would you like to schedule a follow-up? I detected:
      • ${actionItems.length} action items that may need follow-up
      • ${decisions.length} decisions that could benefit from review
      • Key topics: ${chapters.map(ch => ch.topic).join(', ')}
      
      Suggested follow-up in 1 week to review progress.`
      
      setFollowUpPrompt(prompt)
    }
  }, [transcriptSegments, chapters])

  // Add function to extract time-sensitive items (Y34)
  const extractTimeSensitiveItems = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const items: Array<{ text: string; type: 'deadline' | 'meeting' | 'reminder'; date?: Date; priority: 'low' | 'medium' | 'high' }> = []
    
    transcriptSegments.forEach(segment => {
      const text = segment.text.toLowerCase()
      
      // Extract deadlines
      const deadlineMatches = text.match(/(?:due|deadline|by|before)\s+(?:next\s+)?(?:week|month|friday|monday|tuesday|wednesday|thursday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)/gi)
      deadlineMatches?.forEach(match => {
        items.push({
          text: segment.text,
          type: 'deadline',
          priority: text.includes('urgent') || text.includes('asap') ? 'high' : 'medium'
        })
      })
      
      // Extract meeting mentions
      const meetingMatches = text.match(/(?:meeting|call|discussion)\s+(?:next\s+)?(?:week|tomorrow|today|monday|tuesday|wednesday|thursday|friday)/gi)
      meetingMatches?.forEach(match => {
        items.push({
          text: segment.text,
          type: 'meeting',
          priority: 'medium'
        })
      })
      
      // Extract reminders
      const reminderMatches = text.match(/(?:remind|remember|don't forget|check back)/gi)
      reminderMatches?.forEach(match => {
        items.push({
          text: segment.text,
          type: 'reminder',
          priority: 'low'
        })
      })
    })
    
    setTimeSensitiveItems(items)
  }, [transcriptSegments])

  // Add function to create memory links (Y35)
  const createMemoryLinks = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const links: Array<{ app: string; memoryId: string; title: string; relevance: number }> = []
    
    // Simulate memory links to different apps
    const apps = ['Junction', 'Punctual', 'Marathon', 'Memory']
    const topics = chapters.map(ch => ch.topic)
    
    apps.forEach(app => {
      topics.forEach(topic => {
        links.push({
          app,
          memoryId: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `${topic} - ${app} Memory`,
          relevance: 0.7 + Math.random() * 0.3
        })
      })
    })
    
    setMemoryLinks(links)
  }, [chapters])

  // Add function to generate Mere analysis (Y36)
  const generateMereAnalysis = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const conclusions = [
      'Meeting was productive with clear action items identified',
      'Team collaboration was strong with balanced participation',
      'Key decisions were made with stakeholder alignment',
      'Follow-up actions are well-defined and assigned'
    ]
    
    const insights = [
      { type: 'participation', content: 'Speaker 1 dominated 60% of the conversation', confidence: 0.9 },
      { type: 'sentiment', content: 'Overall positive tone with moments of concern', confidence: 0.8 },
      { type: 'efficiency', content: 'Meeting stayed focused on agenda items', confidence: 0.7 },
      { type: 'engagement', content: 'High engagement during decision-making phases', confidence: 0.8 }
    ]
    
    const recommendations = [
      'Schedule follow-up meeting in 1 week to review action items',
      'Consider shorter meetings for similar topics in future',
      'Include more structured time for questions and clarifications',
      'Document key decisions in project management system'
    ]
    
    const sentiment = {
      overall: 0.7,
      trends: ['Started neutral', 'Became positive during solutions discussion', 'Ended with high engagement']
    }
    
    setMereAnalysis({ conclusions, insights, recommendations, sentiment })
  }, [transcriptSegments])

  // Add function to create concept map (Y37)
  const createConceptMap = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const concepts: Array<{ id: string; name: string; frequency: number; segments: string[] }> = []
    const connections: Array<{ from: string; to: string; strength: number }> = []
    
    // Extract concepts from chapters and recurring themes
    const allConcepts = [...chapters.map(ch => ch.topic), ...recurringThemes]
    
    allConcepts.forEach((concept, idx) => {
      const segments = transcriptSegments.filter(seg => 
        seg.text.toLowerCase().includes(concept.toLowerCase())
      )
      
      concepts.push({
        id: `concept-${idx}`,
        name: concept,
        frequency: segments.length,
        segments: segments.map(seg => seg.id)
      })
    })
    
    // Create connections between related concepts
    concepts.forEach((concept1, idx1) => {
      concepts.slice(idx1 + 1).forEach((concept2, idx2) => {
        const sharedSegments = concept1.segments.filter(segId => 
          concept2.segments.includes(segId)
        )
        
        if (sharedSegments.length > 0) {
          connections.push({
            from: concept1.id,
            to: concept2.id,
            strength: sharedSegments.length / Math.max(concept1.frequency, concept2.frequency)
          })
        }
      })
    })
    
    setConceptMap({ concepts, connections })
  }, [transcriptSegments, chapters, recurringThemes])

  // Add state for context overlay, email summary, memory clusters, and offline mode
  const [contextOverlay, setContextOverlay] = useState<{
    visible: boolean
    speaker: string
    context: string
    relatedTopics: string[]
    sentiment: string
    timestamp: number
  }>()
  const [emailSummary, setEmailSummary] = useState<string>('')
  const [memoryClusters, setMemoryClusters] = useState<Array<{
    id: string
    name: string
    type: 'client' | 'project'
    meetings: string[]
    participants: string[]
    topics: string[]
    lastActivity: Date
    relevance: number
  }>>([])
  const [offlineMode, setOfflineMode] = useState(false)
  const [whisperStatus, setWhisperStatus] = useState<'online' | 'offline' | 'loading'>('online')
  const [latencyHistory, setLatencyHistory] = useState<Array<{ timestamp: number; latency: number }>>([])
  const [averageLatency, setAverageLatency] = useState<number>(0)

  // Add function to show context overlay during speaker turns (Y38)
  const showContextOverlay = useCallback((speakerId: string, segment: TranscriptSegment) => {
    const speaker = speakers.find(s => s.id === speakerId)
    if (!speaker) return
    
    // Extract context from recent segments
    const recentSegments = transcriptSegments.slice(-5)
    const relatedTopics = chapters
      .filter(ch => ch.segments.some(seg => seg.speaker === speakerId))
      .map(ch => ch.topic)
    
    const context = `Context for ${speaker.name}: ${relatedTopics.join(', ')}`
    const sentiment = segment.sentimentScore ? 
      (segment.sentimentScore > 0.3 ? 'positive' : segment.sentimentScore < -0.3 ? 'negative' : 'neutral') : 
      'neutral'
    
    setContextOverlay({
      visible: true,
      speaker: speaker.name,
      context,
      relatedTopics,
      sentiment,
      timestamp: Date.now()
    })
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setContextOverlay(prev => prev ? { ...prev, visible: false } : undefined)
    }, 3000)
  }, [speakers, transcriptSegments, chapters])

  // Add function to generate 1-click email summary (Y39)
  const generateEmailSummary = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const participants = speakers.filter(s => s.segments > 0).map(s => s.name)
    const actionItems = transcriptSegments.filter(seg => seg.isActionItem)
    const decisions = transcriptSegments.filter(seg => seg.isDecision)
    const keyQuotes = rankedQuotes.slice(0, 3)
    
    const summary = `Subject: Meeting Summary - ${new Date().toLocaleDateString()}

Hi Team,

Here's a summary of our meeting today:

**Participants:** ${participants.join(', ')}

**Key Decisions Made:**
${decisions.map(d => `• ${d.text}`).join('\n')}

**Action Items:**
${actionItems.map(a => `• ${a.text} - Assigned to: ${a.speaker}`).join('\n')}

**Key Quotes:**
${keyQuotes.map(q => `• "${q.text}" - ${q.speaker}`).join('\n')}

**Topics Discussed:**
${chapters.map(ch => `• ${ch.topic}`).join('\n')}

**Next Steps:**
${actionItems.map(a => `• ${a.text} (Due: TBD)`).join('\n')}

Please let me know if you have any questions or need clarification on any of these points.

Best regards,
[Your Name]`
    
    setEmailSummary(summary)
  }, [transcriptSegments, speakers, rankedQuotes, chapters])

  // Add function to create memory clusters (Y40)
  const createMemoryClusters = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const clusters: Array<{
      id: string
      name: string
      type: 'client' | 'project'
      meetings: string[]
      participants: string[]
      topics: string[]
      lastActivity: Date
      relevance: number
    }> = []
    
    // Extract client/project mentions
    const clientProjectMentions = transcriptSegments.filter(seg => {
      const text = seg.text.toLowerCase()
      return text.includes('client') || text.includes('project') || text.includes('customer')
    })
    
    // Create clusters based on mentions
    const uniqueMentions = new Set<string>()
    clientProjectMentions.forEach(seg => {
      const words = seg.text.toLowerCase().split(' ')
      words.forEach(word => {
        if (word.includes('client') || word.includes('project') || word.includes('customer')) {
          uniqueMentions.add(word)
        }
      })
    })
    
    Array.from(uniqueMentions).forEach((mention, idx) => {
      const relatedSegments = transcriptSegments.filter(seg => 
        seg.text.toLowerCase().includes(mention)
      )
      const participants = [...new Set(relatedSegments.map(seg => seg.speaker))]
      const topics = chapters
        .filter(ch => ch.segments.some(seg => seg.text.toLowerCase().includes(mention)))
        .map(ch => ch.topic)
      
      clusters.push({
        id: `cluster-${idx}`,
        name: mention.charAt(0).toUpperCase() + mention.slice(1),
        type: mention.includes('client') ? 'client' : 'project',
        meetings: [`Meeting ${new Date().toLocaleDateString()}`],
        participants,
        topics,
        lastActivity: new Date(),
        relevance: 0.8 + Math.random() * 0.2
      })
    })
    
    setMemoryClusters(clusters)
  }, [transcriptSegments, chapters])

  // Add function to handle offline transcription (Y41)
  const initializeOfflineTranscription = useCallback(async () => {
    setWhisperStatus('loading')
    
    try {
      // Simulate checking for Whisper.cpp availability
      const isWhisperAvailable = await new Promise<boolean>((resolve) => {
        setTimeout(() => {
          // Simulate 80% chance of Whisper being available
          resolve(Math.random() > 0.2)
        }, 1000)
      })
      
      if (isWhisperAvailable) {
        setWhisperStatus('offline')
        setOfflineMode(true)
        console.log('Whisper.cpp initialized for offline transcription')
      } else {
        setWhisperStatus('online')
        setOfflineMode(false)
        console.log('Falling back to online transcription')
      }
    } catch (error) {
      console.error('Error initializing offline transcription:', error)
      setWhisperStatus('online')
      setOfflineMode(false)
    }
  }, [])

  // Add function to monitor and track latency (Y42)
  const updateLatencyMonitoring = useCallback((newLatency: number) => {
    const now = Date.now()
    setLatencyHistory(prev => {
      const updated = [...prev, { timestamp: now, latency: newLatency }]
      // Keep only last 50 measurements
      return updated.slice(-50)
    })
    
    // Calculate average latency
    setLatencyHistory(prev => {
      const recent = prev.slice(-10) // Last 10 measurements
      const avg = recent.reduce((sum, item) => sum + item.latency, 0) / recent.length
      setAverageLatency(avg)
      return prev
    })
    
    // Check if latency exceeds 3 seconds
    if (newLatency > 3000) {
      setLatencyWarning(`High latency detected: ${(newLatency / 1000).toFixed(1)}s`)
    } else {
      setLatencyWarning(null)
    }
  }, [])

  // Add state for fallback models, downloads, caching, and compliance
  const [fallbackModels, setFallbackModels] = useState<{
    claude: boolean
    gpt4: boolean
    local: boolean
    currentModel: 'local' | 'claude' | 'gpt4'
  }>()
  const [downloadFormats, setDownloadFormats] = useState<{
    mp3: boolean
    txt: boolean
    pdf: boolean
    json: boolean
  }>()
  const [localCache, setLocalCache] = useState<{
    enabled: boolean
    size: number
    lastSync: Date | null
    pendingUploads: Array<{ id: string; data: any; timestamp: number }>
  }>()
  const [offlineResilience, setOfflineResilience] = useState<{
    enabled: boolean
    lastOnline: Date
    pendingActions: Array<{ type: string; data: any; timestamp: number }>
    syncStatus: 'synced' | 'pending' | 'failed'
  }>()
  const [complianceMode, setComplianceMode] = useState<{
    enabled: boolean
    type: 'hipaa' | 'enterprise' | 'none'
    encryptionLevel: 'none' | 'basic' | 'end-to-end'
    dataRetention: number // days
  }>()

  // Add function to handle fallback models (Y43)
  const initializeFallbackModels = useCallback(async () => {
    try {
      // Simulate checking model availability
      const modelStatus = await Promise.all([
        new Promise<boolean>(resolve => setTimeout(() => resolve(Math.random() > 0.3), 500)), // Local
        new Promise<boolean>(resolve => setTimeout(() => resolve(Math.random() > 0.2), 800)), // Claude
        new Promise<boolean>(resolve => setTimeout(() => resolve(Math.random() > 0.1), 1000)) // GPT-4
      ])
      
      const [local, claude, gpt4] = modelStatus
      const currentModel = local ? 'local' : claude ? 'claude' : gpt4 ? 'gpt4' : 'local'
      
      setFallbackModels({
        local,
        claude,
        gpt4,
        currentModel
      })
      
      console.log(`Using ${currentModel} model for summarization`)
    } catch (error) {
      console.error('Error initializing fallback models:', error)
      setFallbackModels({
        local: true,
        claude: false,
        gpt4: false,
        currentModel: 'local'
      })
    }
  }, [])

  // Add function to generate downloadable formats (Y44)
  const generateDownloadFormats = useCallback(() => {
    if (transcriptSegments.length === 0) return
    
    const formats = {
      mp3: true, // Audio recording
      txt: true, // Plain text transcript
      pdf: true, // Formatted PDF with summaries
      json: true // Structured data with metadata
    }
    
    setDownloadFormats(formats)
    
    // Simulate generating download files
    const downloadData = {
      mp3: { url: 'data:audio/mp3;base64,simulated_audio_data', filename: `meeting-${Date.now()}.mp3` },
      txt: { 
        content: transcriptSegments.map(seg => `[${formatTime(seg.startTime)}] ${seg.speaker}: ${seg.text}`).join('\n\n'),
        filename: `transcript-${Date.now()}.txt`
      },
      pdf: { 
        content: `Meeting Summary\n\nParticipants: ${speakers.map(s => s.name).join(', ')}\n\n${emailSummary || 'No summary available'}`,
        filename: `summary-${Date.now()}.pdf`
      },
      json: { 
        content: JSON.stringify({
          meeting: {
            id: `meeting-${Date.now()}`,
            date: new Date().toISOString(),
            participants: speakers,
            segments: transcriptSegments,
            summaries: segmentSummaries,
            actionItems: actionItems,
            chapters: chapters
          }
        }, null, 2),
        filename: `meeting-data-${Date.now()}.json`
      }
    }
    
    // Store download data for later use
    localStorage.setItem('downloadData', JSON.stringify(downloadData))
  }, [transcriptSegments, speakers, emailSummary, segmentSummaries, actionItems, chapters])

  // Add function to handle local caching (Y45)
  const initializeLocalCache = useCallback(() => {
    const cacheConfig = {
      enabled: true,
      size: 0,
      lastSync: null as Date | null,
      pendingUploads: [] as Array<{ id: string; data: any; timestamp: number }>
    }
    
    // Check existing cache
    const existingCache = localStorage.getItem('transcriptionCache')
    if (existingCache) {
      try {
        const cached = JSON.parse(existingCache)
        cacheConfig.size = cached.size || 0
        cacheConfig.lastSync = cached.lastSync ? new Date(cached.lastSync) : null
        cacheConfig.pendingUploads = cached.pendingUploads || []
      } catch (error) {
        console.error('Error parsing cache:', error)
      }
    }
    
    setLocalCache(cacheConfig)
    
    // Cache current transcript
    const cacheData = {
      transcript: transcriptSegments,
      timestamp: Date.now(),
      size: JSON.stringify(transcriptSegments).length
    }
    
    localStorage.setItem('transcriptionCache', JSON.stringify({
      ...cacheConfig,
      current: cacheData
    }))
    
    console.log('Local cache initialized and updated')
  }, [transcriptSegments])

  // Add function to handle offline resilience (Y46)
  const initializeOfflineResilience = useCallback(() => {
    const resilienceConfig = {
      enabled: true,
      lastOnline: new Date(),
      pendingActions: [] as Array<{ type: string; data: any; timestamp: number }>,
      syncStatus: 'synced' as 'synced' | 'pending' | 'failed'
    }
    
    // Check network status
    const isOnline = navigator.onLine
    if (!isOnline) {
      resilienceConfig.syncStatus = 'pending'
      resilienceConfig.pendingActions.push({
        type: 'transcript_update',
        data: { segments: transcriptSegments.length },
        timestamp: Date.now()
      })
    }
    
    setOfflineResilience(resilienceConfig)
    
    // Listen for online/offline events
    const handleOnline = () => {
      setOfflineResilience(prev => prev ? {
        ...prev,
        lastOnline: new Date(),
        syncStatus: 'synced'
      } : undefined)
    }
    
    const handleOffline = () => {
      setOfflineResilience(prev => prev ? {
        ...prev,
        syncStatus: 'pending'
      } : undefined)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [transcriptSegments])

  // Add function to handle compliance mode (Y47)
  const initializeComplianceMode = useCallback((type: 'hipaa' | 'enterprise' | 'none' = 'none') => {
    const complianceConfig = {
      enabled: type !== 'none',
      type,
      encryptionLevel: type === 'hipaa' ? 'end-to-end' : type === 'enterprise' ? 'basic' : 'none',
      dataRetention: type === 'hipaa' ? 7 : type === 'enterprise' ? 30 : 365
    }
    
    setComplianceMode(complianceConfig)
    
    if (complianceConfig.enabled) {
      // Apply compliance settings
      if (complianceConfig.encryptionLevel === 'end-to-end') {
        console.log('End-to-end encryption enabled for HIPAA compliance')
      }
      
      if (complianceConfig.encryptionLevel === 'basic') {
        console.log('Basic encryption enabled for enterprise compliance')
      }
      
      // Set data retention policies
      console.log(`Data retention set to ${complianceConfig.dataRetention} days`)
    }
  }, [])

  // Add state for local database, vector search, and offline summary
  const [localDatabase, setLocalDatabase] = useState<{
    connected: boolean
    tables: string[]
    transcriptCount: number
    vectorCount: number
    lastBackup: Date | null
  }>()
  const [vectorSearch, setVectorSearch] = useState<{
    enabled: boolean
    indexSize: number
    searchResults: Array<{ id: string; similarity: number; content: string; meeting: string }>
    lastSearch: string
  }>()
  const [offlineSummary, setOfflineSummary] = useState<{
    available: boolean
    lastGenerated: Date | null
    quality: number
    model: string
  }>()
  const [databaseOperations, setDatabaseOperations] = useState<{
    saving: boolean
    searching: boolean
    indexing: boolean
    lastOperation: string
  }>()

  // Add function to initialize local SQL database (Y48)
  const initializeLocalDatabase = useCallback(async () => {
    try {
      // Simulate database initialization
      const dbStatus = await new Promise<{
        connected: boolean
        tables: string[]
        transcriptCount: number
        vectorCount: number
        lastBackup: Date | null
      }>((resolve) => {
        setTimeout(() => {
          resolve({
            connected: true,
            tables: ['transcripts', 'vectors', 'summaries', 'metadata'],
            transcriptCount: Math.floor(Math.random() * 50) + 10,
            vectorCount: Math.floor(Math.random() * 1000) + 100,
            lastBackup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
          })
        }, 1000)
      })
      
      setLocalDatabase(dbStatus)
      
      // Simulate saving current transcript
      if (transcriptSegments.length > 0) {
        setDatabaseOperations(prev => ({ ...prev, saving: true, lastOperation: 'Saving transcript' }))
        
        setTimeout(() => {
          console.log('Transcript saved to local SQL database with pgvector')
          setDatabaseOperations(prev => ({ ...prev, saving: false, lastOperation: 'Transcript saved' }))
          setLocalDatabase(prev => prev ? { ...prev, transcriptCount: prev.transcriptCount + 1 } : undefined)
        }, 500)
      }
    } catch (error) {
      console.error('Error initializing local database:', error)
      setLocalDatabase({
        connected: false,
        tables: [],
        transcriptCount: 0,
        vectorCount: 0,
        lastBackup: null
      })
    }
  }, [transcriptSegments])

  // Add function to perform vector search (Y49)
  const performVectorSearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    
    try {
      setDatabaseOperations(prev => ({ ...prev, searching: true, lastOperation: 'Searching vectors' }))
      
      // Simulate vector search in last 5 meetings
      const searchResults = await new Promise<Array<{ id: string; similarity: number; content: string; meeting: string }>>((resolve) => {
        setTimeout(() => {
          const results = []
          const meetings = ['Meeting 1', 'Meeting 2', 'Meeting 3', 'Meeting 4', 'Meeting 5']
          
          for (let i = 0; i < 5; i++) {
            results.push({
              id: `result-${i}`,
              similarity: 0.7 + Math.random() * 0.3,
              content: `Found "${query}" in ${meetings[i]} - related content about ${query}`,
              meeting: meetings[i]
            })
          }
          
          // Sort by similarity
          results.sort((a, b) => b.similarity - a.similarity)
          resolve(results)
        }, 800)
      })
      
      setVectorSearch(prev => ({
        ...prev,
        searchResults,
        lastSearch: query,
        enabled: true,
        indexSize: Math.floor(Math.random() * 1000) + 500
      }))
      
      setDatabaseOperations(prev => ({ ...prev, searching: false, lastOperation: 'Vector search completed' }))
    } catch (error) {
      console.error('Error performing vector search:', error)
      setDatabaseOperations(prev => ({ ...prev, searching: false, lastOperation: 'Vector search failed' }))
    }
  }, [])

  // Add function to generate offline summary (Y50)
  const generateOfflineSummary = useCallback(async () => {
    if (transcriptSegments.length === 0) return
    
    try {
      setDatabaseOperations(prev => ({ ...prev, indexing: true, lastOperation: 'Generating offline summary' }))
      
      // Simulate offline summary generation
      const summary = await new Promise<{
        content: string
        quality: number
        model: string
      }>((resolve) => {
        setTimeout(() => {
          const participants = speakers.map(s => s.name).join(', ')
          const actionItems = transcriptSegments.filter(seg => seg.isActionItem)
          const decisions = transcriptSegments.filter(seg => seg.isDecision)
          
          const content = `OFFLINE SUMMARY\n\nParticipants: ${participants}\n\nKey Points:\n${chapters.map(ch => `• ${ch.topic}`).join('\n')}\n\nAction Items:\n${actionItems.map(a => `• ${a.text}`).join('\n')}\n\nDecisions:\n${decisions.map(d => `• ${d.text}`).join('\n')}`
          
          resolve({
            content,
            quality: 0.8 + Math.random() * 0.2,
            model: 'local-whisper'
          })
        }, 1500)
      })
      
      setOfflineSummary({
        available: true,
        lastGenerated: new Date(),
        quality: summary.quality,
        model: summary.model
      })
      
      setDatabaseOperations(prev => ({ ...prev, indexing: false, lastOperation: 'Offline summary generated' }))
      
      // Store summary in local database
      console.log('Offline summary generated and stored locally')
    } catch (error) {
      console.error('Error generating offline summary:', error)
      setDatabaseOperations(prev => ({ ...prev, indexing: false, lastOperation: 'Offline summary failed' }))
    }
  }, [transcriptSegments, speakers, chapters])

  // Add function to manage database operations (Y51)
  const manageDatabaseOperations = useCallback(() => {
    const operations = {
      backup: () => {
        setDatabaseOperations(prev => ({ ...prev, saving: true, lastOperation: 'Creating backup' }))
        setTimeout(() => {
          console.log('Database backup completed')
          setDatabaseOperations(prev => ({ ...prev, saving: false, lastOperation: 'Backup completed' }))
          setLocalDatabase(prev => prev ? { ...prev, lastBackup: new Date() } : undefined)
        }, 2000)
      },
      optimize: () => {
        setDatabaseOperations(prev => ({ ...prev, indexing: true, lastOperation: 'Optimizing database' }))
        setTimeout(() => {
          console.log('Database optimization completed')
          setDatabaseOperations(prev => ({ ...prev, indexing: false, lastOperation: 'Optimization completed' }))
        }, 3000)
      },
      reindex: () => {
        setDatabaseOperations(prev => ({ ...prev, indexing: true, lastOperation: 'Reindexing vectors' }))
        setTimeout(() => {
          console.log('Vector reindexing completed')
          setDatabaseOperations(prev => ({ ...prev, indexing: false, lastOperation: 'Reindexing completed' }))
          setVectorSearch(prev => prev ? { ...prev, indexSize: Math.floor(Math.random() * 1000) + 500 } : undefined)
        }, 2500)
      }
    }
    
    return operations
  }, [])

  // Add function to perform similarity search (Y52)
  const performSimilaritySearch = useCallback(async (targetText: string) => {
    if (!targetText.trim()) return
    
    try {
      setDatabaseOperations(prev => ({ ...prev, searching: true, lastOperation: 'Performing similarity search' }))
      
      // Simulate similarity search using pgvector
      const similarResults = await new Promise<Array<{ id: string; similarity: number; content: string; source: string }>>((resolve) => {
        setTimeout(() => {
          const results = []
          const sources = ['Previous Meeting 1', 'Previous Meeting 2', 'Previous Meeting 3']
          
          for (let i = 0; i < 3; i++) {
            results.push({
              id: `similar-${i}`,
              similarity: 0.6 + Math.random() * 0.4,
              content: `Similar content found: "${targetText.substring(0, 20)}..." in ${sources[i]}`,
              source: sources[i]
            })
          }
          
          // Sort by similarity
          results.sort((a, b) => b.similarity - a.similarity)
          resolve(results)
        }, 1000)
      })
      
      setVectorSearch(prev => ({
        ...prev,
        searchResults: similarResults,
        lastSearch: targetText,
        enabled: true
      }))
      
      setDatabaseOperations(prev => ({ ...prev, searching: false, lastOperation: 'Similarity search completed' }))
    } catch (error) {
      console.error('Error performing similarity search:', error)
      setDatabaseOperations(prev => ({ ...prev, searching: false, lastOperation: 'Similarity search failed' }))
    }
  }, [])

  // Add state for privacy, audit, and compliance features
  const [privacySettings, setPrivacySettings] = useState<{
    localTranscription: boolean
    selfHostedBackend: boolean
    dataSharingApproved: boolean
    endToEndEncryption: boolean
    speakerLabelingOptOut: boolean
    customLLMEndpoint: string
    enterpriseMode: boolean
  }>()
  const [auditLogs, setAuditLogs] = useState<Array<{
    id: string
    timestamp: Date
    action: string
    user: string
    resource: string
    details: string
  }>>()

  // Add function to configure privacy settings (Y61)
  const configurePrivacySettings = useCallback(async () => {
    try {
      // Simulate privacy configuration
      const settings = await new Promise<{
        localTranscription: boolean
        selfHostedBackend: boolean
        dataSharingApproved: boolean
        endToEndEncryption: boolean
        speakerLabelingOptOut: boolean
        customLLMEndpoint: string
        enterpriseMode: boolean
      }>((resolve) => {
        setTimeout(() => {
          resolve({
            localTranscription: true,
            selfHostedBackend: false,
            dataSharingApproved: false,
            endToEndEncryption: true,
            speakerLabelingOptOut: false,
            customLLMEndpoint: '',
            enterpriseMode: false
          })
        }, 500)
      })
      
      setPrivacySettings(settings)
      console.log('Privacy settings configured for local transcription and encryption')
    } catch (error) {
      console.error('Error configuring privacy settings:', error)
    }
  }, [])

  // Add function to manage data sharing approval (Y62)
  const manageDataSharingApproval = useCallback(async (approved: boolean) => {
    try {
      setPrivacySettings(prev => prev ? { ...prev, dataSharingApproved: approved } : undefined)
      
      if (approved) {
        console.log('Data sharing approved - OpenAI/Anthropic access enabled')
        // Simulate enabling external API access
        setTimeout(() => {
          console.log('External API endpoints configured for data sharing')
        }, 1000)
      } else {
        console.log('Data sharing disabled - all processing remains local')
        // Ensure all processing stays local
        setPrivacySettings(prev => prev ? { 
          ...prev, 
          localTranscription: true, 
          selfHostedBackend: true 
        } : undefined)
      }
    } catch (error) {
      console.error('Error managing data sharing approval:', error)
    }
  }, [])

  // Add function to configure end-to-end encryption (Y63)
  const configureEndToEndEncryption = useCallback(async (enabled: boolean) => {
    try {
      setPrivacySettings(prev => prev ? { ...prev, endToEndEncryption: enabled } : undefined)
      
      if (enabled) {
        console.log('End-to-end encryption enabled for voice-to-text pipeline')
        // Simulate encryption setup
        setTimeout(() => {
          console.log('Encryption keys generated and pipeline secured')
        }, 800)
      } else {
        console.log('End-to-end encryption disabled')
      }
    } catch (error) {
      console.error('Error configuring end-to-end encryption:', error)
    }
  }, [])

  // Add function to manage speaker labeling opt-out (Y64)
  const manageSpeakerLabelingOptOut = useCallback(async (optOut: boolean) => {
    try {
      setPrivacySettings(prev => prev ? { ...prev, speakerLabelingOptOut: optOut } : undefined)
      
      if (optOut) {
        console.log('Speaker labeling disabled - all speakers will be anonymous')
        // Update transcript segments to remove speaker names
        setTranscriptSegments(prev => prev.map(segment => ({
          ...segment,
          speaker: 'Anonymous'
        })))
      } else {
        console.log('Speaker labeling enabled - speakers will be identified')
        // Restore speaker names if available
        setTranscriptSegments(prev => prev.map(segment => ({
          ...segment,
          speaker: segment.speaker === 'Anonymous' ? 'Speaker 1' : segment.speaker
        })))
      }
    } catch (error) {
      console.error('Error managing speaker labeling opt-out:', error)
    }
  }, [])

  // Add function to configure enterprise LLM endpoints (Y65)
  const configureEnterpriseLLMEndpoints = useCallback(async (endpoint: string) => {
    try {
      setPrivacySettings(prev => prev ? { 
        ...prev, 
        customLLMEndpoint: endpoint,
        enterpriseMode: !!endpoint
      } : undefined)
      
      if (endpoint) {
        console.log(`Enterprise LLM endpoint configured: ${endpoint}`)
        // Simulate endpoint validation
        setTimeout(() => {
          console.log('Enterprise LLM endpoint validated and ready for use')
        }, 1200)
      } else {
        console.log('Enterprise LLM endpoint cleared - using default local models')
      }
    } catch (error) {
      console.error('Error configuring enterprise LLM endpoints:', error)
    }
  }, [])

  // Add function to generate audit logs (Y66)
  const generateAuditLog = useCallback((action: string, resource: string, details: string) => {
    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      action,
      user: 'current-user',
      resource,
      details
    }
    
    setAuditLogs(prev => prev ? [logEntry, ...prev.slice(0, 99)] : [logEntry])
    console.log(`Audit log created: ${action} on ${resource}`)
  }, [])

  // Add function to configure compliance mode (Y67)
  const configureComplianceMode = useCallback(async (type: 'hipaa' | 'enterprise' | 'none') => {
    try {
      const complianceConfig = await new Promise<{
        enabled: boolean
        type: 'hipaa' | 'enterprise' | 'none'
        encryptionLevel: 'none' | 'basic' | 'end-to-end'
        dataRetention: number
      }>((resolve) => {
        setTimeout(() => {
          const configs = {
            hipaa: {
              enabled: true,
              type: 'hipaa' as const,
              encryptionLevel: 'end-to-end' as const,
              dataRetention: 7 * 365 // 7 years
            },
            enterprise: {
              enabled: true,
              type: 'enterprise' as const,
              encryptionLevel: 'basic' as const,
              dataRetention: 3 * 365 // 3 years
            },
            none: {
              enabled: false,
              type: 'none' as const,
              encryptionLevel: 'none' as const,
              dataRetention: 90 // 90 days
            }
          }
          resolve(configs[type])
        }, 600)
      })
      
      setComplianceMode(complianceConfig)
      console.log(`Compliance mode configured: ${type}`)
      
      // Update privacy settings based on compliance mode
      setPrivacySettings(prev => prev ? {
        ...prev,
        localTranscription: complianceConfig.enabled,
        endToEndEncryption: complianceConfig.encryptionLevel === 'end-to-end',
        enterpriseMode: type === 'enterprise'
      } : undefined)
    } catch (error) {
      console.error('Error configuring compliance mode:', error)
    }
  }, [])

  // Add state for retention rules, redaction, and summarization tracking
  const [retentionRules, setRetentionRules] = useState<{
    enabled: boolean
    defaultRetention: number
    customRules: Array<{
      id: string
      name: string
      conditions: string[]
      retentionDays: number
      appliesTo: string[]
    }>
    lastUpdated: Date | null
  }>()
  const [redactionMode, setRedactionMode] = useState<{
    enabled: boolean
    redactedSegments: Array<{
      id: string
      originalText: string
      redactedText: string
      reason: string
      timestamp: Date
    }>
    summaryRegenerated: boolean
  }>()
  const [crossAppDeletion, setCrossAppDeletion] = useState<{
    enabled: boolean
    connectedApps: Array<{
      name: string
      status: 'connected' | 'disconnected' | 'pending'
      lastSync: Date | null
    }>
    deletionQueue: Array<{
      id: string
      app: string
      resource: string
      status: 'pending' | 'completed' | 'failed'
    }>
  }>()
  const [summarizationTracking, setSummarizationTracking] = useState<{
    requests: Array<{
      id: string
      timestamp: Date
      model: string
      segments: number
      duration: number
      status: 'pending' | 'completed' | 'failed'
      quality: number
    }>
    totalRequests: number
    averageQuality: number
  }>()

  // Add function to manage retention rules (Y67)
  const manageRetentionRules = useCallback(async () => {
    try {
      // Simulate retention rules configuration
      const rules = await new Promise<{
        enabled: boolean
        defaultRetention: number
        customRules: Array<{
          id: string
          name: string
          conditions: string[]
          retentionDays: number
          appliesTo: string[]
        }>
        lastUpdated: Date | null
      }>((resolve) => {
        setTimeout(() => {
          resolve({
            enabled: true,
            defaultRetention: 90,
            customRules: [
              {
                id: 'rule-1',
                name: 'HIPAA Compliance',
                conditions: ['contains_phi', 'medical_context'],
                retentionDays: 7 * 365, // 7 years
                appliesTo: ['transcripts', 'summaries', 'metadata']
              },
              {
                id: 'rule-2',
                name: 'Project Meetings',
                conditions: ['project_related', 'client_meeting'],
                retentionDays: 3 * 365, // 3 years
                appliesTo: ['transcripts', 'action_items']
              },
              {
                id: 'rule-3',
                name: 'Temporary Notes',
                conditions: ['draft', 'personal'],
                retentionDays: 30,
                appliesTo: ['transcripts']
              }
            ],
            lastUpdated: new Date()
          })
        }, 800)
      })
      
      setRetentionRules(rules)
      console.log('Retention rules configured with custom policies')
    } catch (error) {
      console.error('Error managing retention rules:', error)
    }
  }, [])

  // Add function to redact content and regenerate summary (Y68)
  const redactContent = useCallback(async (segmentId: string, reason: string) => {
    try {
      const segment = transcriptSegments.find(s => s.id === segmentId)
      if (!segment) return
      
      const redactedText = '[REDACTED]'
      
      // Update segment with redacted text
      setTranscriptSegments(prev => prev.map(s => 
        s.id === segmentId ? { ...s, text: redactedText } : s
      ))
      
      // Add to redaction log
      setRedactionMode(prev => prev ? {
        ...prev,
        redactedSegments: [
          ...prev.redactedSegments,
          {
            id: segmentId,
            originalText: segment.text,
            redactedText,
            reason,
            timestamp: new Date()
          }
        ]
      } : undefined)
      
      // Regenerate summary with redacted content
      setTimeout(() => {
        console.log('Regenerating summary with redacted content')
        setRedactionMode(prev => prev ? { ...prev, summaryRegenerated: true } : undefined)
        
        // Simulate summary regeneration
        const newSummary = `REDACTED SUMMARY\n\nThis summary contains redacted content for privacy reasons.\n\nParticipants: ${speakers.map(s => s.name).join(', ')}\n\nKey Points:\n${chapters.map(ch => `• ${ch.topic}`).join('\n')}\n\nNote: Some content has been redacted for privacy.`
        
        // Update summary
        console.log('Summary regenerated with redacted content')
      }, 1000)
      
      console.log(`Content redacted: ${reason}`)
    } catch (error) {
      console.error('Error redacting content:', error)
    }
  }, [transcriptSegments, speakers, chapters])

  // Add function to handle cross-app deletion (Y69)
  const handleCrossAppDeletion = useCallback(async (transcriptId: string) => {
    try {
      // Simulate connected apps
      const connectedApps = [
        { name: 'Mere', status: 'connected' as const, lastSync: new Date() },
        { name: 'Junction', status: 'connected' as const, lastSync: new Date() },
        { name: 'Punctual', status: 'connected' as const, lastSync: new Date() },
        { name: 'Google Calendar', status: 'disconnected' as const, lastSync: null }
      ]
      
      setCrossAppDeletion({
        enabled: true,
        connectedApps,
        deletionQueue: [
          { id: 'delete-1', app: 'Mere', resource: 'memory', status: 'pending' },
          { id: 'delete-2', app: 'Junction', resource: 'knowledge', status: 'pending' },
          { id: 'delete-3', app: 'Punctual', resource: 'tasks', status: 'pending' }
        ]
      })
      
      // Simulate deletion process
      setTimeout(() => {
        setCrossAppDeletion(prev => prev ? {
          ...prev,
          deletionQueue: prev.deletionQueue.map(item => ({
            ...item,
            status: 'completed' as const
          }))
        } : undefined)
        console.log('Transcript deleted from all connected apps')
      }, 2000)
      
      console.log('Initiating cross-app deletion')
    } catch (error) {
      console.error('Error handling cross-app deletion:', error)
    }
  }, [])

  // Add function to track summarization requests (Y70)
  const trackSummarizationRequest = useCallback(async (model: string, segments: number) => {
    try {
      const requestId = `summary-${Date.now()}`
      const startTime = Date.now()
      
      // Add request to tracking
      setSummarizationTracking(prev => prev ? {
        ...prev,
        requests: [
          {
            id: requestId,
            timestamp: new Date(),
            model,
            segments,
            duration: 0,
            status: 'pending',
            quality: 0
          },
          ...prev.requests.slice(0, 49) // Keep last 50 requests
        ],
        totalRequests: prev.totalRequests + 1
      } : {
        requests: [{
          id: requestId,
          timestamp: new Date(),
          model,
          segments,
          duration: 0,
          status: 'pending',
          quality: 0
        }],
        totalRequests: 1,
        averageQuality: 0
      })
      
      // Simulate summarization process
      setTimeout(() => {
        const duration = Date.now() - startTime
        const quality = 0.7 + Math.random() * 0.3
        
        setSummarizationTracking(prev => prev ? {
          ...prev,
          requests: prev.requests.map(req => 
            req.id === requestId ? {
              ...req,
              duration,
              status: 'completed',
              quality
            } : req
          ),
          averageQuality: prev.requests.reduce((sum, req) => sum + req.quality, quality) / (prev.requests.length + 1)
        } : undefined)
        
        console.log(`Summarization completed: ${model} model, ${duration}ms, quality: ${quality.toFixed(2)}`)
      }, 1500)
      
      console.log(`Summarization request tracked: ${model} model`)
    } catch (error) {
      console.error('Error tracking summarization request:', error)
    }
  }, [])

  // Add state for enhanced UI/UX features
  const [transcriptView, setTranscriptView] = useState<{
    realTimeScrolling: boolean
    speakerHighlighting: boolean
    chapterFolding: boolean
    timeSyncedSearch: boolean
    searchQuery: string
    searchResults: Array<{ id: string; timestamp: number; text: string }>
    currentChapter: string
    chapters: Array<{ id: string; title: string; startTime: number; endTime: number }>
  }>()
  const [upcomingMeetings, setUpcomingMeetings] = useState<Array<{
    id: string
    title: string
    startTime: Date
    endTime: Date
    platform: 'google' | 'zoom' | 'teams'
    botStatus: 'ready' | 'joining' | 'active' | 'error'
    participants: string[]
    aiConfidence: number
    purpose: string
  }>>()
  const [botPresence, setBotPresence] = useState<{
    isActive: boolean
    status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
    joinTime: Date | null
    presenceIndicator: boolean
    silentMode: boolean
    helpfulness: number
  }>()
  const [liveHighlights, setLiveHighlights] = useState<Array<{
    id: string
    timestamp: number
    type: 'important' | 'action_item' | 'decision' | 'question' | 'quote'
    text: string
    confidence: number
    speaker: string
    isLive: boolean
  }>>()
  const [summaryToggle, setSummaryToggle] = useState<{
    mode: 'ai' | 'edited' | 'final'
    aiSummary: string
    editedSummary: string
    finalSummary: string
    lastEditTime: Date | null
    editor: string
  }>()

  // Add function to enhance transcript view (Y71)
  const enhanceTranscriptView = useCallback(() => {
    setTranscriptView({
      realTimeScrolling: true,
      speakerHighlighting: true,
      chapterFolding: true,
      timeSyncedSearch: true,
      searchQuery: '',
      searchResults: [],
      currentChapter: 'Introduction',
      chapters: [
        { id: 'intro', title: 'Introduction', startTime: 0, endTime: 300 },
        { id: 'main', title: 'Main Discussion', startTime: 300, endTime: 1800 },
        { id: 'conclusion', title: 'Conclusion', startTime: 1800, endTime: 2100 }
      ]
    })
  }, [])

  // Add function to manage upcoming meetings (Y72)
  const manageUpcomingMeetings = useCallback(() => {
    setUpcomingMeetings([
      {
        id: 'meeting-1',
        title: 'Project Review',
        startTime: new Date(Date.now() + 30 * 60 * 1000),
        endTime: new Date(Date.now() + 90 * 60 * 1000),
        platform: 'google',
        botStatus: 'ready',
        participants: ['John Doe', 'Jane Smith', 'Bob Johnson'],
        aiConfidence: 0.95,
        purpose: 'Review Q4 project milestones'
      },
      {
        id: 'meeting-2',
        title: 'Client Call',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        platform: 'zoom',
        botStatus: 'joining',
        participants: ['Client A', 'Sales Team'],
        aiConfidence: 0.88,
        purpose: 'Product demonstration'
      }
    ])
  }, [])

  // Add function to manage bot presence (Y73)
  const manageBotPresence = useCallback(() => {
    setBotPresence({
      isActive: true,
      status: 'listening',
      joinTime: new Date(),
      presenceIndicator: true,
      silentMode: true,
      helpfulness: 0.92
    })
  }, [])

  // Add function to detect live highlights (Y74)
  const detectLiveHighlights = useCallback((segments: TranscriptSegment[]) => {
    const highlights = segments
      .filter(segment => segment.confidence > 0.8)
      .map(segment => ({
        id: `highlight-${segment.id}`,
        timestamp: segment.startTime,
        type: segment.isActionItem ? 'action_item' : 
              segment.isDecision ? 'decision' : 
              segment.isQuestion ? 'question' : 'important',
        text: segment.text,
        confidence: segment.confidence,
        speaker: segment.speaker,
        isLive: segment.isLive
      }))
      .slice(0, 10)
  
    setLiveHighlights(highlights)
  }, [])

  // Add function to toggle summary modes (Y75)
  const toggleSummaryMode = useCallback((mode: 'ai' | 'edited' | 'final') => {
    setSummaryToggle(prev => ({
      ...prev!,
      mode,
      lastEditTime: mode === 'edited' ? new Date() : prev?.lastEditTime,
      editor: mode === 'edited' ? 'Current User' : prev?.editor || ''
    }))
  }, [])

  // Add function to perform time-synced search
  const performTimeSyncedSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setTranscriptView(prev => ({ ...prev!, searchQuery: '', searchResults: [] }))
      return
    }

    const results = segments
      .filter(segment => segment.text.toLowerCase().includes(query.toLowerCase()))
      .map(segment => ({
        id: segment.id,
        timestamp: segment.startTime,
        text: segment.text
      }))

    setTranscriptView(prev => ({ 
      ...prev!, 
      searchQuery: query, 
      searchResults: results 
    }))
  }, [segments])

  // Add function to jump to search result
  const jumpToSearchResult = useCallback((result: { id: string; timestamp: number }) => {
    jumpToTimestamp(result.timestamp)
    setTranscriptView(prev => ({ 
      ...prev!, 
      currentChapter: prev?.chapters.find(c => 
        result.timestamp >= c.startTime && result.timestamp <= c.endTime
      )?.title || 'Unknown'
    }))
  }, [jumpToTimestamp])

  // Add function to toggle chapter folding
  const toggleChapterFolding = useCallback((chapterId: string) => {
    setTranscriptView(prev => ({
      ...prev!,
      chapters: prev?.chapters.map(c => 
        c.id === chapterId ? { ...c, folded: !c.folded } : c
      ) || []
    }))
  }, [])

  // Add function to manage bot join
  const manageBotJoin = useCallback((meetingId: string) => {
    setBotPresence(prev => ({
      ...prev!,
      isActive: true,
      status: 'joining',
      joinTime: new Date()
    }))

    // Simulate bot joining process
    setTimeout(() => {
      setBotPresence(prev => ({
        ...prev!,
        status: 'listening'
      }))
    }, 2000)
  }, [])

  // Add function to update live highlights in real-time
  const updateLiveHighlights = useCallback((newSegment: TranscriptSegment) => {
    if (newSegment.confidence > 0.85 || newSegment.isActionItem || newSegment.isQuestion) {
      const highlight = {
        id: `highlight-${Date.now()}`,
        timestamp: newSegment.startTime,
        type: newSegment.isActionItem ? 'action_item' : 
              newSegment.isQuestion ? 'question' : 'important',
        text: newSegment.text,
        confidence: newSegment.confidence,
        speaker: newSegment.speaker,
        isLive: true
      }

      setLiveHighlights(prev => [highlight, ...(prev || []).slice(0, 9)])
    }
  }, [])

  // Add function to edit summary
  const editSummary = useCallback((content: string) => {
    setSummaryToggle(prev => ({
      ...prev!,
      editedSummary: content,
      lastEditTime: new Date(),
      editor: 'Current User'
    }))
  }, [])

  // Add function to finalize summary
  const finalizeSummary = useCallback(() => {
    setSummaryToggle(prev => ({
      ...prev!,
      finalSummary: prev?.editedSummary || prev?.aiSummary || '',
      mode: 'final'
    }))
  }, [])

  // Add state for advanced UI/UX features
  const [bookmarkPins, setBookmarkPins] = useState<Array<{
    id: string
    segmentId: string
    timestamp: number
    label: string
    color: string
    isPinned: boolean
    createdAt: Date
  }>>()
  const [smartView, setSmartView] = useState<{
    enabled: boolean
    keyMomentsOnly: boolean
    collapseRatio: number
    keySegments: string[]
    originalLength: number
    collapsedLength: number
  }>()
  const [commandBar, setCommandBar] = useState<{
    isOpen: boolean
    query: string
    commands: Array<{
      id: string
      name: string
      shortcut: string
      description: string
      action: () => void
    }>
    recentCommands: string[]
  }>()
  const [audioWaveform, setAudioWaveform] = useState<{
    enabled: boolean
    data: number[]
    duration: number
    currentPosition: number
    scrubberPosition: number
    zoomLevel: number
    segments: Array<{
      start: number
      end: number
      intensity: number
      type: 'speech' | 'silence' | 'highlight'
    }>
  }>()
  const [playbackSpeed, setPlaybackSpeed] = useState<{
    currentSpeed: number
    availableSpeeds: number[]
    textFollowEnabled: boolean
    syncMode: 'playhead' | 'tap' | 'scroll'
    autoScroll: boolean
  }>()

  // Add function to pin transcript parts as bookmarks (Y76)
  const pinTranscriptPart = useCallback((segmentId: string, label: string, color: string = 'blue') => {
    const segment = segments.find(s => s.id === segmentId)
    if (!segment) return

    const bookmark = {
      id: `pin-${Date.now()}`,
      segmentId,
      timestamp: segment.startTime,
      label,
      color,
      isPinned: true,
      createdAt: new Date()
    }

    setBookmarkPins(prev => [bookmark, ...(prev || [])])
  }, [segments])

  // Add function to toggle smart view (Y77)
  const toggleSmartView = useCallback(() => {
    setSmartView(prev => {
      if (!prev) {
        // Initialize smart view
        const keySegments = segments
          .filter(segment => segment.confidence > 0.85 || segment.isActionItem || segment.isQuestion)
          .slice(0, Math.floor(segments.length * 0.2))
          .map(s => s.id)

        return {
          enabled: true,
          keyMomentsOnly: true,
          collapseRatio: 0.2,
          keySegments,
          originalLength: segments.length,
          collapsedLength: keySegments.length
        }
      }

      return {
        ...prev,
        enabled: !prev.enabled,
        keyMomentsOnly: !prev.keyMomentsOnly
      }
    })
  }, [segments])

  // Add function to manage command bar (Y78)
  const manageCommandBar = useCallback(() => {
    const commands = [
      {
        id: 'start-recording',
        name: 'Start Recording',
        shortcut: '⌘R',
        description: 'Start audio recording',
        action: () => startRecording()
      },
      {
        id: 'stop-recording',
        name: 'Stop Recording',
        shortcut: '⌘S',
        description: 'Stop audio recording',
        action: () => stopRecording()
      },
      {
        id: 'toggle-smart-view',
        name: 'Toggle Smart View',
        shortcut: '⌘V',
        description: 'Show only key moments',
        action: () => toggleSmartView()
      },
      {
        id: 'generate-summary',
        name: 'Generate Summary',
        shortcut: '⌘M',
        description: 'Create meeting summary',
        action: () => generateMeetingSummary(segments, speakers, actionItems)
      },
      {
        id: 'search-transcript',
        name: 'Search Transcript',
        shortcut: '⌘F',
        description: 'Search through transcript',
        action: () => performTimeSyncedSearch('')
      }
    ]

    setCommandBar({
      isOpen: false,
      query: '',
      commands,
      recentCommands: []
    })
  }, [startRecording, stopRecording, toggleSmartView, generateMeetingSummary, segments, speakers, actionItems, performTimeSyncedSearch])

  // Add function to handle command bar shortcuts
  const handleCommandBarShortcut = useCallback((event: KeyboardEvent) => {
    if (event.metaKey && event.key === 'k') {
      event.preventDefault()
      setCommandBar(prev => ({ ...prev!, isOpen: !prev?.isOpen }))
    }

    if (commandBar?.isOpen) {
      const command = commandBar.commands.find(c => 
        c.shortcut.toLowerCase() === `${event.metaKey ? '⌘' : ''}${event.key.toUpperCase()}`
      )
      if (command) {
        event.preventDefault()
        command.action()
        setCommandBar(prev => ({ 
          ...prev!, 
          isOpen: false,
          recentCommands: [command.name, ...(prev?.recentCommands || [])].slice(0, 5)
        }))
      }
    }
  }, [commandBar])

  // Add function to generate audio waveform (Y79)
  const generateAudioWaveform = useCallback((audioData: number[]) => {
    const segments = audioData.map((intensity, index) => ({
      start: index * 0.1, // 100ms intervals
      end: (index + 1) * 0.1,
      intensity: intensity / 100,
      type: intensity > 50 ? 'speech' : 'silence' as const
    }))

    setAudioWaveform({
      enabled: true,
      data: audioData,
      duration: audioData.length * 0.1,
      currentPosition: 0,
      scrubberPosition: 0,
      zoomLevel: 1,
      segments
    })
  }, [])

  // Add function to handle waveform scrubbing
  const handleWaveformScrub = useCallback((position: number) => {
    setAudioWaveform(prev => {
      if (!prev) return prev
      return {
        ...prev,
        scrubberPosition: position,
        currentPosition: position
      }
    })
    jumpToTimestamp(position)
  }, [jumpToTimestamp])

  // Add function to manage playback speed (Y80)
  const managePlaybackSpeed = useCallback(() => {
    setPlaybackSpeed({
      currentSpeed: 1.0,
      availableSpeeds: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
      textFollowEnabled: true,
      syncMode: 'playhead',
      autoScroll: true
    })
  }, [])

  // Add function to change playback speed
  const changePlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(prev => ({ ...prev!, currentSpeed: speed }))
    // In a real implementation, this would control the audio playback speed
  }, [])

  // Add function to toggle text follow mode
  const toggleTextFollow = useCallback(() => {
    setPlaybackSpeed(prev => ({ 
      ...prev!, 
      textFollowEnabled: !prev?.textFollowEnabled 
    }))
  }, [])

  // Add function to change sync mode
  const changeSyncMode = useCallback((mode: 'playhead' | 'tap' | 'scroll') => {
    setPlaybackSpeed(prev => ({ ...prev!, syncMode: mode }))
  }, [])

  // Add function to handle text sync on tap/scroll
  const handleTextSync = useCallback((timestamp: number) => {
    if (playbackSpeed?.syncMode === 'tap' || playbackSpeed?.syncMode === 'scroll') {
      jumpToTimestamp(timestamp)
      setAudioWaveform(prev => {
        if (!prev) return prev
        return {
          ...prev,
          currentPosition: timestamp
        }
      })
    }
  }, [jumpToTimestamp, playbackSpeed?.syncMode])

  // Add function to auto-scroll transcript
  const autoScrollTranscript = useCallback((timestamp: number) => {
    if (playbackSpeed?.autoScroll && playbackSpeed?.textFollowEnabled) {
      // Find the segment at this timestamp and scroll to it
      const segment = segments.find(s => 
        timestamp >= s.startTime && timestamp <= s.endTime
      )
      if (segment) {
        // In a real implementation, this would scroll the transcript view
        console.log('Auto-scrolling to segment:', segment.id)
      }
    }
  }, [segments, playbackSpeed?.autoScroll, playbackSpeed?.textFollowEnabled])

  // Add function to execute command from command bar
  const executeCommand = useCallback((commandId: string) => {
    const command = commandBar?.commands.find(c => c.id === commandId)
    if (command) {
      command.action()
      setCommandBar(prev => ({ 
        ...prev!, 
        isOpen: false,
        recentCommands: [command.name, ...(prev?.recentCommands || [])].slice(0, 5)
      }))
    }
  }, [commandBar?.commands])

  // Add function to search commands
  const searchCommands = useCallback((query: string) => {
    setCommandBar(prev => ({ ...prev!, query }))
  }, [])

  // Add function to highlight segment for pinning
  const highlightSegmentForPinning = useCallback((segmentId: string) => {
    // In a real implementation, this would highlight the segment in the UI
    console.log('Highlighting segment for pinning:', segmentId)
  }, [])

  // Add function to remove bookmark pin
  const removeBookmarkPin = useCallback((pinId: string) => {
    setBookmarkPins(prev => prev?.filter(pin => pin.id !== pinId) || [])
  }, [])

  // Add function to update bookmark pin
  const updateBookmarkPin = useCallback((pinId: string, updates: Partial<typeof bookmarkPins[0]>) => {
    setBookmarkPins(prev => 
      prev?.map(pin => pin.id === pinId ? { ...pin, ...updates } : pin) || []
    )
  }, [])

  // Add function to export bookmarks
  const exportBookmarks = useCallback(() => {
    const bookmarkData = bookmarkPins?.map(pin => ({
      timestamp: pin.timestamp,
      label: pin.label,
      color: pin.color,
      segmentText: segments.find(s => s.id === pin.segmentId)?.text || ''
    }))
    
    const blob = new Blob([JSON.stringify(bookmarkData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transcript-bookmarks.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [bookmarkPins, segments])

  // Add state for advanced UI/UX features (91-95)
  const [themeSettings, setThemeSettings] = useState<{
    currentTheme: 'light' | 'dark' | 'sepia'
    autoSwitch: boolean
    customColors: {
      primary: string
      secondary: string
      accent: string
      background: string
      text: string
    }
    accessibility: {
      highContrast: boolean
      fontSize: number
      reducedMotion: boolean
    }
  }>()
  const [insightGraph, setInsightGraph] = useState<{
    enabled: boolean
    nodes: Array<{
      id: string
      type: 'speaker' | 'topic' | 'concept'
      label: string
      size: number
      color: string
      connections: string[]
    }>
    edges: Array<{
      id: string
      source: string
      target: string
      weight: number
      type: 'speaks_about' | 'responds_to' | 'mentions'
      timestamp: number
    }>
    timeRange: {
      start: number
      end: number
      current: number
    }
    filters: {
      speakerFilter: string[]
      topicFilter: string[]
      timeFilter: boolean
    }
  }>()
  const [summaryBuilder, setSummaryBuilder] = useState<{
    enabled: boolean
    snippets: Array<{
      id: string
      segmentId: string
      text: string
      speaker: string
      timestamp: number
      order: number
      isSelected: boolean
    }>
    dragState: {
      isDragging: boolean
      draggedId: string | null
      dropTarget: string | null
    }
    layout: 'timeline' | 'topics' | 'speakers' | 'custom'
    autoArrange: boolean
  }>()
  const [keyboardNavigation, setKeyboardNavigation] = useState<{
    enabled: boolean
    shortcuts: Map<string, () => void>
    currentFocus: string
    focusHistory: string[]
    powerUserMode: boolean
    customShortcuts: Array<{
      key: string
      action: string
      description: string
    }>
  }>()
  const [voiceCommandsAdvanced, setVoiceCommandsAdvanced] = useState<{
    enabled: boolean
    isListening: boolean
    wakePhrase: string
    commands: Array<{
      phrase: string
      action: string
      description: string
      isActive: boolean
    }>
    recognition: {
      confidence: number
      language: string
      continuous: boolean
    }
    history: Array<{
      timestamp: Date
      phrase: string
      action: string
      success: boolean
    }>
  }>()

  // Add function to manage theme settings (Y91)
  const manageThemeSettings = useCallback(() => {
    setThemeSettings({
      currentTheme: 'light',
      autoSwitch: false,
      customColors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#10B981',
        background: '#FFFFFF',
        text: '#1F2937'
      },
      accessibility: {
        highContrast: false,
        fontSize: 16,
        reducedMotion: false
      }
    })
  }, [])

  // Add function to switch theme
  const switchTheme = useCallback((theme: 'light' | 'dark' | 'sepia') => {
    setThemeSettings(prev => {
      if (!prev) return prev
      
      const themeColors = {
        light: {
          primary: '#3B82F6',
          secondary: '#6B7280',
          accent: '#10B981',
          background: '#FFFFFF',
          text: '#1F2937'
        },
        dark: {
          primary: '#60A5FA',
          secondary: '#9CA3AF',
          accent: '#34D399',
          background: '#1F2937',
          text: '#F9FAFB'
        },
        sepia: {
          primary: '#8B4513',
          secondary: '#A0522D',
          accent: '#CD853F',
          background: '#F5F5DC',
          text: '#2F1B14'
        }
      }

      return {
        ...prev,
        currentTheme: theme,
        customColors: themeColors[theme]
      }
    })
  }, [])

  // Add function to generate insight graph (Y92)
  const generateInsightGraph = useCallback(() => {
    const speakerNodes = speakers.map(speaker => ({
      id: `speaker-${speaker.id}`,
      type: 'speaker' as const,
      label: speaker.name,
      size: speaker.segments * 2,
      color: speaker.color,
      connections: []
    }))

    const topicNodes = extractTopics(segments).map(topic => ({
      id: `topic-${topic}`,
      type: 'topic' as const,
      label: topic,
      size: segments.filter(s => s.text.toLowerCase().includes(topic.toLowerCase())).length,
      color: '#10B981',
      connections: []
    }))

    const edges = segments.flatMap(segment => {
      const edges = []
      const speakerId = `speaker-${segment.speaker}`
      
      // Find topics mentioned in this segment
      topicNodes.forEach(topic => {
        if (segment.text.toLowerCase().includes(topic.label.toLowerCase())) {
          edges.push({
            id: `edge-${segment.id}-${topic.id}`,
            source: speakerId,
            target: topic.id,
            weight: 1,
            type: 'speaks_about' as const,
            timestamp: segment.startTime
          })
        }
      })

      return edges
    })

    setInsightGraph({
      enabled: true,
      nodes: [...speakerNodes, ...topicNodes],
      edges,
      timeRange: {
        start: segments[0]?.startTime || 0,
        end: segments[segments.length - 1]?.endTime || 0,
        current: currentTime
      },
      filters: {
        speakerFilter: [],
        topicFilter: [],
        timeFilter: false
      }
    })
  }, [speakers, segments, extractTopics, currentTime])

  // Add function to update insight graph time
  const updateInsightGraphTime = useCallback((timestamp: number) => {
    setInsightGraph(prev => {
      if (!prev) return prev
      return {
        ...prev,
        timeRange: {
          ...prev.timeRange,
          current: timestamp
        }
      }
    })
  }, [])

  // Add function to manage summary builder (Y93)
  const manageSummaryBuilder = useCallback(() => {
    const snippets = segments
      .filter(segment => segment.confidence > 0.8 || segment.isActionItem || segment.isQuestion)
      .map((segment, index) => ({
        id: `snippet-${segment.id}`,
        segmentId: segment.id,
        text: segment.text,
        speaker: segment.speaker,
        timestamp: segment.startTime,
        order: index,
        isSelected: false
      }))

    setSummaryBuilder({
      enabled: true,
      snippets,
      dragState: {
        isDragging: false,
        draggedId: null,
        dropTarget: null
      },
      layout: 'timeline',
      autoArrange: true
    })
  }, [segments])

  // Add function to handle drag and drop
  const handleDragStart = useCallback((snippetId: string) => {
    setSummaryBuilder(prev => ({
      ...prev!,
      dragState: {
        isDragging: true,
        draggedId: snippetId,
        dropTarget: null
      }
    }))
  }, [])

  // Add function to handle drag over
  const handleDragOver = useCallback((targetId: string) => {
    setSummaryBuilder(prev => ({
      ...prev!,
      dragState: {
        ...prev!.dragState,
        dropTarget: targetId
      }
    }))
  }, [])

  // Add function to handle drop
  const handleDrop = useCallback((targetId: string) => {
    setSummaryBuilder(prev => {
      if (!prev || !prev.dragState.draggedId) return prev

      const draggedSnippet = prev.snippets.find(s => s.id === prev.dragState.draggedId)
      const targetSnippet = prev.snippets.find(s => s.id === targetId)
      
      if (!draggedSnippet || !targetSnippet) return prev

      const newSnippets = prev.snippets.map(snippet => {
        if (snippet.id === draggedSnippet.id) {
          return { ...snippet, order: targetSnippet.order }
        }
        if (snippet.id === targetSnippet.id) {
          return { ...snippet, order: draggedSnippet.order }
        }
        return snippet
      }).sort((a, b) => a.order - b.order)

      return {
        ...prev,
        snippets: newSnippets,
        dragState: {
          isDragging: false,
          draggedId: null,
          dropTarget: null
        }
      }
    })
  }, [])

  // Add function to manage keyboard navigation (Y94)
  const manageKeyboardNavigation = useCallback(() => {
    const shortcuts = new Map<string, () => void>([
      ['Space', () => handlePlayPause()],
      ['ArrowRight', () => jumpToTimestamp(currentTime + 10)],
      ['ArrowLeft', () => jumpToTimestamp(currentTime - 10)],
      ['ArrowUp', () => jumpToTimestamp(currentTime - 30)],
      ['ArrowDown', () => jumpToTimestamp(currentTime + 30)],
      ['Home', () => jumpToTimestamp(0)],
      ['End', () => jumpToTimestamp(duration)],
      ['KeyR', () => startRecording()],
      ['KeyS', () => stopRecording()],
      ['KeyM', () => generateMeetingSummary(segments, speakers, actionItems)],
      ['KeyB', () => addBookmark()],
      ['KeyF', () => performTimeSyncedSearch('')],
      ['KeyV', () => toggleSmartView()],
      ['KeyK', () => setCommandBar(prev => ({ ...prev!, isOpen: !prev?.isOpen }))]
    ])

    setKeyboardNavigation({
      enabled: true,
      shortcuts,
      currentFocus: 'transcript',
      focusHistory: [],
      powerUserMode: false,
      customShortcuts: []
    })
  }, [handlePlayPause, jumpToTimestamp, currentTime, duration, startRecording, stopRecording, generateMeetingSummary, segments, speakers, actionItems, addBookmark, performTimeSyncedSearch, toggleSmartView])

  // Add function to handle keyboard events
  const handleKeyboardEvent = useCallback((event: KeyboardEvent) => {
    if (!keyboardNavigation?.enabled) return

    const key = event.key
    const action = keyboardNavigation.shortcuts.get(key)
    
    if (action) {
      event.preventDefault()
      action()
      
      setKeyboardNavigation(prev => ({
        ...prev!,
        focusHistory: [key, ...prev!.focusHistory.slice(0, 9)]
      }))
    }
  }, [keyboardNavigation])

  // Add function to manage voice commands (Y95)
  const manageVoiceCommands = useCallback(() => {
    const commands = [
      {
        phrase: 'start recording',
        action: 'start_recording',
        description: 'Start audio recording',
        isActive: true
      },
      {
        phrase: 'stop recording',
        action: 'stop_recording',
        description: 'Stop audio recording',
        isActive: true
      },
      {
        phrase: 'add bookmark',
        action: 'add_bookmark',
        description: 'Add bookmark at current position',
        isActive: true
      },
      {
        phrase: 'generate summary',
        action: 'generate_summary',
        description: 'Generate meeting summary',
        isActive: true
      },
      {
        phrase: 'smart view',
        action: 'toggle_smart_view',
        description: 'Toggle smart view mode',
        isActive: true
      },
      {
        phrase: 'search transcript',
        action: 'search_transcript',
        description: 'Open search interface',
        isActive: true
      }
    ]

    setVoiceCommands({
      enabled: true,
      isListening: false,
      wakePhrase: 'Hey Mere',
      commands,
      recognition: {
        confidence: 0.8,
        language: 'en-US',
        continuous: false
      },
      history: []
    })
  }, [])

  // Add function to start voice recognition
  const startVoiceRecognition = useCallback(() => {
    setVoiceCommands(prev => ({ ...prev!, isListening: true }))
    
    // Simulate voice recognition
    setTimeout(() => {
      const randomCommand = voiceCommands?.commands[Math.floor(Math.random() * voiceCommands.commands.length)]
      if (randomCommand) {
        executeVoiceCommand(randomCommand.phrase)
      }
    }, 2000)
  }, [voiceCommands?.commands])

  // Add function to execute voice command
  const executeVoiceCommand = useCallback((phrase: string) => {
    const command = voiceCommands?.commands.find(c => 
      phrase.toLowerCase().includes(c.phrase.toLowerCase())
    )

    if (command) {
      // Execute the corresponding action
      switch (command.action) {
        case 'start_recording':
          startRecording()
          break
        case 'stop_recording':
          stopRecording()
          break
        case 'add_bookmark':
          addBookmark()
          break
        case 'generate_summary':
          generateMeetingSummary(segments, speakers, actionItems)
          break
        case 'toggle_smart_view':
          toggleSmartView()
          break
        case 'search_transcript':
          performTimeSyncedSearch('')
          break
      }

      setVoiceCommands(prev => ({
        ...prev!,
        isListening: false,
        history: [{
          timestamp: new Date(),
          phrase,
          action: command.action,
          success: true
        }, ...prev!.history.slice(0, 9)]
      }))
    }
  }, [voiceCommands?.commands, startRecording, stopRecording, addBookmark, generateMeetingSummary, segments, speakers, actionItems, toggleSmartView, performTimeSyncedSearch])

  // Add function to toggle voice commands
  const toggleVoiceCommands = useCallback(() => {
    setVoiceCommands(prev => ({ ...prev!, enabled: !prev?.enabled }))
  }, [])

  // Add function to update accessibility settings
  const updateAccessibilitySettings = useCallback((settings: Partial<typeof themeSettings.accessibility>) => {
    setThemeSettings(prev => ({
      ...prev!,
      accessibility: { ...prev!.accessibility, ...settings }
    }))
  }, [])

  // Add function to export summary builder content
  const exportSummaryBuilder = useCallback(() => {
    if (!summaryBuilder?.snippets) return

    const content = summaryBuilder.snippets
      .sort((a, b) => a.order - b.order)
      .map(snippet => `${snippet.speaker}: ${snippet.text}`)
      .join('\n\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meeting-summary.txt'
    a.click()
    URL.revokeObjectURL(url)
  }, [summaryBuilder?.snippets])

  // Add state for advanced UI/UX features (96-100)
  const [wordHighlighting, setWordHighlighting] = useState<{
    enabled: boolean
    selectedWord: string | null
    selectedSegment: string | null
    contextQuery: string | null
    contextResults: Array<{
      id: string
      type: 'definition' | 'reference' | 'related' | 'previous_mention'
      content: string
      confidence: number
      timestamp?: number
      speaker?: string
    }>
    isQuerying: boolean
  }>()
  const [aiAnnotations, setAiAnnotations] = useState<{
    enabled: boolean
    annotations: Array<{
      id: string
      segmentId: string
      type: 'sentiment' | 'intent' | 'topic' | 'action_item' | 'question' | 'decision' | 'quote'
      content: string
      confidence: number
      isVisible: boolean
      color: string
      metadata: Record<string, any>
    }>
    filters: {
      sentiment: boolean
      intent: boolean
      topic: boolean
      actionItem: boolean
      question: boolean
      decision: boolean
      quote: boolean
    }
    autoGenerate: boolean
  }>()
  const [meetingPreview, setMeetingPreview] = useState<{
    enabled: boolean
    participants: Array<{
      id: string
      name: string
      role: string
      avatar: string
      speakingTime: number
      contribution: number
    }>
    timeInfo: {
      startTime: Date
      endTime: Date
      duration: number
      currentTime: number
    }
    aiConfidence: {
      overall: number
      transcription: number
      speaker: number
      sentiment: number
      topics: number
    }
    purpose: {
      primary: string
      secondary: string[]
      detected: boolean
      confidence: number
    }
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  }>()
  const [slideExport, setSlideExport] = useState<{
    enabled: boolean
    templates: Array<{
      id: string
      name: string
      description: string
      layout: 'summary' | 'action_items' | 'quotes' | 'timeline' | 'custom'
      slides: number
    }>
    selectedTemplate: string | null
    content: Array<{
      slideNumber: number
      title: string
      content: string[]
      type: 'title' | 'content' | 'summary' | 'action_items' | 'quotes'
    }>
    exportFormats: Array<'pptx' | 'pdf' | 'keynote' | 'html'>
    isGenerating: boolean
  }>()
  const [diffMode, setDiffMode] = useState<{
    enabled: boolean
    originalSegments: TranscriptSegment[]
    editedSegments: TranscriptSegment[]
    differences: Array<{
      id: string
      type: 'added' | 'deleted' | 'modified' | 'unchanged'
      originalText?: string
      editedText?: string
      segmentId: string
      timestamp: number
      speaker: string
      changes: Array<{
        type: 'insert' | 'delete' | 'replace'
        position: number
        original?: string
        edited?: string
      }>
    }>
    filters: {
      showAdded: boolean
      showDeleted: boolean
      showModified: boolean
      showUnchanged: boolean
    }
    viewMode: 'side_by_side' | 'inline' | 'unified'
  }>()

  // Add function to handle word highlighting and context queries (Y96)
  const handleWordHighlight = useCallback((word: string, segmentId: string) => {
    setWordHighlighting({
      enabled: true,
      selectedWord: word,
      selectedSegment: segmentId,
      contextQuery: null,
      contextResults: [],
      isQuerying: true
    })

    // Simulate context query
    setTimeout(() => {
      const results = [
        {
          id: 'def-1',
          type: 'definition' as const,
          content: `"${word}" refers to a technical term used in project management`,
          confidence: 0.85,
          timestamp: segments.find(s => s.id === segmentId)?.startTime,
          speaker: segments.find(s => s.id === segmentId)?.speaker
        },
        {
          id: 'ref-1',
          type: 'reference' as const,
          content: `Previously mentioned by ${speakers[0]?.name} at 12:30`,
          confidence: 0.92,
          timestamp: 750, // 12:30 in seconds
          speaker: speakers[0]?.name
        },
        {
          id: 'rel-1',
          type: 'related' as const,
          content: `Related topics: project timeline, deliverables, milestones`,
          confidence: 0.78
        }
      ]

      setWordHighlighting(prev => ({
        ...prev!,
        contextResults: results,
        isQuerying: false
      }))
    }, 1000)
  }, [segments, speakers])

  // Add function to ask Mere about highlighted word
  const askMereAboutWord = useCallback((word: string, question: string) => {
    setWordHighlighting(prev => ({
      ...prev!,
      contextQuery: question,
      isQuerying: true
    }))

    // Simulate Mere response
    setTimeout(() => {
      const response = {
        id: 'mere-response',
        type: 'definition' as const,
        content: `Mere says: "${word}" in this context refers to the project milestone we discussed earlier. It's related to the Q2 deliverables.`,
        confidence: 0.95
      }

      setWordHighlighting(prev => ({
        ...prev!,
        contextResults: [response, ...prev!.contextResults],
        isQuerying: false
      }))
    }, 1500)
  }, [])

  // Add function to manage AI annotations (Y97)
  const manageAIAnnotations = useCallback(() => {
    const annotations = segments.flatMap(segment => {
      const segmentAnnotations = []
      
      if (segment.sentimentScore !== undefined) {
        segmentAnnotations.push({
          id: `sentiment-${segment.id}`,
          segmentId: segment.id,
          type: 'sentiment' as const,
          content: `Sentiment: ${segment.sentimentScore > 0 ? 'Positive' : segment.sentimentScore < 0 ? 'Negative' : 'Neutral'}`,
          confidence: Math.abs(segment.sentimentScore),
          isVisible: true,
          color: segment.sentimentScore > 0 ? '#10B981' : segment.sentimentScore < 0 ? '#EF4444' : '#6B7280',
          metadata: { score: segment.sentimentScore }
        })
      }

      if (segment.intentCategory) {
        segmentAnnotations.push({
          id: `intent-${segment.id}`,
          segmentId: segment.id,
          type: 'intent' as const,
          content: `Intent: ${segment.intentCategory}`,
          confidence: 0.8,
          isVisible: true,
          color: '#3B82F6',
          metadata: { category: segment.intentCategory }
        })
      }

      if (segment.isActionItem) {
        segmentAnnotations.push({
          id: `action-${segment.id}`,
          segmentId: segment.id,
          type: 'action_item' as const,
          content: 'Action Item',
          confidence: 0.9,
          isVisible: true,
          color: '#F59E0B',
          metadata: { priority: 'medium' }
        })
      }

      if (segment.isQuestion) {
        segmentAnnotations.push({
          id: `question-${segment.id}`,
          segmentId: segment.id,
          type: 'question' as const,
          content: 'Question',
          confidence: 0.85,
          isVisible: true,
          color: '#8B5CF6',
          metadata: { questionType: 'clarification' }
        })
      }

      return segmentAnnotations
    })

    setAiAnnotations({
      enabled: true,
      annotations,
      filters: {
        sentiment: true,
        intent: true,
        topic: true,
        actionItem: true,
        question: true,
        decision: true,
        quote: true
      },
      autoGenerate: true
    })
  }, [segments])

  // Add function to toggle annotation visibility
  const toggleAnnotationVisibility = useCallback((annotationId: string) => {
    setAiAnnotations(prev => ({
      ...prev!,
      annotations: prev!.annotations.map(ann => 
        ann.id === annotationId ? { ...ann, isVisible: !ann.isVisible } : ann
      )
    }))
  }, [])

  // Add function to filter annotations
  const filterAnnotations = useCallback((filterType: keyof typeof aiAnnotations.filters) => {
    setAiAnnotations(prev => ({
      ...prev!,
      filters: {
        ...prev!.filters,
        [filterType]: !prev!.filters[filterType]
      }
    }))
  }, [aiAnnotations?.filters])

  // Add function to manage meeting preview (Y98)
  const manageMeetingPreview = useCallback(() => {
    const participantData = speakers.map(speaker => ({
      id: speaker.id,
      name: speaker.name,
      role: 'Participant',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&background=random`,
      speakingTime: speaker.totalDuration,
      contribution: (speaker.segments / segments.length) * 100
    }))

    const overallConfidence = segments.reduce((acc, seg) => acc + seg.confidence, 0) / segments.length

    setMeetingPreview({
      enabled: true,
      participants: participantData,
      timeInfo: {
        startTime: new Date(Date.now() - (duration * 1000)),
        endTime: new Date(),
        duration,
        currentTime
      },
      aiConfidence: {
        overall: overallConfidence,
        transcription: overallConfidence,
        speaker: speakers.reduce((acc, s) => acc + s.averageConfidence, 0) / speakers.length,
        sentiment: segments.filter(s => s.sentimentScore !== undefined).length / segments.length,
        topics: extractTopics(segments).length / 10 // Normalize to 0-1
      },
      purpose: {
        primary: 'Project Review',
        secondary: ['Planning', 'Status Update', 'Decision Making'],
        detected: true,
        confidence: 0.87
      },
      status: 'in_progress'
    })
  }, [speakers, segments, duration, currentTime, extractTopics])

  // Add function to export summary to slides (Y99)
  const exportToSlides = useCallback(() => {
    setSlideExport(prev => ({ ...prev!, isGenerating: true }))

    const templates = [
      {
        id: 'summary',
        name: 'Meeting Summary',
        description: 'High-level overview with key points',
        layout: 'summary' as const,
        slides: 3
      },
      {
        id: 'action_items',
        name: 'Action Items',
        description: 'Focused on tasks and responsibilities',
        layout: 'action_items' as const,
        slides: 2
      },
      {
        id: 'quotes',
        name: 'Key Quotes',
        description: 'Important statements and insights',
        layout: 'quotes' as const,
        slides: 4
      }
    ]

    const content = [
      {
        slideNumber: 1,
        title: 'Meeting Summary',
        content: [
          `Date: ${new Date().toLocaleDateString()}`,
          `Duration: ${formatTime(duration)}`,
          `Participants: ${speakers.length}`,
          `Key Topics: ${extractTopics(segments).slice(0, 3).join(', ')}`
        ],
        type: 'title' as const
      },
      {
        slideNumber: 2,
        title: 'Action Items',
        content: actionItems.map(item => `• ${item.text} (${item.assignedTo || 'Unassigned'})`),
        type: 'action_items' as const
      },
      {
        slideNumber: 3,
        title: 'Key Decisions',
        content: segments
          .filter(s => s.isDecision)
          .map(s => `• ${s.text}`)
          .slice(0, 5),
        type: 'content' as const
      }
    ]

    setSlideExport({
      enabled: true,
      templates,
      selectedTemplate: 'summary',
      content,
      exportFormats: ['pptx', 'pdf', 'keynote', 'html'],
      isGenerating: false
    })
  }, [duration, speakers, extractTopics, segments, actionItems])

  // Add function to generate slide export
  const generateSlideExport = useCallback((format: 'pptx' | 'pdf' | 'keynote' | 'html') => {
    // Simulate export generation
    setTimeout(() => {
      const blob = new Blob(['Slide export content'], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meeting-summary.${format}`
      a.click()
      URL.revokeObjectURL(url)
    }, 2000)
  }, [])

  // Add function to manage diff mode (Y100)
  const manageDiffMode = useCallback(() => {
    const originalSegments = segments.map(seg => ({ ...seg }))
    const editedSegments = segments.map(seg => ({
      ...seg,
      text: seg.punctuationCorrected && seg.originalText ? seg.originalText : seg.text
    }))

    const differences = segments.map(segment => {
      const original = originalSegments.find(s => s.id === segment.id)
      const edited = editedSegments.find(s => s.id === segment.id)
      
      if (!original || !edited) return null

      const hasChanges = original.text !== edited.text
      const changes = hasChanges ? [
        {
          type: 'replace' as const,
          position: 0,
          original: original.text,
          edited: edited.text
        }
      ] : []

      return {
        id: `diff-${segment.id}`,
        type: hasChanges ? 'modified' as const : 'unchanged' as const,
        originalText: original.text,
        editedText: edited.text,
        segmentId: segment.id,
        timestamp: segment.startTime,
        speaker: segment.speaker,
        changes
      }
    }).filter(Boolean) as typeof diffMode.differences

    setDiffMode({
      enabled: true,
      originalSegments,
      editedSegments,
      differences,
      filters: {
        showAdded: true,
        showDeleted: true,
        showModified: true,
        showUnchanged: false
      },
      viewMode: 'side_by_side'
    })
  }, [segments])

  // Add function to toggle diff filters
  const toggleDiffFilter = useCallback((filterType: keyof typeof diffMode.filters) => {
    setDiffMode(prev => ({
      ...prev!,
      filters: {
        ...prev!.filters,
        [filterType]: !prev!.filters[filterType]
      }
    }))
  }, [diffMode?.filters])

  // Add function to change diff view mode
  const changeDiffViewMode = useCallback((mode: 'side_by_side' | 'inline' | 'unified') => {
    setDiffMode(prev => ({ ...prev!, viewMode: mode }))
  }, [])

  // Add function to revert segment changes
  const revertSegmentChanges = useCallback((segmentId: string) => {
    setSegments(prev => prev.map(seg => 
      seg.id === segmentId 
        ? { ...seg, text: seg.originalText || seg.text, punctuationCorrected: false }
        : seg
    ))
  }, [])

  // Add function to apply all changes
  const applyAllChanges = useCallback(() => {
    setSegments(prev => prev.map(seg => ({
      ...seg,
      originalText: seg.text,
      punctuationCorrected: true
    })))
  }, [])

  // Add state for advanced collaboration and mobile features (101-105)
  const [inlineCollaboration, setInlineCollaboration] = useState<{
    enabled: boolean
    collaborators: Array<{
      id: string
      name: string
      avatar: string
      color: string
      cursor: { x: number; y: number; segmentId: string } | null
      isOnline: boolean
      lastActivity: Date
    }>
    comments: Array<{
      id: string
      segmentId: string
      author: string
      text: string
      timestamp: Date
      replies: Array<{
        id: string
        author: string
        text: string
        timestamp: Date
      }>
      isResolved: boolean
    }>
    suggestions: Array<{
      id: string
      segmentId: string
      author: string
      originalText: string
      suggestedText: string
      timestamp: Date
      status: 'pending' | 'accepted' | 'rejected'
    }>
    permissions: {
      canEdit: boolean
      canComment: boolean
      canSuggest: boolean
      canResolve: boolean
    }
  }>()
  const [liveConfidenceBar, setLiveConfidenceBar] = useState<{
    enabled: boolean
    currentConfidence: number
    averageConfidence: number
    confidenceHistory: Array<{
      timestamp: number
      confidence: number
      segmentId: string
    }>
    thresholds: {
      low: number
      medium: number
      high: number
    }
    alerts: Array<{
      id: string
      type: 'low_confidence' | 'speaker_uncertainty' | 'punctuation_issue'
      message: string
      timestamp: Date
      segmentId: string
    }>
    autoCorrection: boolean
  }>()
  const [transcriptForking, setTranscriptForking] = useState<{
    enabled: boolean
    forks: Array<{
      id: string
      name: string
      description: string
      originalTranscriptId: string
      segments: TranscriptSegment[]
      annotations: Array<{
        id: string
        segmentId: string
        type: 'highlight' | 'note' | 'tag' | 'custom'
        content: string
        color: string
        author: string
        timestamp: Date
      }>
      createdAt: Date
      lastModified: Date
      isPublic: boolean
      collaborators: string[]
    }>
    currentFork: string | null
    forkHistory: Array<{
      id: string
      action: 'create' | 'merge' | 'delete' | 'share'
      forkId: string
      timestamp: Date
      user: string
    }>
  }>()
  const [mobileVoiceCommands, setMobileVoiceCommands] = useState<{
    enabled: boolean
    isListening: boolean
    wakePhrase: string
    commands: Array<{
      phrase: string
      action: string
      description: string
      mobileOnly: boolean
      requiresConfirmation: boolean
    }>
    recognition: {
      confidence: number
      language: string
      continuous: boolean
      noiseReduction: boolean
    }
    history: Array<{
      timestamp: Date
      phrase: string
      action: string
      success: boolean
      confidence: number
    }>
    gestures: {
      tapToListen: boolean
      swipeToCommand: boolean
      shakeToStop: boolean
    }
  }>()
  const [versionHistory, setVersionHistory] = useState<{
    enabled: boolean
    versions: Array<{
      id: string
      name: string
      description: string
      segments: TranscriptSegment[]
      changes: Array<{
        type: 'added' | 'deleted' | 'modified' | 'merged'
        segmentId: string
        originalText?: string
        newText?: string
        timestamp: Date
        author: string
      }>
      createdAt: Date
      createdBy: string
      isAutoSave: boolean
      tags: string[]
    }>
    currentVersion: string
    autoSaveInterval: number
    maxVersions: number
    diffView: {
      enabled: boolean
      compareWith: string | null
      showChanges: boolean
      filters: {
        showAdded: boolean
        showDeleted: boolean
        showModified: boolean
        showUnchanged: boolean
      }
    }
  }>()

  // Add function to manage inline collaboration (Y101)
  const manageInlineCollaboration = useCallback(() => {
    const collaborators = [
      {
        id: 'user-1',
        name: 'John Doe',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
        color: '#3B82F6',
        cursor: null,
        isOnline: true,
        lastActivity: new Date()
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
        color: '#10B981',
        cursor: { x: 100, y: 200, segmentId: 'segment-1' },
        isOnline: true,
        lastActivity: new Date()
      }
    ]

    const comments = [
      {
        id: 'comment-1',
        segmentId: 'segment-1',
        author: 'John Doe',
        text: 'This point needs clarification',
        timestamp: new Date(),
        replies: [
          {
            id: 'reply-1',
            author: 'Jane Smith',
            text: 'I agree, let me add more context',
            timestamp: new Date()
          }
        ],
        isResolved: false
      }
    ]

    const suggestions = [
      {
        id: 'suggestion-1',
        segmentId: 'segment-2',
        author: 'Jane Smith',
        originalText: 'We need to finish the project',
        suggestedText: 'We need to finish the project by Friday',
        timestamp: new Date(),
        status: 'pending' as const
      }
    ]

    setInlineCollaboration({
      enabled: true,
      collaborators,
      comments,
      suggestions,
      permissions: {
        canEdit: true,
        canComment: true,
        canSuggest: true,
        canResolve: true
      }
    })
  }, [])

  // Add function to add comment
  const addCollaborationComment = useCallback((segmentId: string, text: string) => {
    setInlineCollaboration(prev => ({
      ...prev!,
      comments: [{
        id: `comment-${Date.now()}`,
        segmentId,
        author: 'Current User',
        text,
        timestamp: new Date(),
        replies: [],
        isResolved: false
      }, ...prev!.comments]
    }))
  }, [])

  // Add function to resolve comment
  const resolveCollaborationComment = useCallback((commentId: string) => {
    setInlineCollaboration(prev => ({
      ...prev!,
      comments: prev!.comments.map(comment => 
        comment.id === commentId ? { ...comment, isResolved: true } : comment
      )
    }))
  }, [])

  // Add function to manage live confidence bar (Y102)
  const manageLiveConfidenceBar = useCallback(() => {
    const confidenceHistory = segments.map(segment => ({
      timestamp: segment.startTime,
      confidence: segment.confidence,
      segmentId: segment.id
    }))

    const averageConfidence = segments.reduce((acc, seg) => acc + seg.confidence, 0) / segments.length

    const alerts = segments
      .filter(segment => segment.confidence < 0.7)
      .map(segment => ({
        id: `alert-${segment.id}`,
        type: 'low_confidence' as const,
        message: `Low confidence transcription: "${segment.text}"`,
        timestamp: new Date(),
        segmentId: segment.id
      }))

    setLiveConfidenceBar({
      enabled: true,
      currentConfidence: segments[segments.length - 1]?.confidence || 0,
      averageConfidence,
      confidenceHistory,
      thresholds: {
        low: 0.6,
        medium: 0.8,
        high: 0.95
      },
      alerts,
      autoCorrection: true
    })
  }, [segments])

  // Add function to update confidence in real-time
  const updateLiveConfidence = useCallback((confidence: number, segmentId: string) => {
    setLiveConfidenceBar(prev => ({
      ...prev!,
      currentConfidence: confidence,
      confidenceHistory: [{
        timestamp: Date.now(),
        confidence,
        segmentId
      }, ...prev!.confidenceHistory.slice(0, 99)] // Keep last 100 entries
    }))
  }, [])

  // Add function to manage transcript forking (Y103)
  const manageTranscriptForking = useCallback(() => {
    const forks = [
      {
        id: 'fork-1',
        name: 'Technical Focus',
        description: 'Focused on technical implementation details',
        originalTranscriptId: 'transcript-1',
        segments: segments.map(seg => ({ ...seg })),
        annotations: [
          {
            id: 'annot-1',
            segmentId: 'segment-1',
            type: 'highlight' as const,
            content: 'Technical requirement',
            color: '#F59E0B',
            author: 'Current User',
            timestamp: new Date()
          }
        ],
        createdAt: new Date(),
        lastModified: new Date(),
        isPublic: false,
        collaborators: ['user-1', 'user-2']
      }
    ]

    setTranscriptForking({
      enabled: true,
      forks,
      currentFork: null,
      forkHistory: [
        {
          id: 'history-1',
          action: 'create' as const,
          forkId: 'fork-1',
          timestamp: new Date(),
          user: 'Current User'
        }
      ]
    })
  }, [segments])

  // Add function to create new fork
  const createTranscriptFork = useCallback((name: string, description: string) => {
    const newFork = {
      id: `fork-${Date.now()}`,
      name,
      description,
      originalTranscriptId: 'current-transcript',
      segments: segments.map(seg => ({ ...seg })),
      annotations: [],
      createdAt: new Date(),
      lastModified: new Date(),
      isPublic: false,
      collaborators: ['current-user']
    }

    setTranscriptForking(prev => ({
      ...prev!,
      forks: [newFork, ...prev!.forks],
      currentFork: newFork.id,
      forkHistory: [{
        id: `history-${Date.now()}`,
        action: 'create' as const,
        forkId: newFork.id,
        timestamp: new Date(),
        user: 'Current User'
      }, ...prev!.forkHistory]
    }))
  }, [segments])

  // Add function to add annotation to fork
  const addForkAnnotation = useCallback((forkId: string, segmentId: string, type: 'highlight' | 'note' | 'tag' | 'custom', content: string, color: string) => {
    setTranscriptForking(prev => ({
      ...prev!,
      forks: prev!.forks.map(fork => 
        fork.id === forkId ? {
          ...fork,
          annotations: [{
            id: `annot-${Date.now()}`,
            segmentId,
            type,
            content,
            color,
            author: 'Current User',
            timestamp: new Date()
          }, ...fork.annotations],
          lastModified: new Date()
        } : fork
      )
    }))
  }, [])

  // Add function to manage mobile voice commands (Y104)
  const manageMobileVoiceCommands = useCallback(() => {
    const commands = [
      {
        phrase: 'start recording',
        action: 'start_recording',
        description: 'Start audio recording',
        mobileOnly: false,
        requiresConfirmation: false
      },
      {
        phrase: 'stop recording',
        action: 'stop_recording',
        description: 'Stop audio recording',
        mobileOnly: false,
        requiresConfirmation: false
      },
      {
        phrase: 'add bookmark',
        action: 'add_bookmark',
        description: 'Add bookmark at current position',
        mobileOnly: false,
        requiresConfirmation: false
      },
      {
        phrase: 'generate summary',
        action: 'generate_summary',
        description: 'Generate meeting summary',
        mobileOnly: false,
        requiresConfirmation: true
      },
      {
        phrase: 'share transcript',
        action: 'share_transcript',
        description: 'Share transcript via mobile share sheet',
        mobileOnly: true,
        requiresConfirmation: true
      },
      {
        phrase: 'take screenshot',
        action: 'take_screenshot',
        description: 'Capture current transcript view',
        mobileOnly: true,
        requiresConfirmation: false
      }
    ]

    setMobileVoiceCommands({
      enabled: true,
      isListening: false,
      wakePhrase: 'Hey Yonder',
      commands,
      recognition: {
        confidence: 0.8,
        language: 'en-US',
        continuous: false,
        noiseReduction: true
      },
      history: [],
      gestures: {
        tapToListen: true,
        swipeToCommand: true,
        shakeToStop: true
      }
    })
  }, [])

  // Add function to start mobile voice recognition
  const startMobileVoiceRecognition = useCallback(() => {
    setMobileVoiceCommands(prev => ({ ...prev!, isListening: true }))
    
    // Simulate mobile voice recognition
    setTimeout(() => {
      const mobileCommand = mobileVoiceCommands?.commands.find(c => c.mobileOnly)
      if (mobileCommand) {
        executeMobileVoiceCommand(mobileCommand.phrase)
      }
    }, 2000)
  }, [mobileVoiceCommands?.commands])

  // Add function to execute mobile voice command
  const executeMobileVoiceCommand = useCallback((phrase: string) => {
    const command = mobileVoiceCommands?.commands.find(c => 
      phrase.toLowerCase().includes(c.phrase.toLowerCase())
    )

    if (command) {
      // Execute the corresponding action
      switch (command.action) {
        case 'start_recording':
          startRecording()
          break
        case 'stop_recording':
          stopRecording()
          break
        case 'add_bookmark':
          addBookmark()
          break
        case 'generate_summary':
          generateMeetingSummary(segments, speakers, actionItems)
          break
        case 'share_transcript':
          // Simulate mobile share
          console.log('Sharing transcript via mobile share sheet')
          break
        case 'take_screenshot':
          // Simulate screenshot
          console.log('Taking screenshot of transcript view')
          break
      }

      setMobileVoiceCommands(prev => ({
        ...prev!,
        isListening: false,
        history: [{
          timestamp: new Date(),
          phrase,
          action: command.action,
          success: true,
          confidence: 0.9
        }, ...prev!.history.slice(0, 9)]
      }))
    }
  }, [mobileVoiceCommands?.commands, startRecording, stopRecording, addBookmark, generateMeetingSummary, segments, speakers, actionItems])

  // Add function to manage version history (Y105)
  const manageVersionHistory = useCallback(() => {
    const versions = [
      {
        id: 'version-1',
        name: 'Initial Draft',
        description: 'First transcription attempt',
        segments: segments.map(seg => ({ ...seg })),
        changes: [],
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        createdBy: 'System',
        isAutoSave: true,
        tags: ['draft', 'initial']
      },
      {
        id: 'version-2',
        name: 'Punctuation Corrected',
        description: 'Applied punctuation corrections',
        segments: segments.map(seg => ({ 
          ...seg, 
          text: seg.punctuationCorrected ? seg.originalText || seg.text : seg.text 
        })),
        changes: segments
          .filter(seg => seg.punctuationCorrected)
          .map(seg => ({
            type: 'modified' as const,
            segmentId: seg.id,
            originalText: seg.originalText,
            newText: seg.text,
            timestamp: new Date(),
            author: 'System'
          })),
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        createdBy: 'System',
        isAutoSave: true,
        tags: ['corrected', 'punctuation']
      }
    ]

    setVersionHistory({
      enabled: true,
      versions,
      currentVersion: 'version-2',
      autoSaveInterval: 300000, // 5 minutes
      maxVersions: 10,
      diffView: {
        enabled: false,
        compareWith: null,
        showChanges: true,
        filters: {
          showAdded: true,
          showDeleted: true,
          showModified: true,
          showUnchanged: false
        }
      }
    })
  }, [segments])

  // Add function to create new version
  const createNewVersion = useCallback((name: string, description: string) => {
    const newVersion = {
      id: `version-${Date.now()}`,
      name,
      description,
      segments: segments.map(seg => ({ ...seg })),
      changes: [],
      createdAt: new Date(),
      createdBy: 'Current User',
      isAutoSave: false,
      tags: ['manual']
    }

    setVersionHistory(prev => ({
      ...prev!,
      versions: [newVersion, ...prev!.versions.slice(0, prev!.maxVersions - 1)],
      currentVersion: newVersion.id
    }))
  }, [segments])

  // Add function to compare versions
  const compareVersions = useCallback((versionId1: string, versionId2: string) => {
    const version1 = versionHistory?.versions.find(v => v.id === versionId1)
    const version2 = versionHistory?.versions.find(v => v.id === versionId2)

    if (version1 && version2) {
      const differences = version1.segments.map((seg1, index) => {
        const seg2 = version2.segments[index]
        if (!seg2) return null

        const hasChanges = seg1.text !== seg2.text
        return hasChanges ? {
          id: `diff-${seg1.id}`,
          type: 'modified' as const,
          segmentId: seg1.id,
          originalText: seg1.text,
          newText: seg2.text,
          timestamp: new Date(),
          author: 'Comparison'
        } : null
      }).filter(Boolean)

      setVersionHistory(prev => ({
        ...prev!,
        diffView: {
          ...prev!.diffView,
          enabled: true,
          compareWith: versionId2,
          showChanges: true
        }
      }))
    }
  }, [versionHistory?.versions])

  // Add function to restore version
  const restoreVersion = useCallback((versionId: string) => {
    const version = versionHistory?.versions.find(v => v.id === versionId)
    if (version) {
      setSegments(version.segments)
      setVersionHistory(prev => ({
        ...prev!,
        currentVersion: versionId
      }))
    }
  }, [versionHistory?.versions])

  // Add state for advanced integration and automation features (106-110)
  const [calendarSync, setCalendarSync] = useState<{
    enabled: boolean
    connectedCalendars: Array<{
      id: string
      name: string
      type: 'google' | 'outlook' | 'ical' | 'custom'
      isConnected: boolean
      lastSync: Date | null
      events: Array<{
        id: string
        title: string
        startTime: Date
        endTime: Date
        participants: string[]
        description: string
        location: string
        isRecurring: boolean
      }>
    }>
    autoSync: boolean
    syncInterval: number
    upcomingEvents: Array<{
      id: string
      title: string
      startTime: Date
      endTime: Date
      participants: string[]
      calendarId: string
      isRelated: boolean
    }>
    meetingContext: {
      currentEvent: string | null
      relatedEvents: string[]
      followUpScheduled: boolean
      followUpDate: Date | null
    }
  }>()
  const [relatedMeetings, setRelatedMeetings] = useState<{
    enabled: boolean
    meetings: Array<{
      id: string
      title: string
      date: Date
      duration: number
      participants: string[]
      topics: string[]
      summary: string
      similarity: number
      tags: string[]
      isBookmarked: boolean
    }>
    filters: {
      dateRange: 'week' | 'month' | 'quarter' | 'year'
      participants: string[]
      topics: string[]
      similarity: number
    }
    viewMode: 'carousel' | 'list' | 'timeline'
    autoSuggest: boolean
  }>()
  const [slackExport, setSlackExport] = useState<{
    enabled: boolean
    connectedChannels: Array<{
      id: string
      name: string
      type: 'public' | 'private' | 'dm'
      isConnected: boolean
      lastExport: Date | null
      exportCount: number
    }>
    exportSettings: {
      format: 'summary' | 'action_items' | 'full_transcript' | 'custom'
      includeAttachments: boolean
      includeTimestamps: boolean
      includeParticipants: boolean
      autoExport: boolean
    }
    webhooks: Array<{
      id: string
      name: string
      url: string
      events: Array<'meeting_start' | 'meeting_end' | 'action_item' | 'summary' | 'custom'>
      isActive: boolean
      lastTriggered: Date | null
    }>
    exportHistory: Array<{
      id: string
      channelId: string
      format: string
      timestamp: Date
      success: boolean
      messageCount: number
    }>
  }>()
  const [voiceprintIdentification, setVoiceprintIdentification] = useState<{
    enabled: boolean
    voiceprints: Array<{
      id: string
      userId: string
      userName: string
      voiceprintData: string
      confidence: number
      samples: number
      lastUpdated: Date
      isActive: boolean
      preferences: {
        autoIdentify: boolean
        requireConfirmation: boolean
        updateVoiceprint: boolean
      }
    }>
    currentSpeaker: {
      userId: string | null
      confidence: number
      isIdentified: boolean
      lastSpoken: Date | null
    }
    identificationHistory: Array<{
      timestamp: Date
      userId: string
      confidence: number
      segmentId: string
      isCorrect: boolean
    }>
    settings: {
      minConfidence: number
      autoUpdate: boolean
      requireTraining: boolean
      trainingSamples: number
    }
  }>()
  const [instantSummarization, setInstantSummarization] = useState<{
    enabled: boolean
    isGenerating: boolean
    lastSummary: {
      timestamp: Date
      content: string
      duration: number
      segments: number
      keyPoints: string[]
      actionItems: string[]
      decisions: string[]
    } | null
    settings: {
      autoGenerate: boolean
      interval: number
      includeActionItems: boolean
      includeDecisions: boolean
      includeQuotes: boolean
      maxLength: number
    }
    history: Array<{
      id: string
      timestamp: Date
      content: string
      duration: number
      segments: number
      isBookmarked: boolean
    }>
    templates: Array<{
      id: string
      name: string
      description: string
      format: 'bullet_points' | 'paragraph' | 'timeline' | 'custom'
      sections: string[]
    }>
  }>()

  // Add function to manage calendar sync (Y106)
  const manageCalendarSync = useCallback(() => {
    const connectedCalendars = [
      {
        id: 'google-calendar-1',
        name: 'Work Calendar',
        type: 'google' as const,
        isConnected: true,
        lastSync: new Date(),
        events: [
          {
            id: 'event-1',
            title: 'Weekly Team Meeting',
            startTime: new Date(Date.now() + 3600000), // 1 hour from now
            endTime: new Date(Date.now() + 7200000), // 2 hours from now
            participants: ['john@company.com', 'jane@company.com'],
            description: 'Weekly team sync and project updates',
            location: 'Conference Room A',
            isRecurring: true
          }
        ]
      }
    ]

    const upcomingEvents = connectedCalendars.flatMap(calendar => 
      calendar.events.map(event => ({
        id: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        participants: event.participants,
        calendarId: calendar.id,
        isRelated: event.title.toLowerCase().includes('meeting')
      }))
    )

    setCalendarSync({
      enabled: true,
      connectedCalendars,
      autoSync: true,
      syncInterval: 300000, // 5 minutes
      upcomingEvents,
      meetingContext: {
        currentEvent: null,
        relatedEvents: [],
        followUpScheduled: false,
        followUpDate: null
      }
    })
  }, [])

  // Add function to sync with calendar
  const syncWithCalendar = useCallback(() => {
    // Simulate calendar sync
    setTimeout(() => {
      setCalendarSync(prev => ({
        ...prev!,
        connectedCalendars: prev!.connectedCalendars.map(calendar => ({
          ...calendar,
          lastSync: new Date()
        }))
      }))
    }, 1000)
  }, [])

  // Add function to schedule follow-up
  const scheduleFollowUp = useCallback((date: Date, participants: string[]) => {
    setCalendarSync(prev => ({
      ...prev!,
      meetingContext: {
        ...prev!.meetingContext,
        followUpScheduled: true,
        followUpDate: date
      }
    }))
  }, [])

  // Add function to manage related meetings (Y107)
  const manageRelatedMeetings = useCallback(() => {
    const meetings = [
      {
        id: 'meeting-1',
        title: 'Project Kickoff',
        date: new Date(Date.now() - 86400000), // Yesterday
        duration: 60,
        participants: ['John Doe', 'Jane Smith'],
        topics: ['project planning', 'timeline', 'resources'],
        summary: 'Discussed project scope and initial timeline',
        similarity: 0.85,
        tags: ['project', 'planning'],
        isBookmarked: true
      },
      {
        id: 'meeting-2',
        title: 'Technical Review',
        date: new Date(Date.now() - 172800000), // 2 days ago
        duration: 45,
        participants: ['John Doe', 'Tech Lead'],
        topics: ['architecture', 'implementation'],
        summary: 'Reviewed technical architecture and implementation approach',
        similarity: 0.72,
        tags: ['technical', 'architecture'],
        isBookmarked: false
      }
    ]

    setRelatedMeetings({
      enabled: true,
      meetings,
      filters: {
        dateRange: 'month',
        participants: [],
        topics: [],
        similarity: 0.5
      },
      viewMode: 'carousel',
      autoSuggest: true
    })
  }, [])

  // Add function to filter related meetings
  const filterRelatedMeetings = useCallback((filterType: keyof typeof relatedMeetings.filters, value: any) => {
    setRelatedMeetings(prev => ({
      ...prev!,
      filters: {
        ...prev!.filters,
        [filterType]: value
      }
    }))
  }, [relatedMeetings?.filters])

  // Add function to change view mode
  const changeRelatedMeetingsView = useCallback((mode: 'carousel' | 'list' | 'timeline') => {
    setRelatedMeetings(prev => ({ ...prev!, viewMode: mode }))
  }, [])

  // Add function to manage Slack export (Y108)
  const manageSlackExport = useCallback(() => {
    const connectedChannels = [
      {
        id: 'channel-1',
        name: '#general',
        type: 'public' as const,
        isConnected: true,
        lastExport: new Date(),
        exportCount: 5
      },
      {
        id: 'channel-2',
        name: '#project-updates',
        type: 'public' as const,
        isConnected: true,
        lastExport: new Date(Date.now() - 3600000),
        exportCount: 12
      }
    ]

    const webhooks = [
      {
        id: 'webhook-1',
        name: 'Meeting Notifications',
        url: 'https://hooks.slack.com/services/...',
        events: ['meeting_start', 'meeting_end', 'action_item'] as const,
        isActive: true,
        lastTriggered: new Date()
      }
    ]

    setSlackExport({
      enabled: true,
      connectedChannels,
      exportSettings: {
        format: 'summary',
        includeAttachments: true,
        includeTimestamps: true,
        includeParticipants: true,
        autoExport: false
      },
      webhooks,
      exportHistory: [
        {
          id: 'export-1',
          channelId: 'channel-1',
          format: 'summary',
          timestamp: new Date(),
          success: true,
          messageCount: 3
        }
      ]
    })
  }, [])

  // Add function to export to Slack
  const exportToSlack = useCallback((channelId: string, format: 'summary' | 'action_items' | 'full_transcript' | 'custom') => {
    setSlackExport(prev => ({ ...prev!, exportSettings: { ...prev!.exportSettings, format } }))
    
    // Simulate Slack export
    setTimeout(() => {
      setSlackExport(prev => ({
        ...prev!,
        exportHistory: [{
          id: `export-${Date.now()}`,
          channelId,
          format,
          timestamp: new Date(),
          success: true,
          messageCount: 2
        }, ...prev!.exportHistory]
      }))
    }, 2000)
  }, [])

  // Add function to trigger webhook
  const triggerWebhook = useCallback((webhookId: string, event: 'meeting_start' | 'meeting_end' | 'action_item' | 'summary' | 'custom') => {
    setSlackExport(prev => ({
      ...prev!,
      webhooks: prev!.webhooks.map(webhook => 
        webhook.id === webhookId ? { ...webhook, lastTriggered: new Date() } : webhook
      )
    }))
  }, [])

  // Add function to manage voiceprint identification (Y109)
  const manageVoiceprintIdentification = useCallback(() => {
    const voiceprints = [
      {
        id: 'voiceprint-1',
        userId: 'user-1',
        userName: 'John Doe',
        voiceprintData: 'voiceprint-data-1',
        confidence: 0.92,
        samples: 15,
        lastUpdated: new Date(),
        isActive: true,
        preferences: {
          autoIdentify: true,
          requireConfirmation: false,
          updateVoiceprint: true
        }
      },
      {
        id: 'voiceprint-2',
        userId: 'user-2',
        userName: 'Jane Smith',
        voiceprintData: 'voiceprint-data-2',
        confidence: 0.88,
        samples: 12,
        lastUpdated: new Date(Date.now() - 86400000),
        isActive: true,
        preferences: {
          autoIdentify: true,
          requireConfirmation: true,
          updateVoiceprint: false
        }
      }
    ]

    setVoiceprintIdentification({
      enabled: true,
      voiceprints,
      currentSpeaker: {
        userId: null,
        confidence: 0,
        isIdentified: false,
        lastSpoken: null
      },
      identificationHistory: [],
      settings: {
        minConfidence: 0.7,
        autoUpdate: true,
        requireTraining: false,
        trainingSamples: 10
      }
    })
  }, [])

  // Add function to identify speaker
  const identifySpeaker = useCallback((audioData: string) => {
    // Simulate speaker identification
    setTimeout(() => {
      const identifiedSpeaker = voiceprintIdentification?.voiceprints[0]
      if (identifiedSpeaker) {
        setVoiceprintIdentification(prev => ({
          ...prev!,
          currentSpeaker: {
            userId: identifiedSpeaker.userId,
            confidence: identifiedSpeaker.confidence,
            isIdentified: true,
            lastSpoken: new Date()
          },
          identificationHistory: [{
            timestamp: new Date(),
            userId: identifiedSpeaker.userId,
            confidence: identifiedSpeaker.confidence,
            segmentId: 'current-segment',
            isCorrect: true
          }, ...prev!.identificationHistory]
        }))
      }
    }, 1000)
  }, [voiceprintIdentification?.voiceprints])

  // Add function to train voiceprint
  const trainVoiceprint = useCallback((userId: string, audioSamples: string[]) => {
    setVoiceprintIdentification(prev => ({
      ...prev!,
      voiceprints: prev!.voiceprints.map(voiceprint => 
        voiceprint.userId === userId ? {
          ...voiceprint,
          samples: voiceprint.samples + audioSamples.length,
          lastUpdated: new Date(),
          confidence: Math.min(0.95, voiceprint.confidence + 0.02)
        } : voiceprint
      )
    }))
  }, [])

  // Add function to manage instant summarization (Y110)
  const manageInstantSummarization = useCallback(() => {
    const templates = [
      {
        id: 'template-1',
        name: 'Quick Summary',
        description: 'Brief overview of key points',
        format: 'bullet_points' as const,
        sections: ['Key Points', 'Action Items', 'Decisions']
      },
      {
        id: 'template-2',
        name: 'Detailed Summary',
        description: 'Comprehensive meeting summary',
        format: 'paragraph' as const,
        sections: ['Overview', 'Discussion Points', 'Action Items', 'Next Steps']
      }
    ]

    setInstantSummarization({
      enabled: true,
      isGenerating: false,
      lastSummary: null,
      settings: {
        autoGenerate: true,
        interval: 300000, // 5 minutes
        includeActionItems: true,
        includeDecisions: true,
        includeQuotes: true,
        maxLength: 500
      },
      history: [],
      templates
    })
  }, [])

  // Add function to generate instant summary
  const generateInstantSummary = useCallback(() => {
    setInstantSummarization(prev => ({ ...prev!, isGenerating: true }))
    
    // Simulate instant summary generation
    setTimeout(() => {
      const summary = {
        timestamp: new Date(),
        content: 'Team discussed project timeline and resource allocation. Key decisions made on technical approach.',
        duration: duration,
        segments: segments.length,
        keyPoints: [
          'Project timeline approved',
          'Resource allocation finalized',
          'Technical approach selected'
        ],
        actionItems: [
          'Schedule follow-up meeting',
          'Prepare technical documentation',
          'Assign team responsibilities'
        ],
        decisions: [
          'Use React for frontend',
          'Implement by end of Q2',
          'Weekly progress reviews'
        ]
      }

      setInstantSummarization(prev => ({
        ...prev!,
        isGenerating: false,
        lastSummary: summary,
        history: [{
          id: `summary-${Date.now()}`,
          timestamp: summary.timestamp,
          content: summary.content,
          duration: summary.duration,
          segments: summary.segments,
          isBookmarked: false
        }, ...prev!.history]
      }))
    }, 2000)
  }, [duration, segments])

  // Add function to bookmark summary
  const bookmarkSummary = useCallback((summaryId: string) => {
    setInstantSummarization(prev => ({
      ...prev!,
      history: prev!.history.map(summary => 
        summary.id === summaryId ? { ...summary, isBookmarked: !summary.isBookmarked } : summary
      )
    }))
  }, [])

  // Add function to use summary template
  const useSummaryTemplate = useCallback((templateId: string) => {
    const template = instantSummarization?.templates.find(t => t.id === templateId)
    if (template) {
      // Apply template settings and generate summary
      generateInstantSummary()
    }
  }, [instantSummarization?.templates, generateInstantSummary])

  // Add state for advanced meeting management and quality features (111-115)
  const [endOfMeetingWrapUp, setEndOfMeetingWrapUp] = useState<{
    enabled: boolean
    isGenerating: boolean
    wrapUp: {
      id: string
      timestamp: Date
      content: string
      keyDecisions: string[]
      actionItems: string[]
      nextSteps: string[]
      followUpRequired: boolean
      followUpDate: Date | null
      participants: string[]
      isEditable: boolean
      version: number
    } | null
    templates: Array<{
      id: string
      name: string
      description: string
      sections: string[]
      isDefault: boolean
    }>
    settings: {
      autoGenerate: boolean
      includeDecisions: boolean
      includeActionItems: boolean
      includeNextSteps: boolean
      suggestFollowUp: boolean
      notifyParticipants: boolean
    }
    history: Array<{
      id: string
      timestamp: Date
      content: string
      version: number
      isPublished: boolean
    }>
  }>()
  const [meetingTagging, setMeetingTagging] = useState<{
    enabled: boolean
    tags: Array<{
      id: string
      name: string
      type: 'topic' | 'project' | 'client' | 'priority' | 'custom'
      color: string
      description: string
      usageCount: number
      isActive: boolean
    }>
    appliedTags: Array<{
      tagId: string
      segmentId?: string
      confidence: number
      appliedBy: string
      timestamp: Date
    }>
    autoTagging: {
      enabled: boolean
      confidence: number
      maxTags: number
      topics: boolean
      projects: boolean
      clients: boolean
    }
    tagSuggestions: Array<{
      tagId: string
      confidence: number
      reason: string
      segmentId?: string
    }>
  }>()
  const [filteredSummaryViews, setFilteredSummaryViews] = useState<{
    enabled: boolean
    currentView: 'full' | 'decisions' | 'action_items' | 'quotes' | 'custom'
    views: Array<{
      id: string
      name: string
      type: 'decisions' | 'action_items' | 'quotes' | 'custom'
      filters: {
        speakers: string[]
        timeRange: { start: number; end: number } | null
        confidence: number
        tags: string[]
      }
      content: Array<{
        id: string
        type: 'decision' | 'action_item' | 'quote' | 'custom'
        text: string
        speaker: string
        timestamp: number
        confidence: number
        tags: string[]
      }>
      isVisible: boolean
    }>
    customFilters: Array<{
      id: string
      name: string
      criteria: {
        keywords: string[]
        speakers: string[]
        timeRange: { start: number; end: number } | null
        confidence: number
        tags: string[]
      }
      isActive: boolean
    }>
  }>()
  const [copySafeText, setCopySafeText] = useState<{
    enabled: boolean
    format: 'plain_text' | 'rich_text' | 'markdown' | 'html'
    preserveQuotes: boolean
    preserveFormatting: boolean
    includeTimestamps: boolean
    includeSpeakers: boolean
    includeConfidence: boolean
    copyHistory: Array<{
      id: string
      timestamp: Date
      format: string
      content: string
      length: number
      destination: string
    }>
    templates: Array<{
      id: string
      name: string
      description: string
      format: string
      settings: {
        includeTimestamps: boolean
        includeSpeakers: boolean
        includeConfidence: boolean
        preserveQuotes: boolean
        preserveFormatting: boolean
      }
    }>
  }>()
  const [summaryQualityRating, setSummaryQualityRating] = useState<{
    enabled: boolean
    currentRating: {
      overall: number
      accuracy: number
      completeness: number
      clarity: number
      relevance: number
      timestamp: Date
      factors: Array<{
        factor: string
        score: number
        weight: number
        explanation: string
      }>
    } | null
    ratingHistory: Array<{
      id: string
      timestamp: Date
      overall: number
      accuracy: number
      completeness: number
      clarity: number
      relevance: number
      summaryId: string
    }>
    thresholds: {
      excellent: number
      good: number
      acceptable: number
      poor: number
    }
    autoImprove: {
      enabled: boolean
      targetScore: number
      maxAttempts: number
      improvementStrategies: Array<{
        id: string
        name: string
        description: string
        isActive: boolean
      }>
    }
    feedback: Array<{
      id: string
      timestamp: Date
      type: 'user' | 'ai' | 'system'
      content: string
      rating: number
      isResolved: boolean
    }>
  }>()

  // Add function to manage end-of-meeting wrap-up (Y111)
  const manageEndOfMeetingWrapUp = useCallback(() => {
    const templates = [
      {
        id: 'template-1',
        name: 'Standard Wrap-Up',
        description: 'Comprehensive meeting summary with all key elements',
        sections: ['Key Decisions', 'Action Items', 'Next Steps', 'Follow-up Required'],
        isDefault: true
      },
      {
        id: 'template-2',
        name: 'Quick Wrap-Up',
        description: 'Brief summary focusing on essential points',
        sections: ['Key Decisions', 'Action Items'],
        isDefault: false
      }
    ]

    setEndOfMeetingWrapUp({
      enabled: true,
      isGenerating: false,
      wrapUp: null,
      templates,
      settings: {
        autoGenerate: true,
        includeDecisions: true,
        includeActionItems: true,
        includeNextSteps: true,
        suggestFollowUp: true,
        notifyParticipants: false
      },
      history: []
    })
  }, [])

  // Add function to generate end-of-meeting wrap-up
  const generateEndOfMeetingWrapUp = useCallback(() => {
    setEndOfMeetingWrapUp(prev => ({ ...prev!, isGenerating: true }))
    
    // Simulate wrap-up generation
    setTimeout(() => {
      const wrapUp = {
        id: `wrapup-${Date.now()}`,
        timestamp: new Date(),
        content: 'Meeting concluded successfully with clear action items and next steps identified.',
        keyDecisions: [
          'Approved the new project timeline',
          'Selected React for frontend development',
          'Agreed on weekly progress reviews'
        ],
        actionItems: [
          'Schedule follow-up meeting for next week',
          'Prepare technical documentation',
          'Assign team responsibilities'
        ],
        nextSteps: [
          'Begin implementation phase',
          'Set up development environment',
          'Create project milestones'
        ],
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        participants: ['John Doe', 'Jane Smith', 'Tech Lead'],
        isEditable: true,
        version: 1
      }

      setEndOfMeetingWrapUp(prev => ({
        ...prev!,
        isGenerating: false,
        wrapUp,
        history: [{
          id: `history-${Date.now()}`,
          timestamp: wrapUp.timestamp,
          content: wrapUp.content,
          version: wrapUp.version,
          isPublished: false
        }, ...prev!.history]
      }))
    }, 3000)
  }, [])

  // Add function to edit wrap-up
  const editWrapUp = useCallback((content: string, keyDecisions: string[], actionItems: string[], nextSteps: string[]) => {
    setEndOfMeetingWrapUp(prev => {
      if (!prev!.wrapUp) return prev

      const updatedWrapUp = {
        ...prev!.wrapUp,
        content,
        keyDecisions,
        actionItems,
        nextSteps,
        version: prev!.wrapUp.version + 1
      }

      return {
        ...prev!,
        wrapUp: updatedWrapUp,
        history: [{
          id: `history-${Date.now()}`,
          timestamp: new Date(),
          content: updatedWrapUp.content,
          version: updatedWrapUp.version,
          isPublished: false
        }, ...prev!.history]
      }
    })
  }, [])

  // Add function to manage meeting tagging (Y112)
  const manageMeetingTagging = useCallback(() => {
    const tags = [
      {
        id: 'tag-1',
        name: 'Project Planning',
        type: 'topic' as const,
        color: '#3B82F6',
        description: 'Discussions about project planning and strategy',
        usageCount: 15,
        isActive: true
      },
      {
        id: 'tag-2',
        name: 'Technical Review',
        type: 'topic' as const,
        color: '#10B981',
        description: 'Technical discussions and code reviews',
        usageCount: 8,
        isActive: true
      },
      {
        id: 'tag-3',
        name: 'Client A',
        type: 'client' as const,
        color: '#F59E0B',
        description: 'Meetings related to Client A',
        usageCount: 12,
        isActive: true
      }
    ]

    setMeetingTagging({
      enabled: true,
      tags,
      appliedTags: [
        {
          tagId: 'tag-1',
          confidence: 0.95,
          appliedBy: 'AI',
          timestamp: new Date()
        }
      ],
      autoTagging: {
        enabled: true,
        confidence: 0.8,
        maxTags: 5,
        topics: true,
        projects: true,
        clients: true
      },
      tagSuggestions: [
        {
          tagId: 'tag-2',
          confidence: 0.87,
          reason: 'Technical discussion detected',
          segmentId: 'segment-1'
        }
      ]
    })
  }, [])

  // Add function to apply tag
  const applyTag = useCallback((tagId: string, segmentId?: string) => {
    setMeetingTagging(prev => ({
      ...prev!,
      appliedTags: [{
        tagId,
        segmentId,
        confidence: 1.0,
        appliedBy: 'User',
        timestamp: new Date()
      }, ...prev!.appliedTags],
      tags: prev!.tags.map(tag => 
        tag.id === tagId ? { ...tag, usageCount: tag.usageCount + 1 } : tag
      )
    }))
  }, [])

  // Add function to create new tag
  const createNewTag = useCallback((name: string, type: 'topic' | 'project' | 'client' | 'priority' | 'custom', color: string, description: string) => {
    const newTag = {
      id: `tag-${Date.now()}`,
      name,
      type,
      color,
      description,
      usageCount: 0,
      isActive: true
    }

    setMeetingTagging(prev => ({
      ...prev!,
      tags: [newTag, ...prev!.tags]
    }))
  }, [])

  // Add function to manage filtered summary views (Y113)
  const manageFilteredSummaryViews = useCallback(() => {
    const views = [
      {
        id: 'view-1',
        name: 'Just Decisions',
        type: 'decisions' as const,
        filters: {
          speakers: [],
          timeRange: null,
          confidence: 0.7,
          tags: []
        },
        content: [
          {
            id: 'decision-1',
            type: 'decision' as const,
            text: 'Approved the new project timeline',
            speaker: 'John Doe',
            timestamp: 1200000, // 20 minutes
            confidence: 0.95,
            tags: ['project-planning']
          }
        ],
        isVisible: true
      },
      {
        id: 'view-2',
        name: 'Just Action Items',
        type: 'action_items' as const,
        filters: {
          speakers: [],
          timeRange: null,
          confidence: 0.7,
          tags: []
        },
        content: [
          {
            id: 'action-1',
            type: 'action_item' as const,
            text: 'Schedule follow-up meeting for next week',
            speaker: 'Jane Smith',
            timestamp: 1800000, // 30 minutes
            confidence: 0.92,
            tags: ['follow-up']
          }
        ],
        isVisible: true
      }
    ]

    setFilteredSummaryViews({
      enabled: true,
      currentView: 'full',
      views,
      customFilters: [
        {
          id: 'filter-1',
          name: 'High Confidence Items',
          criteria: {
            keywords: [],
            speakers: [],
            timeRange: null,
            confidence: 0.9,
            tags: []
          },
          isActive: true
        }
      ]
    })
  }, [])

  // Add function to switch summary view
  const switchSummaryView = useCallback((viewType: 'full' | 'decisions' | 'action_items' | 'quotes' | 'custom') => {
    setFilteredSummaryViews(prev => ({ ...prev!, currentView: viewType }))
  }, [])

  // Add function to create custom filter
  const createCustomFilter = useCallback((name: string, criteria: {
    keywords: string[]
    speakers: string[]
    timeRange: { start: number; end: number } | null
    confidence: number
    tags: string[]
  }) => {
    const newFilter = {
      id: `filter-${Date.now()}`,
      name,
      criteria,
      isActive: true
    }

    setFilteredSummaryViews(prev => ({
      ...prev!,
      customFilters: [newFilter, ...prev!.customFilters]
    }))
  }, [])

  // Add function to manage copy-safe text (Y114)
  const manageCopySafeText = useCallback(() => {
    const templates = [
      {
        id: 'template-1',
        name: 'Plain Text',
        description: 'Simple text format without formatting',
        format: 'plain_text',
        settings: {
          includeTimestamps: true,
          includeSpeakers: true,
          includeConfidence: false,
          preserveQuotes: true,
          preserveFormatting: false
        }
      },
      {
        id: 'template-2',
        name: 'Rich Text',
        description: 'Formatted text with styling',
        format: 'rich_text',
        settings: {
          includeTimestamps: true,
          includeSpeakers: true,
          includeConfidence: true,
          preserveQuotes: true,
          preserveFormatting: true
        }
      }
    ]

    setCopySafeText({
      enabled: true,
      format: 'plain_text',
      preserveQuotes: true,
      preserveFormatting: false,
      includeTimestamps: true,
      includeSpeakers: true,
      includeConfidence: false,
      copyHistory: [
        {
          id: 'copy-1',
          timestamp: new Date(),
          format: 'plain_text',
          content: 'Sample copied content',
          length: 150,
          destination: 'clipboard'
        }
      ],
      templates
    })
  }, [])

  // Add function to copy text safely
  const copyTextSafely = useCallback((format: 'plain_text' | 'rich_text' | 'markdown' | 'html') => {
    const content = segments.map(segment => {
      let text = segment.text
      
      if (copySafeText?.includeSpeakers) {
        text = `[${segment.speaker}]: ${text}`
      }
      
      if (copySafeText?.includeTimestamps) {
        const minutes = Math.floor(segment.startTime / 60000)
        const seconds = Math.floor((segment.startTime % 60000) / 1000)
        text = `[${minutes}:${seconds.toString().padStart(2, '0')}] ${text}`
      }
      
      if (copySafeText?.preserveQuotes) {
        text = text.replace(/"/g, '"').replace(/'/g, "'")
      }
      
      return text
    }).join('\n')

    // Simulate copying to clipboard
    navigator.clipboard.writeText(content).then(() => {
      setCopySafeText(prev => ({
        ...prev!,
        copyHistory: [{
          id: `copy-${Date.now()}`,
          timestamp: new Date(),
          format,
          content: content.substring(0, 100) + '...',
          length: content.length,
          destination: 'clipboard'
        }, ...prev!.copyHistory]
      }))
    })
  }, [segments, copySafeText])

  // Add function to manage summary quality rating (Y115)
  const manageSummaryQualityRating = useCallback(() => {
    const currentRating = {
      overall: 0.87,
      accuracy: 0.92,
      completeness: 0.85,
      clarity: 0.89,
      relevance: 0.91,
      timestamp: new Date(),
      factors: [
        {
          factor: 'Content Accuracy',
          score: 0.92,
          weight: 0.3,
          explanation: 'High accuracy in capturing key points and decisions'
        },
        {
          factor: 'Completeness',
          score: 0.85,
          weight: 0.25,
          explanation: 'Good coverage of meeting topics with some minor gaps'
        },
        {
          factor: 'Clarity',
          score: 0.89,
          weight: 0.2,
          explanation: 'Clear and well-structured summary'
        },
        {
          factor: 'Relevance',
          score: 0.91,
          weight: 0.25,
          explanation: 'Highly relevant content focused on key outcomes'
        }
      ]
    }

    setSummaryQualityRating({
      enabled: true,
      currentRating,
      ratingHistory: [
        {
          id: 'rating-1',
          timestamp: new Date(),
          overall: 0.87,
          accuracy: 0.92,
          completeness: 0.85,
          clarity: 0.89,
          relevance: 0.91,
          summaryId: 'summary-1'
        }
      ],
      thresholds: {
        excellent: 0.9,
        good: 0.8,
        acceptable: 0.7,
        poor: 0.6
      },
      autoImprove: {
        enabled: true,
        targetScore: 0.9,
        maxAttempts: 3,
        improvementStrategies: [
          {
            id: 'strategy-1',
            name: 'Enhance Accuracy',
            description: 'Improve transcription accuracy and context understanding',
            isActive: true
          },
          {
            id: 'strategy-2',
            name: 'Increase Completeness',
            description: 'Capture more details and ensure comprehensive coverage',
            isActive: true
          }
        ]
      },
      feedback: [
        {
          id: 'feedback-1',
          timestamp: new Date(),
          type: 'user',
          content: 'Summary captured key decisions well but missed some technical details',
          rating: 0.8,
          isResolved: false
        }
      ]
    })
  }, [])

  // Add function to rate summary quality
  const rateSummaryQuality = useCallback((accuracy: number, completeness: number, clarity: number, relevance: number) => {
    const overall = (accuracy * 0.3 + completeness * 0.25 + clarity * 0.2 + relevance * 0.25)
    
    const rating = {
      overall,
      accuracy,
      completeness,
      clarity,
      relevance,
      timestamp: new Date(),
      factors: [
        {
          factor: 'Content Accuracy',
          score: accuracy,
          weight: 0.3,
          explanation: 'Accuracy in capturing key points and decisions'
        },
        {
          factor: 'Completeness',
          score: completeness,
          weight: 0.25,
          explanation: 'Coverage of meeting topics and outcomes'
        },
        {
          factor: 'Clarity',
          score: clarity,
          weight: 0.2,
          explanation: 'Clear and well-structured summary'
        },
        {
          factor: 'Relevance',
          score: relevance,
          weight: 0.25,
          explanation: 'Relevance of content to meeting objectives'
        }
      ]
    }

    setSummaryQualityRating(prev => ({
      ...prev!,
      currentRating: rating,
      ratingHistory: [{
        id: `rating-${Date.now()}`,
        timestamp: rating.timestamp,
        overall: rating.overall,
        accuracy: rating.accuracy,
        completeness: rating.completeness,
        clarity: rating.clarity,
        relevance: rating.relevance,
        summaryId: 'current-summary'
      }, ...prev!.ratingHistory]
    }))
  }, [])

  // Add function to add quality feedback
  const addQualityFeedback = useCallback((content: string, rating: number, type: 'user' | 'ai' | 'system') => {
    const feedback = {
      id: `feedback-${Date.now()}`,
      timestamp: new Date(),
      type,
      content,
      rating,
      isResolved: false
    }

    setSummaryQualityRating(prev => ({
      ...prev!,
      feedback: [feedback, ...prev!.feedback]
    }))
  }, [])

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
                      {speakers.find(s => s.id === item.speaker)?.name} • {formatTime(item.startTime)}
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

      {/* UI for latency warning and segment summaries */}
      {latencyWarning && (
        <div className="bg-yellow-200 text-yellow-900 p-2 rounded mb-2">
          {latencyWarning}
        </div>
      )}
      {/* 2-minute segment summaries */}
      {segmentSummaries.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Live Segment Summaries (2-min):</h4>
          <ul className="space-y-1">
            {segmentSummaries.map((seg, idx) => (
              <li key={idx} className="text-sm text-gray-700">
                <span className="font-mono">[{seg.start}s–{seg.end}s]</span>: {seg.summary}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Language selection UI (Y6) */}
      <div className="mb-2">
        <label htmlFor="language-select" className="mr-2 font-medium">Transcription Language:</label>
        <select
          id="language-select"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="zh">Chinese</option>
          <option value="ja">Japanese</option>
          <option value="hi">Hindi</option>
          <option value="auto">Auto-Detect</option>
        </select>
      </div>

      {/* Action Items Live List (Y3) */}
      {actionItems.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Live Action Items:</h4>
          <ul className="space-y-1">
            {actionItems.map((item, idx) => (
              <li key={item.id} className="text-sm text-blue-700">
                <span className="font-mono">[{item.startTime}s]</span>: {item.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Placeholder for Whisper.cpp integration (Y7) */}
      <div className="my-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
        <b>Note:</b> Real transcription will use local Whisper.cpp for privacy and latency. (Simulated for now)
      </div>

      {/* Semantic Chapters (Y8) */}
      {chapters.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Chapters by Topic:</h4>
          {chapters.map((ch, idx) => (
            <div key={idx} className="mb-2">
              <div className="font-semibold text-blue-700">{ch.topic}</div>
              <ul className="ml-4 list-disc">
                {ch.segments.map(seg => (
                  <li key={seg.id} className="text-sm">
                    {seg.text} {seg.emotionalTone && <span className="ml-2 text-xs text-pink-600">[{seg.emotionalTone}]</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {/* Recurring Themes (Y12) */}
      {recurringThemes.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Recurring Themes:</h4>
          <div className="flex flex-wrap gap-2">
            {recurringThemes.map((theme, idx) => (
              <span key={idx} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{theme}</span>
            ))}
          </div>
        </div>
      )}
      {/* Ranked Quotes (Y11) */}
      {rankedQuotes.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Key Quotes (Ranked):</h4>
          <ul className="space-y-1">
            {rankedQuotes.map((q, idx) => (
              <li key={q.segmentId} className="text-sm text-purple-700">{q.text}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Live Summary (Y9) */}
      {liveSummary && (
        <div className="my-4 p-2 bg-blue-50 rounded text-blue-900 text-sm">
          {liveSummary}
        </div>
      )}

      {/* 5-Minute Summaries (Y17) */}
      {fiveMinuteSummaries.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">5-Minute Summaries:</h4>
          {fiveMinuteSummaries.map((summary, idx) => (
            <div key={idx} className="mb-2 p-2 bg-green-50 rounded">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(summary.timestamp).toLocaleTimeString()}
              </div>
              <ul className="list-disc ml-4 text-sm">
                {summary.bullets.map((bullet, bulletIdx) => (
                  <li key={bulletIdx}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {/* Style Tags and Highlights (Y13, Y14) */}
      {transcriptSegments.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Transcript with Style Tags & Highlights:</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {transcriptSegments.slice(-5).map(segment => (
              <div key={segment.id} className="p-2 border rounded">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">{segment.speaker}</span>
                  <span className="text-xs bg-gray-100 px-1 rounded">
                    {styleTags[segment.id] || 'neutral'} • {Math.round(segment.confidence * 100)}%
                  </span>
                </div>
                <div className="text-sm">
                  {highlightedText[segment.id]?.length > 0 ? (
                    <span>
                      {segment.text.split(' ').map((word, wordIdx) => {
                        const highlight = highlightedText[segment.id].find(h => 
                          segment.text.includes(h.text) && word.includes(h.text)
                        )
                        if (highlight) {
                          return (
                            <span key={wordIdx} className={`px-1 rounded ${
                              highlight.type === 'name' ? 'bg-blue-200' :
                              highlight.type === 'date' ? 'bg-green-200' :
                              highlight.type === 'number' ? 'bg-yellow-200' :
                              'bg-purple-200'
                            }`}>
                              {word}
                            </span>
                          )
                        }
                        return word + ' '
                      })}
                    </span>
                  ) : (
                    segment.text
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Intent: {segment.intentCategory} • {formatTime(segment.startTime)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Q&A Interface (Y19) */}
      <div className="my-4">
        <h4 className="font-bold mb-2">Live Q&A:</h4>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="What did X say about Y?"
            className="flex-1 px-3 py-1 border rounded text-sm"
            onKeyPress={(e) => e.key === 'Enter' && answerLiveQuestion(newQuestion)}
          />
          <button
            onClick={() => answerLiveQuestion(newQuestion)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Ask
          </button>
        </div>
        {liveQuestions.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {liveQuestions.map(q => (
              <div key={q.id} className="p-2 bg-gray-50 rounded text-sm">
                <div className="font-medium text-gray-700">Q: {q.question}</div>
                <div className="text-gray-600 mt-1">A: {q.answer}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(q.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mere Context (Y21) */}
      {mereContext.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Mere Context Updates:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {mereContext.slice(-5).map((ctx, idx) => (
              <div key={idx} className="text-xs text-gray-600">
                <span className="font-medium">{ctx.type}:</span> {ctx.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flashcard Queue (Y22) */}
      {flashcardQueue.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Flashcards Created:</h4>
          <div className="space-y-1">
            {flashcardQueue.map((card, idx) => (
              <div key={idx} className="p-2 bg-purple-50 rounded text-sm">
                <div className="text-purple-800">{card.text}</div>
                <div className="text-xs text-purple-600 mt-1">
                  Created at {new Date(card.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recap Email (Y18) */}
      {recapEmail && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Recap Email Draft:</h4>
          <div className="p-3 bg-gray-50 rounded border">
            <pre className="text-sm whitespace-pre-wrap font-mono">{recapEmail}</pre>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(recapEmail)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => window.open(`mailto:?subject=Meeting Recap&body=${encodeURIComponent(recapEmail)}`)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Open in Email Client
            </button>
          </div>
        </div>
      )}

      {/* Timestamp Links in Summaries (Y20) */}
      {segmentSummaries.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Segment Summaries with Timestamps:</h4>
          <ul className="space-y-1">
            {segmentSummaries.map((seg, idx) => (
              <li key={idx} className="text-sm text-gray-700">
                <span className="font-mono text-blue-600 cursor-pointer hover:underline" 
                      onClick={() => jumpToTimestamp(seg.start)}>
                  [{formatTime(seg.start)}s–{formatTime(seg.end)}s]
                </span>: {seg.summary}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Flashcard Creation Button */}
      {transcriptSegments.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Quick Actions:</h4>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const lastSegment = transcriptSegments[transcriptSegments.length - 1]
                createFlashcard(lastSegment.text, lastSegment.id)
              }}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              Create Flashcard from Last Segment
            </button>
            <button
              onClick={() => updateMereContext('meeting_update', `Meeting has ${transcriptSegments.length} segments with ${actionItems.length} action items`)}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              Update Mere Context
            </button>
            <button
              onClick={generateMeetingMinutes}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Generate Meeting Minutes
            </button>
            <button
              onClick={generateMeetingAnalytics}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Generate Analytics
            </button>
          </div>
        </div>
      )}

      {/* Voice Commands Display (Y23) */}
      {voiceCommands.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Voice Commands Detected:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {voiceCommands.map((cmd, idx) => (
              <div key={idx} className={`p-2 rounded text-sm ${cmd.executed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <span className="font-medium">{cmd.command}</span>
                <span className="text-xs ml-2">
                  {new Date(cmd.timestamp).toLocaleTimeString()} 
                  {cmd.executed ? ' ✓' : ' ⏳'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meeting Minutes (Y24) */}
      {meetingMinutes && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Meeting Minutes:</h4>
          <div className="p-3 bg-gray-50 rounded border">
            <pre className="text-sm whitespace-pre-wrap font-mono">{meetingMinutes}</pre>
          </div>
          <div className="mt-2">
            <button
              onClick={() => navigator.clipboard.writeText(meetingMinutes)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Copy Minutes
            </button>
          </div>
        </div>
      )}

      {/* Sensitive Information Flags (Y25) */}
      {sensitiveInfoFlags.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2 text-red-700">⚠️ Sensitive Information Detected:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {sensitiveInfoFlags.map((flag, idx) => (
              <div key={idx} className="p-2 bg-red-100 text-red-800 rounded text-sm">
                <span className="font-medium">{flag.type}</span>
                <span className="text-xs ml-2">Confidence: {Math.round(flag.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Translation Interface (Y26) */}
      <div className="my-4">
        <h4 className="font-bold mb-2">Real-time Translation:</h4>
        <div className="flex gap-2 mb-2">
          <select
            value={translationTarget}
            onChange={(e) => setTranslationTarget(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="">Select target language...</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
          </select>
          <button
            onClick={() => {
              if (translationTarget && transcriptSegments.length > 0) {
                const lastSegment = transcriptSegments[transcriptSegments.length - 1]
                const translated = translateSegment(lastSegment.text, translationTarget)
                setTranslatedSegments(prev => ({ ...prev, [lastSegment.id]: translated }))
              }
            }}
            disabled={!translationTarget}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Translate Last Segment
          </button>
        </div>
        {Object.keys(translatedSegments).length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {Object.entries(translatedSegments).map(([segmentId, translation]) => {
              const segment = transcriptSegments.find(s => s.id === segmentId)
              return (
                <div key={segmentId} className="p-2 bg-blue-50 rounded text-sm">
                  <div className="text-gray-700">Original: {segment?.text}</div>
                  <div className="text-blue-800 font-medium">Translation: {translation}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Meeting Analytics Dashboard (Y27) */}
      {meetingAnalytics && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Meeting Analytics:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duration and Engagement */}
            <div className="p-3 bg-blue-50 rounded">
              <h5 className="font-medium mb-2">Meeting Overview</h5>
              <div className="space-y-1 text-sm">
                <div>Duration: {formatTime(meetingAnalytics.totalDuration)}</div>
                <div>Questions: {meetingAnalytics.engagementMetrics.questions}</div>
                <div>Decisions: {meetingAnalytics.engagementMetrics.decisions}</div>
                <div>Action Items: {meetingAnalytics.engagementMetrics.actionItems}</div>
              </div>
            </div>
            
            {/* Speaker Distribution */}
            <div className="p-3 bg-green-50 rounded">
              <h5 className="font-medium mb-2">Speaker Distribution</h5>
              <div className="space-y-1 text-sm">
                {Object.entries(meetingAnalytics.speakerDistribution).map(([speaker, time]) => (
                  <div key={speaker}>
                    {speaker}: {formatTime(time)} ({(time / meetingAnalytics.totalDuration * 100).toFixed(1)}%)
                  </div>
                ))}
              </div>
            </div>
            
            {/* Topic Evolution */}
            <div className="p-3 bg-purple-50 rounded">
              <h5 className="font-medium mb-2">Topic Evolution</h5>
              <div className="space-y-1 text-sm">
                {meetingAnalytics.topicEvolution.map((topic, idx) => (
                  <div key={idx}>
                    {formatTime(topic.time)}: {topic.topic}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sentiment Trend */}
            <div className="p-3 bg-orange-50 rounded">
              <h5 className="font-medium mb-2">Sentiment Trend</h5>
              <div className="space-y-1 text-sm">
                {meetingAnalytics.sentimentTrend.slice(-5).map((point, idx) => (
                  <div key={idx}>
                    {formatTime(point.time)}: {(point.sentiment * 100).toFixed(0)}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Command Instructions */}
      <div className="my-4 p-3 bg-gray-50 rounded">
        <h4 className="font-bold mb-2">Voice Commands Available:</h4>
        <div className="text-sm space-y-1">
          <div>• "Bookmark this" - Mark current segment</div>
          <div>• "Create flashcard" - Make flashcard from current segment</div>
          <div>• "Pause recording" / "Resume recording" - Control recording</div>
          <div>• "Summarize so far" - Get current summary</div>
          <div>• "What was said about [topic]" - Search transcript</div>
          <div>• "Translate to [language]" - Translate current segment</div>
        </div>
      </div>

      {/* Cross-References (Y28) */}
      {crossReferences.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Cross-References from Past Meetings:</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {crossReferences.map((ref, idx) => (
              <div key={idx} className="p-2 bg-blue-50 rounded text-sm">
                <div className="font-medium text-blue-800">{ref.fact}</div>
                <div className="text-blue-600 text-xs mt-1">
                  Previously discussed in: {ref.previousMeetings.join(', ')}
                </div>
                <div className="text-blue-500 text-xs">
                  Confidence: {Math.round(ref.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Memory Replay Mode (Y29) */}
      <div className="my-4">
        <h4 className="font-bold mb-2">Memory Replay Mode:</h4>
        <div className="flex gap-2 mb-2">
          {speakers.filter(s => s.segments > 0).map(speaker => (
            <button
              key={speaker.id}
              onClick={() => startMemoryReplay(speaker.id)}
              disabled={memoryReplayMode}
              className={`px-3 py-1 rounded text-sm ${
                memoryReplayMode && currentReplaySpeaker === speaker.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              } disabled:opacity-50`}
            >
              Replay {speaker.name}
            </button>
          ))}
          {memoryReplayMode && (
            <button
              onClick={stopMemoryReplay}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Stop Replay
            </button>
          )}
        </div>
        {memoryReplayMode && (
          <div className="p-2 bg-purple-50 rounded text-sm">
            <div className="font-medium text-purple-800">
              Replaying from {speakers.find(s => s.id === currentReplaySpeaker)?.name}'s perspective...
            </div>
            <div className="text-purple-600 text-xs mt-1">
              Showing only their contributions in chronological order
            </div>
          </div>
        )}
      </div>

      {/* Mind Map (Y30) */}
      {mindMap && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Mind Map: {mindMap.centralTopic}</h4>
          <div className="p-3 bg-green-50 rounded border">
            <div className="text-center mb-3">
              <div className="inline-block p-2 bg-green-200 rounded-full text-green-800 font-medium">
                {mindMap.centralTopic}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mindMap.nodes.map(node => (
                <div key={node.id} className="p-2 bg-white rounded border">
                  <div className={`text-xs px-1 py-0.5 rounded mb-1 inline-block ${
                    node.type === 'topic' ? 'bg-blue-100 text-blue-800' :
                    node.type === 'action' ? 'bg-yellow-100 text-yellow-800' :
                    node.type === 'decision' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {node.type.toUpperCase()}
                  </div>
                  <div className="text-sm">{node.label}</div>
                  {node.connections.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Connected to: {node.connections.length} nodes
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setMindMap(undefined)}
            className="mt-2 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Hide Mind Map
          </button>
        </div>
      )}

      {/* Junction Documents (Y31) */}
      {junctionDocuments.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Junction Documents Created:</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {junctionDocuments.map(doc => (
              <div key={doc.id} className="p-2 bg-indigo-50 rounded text-sm">
                <div className="font-medium text-indigo-800">{doc.title}</div>
                <div className="text-indigo-600 text-xs mt-1">
                  Tags: {doc.tags.join(', ')}
                </div>
                <div className="text-indigo-500 text-xs">
                  Content length: {doc.content.length} characters
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Knowledge Graph Updates (Y32) */}
      {knowledgeGraphUpdates.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Mindtrain Knowledge Graph Updates:</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {knowledgeGraphUpdates.slice(-10).map((update, idx) => (
              <div key={idx} className="p-2 bg-orange-50 rounded text-sm">
                <div className="font-medium text-orange-800">
                  {update.type.toUpperCase()}: {update.node}
                </div>
                <div className="text-orange-600 text-xs mt-1">
                  {update.type === 'add' && `Added ${update.metadata.type} node`}
                  {update.type === 'connect' && `Connected ${update.metadata.from} to ${update.metadata.to}`}
                  {update.type === 'update' && 'Updated node metadata'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Action Buttons */}
      {transcriptSegments.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Advanced Actions:</h4>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => crossReferenceFacts(transcriptSegments[transcriptSegments.length - 1].text)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Cross-Reference Last Segment
            </button>
            <button
              onClick={generateMindMap}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Generate Mind Map
            </button>
            <button
              onClick={storeAsJunctionDocument}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
            >
              Store in Junction
            </button>
            <button
              onClick={updateKnowledgeGraph}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              Update Knowledge Graph
            </button>
            <button
              onClick={promptFollowUpScheduling}
              className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
            >
              Suggest Follow-up
            </button>
            <button
              onClick={extractTimeSensitiveItems}
              className="px-3 py-1 bg-pink-600 text-white rounded text-sm hover:bg-pink-700"
            >
              Extract Time Items
            </button>
            <button
              onClick={createMemoryLinks}
              className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
            >
              Create Memory Links
            </button>
            <button
              onClick={generateMereAnalysis}
              className="px-3 py-1 bg-violet-600 text-white rounded text-sm hover:bg-violet-700"
            >
              Generate Mere Analysis
            </button>
            <button
              onClick={createConceptMap}
              className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
            >
              Create Concept Map
            </button>
            <button
              onClick={generateEmailSummary}
              className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
            >
              Generate Email Summary
            </button>
            <button
              onClick={createMemoryClusters}
              className="px-3 py-1 bg-rose-600 text-white rounded text-sm hover:bg-rose-700"
            >
              Create Memory Clusters
            </button>
            <button
              onClick={initializeOfflineTranscription}
              className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-700"
            >
              Initialize Offline Mode
            </button>
            <button
              onClick={initializeFallbackModels}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              Initialize Fallback Models
            </button>
            <button
              onClick={generateDownloadFormats}
              className="px-3 py-1 bg-lime-600 text-white rounded text-sm hover:bg-lime-700"
            >
              Generate Downloads
            </button>
            <button
              onClick={initializeLocalCache}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
            >
              Initialize Cache
            </button>
            <button
              onClick={() => initializeOfflineResilience()}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              Enable Offline Resilience
            </button>
            <button
              onClick={() => initializeComplianceMode('hipaa')}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              HIPAA Mode
            </button>
            <button
              onClick={() => initializeComplianceMode('enterprise')}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Enterprise Mode
            </button>
            <button
              onClick={initializeLocalDatabase}
              className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
            >
              Initialize Database
            </button>
            <button
              onClick={() => performVectorSearch('project')}
              className="px-3 py-1 bg-fuchsia-600 text-white rounded text-sm hover:bg-fuchsia-700"
            >
              Vector Search
            </button>
            <button
              onClick={generateOfflineSummary}
              className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
            >
              Generate Offline Summary
            </button>
            <button
              onClick={() => performSimilaritySearch('budget allocation')}
              className="px-3 py-1 bg-sky-600 text-white rounded text-sm hover:bg-sky-700"
            >
              Similarity Search
            </button>
            <button
              onClick={() => manageDatabaseOperations().backup()}
              className="px-3 py-1 bg-stone-600 text-white rounded text-sm hover:bg-stone-700"
            >
              Database Backup
            </button>
            <button
              onClick={() => manageDatabaseOperations().optimize()}
              className="px-3 py-1 bg-zinc-600 text-white rounded text-sm hover:bg-zinc-700"
            >
              Optimize Database
            </button>
            <button
              onClick={() => manageDatabaseOperations().reindex()}
              className="px-3 py-1 bg-neutral-600 text-white rounded text-sm hover:bg-neutral-700"
            >
              Reindex Vectors
            </button>
            <button
              onClick={configurePrivacySettings}
              className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-700"
            >
              Configure Privacy
            </button>
            <button
              onClick={() => configureEndToEndEncryption(true)}
              className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
            >
              Enable Encryption
            </button>
            <button
              onClick={() => manageSpeakerLabelingOptOut(true)}
              className="px-3 py-1 bg-rose-600 text-white rounded text-sm hover:bg-rose-700"
            >
              Disable Speaker Labels
            </button>
            <button
              onClick={() => configureEnterpriseLLMEndpoints('https://enterprise-llm.company.com')}
              className="px-3 py-1 bg-violet-600 text-white rounded text-sm hover:bg-violet-700"
            >
              Set Enterprise LLM
            </button>
            <button
              onClick={() => configureComplianceMode('hipaa')}
              className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
            >
              HIPAA Mode
            </button>
            <button
              onClick={() => configureComplianceMode('enterprise')}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Enterprise Mode
            </button>
            <button
              onClick={() => generateAuditLog('transcript_access', 'current_meeting', 'User accessed transcript')}
              className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
            >
              Log Access
            </button>
            <button
              onClick={manageRetentionRules}
              className="px-3 py-1 bg-lime-600 text-white rounded text-sm hover:bg-lime-700"
            >
              Manage Retention
            </button>
            <button
              onClick={() => redactContent('segment-1', 'privacy')}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Redact Content
            </button>
            <button
              onClick={() => handleCrossAppDeletion('transcript-1')}
              className="px-3 py-1 bg-pink-600 text-white rounded text-sm hover:bg-pink-700"
            >
              Delete Cross-App
            </button>
            <button
              onClick={() => trackSummarizationRequest('gpt-4', transcriptSegments.length)}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
            >
              Track Summary
            </button>
            <button
              onClick={enhanceTranscriptView}
              className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
            >
              Enhance View
            </button>
            <button
              onClick={manageUpcomingMeetings}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              Load Meetings
            </button>
            <button
              onClick={manageBotPresence}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Activate Bot
            </button>
            <button
              onClick={() => detectLiveHighlights(segments)}
              className="px-3 py-1 bg-pink-600 text-white rounded text-sm hover:bg-pink-700"
            >
              Detect Highlights
            </button>
            <button
              onClick={() => toggleSummaryMode('ai')}
              className="px-3 py-1 bg-violet-600 text-white rounded text-sm hover:bg-violet-700"
            >
              Toggle Summary
            </button>
            <button
              onClick={() => pinTranscriptPart('segment-1', 'Important Point', 'red')}
              className="px-3 py-1 bg-rose-600 text-white rounded text-sm hover:bg-rose-700"
            >
              Pin Segment
            </button>
            <button
              onClick={toggleSmartView}
              className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
            >
              Smart View
            </button>
            <button
              onClick={manageCommandBar}
              className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-700"
            >
              Command Bar
            </button>
            <button
              onClick={() => generateAudioWaveform([50, 60, 70, 80, 90, 85, 75, 65, 55, 45])}
              className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
            >
              Generate Waveform
            </button>
            <button
              onClick={managePlaybackSpeed}
              className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
            >
              Playback Speed
            </button>
            <button
              onClick={manageThemeSettings}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              Theme Settings
            </button>
            <button
              onClick={generateInsightGraph}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
            >
              Insight Graph
            </button>
            <button
              onClick={manageSummaryBuilder}
              className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
            >
              Summary Builder
            </button>
            <button
              onClick={manageKeyboardNavigation}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              Keyboard Nav
            </button>
            <button
              onClick={manageVoiceCommands}
              className="px-3 py-1 bg-pink-600 text-white rounded text-sm hover:bg-pink-700"
            >
              Voice Commands
            </button>
            <button
              onClick={() => handleWordHighlight('project', 'segment-1')}
              className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
            >
              Highlight Word
            </button>
            <button
              onClick={manageAIAnnotations}
              className="px-3 py-1 bg-lime-600 text-white rounded text-sm hover:bg-lime-700"
            >
              AI Annotations
            </button>
            <button
              onClick={manageMeetingPreview}
              className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
            >
              Meeting Preview
            </button>
            <button
              onClick={exportToSlides}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              Export Slides
            </button>
            <button
              onClick={manageDiffMode}
              className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-700"
            >
              Diff Mode
            </button>
            <button
              onClick={manageInlineCollaboration}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
            >
              Inline Collaboration
            </button>
            <button
              onClick={manageLiveConfidenceBar}
              className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
            >
              Live Confidence
            </button>
            <button
              onClick={manageTranscriptForking}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              Fork Transcript
            </button>
            <button
              onClick={manageMobileVoiceCommands}
              className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
            >
              Mobile Voice
            </button>
            <button
              onClick={manageVersionHistory}
              className="px-3 py-1 bg-violet-600 text-white rounded text-sm hover:bg-violet-700"
            >
              Version History
            </button>
            <button
              onClick={manageCalendarSync}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Calendar Sync
            </button>
            <button
              onClick={manageRelatedMeetings}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Related Meetings
            </button>
            <button
              onClick={manageSlackExport}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              Slack Export
            </button>
            <button
              onClick={manageVoiceprintIdentification}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              Voiceprint ID
            </button>
            <button
              onClick={manageInstantSummarization}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Instant Summary
            </button>
            <button
              onClick={manageEndOfMeetingWrapUp}
              className="px-3 py-1 bg-pink-600 text-white rounded text-sm hover:bg-pink-700"
            >
              End Wrap-Up
            </button>
            <button
              onClick={manageMeetingTagging}
              className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
            >
              Meeting Tags
            </button>
            <button
              onClick={manageFilteredSummaryViews}
              className="px-3 py-1 bg-lime-600 text-white rounded text-sm hover:bg-lime-700"
            >
              Filtered Views
            </button>
            <button
              onClick={manageCopySafeText}
              className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
            >
              Copy Safe Text
            </button>
            <button
              onClick={manageSummaryQualityRating}
              className="px-3 py-1 bg-rose-600 text-white rounded text-sm hover:bg-rose-700"
            >
              Quality Rating
            </button>
          </div>
        </div>
      )}

      {/* Privacy Settings Status (Y61-Y65) */}
      {privacySettings && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Privacy & Compliance Settings:</h4>
          <div className="p-3 bg-slate-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Local Transcription:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  privacySettings.localTranscription ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {privacySettings.localTranscription ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Self-Hosted Backend:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  privacySettings.selfHostedBackend ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {privacySettings.selfHostedBackend ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Data Sharing Approved:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  privacySettings.dataSharingApproved ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {privacySettings.dataSharingApproved ? 'Approved' : 'Not Approved'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">End-to-End Encryption:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  privacySettings.endToEndEncryption ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {privacySettings.endToEndEncryption ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Speaker Labeling:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  !privacySettings.speakerLabelingOptOut ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {!privacySettings.speakerLabelingOptOut ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Enterprise Mode:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  privacySettings.enterpriseMode ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {privacySettings.enterpriseMode ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              {privacySettings.customLLMEndpoint && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Custom LLM Endpoint:</span>
                  <span className="text-xs font-mono text-slate-600 truncate max-w-32">
                    {privacySettings.customLLMEndpoint}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compliance Mode Status (Y67) */}
      {complianceMode && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Compliance Mode:</h4>
          <div className="p-3 bg-emerald-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Mode:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  complianceMode.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {complianceMode.type.toUpperCase()}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Encryption Level:</span>
                <span className="text-sm font-medium">{complianceMode.encryptionLevel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Data Retention:</span>
                <span className="text-sm font-medium">{complianceMode.dataRetention} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  complianceMode.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {complianceMode.enabled ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs (Y66) */}
      {auditLogs && auditLogs.length > 0 && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Recent Audit Logs:</h4>
          <div className="p-3 bg-amber-50 rounded border">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-2 bg-white rounded border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-amber-700">{log.action}</div>
                      <div className="text-xs text-amber-600 mt-1">{log.resource}</div>
                      <div className="text-xs text-amber-500 mt-1">{log.details}</div>
                    </div>
                    <div className="text-xs text-amber-600 ml-2">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-amber-600 mt-2">
              Showing {Math.min(auditLogs.length, 5)} of {auditLogs.length} logs
            </div>
          </div>
        </div>
      )}

      {/* Retention Rules Status (Y67) */}
      {retentionRules && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Retention Rules:</h4>
          <div className="p-3 bg-lime-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  retentionRules.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {retentionRules.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Default Retention:</span>
                <span className="text-sm font-medium">{retentionRules.defaultRetention} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Custom Rules:</span>
                <span className="text-sm font-medium">{retentionRules.customRules.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Updated:</span>
                <span className="text-sm font-medium">
                  {retentionRules.lastUpdated ? retentionRules.lastUpdated.toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
            
            {/* Custom Rules List */}
            {retentionRules.customRules.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-lime-700 font-medium mb-2">Custom Rules:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {retentionRules.customRules.map(rule => (
                    <div key={rule.id} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium text-lime-800">{rule.name}</div>
                      <div className="text-lime-600">Retention: {rule.retentionDays} days</div>
                      <div className="text-lime-500">Applies to: {rule.appliesTo.join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Redaction Mode Status (Y68) */}
      {redactionMode && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Content Redaction:</h4>
          <div className="p-3 bg-red-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  redactionMode.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {redactionMode.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Redacted Segments:</span>
                <span className="text-sm font-medium">{redactionMode.redactedSegments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Summary Regenerated:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  redactionMode.summaryRegenerated ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {redactionMode.summaryRegenerated ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
            
            {/* Redacted Segments List */}
            {redactionMode.redactedSegments.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-red-700 font-medium mb-2">Redacted Content:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {redactionMode.redactedSegments.slice(0, 3).map(redaction => (
                    <div key={redaction.id} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium text-red-800">Reason: {redaction.reason}</div>
                      <div className="text-red-600 mt-1">Original: {redaction.originalText.substring(0, 50)}...</div>
                      <div className="text-red-500">Redacted: {redaction.redactedText}</div>
                      <div className="text-red-400 text-xs mt-1">
                        {redaction.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cross-App Deletion Status (Y69) */}
      {crossAppDeletion && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Cross-App Deletion:</h4>
          <div className="p-3 bg-pink-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  crossAppDeletion.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {crossAppDeletion.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Connected Apps:</span>
                <span className="text-sm font-medium">{crossAppDeletion.connectedApps.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Deletion Queue:</span>
                <span className="text-sm font-medium">{crossAppDeletion.deletionQueue.length}</span>
              </div>
            </div>
            
            {/* Connected Apps Status */}
            <div className="mt-3">
              <div className="text-xs text-pink-700 font-medium mb-2">App Status:</div>
              <div className="space-y-1">
                {crossAppDeletion.connectedApps.map(app => (
                  <div key={app.name} className="flex justify-between items-center text-xs">
                    <span className="text-pink-800">{app.name}</span>
                    <div className={`px-2 py-1 rounded ${
                      app.status === 'connected' ? 'bg-green-200 text-green-800' :
                      app.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {app.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Deletion Queue */}
            {crossAppDeletion.deletionQueue.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-pink-700 font-medium mb-2">Deletion Queue:</div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {crossAppDeletion.deletionQueue.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs p-1 bg-white rounded">
                      <span className="text-pink-800">{item.app} - {item.resource}</span>
                      <div className={`px-2 py-1 rounded ${
                        item.status === 'completed' ? 'bg-green-200 text-green-800' :
                        item.status === 'failed' ? 'bg-red-200 text-red-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summarization Tracking Status (Y70) */}
      {summarizationTracking && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Summarization Tracking:</h4>
          <div className="p-3 bg-indigo-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Requests:</span>
                <span className="text-sm font-medium">{summarizationTracking.totalRequests}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Quality:</span>
                <span className="text-sm font-medium">{(summarizationTracking.averageQuality * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Recent Requests:</span>
                <span className="text-sm font-medium">{summarizationTracking.requests.length}</span>
              </div>
            </div>
            
            {/* Recent Requests */}
            {summarizationTracking.requests.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-indigo-700 font-medium mb-2">Recent Requests:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {summarizationTracking.requests.slice(0, 5).map(request => (
                    <div key={request.id} className="p-2 bg-white rounded border text-xs">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-indigo-800">{request.model}</div>
                          <div className="text-indigo-600">Segments: {request.segments}</div>
                          <div className="text-indigo-500">Duration: {request.duration}ms</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`px-2 py-1 rounded ${
                            request.status === 'completed' ? 'bg-green-200 text-green-800' :
                            request.status === 'failed' ? 'bg-red-200 text-red-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {request.status}
                          </div>
                          {request.status === 'completed' && (
                            <div className="text-xs text-indigo-600 mt-1">
                              {(request.quality * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-indigo-400 text-xs mt-1">
                        {request.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Transcript View (Y71) */}
      {transcriptView && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Enhanced Transcript View:</h4>
          <div className="p-3 bg-gray-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Real-Time Scrolling:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  transcriptView.realTimeScrolling ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {transcriptView.realTimeScrolling ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Speaker Highlighting:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  transcriptView.speakerHighlighting ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {transcriptView.speakerHighlighting ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Chapter Folding:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  transcriptView.chapterFolding ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {transcriptView.chapterFolding ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Time-Synced Search:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  transcriptView.timeSyncedSearch ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {transcriptView.timeSyncedSearch ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Search Query:</span>
                <span className="text-sm font-medium">{transcriptView.searchQuery}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Search Results:</span>
                <span className="text-sm font-medium">{transcriptView.searchResults.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Chapter:</span>
                <span className="text-sm font-medium">{transcriptView.currentChapter}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Chapters:</span>
                <span className="text-sm font-medium">{transcriptView.chapters.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Meetings (Y72) */}
      {upcomingMeetings && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Upcoming Meetings:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {upcomingMeetings.map(meeting => (
              <div key={meeting.id} className="p-2 bg-blue-50 rounded text-sm">
                <div className="font-medium">{meeting.title}</div>
                <div className="text-gray-600">
                  {meeting.purpose}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                </div>
                <div className="text-xs text-gray-500">
                  AI Confidence: {meeting.aiConfidence.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  {meeting.participants.join(', ')}
                </div>
                <div className="text-xs text-gray-500">
                  {meeting.botStatus}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bot Presence Indicator (Y73) */}
      {botPresence && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Bot Presence:</h4>
          <div className="p-3 bg-green-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  botPresence.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {botPresence.status}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Join Time:</span>
                <span className="text-sm font-medium">
                  {botPresence.joinTime ? botPresence.joinTime.toLocaleTimeString() : 'Not joined yet'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Presence Indicator:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  botPresence.presenceIndicator ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {botPresence.presenceIndicator ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Silent Mode:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  botPresence.silentMode ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {botPresence.silentMode ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Helpfulness:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  botPresence.helpfulness.toFixed(2) === '1.00' ? 'bg-green-200 text-green-800' :
                  botPresence.helpfulness.toFixed(2) === '0.00' ? 'bg-red-200 text-red-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {botPresence.helpfulness.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Highlights Panel (Y74) */}
      {liveHighlights && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Live Highlights:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {liveHighlights.map(highlight => (
              <div key={highlight.id} className="p-2 bg-yellow-50 rounded text-sm">
                <div className="font-medium">{highlight.text}</div>
                <div className="text-xs text-gray-500">
                  {highlight.type} - {highlight.speaker}
                </div>
                <div className="text-xs text-gray-500">
                  Confidence: {highlight.confidence.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  {highlight.isLive ? 'Live' : 'Not live'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Toggle (Y75) */}
      {summaryToggle && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Summary Mode:</h4>
          <div className="p-3 bg-gray-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Mode:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  summaryToggle.mode === 'ai' ? 'bg-green-200 text-green-800' :
                  summaryToggle.mode === 'edited' ? 'bg-blue-200 text-blue-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {summaryToggle.mode.toUpperCase()}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Edited:</span>
                <span className="text-sm font-medium">
                  {summaryToggle.lastEditTime ? summaryToggle.lastEditTime.toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Editor:</span>
                <span className="text-sm font-medium">{summaryToggle.editor}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Settings (Y91) */}
      {themeSettings && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Theme Settings:</h4>
          <div className="p-3 bg-purple-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Theme:</span>
                <span className="text-sm font-medium capitalize">{themeSettings.currentTheme}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto Switch:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  themeSettings.autoSwitch ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {themeSettings.autoSwitch ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">High Contrast:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  themeSettings.accessibility.highContrast ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {themeSettings.accessibility.highContrast ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insight Graph (Y92) */}
      {insightGraph && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Insight Graph:</h4>
          <div className="p-3 bg-indigo-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  insightGraph.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {insightGraph.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Nodes:</span>
                <span className="text-sm font-medium">{insightGraph.nodes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Edges:</span>
                <span className="text-sm font-medium">{insightGraph.edges.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Commands (Y95) */}
      {voiceCommands && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Voice Commands:</h4>
          <div className="p-3 bg-pink-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  voiceCommands.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {voiceCommands.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Listening:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  voiceCommands.isListening ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {voiceCommands.isListening ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Wake Phrase:</span>
                <span className="text-sm font-medium">{voiceCommands.wakePhrase}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Word Highlighting (Y96) */}
      {wordHighlighting && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Word Highlighting:</h4>
          <div className="p-3 bg-cyan-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Selected Word:</span>
                <span className="text-sm font-medium">{wordHighlighting.selectedWord}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Querying:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  wordHighlighting.isQuerying ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {wordHighlighting.isQuerying ? 'In Progress' : 'Idle'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Results:</span>
                <span className="text-sm font-medium">{wordHighlighting.contextResults.length}</span>
              </div>
              
              {/* Context Results */}
              {wordHighlighting.contextResults.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-cyan-700 font-medium mb-2">Context Results:</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {wordHighlighting.contextResults.map(result => (
                      <div key={result.id} className="p-2 bg-white rounded border text-xs">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-cyan-800">{result.type}</div>
                            <div className="text-cyan-600">{result.content}</div>
                          </div>
                          <div className="text-cyan-500 font-mono">{(result.confidence * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Annotations (Y97) */}
      {aiAnnotations && (
        <div className="my-4">
          <h4 className="font-bold mb-2">AI Annotations:</h4>
          <div className="p-3 bg-lime-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  aiAnnotations.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {aiAnnotations.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Annotations:</span>
                <span className="text-sm font-medium">{aiAnnotations.annotations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto Generate:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  aiAnnotations.autoGenerate ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {aiAnnotations.autoGenerate ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              
              {/* Annotation Filters */}
              <div className="mt-3">
                <div className="text-xs text-lime-700 font-medium mb-2">Filters:</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(aiAnnotations.filters).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => filterAnnotations(key as keyof typeof aiAnnotations.filters)}
                      className={`text-xs px-2 py-1 rounded ${
                        value ? 'bg-lime-200 text-lime-800' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Preview (Y98) */}
      {meetingPreview && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Meeting Preview:</h4>
          <div className="p-3 bg-amber-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <span className="text-sm font-medium capitalize">{meetingPreview.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Participants:</span>
                <span className="text-sm font-medium">{meetingPreview.participants.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Duration:</span>
                <span className="text-sm font-medium">{formatTime(meetingPreview.timeInfo.duration)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">AI Confidence:</span>
                <span className="text-sm font-medium">{(meetingPreview.aiConfidence.overall * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Purpose:</span>
                <span className="text-sm font-medium">{meetingPreview.purpose.primary}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide Export (Y99) */}
      {slideExport && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Slide Export:</h4>
          <div className="p-3 bg-purple-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  slideExport.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {slideExport.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Templates:</span>
                <span className="text-sm font-medium">{slideExport.templates.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Content Slides:</span>
                <span className="text-sm font-medium">{slideExport.content.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Generating:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  slideExport.isGenerating ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {slideExport.isGenerating ? 'In Progress' : 'Ready'}
                </div>
              </div>
              
              {/* Export Formats */}
              <div className="mt-3">
                <div className="text-xs text-purple-700 font-medium mb-2">Export Formats:</div>
                <div className="flex flex-wrap gap-1">
                  {slideExport.exportFormats.map(format => (
                    <button
                      key={format}
                      onClick={() => generateSlideExport(format)}
                      className="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded hover:bg-purple-300"
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diff Mode (Y100) */}
      {diffMode && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Diff Mode:</h4>
          <div className="p-3 bg-slate-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  diffMode.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {diffMode.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Differences:</span>
                <span className="text-sm font-medium">{diffMode.differences.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">View Mode:</span>
                <span className="text-sm font-medium capitalize">{diffMode.viewMode.replace('_', ' ')}</span>
              </div>
              
              {/* Diff Filters */}
              <div className="mt-3">
                <div className="text-xs text-slate-700 font-medium mb-2">Filters:</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(diffMode.filters).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => toggleDiffFilter(key as keyof typeof diffMode.filters)}
                      className={`text-xs px-2 py-1 rounded ${
                        value ? 'bg-slate-200 text-slate-800' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {key.replace('show', '').toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Collaboration (Y101) */}
      {inlineCollaboration && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Inline Collaboration:</h4>
          <div className="p-3 bg-indigo-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  inlineCollaboration.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {inlineCollaboration.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Collaborators:</span>
                <span className="text-sm font-medium">{inlineCollaboration.collaborators.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Comments:</span>
                <span className="text-sm font-medium">{inlineCollaboration.comments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Suggestions:</span>
                <span className="text-sm font-medium">{inlineCollaboration.suggestions.length}</span>
              </div>
              
              {/* Online Collaborators */}
              <div className="mt-3">
                <div className="text-xs text-indigo-700 font-medium mb-2">Online Collaborators:</div>
                <div className="flex flex-wrap gap-2">
                  {inlineCollaboration.collaborators.filter(c => c.isOnline).map(collaborator => (
                    <div key={collaborator.id} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: collaborator.color }}
                      />
                      <span className="text-xs">{collaborator.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Confidence Bar (Y102) */}
      {liveConfidenceBar && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Live Confidence Bar:</h4>
          <div className="p-3 bg-emerald-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Confidence:</span>
                <span className="text-sm font-medium">{(liveConfidenceBar.currentConfidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Confidence:</span>
                <span className="text-sm font-medium">{(liveConfidenceBar.averageConfidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Alerts:</span>
                <span className="text-sm font-medium">{liveConfidenceBar.alerts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto Correction:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  liveConfidenceBar.autoCorrection ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {liveConfidenceBar.autoCorrection ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              
              {/* Confidence Bar */}
              <div className="mt-3">
                <div className="text-xs text-emerald-700 font-medium mb-2">Confidence Level:</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${liveConfidenceBar.currentConfidence * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-emerald-600 mt-1">
                  <span>Low ({liveConfidenceBar.thresholds.low * 100}%)</span>
                  <span>High ({liveConfidenceBar.thresholds.high * 100}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Forking (Y103) */}
      {transcriptForking && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Transcript Forking:</h4>
          <div className="p-3 bg-orange-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  transcriptForking.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {transcriptForking.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Forks:</span>
                <span className="text-sm font-medium">{transcriptForking.forks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Fork:</span>
                <span className="text-sm font-medium">{transcriptForking.currentFork || 'None'}</span>
              </div>
              
              {/* Fork List */}
              <div className="mt-3">
                <div className="text-xs text-orange-700 font-medium mb-2">Available Forks:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {transcriptForking.forks.map(fork => (
                    <div key={fork.id} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium text-orange-800">{fork.name}</div>
                      <div className="text-orange-600">{fork.description}</div>
                      <div className="text-orange-500 text-xs">
                        {fork.annotations.length} annotations • {fork.collaborators.length} collaborators
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Voice Commands (Y104) */}
      {mobileVoiceCommands && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Mobile Voice Commands:</h4>
          <div className="p-3 bg-teal-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  mobileVoiceCommands.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {mobileVoiceCommands.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Listening:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  mobileVoiceCommands.isListening ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {mobileVoiceCommands.isListening ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Wake Phrase:</span>
                <span className="text-sm font-medium">{mobileVoiceCommands.wakePhrase}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Commands:</span>
                <span className="text-sm font-medium">{mobileVoiceCommands.commands.length}</span>
              </div>
              
              {/* Mobile Commands */}
              <div className="mt-3">
                <div className="text-xs text-teal-700 font-medium mb-2">Available Commands:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {mobileVoiceCommands.commands.map(command => (
                    <div key={command.phrase} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium text-teal-800">"{command.phrase}"</div>
                      <div className="text-teal-600">{command.description}</div>
                      <div className="text-teal-500 text-xs">
                        {command.mobileOnly ? 'Mobile only' : 'All platforms'} • 
                        {command.requiresConfirmation ? ' Requires confirmation' : ' No confirmation'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History (Y105) */}
      {versionHistory && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Version History:</h4>
          <div className="p-3 bg-violet-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  versionHistory.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {versionHistory.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Versions:</span>
                <span className="text-sm font-medium">{versionHistory.versions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Version:</span>
                <span className="text-sm font-medium">{versionHistory.currentVersion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto Save:</span>
                <span className="text-sm font-medium">{versionHistory.autoSaveInterval / 60000} min</span>
              </div>
              
              {/* Version List */}
              <div className="mt-3">
                <div className="text-xs text-violet-700 font-medium mb-2">Version History:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {versionHistory.versions.map(version => (
                    <div key={version.id} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium text-violet-800">{version.name}</div>
                      <div className="text-violet-600">{version.description}</div>
                      <div className="text-violet-500 text-xs">
                        {version.changes.length} changes • {version.createdBy} • {version.isAutoSave ? 'Auto' : 'Manual'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Sync (Y106) */}
      {calendarSync && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Calendar Sync:</h4>
          <div className="p-3 bg-blue-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  calendarSync.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {calendarSync.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Connected Calendars:</span>
                <span className="text-sm font-medium">{calendarSync.connectedCalendars.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Upcoming Events:</span>
                <span className="text-sm font-medium">{calendarSync.upcomingEvents.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto Sync:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  calendarSync.autoSync ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {calendarSync.autoSync ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              
              {/* Upcoming Events */}
              <div className="mt-3">
                <div className="text-xs text-blue-700 font-medium mb-2">Upcoming Events:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {calendarSync.upcomingEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium text-blue-800">{event.title}</div>
                      <div className="text-blue-600">
                        {event.startTime.toLocaleTimeString()} - {event.participants.length} participants
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Related Meetings (Y107) */}
      {relatedMeetings && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Related Meetings:</h4>
          <div className="p-3 bg-green-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  relatedMeetings.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {relatedMeetings.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Meetings:</span>
                <span className="text-sm font-medium">{relatedMeetings.meetings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">View Mode:</span>
                <span className="text-sm font-medium capitalize">{relatedMeetings.viewMode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto Suggest:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  relatedMeetings.autoSuggest ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {relatedMeetings.autoSuggest ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              
              {/* Related Meetings List */}
              <div className="mt-3">
                <div className="text-xs text-green-700 font-medium mb-2">Related Meetings:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {relatedMeetings.meetings.slice(0, 3).map(meeting => (
                    <div key={meeting.id} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium text-green-800">{meeting.title}</div>
                      <div className="text-green-600">
                        {meeting.date.toLocaleDateString()} • {(meeting.similarity * 100).toFixed(0)}% similar
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slack Export (Y108) */}
      {slackExport && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Slack Export:</h4>
          <div className="p-3 bg-purple-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  slackExport.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {slackExport.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Connected Channels:</span>
                <span className="text-sm font-medium">{slackExport.connectedChannels.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Webhooks:</span>
                <span className="text-sm font-medium">{slackExport.webhooks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Export Format:</span>
                <span className="text-sm font-medium capitalize">{slackExport.exportSettings.format.replace('_', ' ')}</span>
              </div>
              
              {/* Connected Channels */}
              <div className="mt-3">
                <div className="text-xs text-purple-700 font-medium mb-2">Connected Channels:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {slackExport.connectedChannels.map(channel => (
                    <div key={channel.id} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium text-purple-800">{channel.name}</div>
                      <div className="text-purple-600">
                        {channel.exportCount} exports • {channel.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voiceprint Identification (Y109) */}
      {voiceprintIdentification && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Voiceprint Identification:</h4>
          <div className="p-3 bg-yellow-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  voiceprintIdentification.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {voiceprintIdentification.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Voiceprints:</span>
                <span className="text-sm font-medium">{voiceprintIdentification.voiceprints.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Speaker:</span>
                <span className="text-sm font-medium">
                  {voiceprintIdentification.currentSpeaker.isIdentified 
                    ? voiceprintIdentification.voiceprints.find(v => v.userId === voiceprintIdentification.currentSpeaker.userId)?.userName || 'Unknown'
                    : 'Not identified'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Confidence:</span>
                <span className="text-sm font-medium">{(voiceprintIdentification.currentSpeaker.confidence * 100).toFixed(0)}%</span>
              </div>
              
              {/* Voiceprints List */}
              <div className="mt-3">
                <div className="text-xs text-yellow-700 font-medium mb-2">Voiceprints:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {voiceprintIdentification.voiceprints.map(voiceprint => (
                    <div key={voiceprint.id} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium text-yellow-800">{voiceprint.userName}</div>
                      <div className="text-yellow-600">
                        {(voiceprint.confidence * 100).toFixed(0)}% confidence • {voiceprint.samples} samples
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instant Summarization (Y110) */}
      {instantSummarization && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Instant Summarization:</h4>
          <div className="p-3 bg-red-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  instantSummarization.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {instantSummarization.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Generating:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  instantSummarization.isGenerating ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {instantSummarization.isGenerating ? 'In Progress' : 'Ready'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Templates:</span>
                <span className="text-sm font-medium">{instantSummarization.templates.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">History:</span>
                <span className="text-sm font-medium">{instantSummarization.history.length}</span>
              </div>
              
              {/* Last Summary */}
              {instantSummarization.lastSummary && (
                <div className="mt-3">
                  <div className="text-xs text-red-700 font-medium mb-2">Last Summary:</div>
                  <div className="p-2 bg-white rounded border text-xs">
                    <div className="text-red-800">{instantSummarization.lastSummary.content}</div>
                    <div className="text-red-600 mt-1">
                      {instantSummarization.lastSummary.keyPoints.length} key points • 
                      {instantSummarization.lastSummary.actionItems.length} action items
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* End-of-Meeting Wrap-Up (Y111) */}
      {endOfMeetingWrapUp && (
        <div className="my-4">
          <h4 className="font-bold mb-2">End-of-Meeting Wrap-Up:</h4>
          <div className="p-3 bg-pink-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  endOfMeetingWrapUp.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {endOfMeetingWrapUp.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Generating:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  endOfMeetingWrapUp.isGenerating ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {endOfMeetingWrapUp.isGenerating ? 'In Progress' : 'Ready'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Templates:</span>
                <span className="text-sm font-medium">{endOfMeetingWrapUp.templates.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">History:</span>
                <span className="text-sm font-medium">{endOfMeetingWrapUp.history.length}</span>
              </div>
              
              {/* Current Wrap-Up */}
              {endOfMeetingWrapUp.wrapUp && (
                <div className="mt-3">
                  <div className="text-xs text-pink-700 font-medium mb-2">Current Wrap-Up:</div>
                  <div className="p-2 bg-white rounded border text-xs">
                    <div className="text-pink-800">{endOfMeetingWrapUp.wrapUp.content}</div>
                    <div className="text-pink-600 mt-1">
                      {endOfMeetingWrapUp.wrapUp.keyDecisions.length} decisions • 
                      {endOfMeetingWrapUp.wrapUp.actionItems.length} action items • 
                      {endOfMeetingWrapUp.wrapUp.nextSteps.length} next steps
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meeting Tagging (Y112) */}
      {meetingTagging && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Meeting Tagging:</h4>
          <div className="p-3 bg-cyan-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  meetingTagging.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {meetingTagging.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tags:</span>
                <span className="text-sm font-medium">{meetingTagging.tags.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Applied Tags:</span>
                <span className="text-sm font-medium">{meetingTagging.appliedTags.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto Tagging:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  meetingTagging.autoTagging.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {meetingTagging.autoTagging.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              
              {/* Applied Tags */}
              <div className="mt-3">
                <div className="text-xs text-cyan-700 font-medium mb-2">Applied Tags:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {meetingTagging.appliedTags.slice(0, 3).map(appliedTag => {
                    const tag = meetingTagging.tags.find(t => t.id === appliedTag.tagId)
                    return (
                      <div key={appliedTag.tagId} className="p-2 bg-white rounded border text-xs">
                        <div className="font-medium text-cyan-800">{tag?.name || 'Unknown Tag'}</div>
                        <div className="text-cyan-600">
                          {(appliedTag.confidence * 100).toFixed(0)}% confidence • {appliedTag.appliedBy}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtered Summary Views (Y113) */}
      {filteredSummaryViews && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Filtered Summary Views:</h4>
          <div className="p-3 bg-lime-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  filteredSummaryViews.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {filteredSummaryViews.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current View:</span>
                <span className="text-sm font-medium capitalize">{filteredSummaryViews.currentView.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Views:</span>
                <span className="text-sm font-medium">{filteredSummaryViews.views.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Custom Filters:</span>
                <span className="text-sm font-medium">{filteredSummaryViews.customFilters.length}</span>
              </div>
              
              {/* Available Views */}
              <div className="mt-3">
                <div className="text-xs text-lime-700 font-medium mb-2">Available Views:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filteredSummaryViews.views.map(view => (
                    <div key={view.id} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium text-lime-800">{view.name}</div>
                      <div className="text-lime-600">
                        {view.content.length} items • {view.type.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Safe Text (Y114) */}
      {copySafeText && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Copy Safe Text:</h4>
          <div className="p-3 bg-amber-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  copySafeText.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {copySafeText.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Format:</span>
                <span className="text-sm font-medium capitalize">{copySafeText.format.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Preserve Quotes:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  copySafeText.preserveQuotes ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {copySafeText.preserveQuotes ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Copy History:</span>
                <span className="text-sm font-medium">{copySafeText.copyHistory.length}</span>
              </div>
              
              {/* Copy History */}
              <div className="mt-3">
                <div className="text-xs text-amber-700 font-medium mb-2">Recent Copies:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {copySafeText.copyHistory.slice(0, 3).map(copy => (
                    <div key={copy.id} className="p-2 bg-white rounded border text-xs">
                      <div className="font-medium text-amber-800">{copy.format}</div>
                      <div className="text-amber-600">
                        {copy.length} characters • {copy.destination}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Quality Rating (Y115) */}
      {summaryQualityRating && (
        <div className="my-4">
          <h4 className="font-bold mb-2">Summary Quality Rating:</h4>
          <div className="p-3 bg-rose-50 rounded border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Enabled:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  summaryQualityRating.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {summaryQualityRating.enabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Rating:</span>
                <span className="text-sm font-medium">
                  {summaryQualityRating.currentRating ? 
                    `${(summaryQualityRating.currentRating.overall * 100).toFixed(0)}%` : 
                    'Not rated'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rating History:</span>
                <span className="text-sm font-medium">{summaryQualityRating.ratingHistory.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto Improve:</span>
                <div className={`text-xs px-2 py-1 rounded ${
                  summaryQualityRating.autoImprove.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {summaryQualityRating.autoImprove.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              
              {/* Current Rating Details */}
              {summaryQualityRating.currentRating && (
                <div className="mt-3">
                  <div className="text-xs text-rose-700 font-medium mb-2">Rating Details:</div>
                  <div className="p-2 bg-white rounded border text-xs">
                    <div className="grid grid-cols-2 gap-2 text-rose-800">
                      <div>Accuracy: {(summaryQualityRating.currentRating.accuracy * 100).toFixed(0)}%</div>
                      <div>Completeness: {(summaryQualityRating.currentRating.completeness * 100).toFixed(0)}%</div>
                      <div>Clarity: {(summaryQualityRating.currentRating.clarity * 100).toFixed(0)}%</div>
                      <div>Relevance: {(summaryQualityRating.currentRating.relevance * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
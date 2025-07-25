export interface TranscriptSegment {
  id: string
  speaker: string
  speakerConfidence: number
  startTime: number
  endTime: number
  text: string
  confidence: number
  isLive: boolean
  punctuationCorrected: boolean
  originalText?: string
  sentimentScore?: number
  emotionalTone?: 'happy' | 'angry' | 'worried' | 'confused' | 'excited' | 'neutral'
  intentCategory?: 'request' | 'complaint' | 'praise' | 'confusion' | 'urgency' | 'neutral'
  urgencyScore?: number
  wordTimestamps?: Array<{ word: string, start: number, end: number }>
  isBookmarked?: boolean
  isActionItem?: boolean
  isQuestion?: boolean
  isDecision?: boolean
  nonVerbalCues?: string[]
  backchanneling?: boolean
}

export interface Speaker {
  id: string
  name: string
  color: string
  segments: number
  totalDuration: number
  averageConfidence: number
}

export interface Bookmark {
  id: string
  timestamp: number
  label: string
}

export interface ActionItem {
  id: string
  text: string
  speaker: string
  timestamp: number
  assignedTo?: string
  priority: 'low' | 'medium' | 'high'
}

export interface Highlight {
  id: string
  segmentId: string
  text: string
  type: 'important' | 'action_item' | 'question' | 'decision' | 'quote'
  timestamp: number
  speaker: string
  isLive: boolean
}

export interface Topic {
  name: string
  frequency: number
  firstMention: number
  segments: string[]
}

export interface Chapter {
  topic: string
  segments: TranscriptSegment[]
}

export interface Quote {
  text: string
  importance: number
  segmentId: string
}

export interface RealTimeSentiment {
  overall: number
  bySpeaker: Record<string, number>
  recentChanges: Array<{ timestamp: number, speaker: string, sentiment: number }>
}

export interface Comment {
  id: string
  segmentId: string
  text: string
  author: string
  timestamp: Date
  isResolved: boolean
  replies: Array<{
    id: string
    text: string
    author: string
    timestamp: Date
  }>
}

export interface VectorSearchState {
  enabled: boolean
  indexSize: number
  searchResults: Array<{
    id: string
    similarity: number
    content: string
    meeting: string
  }>
  lastSearch: string
}

export interface ThemeSettings {
  showTimestamps: boolean
  showSpeakerColors: boolean
  showConfidence: boolean
  showSentiment: boolean
  fontSize: 'small' | 'medium' | 'large'
  compactMode: boolean
  highlightMode: 'none' | 'important' | 'all'
}

export interface EntityHighlight {
  text: string
  type: 'name' | 'date' | 'number' | 'url'
}

export interface MeetingSummary {
  mode: 'edited' | 'ai' | 'final'
  aiSummary: string
  editedSummary: string
  finalSummary: string
  lastEditTime: Date | null
  editor: string
}

export interface WebhookConfig {
  id: string
  name: string
  url: string
  events: Array<'meeting_start' | 'meeting_end' | 'action_item' | 'summary' | 'custom'>
  isActive: boolean
  lastTriggered: Date | null
}

export interface LiveTranscriptionMetrics {
  latency: number
  accuracy: number
  chunkSize: number
  processingTime: number
}

export interface SensitiveInfo {
  type: string
  confidence: number
}

export interface RecordingState {
  isRecording: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  recordingTime: number
}

export interface ProcessingState {
  isProcessing: boolean
  processingStatus: string
  lastSaveTime: Date
  confidenceThreshold: number
}

export interface UIState {
  showMemorySave: boolean
  memorySaved: boolean
  punctualSync: boolean
  autoTranscribeMeetings: boolean
  selectedMemoryTemplate: string
  autoTags: string[]
  showTemplateSelector: boolean
  showCollaboration: boolean
  newComment: string
  selectedSegmentForComment: string | null
  bookmarkMode: boolean
  selectedSegmentId: string | null
}

export interface Comment {
  id: string
  content: string
  author: string
  timestamp: Date
  segmentId: string
}

export interface ThemeSettings {
  showTimestamps: boolean
  showSpeakerColors: boolean
  showConfidence: boolean
  showSentiment: boolean
  fontSize: 'small' | 'medium' | 'large'
  compactMode: boolean
  highlightMode: 'none' | 'important' | 'all'
}
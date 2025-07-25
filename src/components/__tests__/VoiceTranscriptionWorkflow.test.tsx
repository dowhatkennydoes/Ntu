import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VoiceTranscriptionWorkflow } from '../VoiceTranscriptionWorkflow'

// Mock the WorkflowProvider
const mockWorkflowProvider = {
  nextStep: jest.fn(),
  addError: jest.fn(),
  updateWorkflowData: jest.fn()
}

jest.mock('../WorkflowProvider', () => ({
  useWorkflow: () => mockWorkflowProvider
}))

// Mock the hooks
jest.mock('@/hooks/useVoiceRecording', () => ({
  useVoiceRecording: () => ({
    recordingState: {
      isRecording: false,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      recordingTime: 0
    },
    startRecording: jest.fn().mockResolvedValue({ success: true }),
    stopRecording: jest.fn(),
    playAudio: jest.fn(),
    pauseAudio: jest.fn(),
    seekTo: jest.fn(),
    audioRef: { current: null },
    getAudioBlob: jest.fn()
  })
}))

jest.mock('@/hooks/useTranscription', () => ({
  useTranscription: () => ({
    transcriptSegments: [],
    speakers: [],
    processingState: {
      isProcessing: false,
      processingStatus: '',
      lastSaveTime: new Date(),
      confidenceThreshold: 0.7
    },
    addTranscriptSegment: jest.fn(),
    updateTranscriptSegment: jest.fn(),
    deleteTranscriptSegment: jest.fn(),
    simulateRealTimeTranscription: jest.fn(),
    processUploadedFile: jest.fn().mockResolvedValue({ success: true }),
    clearTranscription: jest.fn(),
    transcriptEndRef: { current: null },
    setProcessingState: jest.fn()
  })
}))

jest.mock('@/hooks/useVoiceAnalytics', () => ({
  useVoiceAnalytics: () => ({
    actionItems: [],
    highlights: [],
    topics: [],
    realTimeSentiment: {
      overall: 0,
      bySpeaker: {},
      recentChanges: []
    },
    rankedQuotes: [],
    analytics: {
      totalSegments: 0,
      averageSentiment: 0,
      topTopics: [],
      urgentItems: 0,
      speakerEngagement: 0
    },
    extractActionItems: jest.fn(),
    extractHighlights: jest.fn(),
    extractTopics: jest.fn(),
    updateSentimentAnalysis: jest.fn(),
    rankQuotes: jest.fn(),
    analyzeSegments: jest.fn(),
    setActionItems: jest.fn(),
    setHighlights: jest.fn(),
    setTopics: jest.fn(),
    setRealTimeSentiment: jest.fn(),
    setRankedQuotes: jest.fn()
  })
}))

describe('VoiceTranscriptionWorkflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<VoiceTranscriptionWorkflow />)
    expect(screen.getByText('Voice Transcription')).toBeInTheDocument()
  })

  it('displays the correct heading and description', () => {
    render(<VoiceTranscriptionWorkflow />)
    expect(screen.getByText('Voice Transcription')).toBeInTheDocument()
    expect(screen.getByText(/Record audio or upload files for AI-powered transcription/)).toBeInTheDocument()
  })

  it('shows quick stats section', () => {
    render(<VoiceTranscriptionWorkflow />)
    expect(screen.getByText('Quick Stats')).toBeInTheDocument()
    expect(screen.getByText('Segments')).toBeInTheDocument()
    expect(screen.getByText('Speakers')).toBeInTheDocument()
    expect(screen.getByText('Action Items')).toBeInTheDocument()
    expect(screen.getByText('Bookmarks')).toBeInTheDocument()
  })

  it('shows actions section with save memory button', () => {
    render(<VoiceTranscriptionWorkflow />)
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('Save as Memory')).toBeInTheDocument()
    expect(screen.getByText('Clear Transcript')).toBeInTheDocument()
  })

  it('shows analytics toggle button', () => {
    render(<VoiceTranscriptionWorkflow />)
    expect(screen.getByText('Hide Analytics')).toBeInTheDocument()
  })
})
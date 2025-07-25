'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useWorkflow } from './WorkflowProvider'
import { RecordingControls } from './voice/RecordingControls'
import { TranscriptViewer } from './voice/TranscriptViewer'
import { AnalyticsDashboard } from './voice/AnalyticsDashboard'
import { useVoiceRecording } from '@/hooks/useVoiceRecording'
import { useTranscription } from '@/hooks/useTranscription'
import { useVoiceAnalytics } from '@/hooks/useVoiceAnalytics'
import { 
  Bookmark, 
  Comment, 
  ThemeSettings,
  ActionItem,
  Highlight
} from '@/types/voice-transcription'
import { Memory } from '@/types/memory'
import {
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  CloudArrowUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export function VoiceTranscriptionWorkflow() {
  const { nextStep, addError, updateWorkflowData } = useWorkflow()
  
  // Helper function to create properly formatted errors
  const createError = useCallback((message: string, type: 'validation' | 'processing' | 'network' = 'processing') => {
    const error = {
      id: `error_${Date.now()}`,
      type,
      message,
      step: 'voice-transcription',
      timestamp: new Date().toISOString(),
      recoverable: true,
      retryCount: 0,
      maxRetries: 3
    }
    addError(error)
  }, [addError])
  
  // Custom hooks for state management
  const recording = useVoiceRecording()
  const transcription = useTranscription()
  const analytics = useVoiceAnalytics()

  // UI State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [showMemorySave, setShowMemorySave] = useState(false)
  const [memorySaved, setMemorySaved] = useState(false)
  
  // Theme and settings
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    showTimestamps: true,
    showSpeakerColors: true,
    showConfidence: false,
    showSentiment: false,
    fontSize: 'medium',
    compactMode: false,
    highlightMode: 'important'
  })

  // Auto-save functionality
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastAutoSave, setLastAutoSave] = useState<Date>(new Date())

  // Handle recording start
  const handleStartRecording = useCallback(async () => {
    const result = await recording.startRecording()
    if (!result.success) {
      createError(result.error || 'Failed to start recording')
    }
    return result
  }, [recording, createError])

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    const result = await transcription.processUploadedFile(file)
    if (!result.success) {
      createError(result.error || 'Failed to process file')
    }
    return result
  }, [transcription, createError])

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((segmentId: string) => {
    const segment = transcription.transcriptSegments.find(s => s.id === segmentId)
    if (!segment) return

    const isBookmarked = segment.isBookmarked || false
    
    // Update segment
    transcription.updateTranscriptSegment(segmentId, { isBookmarked: !isBookmarked })
    
    // Update bookmarks list
    if (isBookmarked) {
      setBookmarks(prev => prev.filter(b => b.id !== segmentId))
    } else {
      setBookmarks(prev => [...prev, {
        id: segmentId,
        timestamp: segment.startTime,
        label: segment.text.substring(0, 50) + '...'
      }])
    }
  }, [transcription])

  // Handle segment click
  const handleSegmentClick = useCallback((segmentId: string) => {
    setSelectedSegmentId(segmentId)
    const segment = transcription.transcriptSegments.find(s => s.id === segmentId)
    if (segment && recording.audioRef.current) {
      recording.seekTo(segment.startTime)
    }
  }, [transcription.transcriptSegments, recording])

  // Handle action item click
  const handleActionItemClick = useCallback((item: ActionItem) => {
    const segment = transcription.transcriptSegments.find(s => s.speaker === item.speaker && s.startTime === item.timestamp)
    if (segment) {
      setSelectedSegmentId(segment.id)
      recording.seekTo(item.timestamp)
    }
  }, [transcription.transcriptSegments, recording])

  // Handle highlight click
  const handleHighlightClick = useCallback((highlight: Highlight) => {
    setSelectedSegmentId(highlight.segmentId)
    recording.seekTo(highlight.timestamp)
  }, [recording])

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled) return

    const autoSaveInterval = setInterval(() => {
      if (transcription.transcriptSegments.length > 0) {
        setLastAutoSave(new Date())
        // Here you would implement actual save logic
        console.log('Auto-saving transcription...')
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [autoSaveEnabled, transcription.transcriptSegments.length])

  // Analytics update effect
  useEffect(() => {
    if (transcription.transcriptSegments.length > 0) {
      analytics.analyzeSegments(transcription.transcriptSegments)
    }
  }, [transcription.transcriptSegments, analytics])

  // Save as memory
  const handleSaveAsMemory = useCallback(async () => {
    if (transcription.transcriptSegments.length === 0) {
      createError('No transcript available to save', 'validation')
      return
    }

    try {
      const memoryData: Partial<Memory> = {
        title: `Voice Recording - ${new Date().toLocaleDateString()}`,
        content: transcription.transcriptSegments.map(s => `${s.speaker}: ${s.text}`).join('\n\n'),
        summary: `Voice transcription with ${transcription.transcriptSegments.length} segments, ${analytics.actionItems.length} action items`,
        category: 'audio',
        source: 'transcription',
        tags: analytics.topics.map(t => t.name).slice(0, 5),
        metadata: {
          participants: transcription.speakers.map(s => s.name),
          duration: recording.recordingState.duration,
          keywords: analytics.topics.map(t => t.name),
          sentiment: analytics.realTimeSentiment.overall > 0 ? 'positive' : 
                    analytics.realTimeSentiment.overall < 0 ? 'negative' : 'neutral',
          language: 'en',
          transcriptionConfidence: 0.89
        }
      }

      updateWorkflowData({
        transcription: {
          segments: transcription.transcriptSegments,
          speakers: transcription.speakers,
          analytics: analytics.analytics,
          memory: memoryData
        }
      })

      setMemorySaved(true)
      setShowMemorySave(false)
      
      setTimeout(() => {
        nextStep()
      }, 1000)
    } catch (error) {
      createError('Failed to save as memory')
    }
  }, [
    transcription.transcriptSegments,
    transcription.speakers,
    recording.recordingState.duration,
    analytics,
    updateWorkflowData,
    nextStep,
    createError
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Voice Transcription</h2>
            <p className="text-gray-600 mt-1">
              Record audio or upload files for AI-powered transcription and analysis
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {autoSaveEnabled && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Auto-save enabled</span>
              </div>
            )}
            
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <DocumentTextIcon className="w-4 h-4" />
              <span>{showAnalytics ? 'Hide' : 'Show'} Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recording Controls */}
      <RecordingControls
        recordingState={recording.recordingState}
        onStartRecording={handleStartRecording}
        onStopRecording={recording.stopRecording}
        onPlayAudio={recording.playAudio}
        onPauseAudio={recording.pauseAudio}
        onFileUpload={handleFileUpload}
        onSeekTo={recording.seekTo}
        isProcessing={transcription.processingState.isProcessing}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transcript Viewer */}
        <div className="lg:col-span-2">
          <TranscriptViewer
            segments={transcription.transcriptSegments}
            speakers={transcription.speakers}
            themeSettings={themeSettings}
            onSegmentClick={handleSegmentClick}
            onBookmarkToggle={handleBookmarkToggle}
            selectedSegmentId={selectedSegmentId}
            transcriptEndRef={transcription.transcriptEndRef}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Segments</span>
                <span className="font-medium">{transcription.transcriptSegments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Speakers</span>
                <span className="font-medium">{transcription.speakers.filter(s => s.segments > 0).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Action Items</span>
                <span className="font-medium">{analytics.actionItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bookmarks</span>
                <span className="font-medium">{bookmarks.length}</span>
              </div>
            </div>
          </div>

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <BookmarkIcon className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">Bookmarks</h3>
              </div>
              <div className="space-y-2">
                {bookmarks.slice(0, 3).map((bookmark) => (
                  <button
                    key={bookmark.id}
                    onClick={() => recording.seekTo(bookmark.timestamp)}
                    className="w-full text-left p-2 text-sm bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-gray-900 truncate">
                      {bookmark.label}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {Math.floor(bookmark.timestamp / 60)}:{Math.floor(bookmark.timestamp % 60).toString().padStart(2, '0')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowMemorySave(true)}
                disabled={transcription.transcriptSegments.length === 0}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CloudArrowUpIcon className="w-4 h-4" />
                <span>Save as Memory</span>
              </button>
              
              <button
                onClick={transcription.clearTranscription}
                disabled={transcription.transcriptSegments.length === 0}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Clear Transcript</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <AnalyticsDashboard
          actionItems={analytics.actionItems}
          highlights={analytics.highlights}
          topics={analytics.topics}
          sentiment={analytics.realTimeSentiment}
          quotes={analytics.rankedQuotes}
          onActionItemClick={handleActionItemClick}
          onHighlightClick={handleHighlightClick}
        />
      )}

      {/* Save Memory Modal */}
      {showMemorySave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save as Memory</h3>
            <p className="text-gray-600 mb-6">
              This will save your voice transcription and analysis as a memory that can be referenced later.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveAsMemory}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Memory
              </button>
              <button
                onClick={() => setShowMemorySave(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {memorySaved && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          Memory saved successfully!
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={recording.audioRef} style={{ display: 'none' }} />
    </div>
  )
}
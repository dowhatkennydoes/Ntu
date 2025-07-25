import React from 'react'
import { 
  UserIcon,
  ClockIcon,
  BookmarkIcon,
  SignalIcon
} from '@heroicons/react/24/outline'
import { TranscriptSegment, Speaker, ThemeSettings } from '@/types/voice-transcription'

interface TranscriptViewerProps {
  segments: TranscriptSegment[]
  speakers: Speaker[]
  themeSettings?: ThemeSettings
  onSegmentClick?: (segmentId: string) => void
  onBookmarkToggle?: (segmentId: string) => void
  selectedSegmentId?: string | null
  transcriptEndRef?: React.RefObject<HTMLDivElement>
}

const defaultThemeSettings: ThemeSettings = {
  showTimestamps: true,
  showSpeakerColors: true,
  showConfidence: false,
  showSentiment: false,
  fontSize: 'medium',
  compactMode: false,
  highlightMode: 'important'
}

export const TranscriptViewer = React.memo<TranscriptViewerProps>(({
  segments,
  speakers,
  themeSettings = defaultThemeSettings,
  onSegmentClick,
  onBookmarkToggle,
  selectedSegmentId,
  transcriptEndRef
}) => {
  const getSpeakerInfo = (speakerId: string) => {
    return speakers.find(speaker => speaker.id === speakerId) || {
      id: speakerId,
      name: speakerId,
      color: 'bg-gray-500',
      segments: 0,
      totalDuration: 0,
      averageConfidence: 0
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSentimentColor = (sentiment?: number) => {
    if (!sentiment) return 'text-gray-500'
    if (sentiment > 0.3) return 'text-green-500'
    if (sentiment < -0.3) return 'text-red-500'
    return 'text-gray-500'
  }

  const shouldHighlight = (segment: TranscriptSegment) => {
    if (themeSettings.highlightMode === 'none') return false
    if (themeSettings.highlightMode === 'all') return true
    
    return segment.isActionItem || 
           segment.isQuestion || 
           segment.isDecision || 
           segment.isBookmarked ||
           (segment.urgencyScore || 0) > 0.6
  }

  const getFontSizeClass = () => {
    switch (themeSettings.fontSize) {
      case 'small': return 'text-sm'
      case 'large': return 'text-lg'
      default: return 'text-base'
    }
  }

  if (segments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
        <div className="text-gray-400 mb-4">
          <UserIcon className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcript Available</h3>
        <p className="text-gray-600">Start recording or upload an audio file to see the transcription here.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Transcript</h3>
        <div className="text-sm text-gray-500">
          {segments.length} segments
        </div>
      </div>

      <div className={`space-y-${themeSettings.compactMode ? '2' : '4'} max-h-96 overflow-y-auto`}>
        {segments.map((segment) => {
          const speaker = getSpeakerInfo(segment.speaker)
          const isSelected = selectedSegmentId === segment.id
          const isHighlighted = shouldHighlight(segment)

          return (
            <div
              key={segment.id}
              onClick={() => onSegmentClick?.(segment.id)}
              className={`
                p-4 rounded-lg border transition-all cursor-pointer
                ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}
                ${isHighlighted ? 'ring-2 ring-yellow-200' : ''}
                hover:bg-gray-100
              `}
            >
              {/* Speaker Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {themeSettings.showSpeakerColors && (
                    <div className={`w-3 h-3 rounded-full ${speaker.color}`}></div>
                  )}
                  <span className="font-medium text-gray-900">{speaker.name}</span>
                  
                  {themeSettings.showTimestamps && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <ClockIcon className="w-3 h-3" />
                      <span>{formatTime(segment.startTime)}</span>
                    </div>
                  )}

                  {themeSettings.showConfidence && (
                    <div className="flex items-center space-x-1 text-xs">
                      <SignalIcon className="w-3 h-3" />
                      <span className={getConfidenceColor(segment.confidence)}>
                        {Math.round(segment.confidence * 100)}%
                      </span>
                    </div>
                  )}

                  {themeSettings.showSentiment && segment.sentimentScore !== undefined && (
                    <div className={`text-xs ${getSentimentColor(segment.sentimentScore)}`}>
                      {segment.emotionalTone || 'neutral'}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {segment.isActionItem && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Action Item
                    </span>
                  )}
                  
                  {segment.isQuestion && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Question
                    </span>
                  )}
                  
                  {segment.isDecision && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Decision
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onBookmarkToggle?.(segment.id)
                    }}
                    className={`p-1 rounded transition-colors ${
                      segment.isBookmarked 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <BookmarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Transcript Text */}
              <div className={`${getFontSizeClass()} text-gray-900 leading-relaxed`}>
                {segment.text}
              </div>

              {/* Segment Metadata */}
              {!themeSettings.compactMode && (
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    {segment.punctuationCorrected && (
                      <span className="flex items-center space-x-1">
                        <span>✓</span>
                        <span>Corrected</span>
                      </span>
                    )}
                    
                    {segment.nonVerbalCues && segment.nonVerbalCues.length > 0 && (
                      <span className="italic">
                        [{segment.nonVerbalCues.join(', ')}]
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {segment.urgencyScore !== undefined && segment.urgencyScore > 0.5 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                        Urgent
                      </span>
                    )}
                    
                    {segment.isLive && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        Live
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        
        <div ref={transcriptEndRef} />
      </div>
    </div>
  )
})

TranscriptViewer.displayName = 'TranscriptViewer'
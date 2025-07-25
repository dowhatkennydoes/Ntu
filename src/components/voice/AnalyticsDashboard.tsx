import React from 'react'
import { 
  ChartBarIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { 
  ActionItem, 
  Highlight, 
  Topic, 
  RealTimeSentiment,
  Quote 
} from '@/types/voice-transcription'

interface AnalyticsDashboardProps {
  actionItems: ActionItem[]
  highlights: Highlight[]
  topics: Topic[]
  sentiment: RealTimeSentiment
  quotes: Quote[]
  onActionItemClick?: (item: ActionItem) => void
  onHighlightClick?: (highlight: Highlight) => void
}

export const AnalyticsDashboard = React.memo<AnalyticsDashboardProps>(({
  actionItems,
  highlights,
  topics,
  sentiment,
  quotes,
  onActionItemClick,
  onHighlightClick
}) => {
  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-500'
    if (score < -0.3) return 'text-red-500'
    return 'text-gray-500'
  }

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Positive'
    if (score < -0.3) return 'Negative'
    return 'Neutral'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Action Items</p>
              <p className="text-2xl font-bold text-gray-900">{actionItems.length}</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Highlights</p>
              <p className="text-2xl font-bold text-gray-900">{highlights.length}</p>
            </div>
            <TagIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Topics</p>
              <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
            </div>
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sentiment</p>
              <p className={`text-2xl font-bold ${getSentimentColor(sentiment.overall)}`}>
                {getSentimentLabel(sentiment.overall)}
              </p>
            </div>
            <HeartIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
          <span className="text-sm text-gray-500">{actionItems.length} items</span>
        </div>

        {actionItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No action items detected</p>
        ) : (
          <div className="space-y-3">
            {actionItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onActionItemClick?.(item)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.text}</p>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      <span>Speaker: {item.speaker}</span>
                      <span>Time: {formatTime(item.timestamp)}</span>
                      {item.assignedTo && <span>Assigned: {item.assignedTo}</span>}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topics */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Key Topics</h3>
          <span className="text-sm text-gray-500">{topics.length} topics</span>
        </div>

        {topics.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No topics identified</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.slice(0, 6).map((topic, index) => (
              <div key={topic.name} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">{topic.name}</h4>
                  <span className="text-sm font-medium text-blue-600">×{topic.frequency}</span>
                </div>
                <div className="text-xs text-gray-500">
                  First mentioned at {formatTime(topic.firstMention)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Sentiment */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Overall Sentiment</h4>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    sentiment.overall > 0 ? 'bg-green-500' : sentiment.overall < 0 ? 'bg-red-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${Math.abs(sentiment.overall) * 100}%` }}
                ></div>
              </div>
              <span className={`font-medium ${getSentimentColor(sentiment.overall)}`}>
                {(sentiment.overall * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Speaker Sentiment */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">By Speaker</h4>
            <div className="space-y-2">
              {Object.entries(sentiment.bySpeaker).map(([speaker, score]) => (
                <div key={speaker} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{speaker}</span>
                  <span className={`font-medium ${getSentimentColor(score)}`}>
                    {getSentimentLabel(score)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Quotes */}
      {quotes.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Key Quotes</h3>
            <span className="text-sm text-gray-500">{quotes.length} quotes</span>
          </div>

          <div className="space-y-4">
            {quotes.map((quote, index) => (
              <div key={quote.segmentId} className="border-l-4 border-blue-500 pl-4">
                <blockquote className="text-gray-900 italic">"{quote.text}"</blockquote>
                <div className="mt-2 text-xs text-gray-500">
                  Importance Score: {(quote.importance * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

AnalyticsDashboard.displayName = 'AnalyticsDashboard'
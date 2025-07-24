import React, { useState, useEffect } from 'react'
import { 
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MinusIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface MeetingAnalytics {
  totalMeetings: number
  totalDuration: number
  totalTranscripts: number
  totalSummaries: number
  averageMeetingLength: number
  mostActiveSpeakers: Array<{ speaker: string; count: number }>
  commonTopics: string[]
  actionItemsCompleted: number
  actionItemsPending: number
}

interface MeetingAnalyticsDashboardProps {
  userId: string
}

export default function MeetingAnalyticsDashboard({ userId }: MeetingAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<MeetingAnalytics | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [userId, timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/meetings/analytics?userId=${userId}&timeRange=${timeRange}`)
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load analytics')
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
      setError(error instanceof Error ? error.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
    } else if (current < previous) {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
    }
    return <MinusIcon className="w-4 h-4 text-gray-600" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Start having meetings to see analytics insights</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Analytics</h2>
          <p className="text-gray-600">Insights from your meeting activity</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Meetings</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalMeetings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Duration</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.totalDuration)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Meeting Length</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.averageMeetingLength)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Action Items</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.actionItemsPending}</p>
              <p className="text-xs text-gray-500">pending</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meeting Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Transcripts Generated</span>
              </div>
              <span className="font-medium text-gray-900">{analytics.totalTranscripts}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Summaries Created</span>
              </div>
              <span className="font-medium text-gray-900">{analytics.totalSummaries}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Active Speakers</span>
              </div>
              <span className="font-medium text-gray-900">{analytics.mostActiveSpeakers.length}</span>
            </div>
          </div>
        </div>

        {/* Action Items Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Items Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900">{analytics.actionItemsCompleted}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-gray-900">{analytics.actionItemsPending}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-medium text-gray-900">
                  {analytics.actionItemsCompleted + analytics.actionItemsPending > 0
                    ? Math.round((analytics.actionItemsCompleted / (analytics.actionItemsCompleted + analytics.actionItemsPending)) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Most Active Speakers */}
      {analytics.mostActiveSpeakers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Speakers</h3>
          <div className="space-y-3">
            {analytics.mostActiveSpeakers.slice(0, 5).map((speaker, index) => (
              <div key={speaker.speaker} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {speaker.speaker.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">{speaker.speaker}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">{speaker.count} mentions</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Topics */}
      {analytics.commonTopics.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Topics</h3>
          <div className="flex flex-wrap gap-2">
            {analytics.commonTopics.slice(0, 10).map((topic, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Insights</h3>
        <div className="space-y-2 text-sm text-blue-800">
          {analytics.averageMeetingLength > 60 && (
            <p>• Your average meeting length is {formatDuration(analytics.averageMeetingLength)}. Consider shorter, more focused meetings.</p>
          )}
          
          {analytics.actionItemsPending > analytics.actionItemsCompleted && (
            <p>• You have more pending action items than completed ones. Consider reviewing and prioritizing tasks.</p>
          )}
          
          {analytics.totalMeetings > 0 && analytics.totalSummaries === 0 && (
            <p>• No meeting summaries generated yet. Enable auto-summarization to get AI-powered insights.</p>
          )}
          
          {analytics.totalMeetings > 0 && (
            <p>• You've spent {formatDuration(analytics.totalDuration)} in meetings this {timeRange}.</p>
          )}
        </div>
      </div>
    </div>
  )
} 
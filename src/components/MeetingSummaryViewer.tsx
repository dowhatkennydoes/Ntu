import React, { useState, useEffect } from 'react'
import { 
  DocumentTextIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface MeetingSummary {
  id: string
  meeting_id: string
  user_id: string
  content: string
  agenda?: string
  key_takeaways: string[]
  action_items: string[]
  participants: string[]
  model_used: string
  input_tokens: number
  output_tokens: number
  confidence_score: number
  is_edited: boolean
  created_at: string
  updated_at: string
}

interface MeetingSummaryViewerProps {
  meetingId: string
  userId: string
  onClose: () => void
}

export default function MeetingSummaryViewer({ 
  meetingId, 
  userId, 
  onClose 
}: MeetingSummaryViewerProps) {
  const [summary, setSummary] = useState<MeetingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<MeetingSummary>>({})

  useEffect(() => {
    loadSummary()
  }, [meetingId, userId])

  const loadSummary = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/meetings/summaries?userId=${userId}&meetingId=${meetingId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.summaries && data.summaries.length > 0) {
          setSummary(data.summaries[0])
          setEditData(data.summaries[0])
        } else {
          setError('No summary found for this meeting')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load summary')
      }
    } catch (error) {
      console.error('Failed to load summary:', error)
      setError(error instanceof Error ? error.message : 'Failed to load summary')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!summary) return

    try {
      const response = await fetch('/api/meetings/summaries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryId: summary.id,
          userId,
          updates: editData,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
        setEditData(data.summary)
        setIsEditing(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update summary')
      }
    } catch (error) {
      console.error('Failed to update summary:', error)
      setError(error instanceof Error ? error.message : 'Failed to update summary')
    }
  }

  const handleCancel = () => {
    if (summary) {
      setEditData(summary)
    }
    setIsEditing(false)
  }

  const updateEditField = (field: keyof MeetingSummary, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const addActionItem = () => {
    const newActionItems = [...(editData.action_items || []), '']
    updateEditField('action_items', newActionItems)
  }

  const updateActionItem = (index: number, value: string) => {
    const newActionItems = [...(editData.action_items || [])]
    newActionItems[index] = value
    updateEditField('action_items', newActionItems)
  }

  const removeActionItem = (index: number) => {
    const newActionItems = (editData.action_items || []).filter((_, i) => i !== index)
    updateEditField('action_items', newActionItems)
  }

  const addTakeaway = () => {
    const newTakeaways = [...(editData.key_takeaways || []), '']
    updateEditField('key_takeaways', newTakeaways)
  }

  const updateTakeaway = (index: number, value: string) => {
    const newTakeaways = [...(editData.key_takeaways || [])]
    newTakeaways[index] = value
    updateEditField('key_takeaways', newTakeaways)
  }

  const removeTakeaway = (index: number) => {
    const newTakeaways = (editData.key_takeaways || []).filter((_, i) => i !== index)
    updateEditField('key_takeaways', newTakeaways)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Summary</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center">
            <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Summary Available</h3>
            <p className="text-gray-600 mb-4">This meeting doesn't have a summary yet.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Meeting Summary</h2>
            {summary.is_edited && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Edited
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span>Created: {new Date(summary.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-4 h-4" />
              <span>{summary.participants.length} participants</span>
            </div>
            <div className="flex items-center space-x-2">
              <TagIcon className="w-4 h-4" />
              <span>Model: {summary.model_used}</span>
            </div>
          </div>

          {/* Agenda */}
          {summary.agenda && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Agenda</h3>
              {isEditing ? (
                <textarea
                  value={editData.agenda || ''}
                  onChange={(e) => updateEditField('agenda', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              ) : (
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{summary.agenda}</p>
              )}
            </div>
          )}

          {/* Key Takeaways */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Takeaways</h3>
            {isEditing ? (
              <div className="space-y-2">
                {(editData.key_takeaways || []).map((takeaway, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={takeaway}
                      onChange={(e) => updateTakeaway(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter key takeaway..."
                    />
                    <button
                      onClick={() => removeTakeaway(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTakeaway}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Takeaway
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {summary.key_takeaways.map((takeaway, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{takeaway}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Action Items</h3>
            {isEditing ? (
              <div className="space-y-2">
                {(editData.action_items || []).map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateActionItem(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter action item..."
                    />
                    <button
                      onClick={() => removeActionItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addActionItem}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Action Item
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {summary.action_items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Summary</h3>
            {isEditing ? (
              <textarea
                value={editData.content || ''}
                onChange={(e) => updateEditField('content', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={8}
              />
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{summary.content}</p>
              </div>
            )}
          </div>

          {/* Participants */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Participants</h3>
            <div className="flex flex-wrap gap-2">
              {summary.participants.map((participant, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  <UserGroupIcon className="w-3 h-3 mr-1" />
                  {participant}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CpuChipIcon, 
  SparklesIcon, 
  PauseIcon,
  PlayIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShareIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { AIRequest, AIRequestStatus, AIRequestType, AIParameters } from '@/types/ai'

interface AIAssistantProps {
  onComplete: (result: any) => void
  onCancel: () => void
  initialRequest?: string
}

interface AIAction {
  id: string
  type: 'pause' | 'explain' | 'undo' | 'continue'
  label: string
  description: string
  icon: React.ComponentType<any>
  disabled?: boolean
}

export default function AIAssistant({ onComplete, onCancel, initialRequest }: AIAssistantProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<AIRequest | null>(null)
  const [requestHistory, setRequestHistory] = useState<AIRequest[]>([])
  const [userInput, setUserInput] = useState(initialRequest || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [confidence, setConfidence] = useState(0.85)
  const [showExplanation, setShowExplanation] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const actions: AIAction[] = [
    {
      id: 'pause',
      type: 'pause',
      label: 'Pause',
      description: 'Pause current processing',
      icon: PauseIcon,
      disabled: !isProcessing
    },
    {
      id: 'explain',
      type: 'explain',
      label: 'Explain',
      description: 'Explain what I\'m doing',
      icon: ChatBubbleLeftRightIcon
    },
    {
      id: 'undo',
      type: 'undo',
      label: 'Undo',
      description: 'Undo last action',
      icon: ArrowPathIcon,
      disabled: requestHistory.length === 0
    },
    {
      id: 'continue',
      type: 'continue',
      label: 'Continue',
      description: 'Continue where I left off',
      icon: PlayIcon,
      disabled: isProcessing
    }
  ]

  useEffect(() => {
    if (initialRequest) {
      handleSubmitRequest(initialRequest)
    }
  }, [initialRequest])

  const handleSubmitRequest = async (request: string) => {
    if (!request.trim()) return

    const aiRequest: AIRequest = {
      id: `req-${Date.now()}`,
      type: 'summarize',
      input: request,
      parameters: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        confidenceThreshold: 0.7
      },
      priority: 'medium',
      status: 'pending',
      createdAt: new Date()
    }

    setCurrentRequest(aiRequest)
    setRequestHistory(prev => [...prev, aiRequest])
    setIsActive(true)
    setIsProcessing(true)

    // Simulate AI processing
    await simulateAIProcessing(aiRequest)
  }

  const simulateAIProcessing = async (request: AIRequest) => {
    // Update status to processing
    setCurrentRequest(prev => prev ? { ...prev, status: 'processing', startedAt: new Date() } : null)

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Complete the request
    const completedRequest: AIRequest = {
      ...request,
      status: 'completed',
      completedAt: new Date(),
      result: {
        summary: `AI-generated summary of: "${request.input}"`,
        insights: ['Key insight 1', 'Key insight 2', 'Key insight 3'],
        recommendations: ['Recommendation 1', 'Recommendation 2'],
        confidence: confidence
      },
      confidence: confidence,
      cost: 0.05
    }

    setCurrentRequest(completedRequest)
    setRequestHistory(prev => prev.map(req => req.id === request.id ? completedRequest : req))
    setIsProcessing(false)
  }

  const handleAction = (action: AIAction) => {
    switch (action.type) {
      case 'pause':
        setIsProcessing(false)
        break
      case 'explain':
        setShowExplanation(!showExplanation)
        break
      case 'undo':
        if (requestHistory.length > 0) {
          const newHistory = requestHistory.slice(0, -1)
          setRequestHistory(newHistory)
          setCurrentRequest(newHistory[newHistory.length - 1] || null)
        }
        break
      case 'continue':
        if (currentRequest && currentRequest.status === 'pending') {
          simulateAIProcessing(currentRequest)
        }
        break
    }
  }

  const handleComplete = () => {
    if (currentRequest?.result) {
      onComplete(currentRequest.result)
    }
  }

  const getStatusColor = (status: AIRequestStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: AIRequestStatus) => {
    switch (status) {
      case 'pending': return ClockIcon
      case 'processing': return CpuChipIcon
      case 'completed': return CheckIcon
      case 'failed': return ExclamationTriangleIcon
      default: return ClockIcon
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Assistant (Mere)</h2>
              <p className="text-gray-600">Your intelligent workflow companion</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Confidence Indicator */}
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-sm text-gray-600">Confidence:</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-green-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${confidence * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ask Mere</h3>
            
            <div className="space-y-4">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Tell Mere what you need help with..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              
              <button
                onClick={() => handleSubmitRequest(userInput)}
                disabled={!userInput.trim() || isProcessing}
                className="w-full btn btn-primary"
              >
                {isProcessing ? 'Processing...' : 'Send Request'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                {[
                  'Summarize this document',
                  'Create a memory from this',
                  'Generate a workflow',
                  'Find related content'
                ].map((action) => (
                  <button
                    key={action}
                    onClick={() => setUserInput(action)}
                    className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Processing Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Current Request</h3>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                {actions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action)}
                      disabled={action.disabled}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title={action.description}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
            </div>

            {currentRequest ? (
              <div className="space-y-4">
                {/* Request Status */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  {(() => {
                    const StatusIcon = getStatusIcon(currentRequest.status)
                    return (
                      <StatusIcon className={`h-5 w-5 ${getStatusColor(currentRequest.status).split(' ')[0]}`} />
                    )
                  })()}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {currentRequest.input}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentRequest.status} • {currentRequest.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(currentRequest.status)}`}>
                    {currentRequest.status}
                  </span>
                </div>

                {/* Processing Animation */}
                {isProcessing && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Mere is processing your request...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This usually takes a few seconds
                    </p>
                  </div>
                )}

                {/* Results */}
                {currentRequest.result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                      <p className="text-gray-600">{currentRequest.result.summary}</p>
                    </div>

                    {currentRequest.result.insights && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
                        <ul className="space-y-1">
                          {currentRequest.result.insights.map((insight: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentRequest.result.recommendations && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {currentRequest.result.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="text-blue-500 mr-2">→</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <button className="btn btn-outline btn-sm">
                        <ShareIcon className="h-4 w-4 mr-2" />
                        Share
                      </button>
                      <button onClick={handleComplete} className="btn btn-primary btn-sm">
                        Use Result
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Explanation */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-blue-50 rounded-lg"
                  >
                    <h4 className="font-medium text-blue-900 mb-2">What Mere is doing:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Analyzing your request for context and intent</li>
                      <li>• Processing the input using AI models</li>
                      <li>• Generating relevant insights and recommendations</li>
                      <li>• Ensuring confidence levels meet quality standards</li>
                    </ul>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No active request. Ask Mere something to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request History */}
      {requestHistory.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Request History</h4>
          <div className="space-y-2">
            {requestHistory.slice(-5).reverse().map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {(() => {
                    const StatusIcon = getStatusIcon(request.status)
                    return (
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(request.status).split(' ')[0]}`} />
                    )
                  })()}
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-md">
                      {request.input}
                    </p>
                    <p className="text-xs text-gray-500">
                      {request.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
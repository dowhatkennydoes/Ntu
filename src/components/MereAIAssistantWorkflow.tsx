'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  SparklesIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  BookOpenIcon,
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CloudIcon,
  ComputerDesktopIcon,
  KeyIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  memoryBinding: boolean
  appContext?: string
  tags: string[]
  model: string
  settings: ChatSettings
  statistics: ChatStatistics
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  model?: string
  memoryContext?: MemoryContext[]
  appActions?: AppAction[]
  confidence?: number
  tokens?: number
  processingTime?: number
  userFeedback?: 'helpful' | 'not-helpful' | null
}

interface MemoryContext {
  id: string
  type: 'memory' | 'document' | 'notebook' | 'workflow'
  title: string
  content: string
  relevance: number
  source: string
}

interface AppAction {
  id: string
  type: 'create_document' | 'start_workflow' | 'search_memory' | 'export_data' | 'schedule_meeting'
  title: string
  description: string
  parameters: Record<string, any>
  status: 'suggested' | 'approved' | 'executed' | 'rejected'
  userPermission: 'always' | 'session' | 'never'
}

interface ChatSettings {
  model: 'gpt-4' | 'claude-3' | 'gemini-pro' | 'local'
  temperature: number
  maxTokens: number
  memoryBinding: boolean
  appIntegration: boolean
  responseSpeed: 'fast' | 'balanced' | 'thorough'
  privacyMode: boolean
  complianceLevel: 'public' | 'internal' | 'confidential' | 'restricted'
}

interface ChatStatistics {
  totalMessages: number
  totalTokens: number
  averageResponseTime: number
  memoryHits: number
  appActions: number
  userSatisfaction: number
}

interface MereConfig {
  drawerPosition: 'bottom' | 'right' | 'floating'
  autoStart: boolean
  defaultModel: string
  memoryIntegration: boolean
  appIntegration: boolean
  privacySettings: PrivacySettings
  performanceSettings: PerformanceSettings
}

interface PrivacySettings {
  dataRetention: 'session' | '24h' | '7d' | '30d' | 'indefinite'
  memorySharing: boolean
  appDataSharing: boolean
  complianceMode: 'standard' | 'hipaa' | 'ferpa' | 'gdpr'
}

interface PerformanceSettings {
  responseTimeout: number
  maxConcurrentRequests: number
  cacheEnabled: boolean
  offlineMode: boolean
}

export default function MereAIAssistantWorkflow() {
  const [currentView, setCurrentView] = useState<'chat' | 'sessions' | 'settings' | 'analytics'>('chat')
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState<AppAction | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mereConfig, setMereConfig] = useState<MereConfig>({
    drawerPosition: 'floating',
    autoStart: true,
    defaultModel: 'gpt-4',
    memoryIntegration: true,
    appIntegration: true,
    privacySettings: {
      dataRetention: '7d',
      memorySharing: true,
      appDataSharing: true,
      complianceMode: 'standard'
    },
    performanceSettings: {
      responseTimeout: 30000,
      maxConcurrentRequests: 3,
      cacheEnabled: true,
      offlineMode: false
    }
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sample sessions
  const sampleSessions: ChatSession[] = [
    {
      id: '1',
      title: 'Product Strategy Discussion',
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Can you help me create a product strategy document for Q4?',
          timestamp: new Date('2024-12-14T10:00:00'),
          tokens: 15
        },
        {
          id: '2',
          role: 'assistant',
          content: 'I\'d be happy to help you create a product strategy document for Q4! I can see from your memory that you\'ve been working on user experience improvements and performance optimization. Would you like me to start a new document in Junction, or would you prefer to discuss the strategy first?',
          timestamp: new Date('2024-12-14T10:00:01'),
          model: 'gpt-4',
          memoryContext: [
            {
              id: '1',
              type: 'memory',
              title: 'Q4 Planning Notes',
              content: 'Focus on UX improvements and performance optimization',
              relevance: 0.9,
              source: 'memory'
            }
          ],
          appActions: [
            {
              id: '1',
              type: 'create_document',
              title: 'Create Q4 Strategy Document',
              description: 'Start a new document in Junction for Q4 product strategy',
              parameters: { title: 'Q4 Product Strategy', notebook: 'Product Strategy' },
              status: 'suggested',
              userPermission: 'session'
            }
          ],
          confidence: 0.95,
          tokens: 45,
          processingTime: 1200
        }
      ],
      createdAt: new Date('2024-12-14T10:00:00'),
      updatedAt: new Date('2024-12-14T10:01:00'),
      isActive: true,
      memoryBinding: true,
      appContext: 'product-strategy',
      tags: ['strategy', 'product', 'q4'],
      model: 'gpt-4',
      settings: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        memoryBinding: true,
        appIntegration: true,
        responseSpeed: 'balanced',
        privacyMode: false,
        complianceLevel: 'internal'
      },
      statistics: {
        totalMessages: 2,
        totalTokens: 60,
        averageResponseTime: 1200,
        memoryHits: 1,
        appActions: 1,
        userSatisfaction: 0.9
      }
    },
    {
      id: '2',
      title: 'Meeting Transcription Help',
      messages: [
        {
          id: '3',
          role: 'user',
          content: 'I need help analyzing the sentiment from my last meeting',
          timestamp: new Date('2024-12-14T09:00:00'),
          tokens: 12
        },
        {
          id: '4',
          role: 'assistant',
          content: 'I can help you analyze the sentiment from your meeting! I found a recent transcription in Yonder. Would you like me to run a sentiment analysis on it, or would you prefer to use the Voice Intelligence workflow for more detailed analytics?',
          timestamp: new Date('2024-12-14T09:00:01'),
          model: 'gpt-4',
          memoryContext: [
            {
              id: '2',
              type: 'document',
              title: 'Q4 Strategy Meeting Transcript',
              content: 'Meeting transcript from yesterday\'s strategy session',
              relevance: 0.8,
              source: 'yonder'
            }
          ],
          appActions: [
            {
              id: '2',
              type: 'start_workflow',
              title: 'Run Sentiment Analysis',
              description: 'Use Voice Intelligence workflow to analyze meeting sentiment',
              parameters: { workflow: 'voice-intelligence', action: 'sentiment-analysis' },
              status: 'suggested',
              userPermission: 'session'
            }
          ],
          confidence: 0.88,
          tokens: 35,
          processingTime: 800
        }
      ],
      createdAt: new Date('2024-12-14T09:00:00'),
      updatedAt: new Date('2024-12-14T09:01:00'),
      isActive: false,
      memoryBinding: true,
      appContext: 'meeting-analysis',
      tags: ['meeting', 'sentiment', 'analysis'],
      model: 'gpt-4',
      settings: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        memoryBinding: true,
        appIntegration: true,
        responseSpeed: 'balanced',
        privacyMode: false,
        complianceLevel: 'internal'
      },
      statistics: {
        totalMessages: 2,
        totalTokens: 47,
        averageResponseTime: 800,
        memoryHits: 1,
        appActions: 1,
        userSatisfaction: 0.85
      }
    }
  ]

  useEffect(() => {
    setSessions(sampleSessions)
    if (mereConfig.autoStart && sessions.length === 0) {
      createNewSession()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Create new session
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      memoryBinding: mereConfig.memoryIntegration,
      tags: [],
      model: mereConfig.defaultModel,
      settings: {
        model: mereConfig.defaultModel as any,
        temperature: 0.7,
        maxTokens: 2000,
        memoryBinding: mereConfig.memoryIntegration,
        appIntegration: mereConfig.appIntegration,
        responseSpeed: 'balanced',
        privacyMode: mereConfig.privacySettings.complianceMode !== 'standard',
        complianceLevel: mereConfig.privacySettings.complianceMode as any
      },
      statistics: {
        totalMessages: 0,
        totalTokens: 0,
        averageResponseTime: 0,
        memoryHits: 0,
        appActions: 0,
        userSatisfaction: 0
      }
    }
    
    setSessions(prev => [newSession, ...prev])
    setCurrentSession(newSession)
    
    // Deactivate other sessions
    setSessions(prev => prev.map(s => ({ ...s, isActive: s.id === newSession.id })))
  }

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentSession) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      tokens: content.split(' ').length
    }

    // Add user message
    setCurrentSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage],
      updatedAt: new Date()
    } : null)

    setMessageInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(content),
        timestamp: new Date(),
        model: currentSession?.model || 'gpt-4',
        memoryContext: generateMemoryContext(),
        appActions: generateAppActions(),
        confidence: 0.9 + Math.random() * 0.1,
        tokens: 30 + Math.floor(Math.random() * 50),
        processingTime: 800 + Math.floor(Math.random() * 1200)
      }

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage],
        updatedAt: new Date(),
        statistics: {
          ...prev.statistics,
          totalMessages: prev.statistics.totalMessages + 2,
          totalTokens: prev.statistics.totalTokens + (userMessage.tokens || 0) + (aiMessage.tokens || 0),
          averageResponseTime: (prev.statistics.averageResponseTime + (aiMessage.processingTime || 0)) / 2,
          memoryHits: prev.statistics.memoryHits + (aiMessage.memoryContext?.length || 0),
          appActions: prev.statistics.appActions + (aiMessage.appActions?.length || 0)
        }
      } : null)

      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  // Generate AI response
  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "I understand you're asking about that. Let me help you with that.",
      "Based on your question, I can provide some insights and suggestions.",
      "That's an interesting topic. Let me break this down for you.",
      "I can help you with that. Here's what I found from your memory and available resources.",
      "Great question! Let me analyze this and provide you with a comprehensive answer."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Generate memory context
  const generateMemoryContext = (): MemoryContext[] => {
    if (Math.random() > 0.7) {
      return [
        {
          id: '1',
          type: 'memory',
          title: 'Relevant Memory',
          content: 'Found relevant information from your previous interactions',
          relevance: 0.8 + Math.random() * 0.2,
          source: 'memory'
        }
      ]
    }
    return []
  }

  // Generate app actions
  const generateAppActions = (): AppAction[] => {
    if (Math.random() > 0.6) {
      const actions = [
        {
          id: '1',
          type: 'create_document' as const,
          title: 'Create Document',
          description: 'Start a new document in Junction',
          parameters: { title: 'New Document', notebook: 'General' },
          status: 'suggested' as const,
          userPermission: 'session' as const
        },
        {
          id: '2',
          type: 'start_workflow' as const,
          title: 'Start Workflow',
          description: 'Begin a new workflow process',
          parameters: { workflow: 'voice-transcription' },
          status: 'suggested' as const,
          userPermission: 'session' as const
        }
      ]
      return [actions[Math.floor(Math.random() * actions.length)]]
    }
    return []
  }

  // Handle app action
  const handleAppAction = (action: AppAction, permission: 'always' | 'session' | 'never') => {
    setSelectedAction(action)
    setShowActionModal(true)
  }

  // Execute app action
  const executeAppAction = (action: AppAction) => {
    console.log('Executing action:', action)
    setShowActionModal(false)
    setSelectedAction(null)
  }

  const renderChat = () => (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold">Mere AI Assistant</h2>
            {currentSession?.memoryBinding && (
                              <CpuChipIcon className="w-5 h-5 text-purple-600" title="Memory Binding Enabled" />
            )}
            {currentSession?.settings.appIntegration && (
              <SparklesIcon className="w-5 h-5 text-blue-600" title="App Integration Enabled" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('sessions')}
              className="text-gray-600 hover:text-gray-900"
            >
              <DocumentTextIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className="text-gray-600 hover:text-gray-900"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentSession?.messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === 'assistant' && (
                  <SparklesIcon className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Memory Context */}
                  {message.memoryContext && message.memoryContext.length > 0 && (
                    <div className="mt-3 p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                      <p className="text-xs font-medium text-purple-800 mb-1">Memory Context:</p>
                      {message.memoryContext.map(context => (
                        <div key={context.id} className="text-xs text-purple-700">
                          <span className="font-medium">{context.title}:</span> {context.content}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* App Actions */}
                  {message.appActions && message.appActions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.appActions.map(action => (
                        <div key={action.id} className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                          <p className="text-xs font-medium text-blue-800 mb-1">{action.title}</p>
                          <p className="text-xs text-blue-700 mb-2">{action.description}</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAppAction(action, 'always')}
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                            >
                              Always
                            </button>
                            <button
                              onClick={() => handleAppAction(action, 'session')}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                              This Session
                            </button>
                            <button
                              onClick={() => handleAppAction(action, 'never')}
                              className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                            >
                              Never
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Metadata */}
                  <div className="mt-2 text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                    {message.processingTime && ` • ${message.processingTime}ms`}
                    {message.confidence && ` • ${(message.confidence * 100).toFixed(0)}% confidence`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 text-purple-600 animate-pulse" />
                <span className="text-gray-600">Mere is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(messageInput)
                }
              }}
              placeholder="Ask Mere anything..."
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
            />
          </div>
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-3 rounded-lg ${
              isRecording ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {isRecording ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => sendMessage(messageInput)}
            disabled={!messageInput.trim()}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Chat Sessions</h2>
        <button
          onClick={createNewSession}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 inline mr-2" />
          New Session
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map(session => (
          <div
            key={session.id}
            className={`bg-white p-4 rounded-lg shadow cursor-pointer border-2 ${
              session.isActive ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => {
              setCurrentSession(session)
              setSessions(prev => prev.map(s => ({ ...s, isActive: s.id === session.id })))
              setCurrentView('chat')
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{session.title}</h3>
              <div className="flex items-center space-x-2">
                {session.memoryBinding && (
                  <CpuChipIcon className="w-4 h-4 text-purple-600" />
                )}
                {session.settings.appIntegration && (
                  <SparklesIcon className="w-4 h-4 text-blue-600" />
                )}
                <span className="text-xs text-gray-500">
                  {session.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {session.messages.length} messages • {session.statistics.totalTokens} tokens
            </p>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs ${
                session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {session.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-500">
                {session.model}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mere Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Chat Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Model</label>
              <select
                value={mereConfig.defaultModel}
                onChange={(e) => setMereConfig(prev => ({ ...prev, defaultModel: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3">Claude-3</option>
                <option value="gemini-pro">Gemini Pro</option>
                <option value="local">Local Model</option>
              </select>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={mereConfig.memoryIntegration}
                onChange={(e) => setMereConfig(prev => ({ ...prev, memoryIntegration: e.target.checked }))}
                className="rounded"
              />
              <span className="ml-2">Enable memory binding</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={mereConfig.appIntegration}
                onChange={(e) => setMereConfig(prev => ({ ...prev, appIntegration: e.target.checked }))}
                className="rounded"
              />
              <span className="ml-2">Enable app integration</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={mereConfig.autoStart}
                onChange={(e) => setMereConfig(prev => ({ ...prev, autoStart: e.target.checked }))}
                className="rounded"
              />
              <span className="ml-2">Auto-start new session</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data Retention</label>
              <select
                value={mereConfig.privacySettings.dataRetention}
                onChange={(e) => setMereConfig(prev => ({
                  ...prev,
                  privacySettings: { ...prev.privacySettings, dataRetention: e.target.value as any }
                }))}
                className="w-full border rounded px-3 py-2"
              >
                <option value="session">Session Only</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="indefinite">Indefinite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Compliance Mode</label>
              <select
                value={mereConfig.privacySettings.complianceMode}
                onChange={(e) => setMereConfig(prev => ({
                  ...prev,
                  privacySettings: { ...prev.privacySettings, complianceMode: e.target.value as any }
                }))}
                className="w-full border rounded px-3 py-2"
              >
                <option value="standard">Standard</option>
                <option value="hipaa">HIPAA</option>
                <option value="ferpa">FERPA</option>
                <option value="gdpr">GDPR</option>
              </select>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={mereConfig.privacySettings.memorySharing}
                onChange={(e) => setMereConfig(prev => ({
                  ...prev,
                  privacySettings: { ...prev.privacySettings, memorySharing: e.target.checked }
                }))}
                className="rounded"
              />
              <span className="ml-2">Allow memory sharing</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mere Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.reduce((acc, session) => acc + session.statistics.totalMessages, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
                              <CpuChipIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Memory Hits</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.reduce((acc, session) => acc + session.statistics.memoryHits, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">App Actions</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.reduce((acc, session) => acc + session.statistics.appActions, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mere AI Assistant</h1>
          <p className="text-gray-600">Intelligent AI assistant with memory awareness and app integration</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
              { id: 'sessions', label: 'Sessions', icon: DocumentTextIcon },
              { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
              { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  currentView === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {currentView === 'chat' && renderChat()}
        {currentView === 'sessions' && renderSessions()}
        {currentView === 'settings' && renderSettings()}
        {currentView === 'analytics' && renderAnalytics()}

        {/* Action Modal */}
        {showActionModal && selectedAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">App Action</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedAction.title}</h4>
                  <p className="text-sm text-gray-600">{selectedAction.description}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => executeAppAction(selectedAction)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Execute
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
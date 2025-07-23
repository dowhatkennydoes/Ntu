'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  Cog6ToothIcon,
  MicrophoneIcon,
  DocumentDuplicateIcon,
  StarIcon,
  LinkIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  CpuChipIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  model: 'gpt-4' | 'claude-3' | 'gemini-pro' | 'llama-local' // M3: Enhanced model options
  tokenCount?: number
  isPinned?: boolean
  memoryContext?: boolean
  conversationContext?: string[] // M1: Track conversation context
  memoryReferences?: MemoryReference[] // M4: Track memory references
  appSuggestions?: AppSuggestion[]
}

interface MemoryReference {
  id: string
  title: string
  relevanceScore: number
  snippet: string
  source: 'notebook' | 'voice-note' | 'workflow' | 'flashcard'
}

interface ConversationContext {
  topics: string[]
  entities: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  intent: string
  previousQueries: string[]
}

interface ChatSession {
  id: string
  title: string
  timestamp: Date
  messages: ChatMessage[]
  settings: SessionSettings
  memoryAware: boolean
}

interface SessionSettings {
  tone: 'professional' | 'friendly' | 'analytical' | 'creative'
  verbosity: 'concise' | 'balanced' | 'detailed'
  model: 'gpt-4' | 'claude-3' | 'gemini-pro' | 'llama-local'
  memoryBinding: boolean
  appIntegration: boolean
}

interface AppSuggestion {
  action: string
  app: string
  description: string
  permission: 'always' | 'session' | 'never' | 'ask'
}

export function MereAIAssistantWorkflow() {
  const { nextStep, updateWorkflowData } = useWorkflow()
  
  // M1: Enhanced conversation context tracking
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    topics: [],
    entities: [],
    sentiment: 'neutral',
    intent: '',
    previousQueries: []
  })
  
  // M2: Enhanced session management
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date>(new Date())
  
  // M3: Enhanced model management
  const [availableModels] = useState([
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', status: 'online', speed: 'fast' },
    { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', status: 'online', speed: 'medium' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', status: 'online', speed: 'fast' },
    { id: 'llama-local', name: 'Llama (Local)', provider: 'Meta', status: 'offline', speed: 'slow' }
  ])
  
  // M4: Memory bank integration
  const [memoryBank, setMemoryBank] = useState<MemoryReference[]>([
    {
      id: 'mem-1',
      title: 'Project Planning Best Practices',
      relevanceScore: 0.9,
      snippet: 'Key strategies for effective project planning include stakeholder mapping, risk assessment...',
      source: 'notebook'
    },
    {
      id: 'mem-2', 
      title: 'Team Meeting Notes - Q4 Strategy',
      relevanceScore: 0.8,
      snippet: 'Discussion about automation workflows and productivity improvements...',
      source: 'voice-note'
    }
  ])
  
  // Session management (M16-M35)
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Settings and context (M36-M50)
  const [memoryContextEnabled, setMemoryContextEnabled] = useState(false)
  const [appPermissions, setAppPermissions] = useState<Record<string, 'always' | 'session' | 'never' | 'ask'>>({})
  const [showSettings, setShowSettings] = useState(false)
  
  // UI state (M71-M85)
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([])
  const [selectedModel, setSelectedModel] = useState<'gpt-4' | 'claude-3' | 'gemini-pro' | 'llama-local'>('gpt-4') // Fix model type
  const [sessionTone, setSessionTone] = useState<'professional' | 'friendly' | 'analytical' | 'creative'>('friendly')
  const [verbosity, setVerbosity] = useState<'concise' | 'balanced' | 'detailed'>('balanced')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // M15: Initialize with greeting and sample prompts
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession(true)
    }
  }, [])

  // M33: Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentSession?.messages])

  // M2: Auto-save sessions every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (currentSession && currentSession.messages.length > 0) {
        setIsAutoSaving(true)
        // Simulate auto-save
        setTimeout(() => {
          setIsAutoSaving(false)
          setLastSaved(new Date())
          localStorage.setItem('mere-sessions', JSON.stringify(sessions))
        }, 500)
      }
    }, 30000)
    
    return () => clearInterval(autoSaveInterval)
  }, [currentSession, sessions])

  // M2: Load sessions from storage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('mere-sessions')
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions)
        setSessions(parsed.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        })))
      } catch (error) {
        console.warn('Failed to load saved sessions:', error)
      }
    }
    
    if (sessions.length === 0) {
      createNewSession(true)
    }
  }, [])

  // M1: Enhanced conversation context tracking
  const updateConversationContext = useCallback((userMessage: string, assistantResponse: string) => {
    setConversationContext(prev => {
      // Extract topics (simple keyword extraction)
      const messageTopics = userMessage.toLowerCase().match(/\b(workflow|automation|transcription|research|planning|meeting|project)\w*\b/g) || []
      const responseTopics = assistantResponse.toLowerCase().match(/\b(workflow|automation|transcription|research|planning|meeting|project)\w*\b/g) || []
      
      // Extract entities (simple named entity recognition)
      const entities = [...userMessage.match(/\b[A-Z][a-z]+\b/g) || [], ...assistantResponse.match(/\b[A-Z][a-z]+\b/g) || []]
      
      // Simple sentiment analysis
      const positiveWords = ['good', 'great', 'excellent', 'perfect', 'amazing', 'helpful']
      const negativeWords = ['bad', 'terrible', 'awful', 'wrong', 'problem', 'issue', 'error']
      
      const hasPositive = positiveWords.some(word => userMessage.toLowerCase().includes(word))
      const hasNegative = negativeWords.some(word => userMessage.toLowerCase().includes(word))
      
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
      if (hasPositive && !hasNegative) sentiment = 'positive'
      else if (hasNegative && !hasPositive) sentiment = 'negative'
      
      return {
        topics: Array.from(new Set([...prev.topics, ...messageTopics, ...responseTopics])).slice(-10), // Keep last 10 topics
        entities: Array.from(new Set([...prev.entities, ...entities])).slice(-20), // Keep last 20 entities
        sentiment,
        intent: userMessage.toLowerCase().includes('?') ? 'question' : 'statement',
        previousQueries: [...prev.previousQueries, userMessage].slice(-5) // Keep last 5 queries
      }
    })
  }, [])

  // M8: Create new session
  const createNewSession = (isFirstTime = false) => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: isFirstTime ? 'Welcome to Mere' : 'New Chat',
      timestamp: new Date(),
      messages: isFirstTime ? [
        {
          id: 'welcome',
          type: 'assistant',
          content: 'Hello! I\'m Mere, your AI assistant. I can help you with research, writing, planning, and managing your workflows across the Ntu platform. Here are some things you can try:',
          timestamp: new Date(),
          model: selectedModel,
          appSuggestions: [
            {
              action: 'Create a voice note and transcribe it',
              app: 'Yonder',
              description: 'Record and automatically transcribe audio',
              permission: 'ask'
            },
            {
              action: 'Research a topic with document upload',
              app: 'Junction',
              description: 'Upload documents and ask semantic questions',
              permission: 'ask'
            },
            {
              action: 'Build an automation workflow',
              app: 'Marathon', 
              description: 'Create automated workflows and triggers',
              permission: 'ask'
            }
          ]
        }
      ] : [],
      settings: {
        tone: sessionTone,
        verbosity,
        model: selectedModel,
        memoryBinding: memoryContextEnabled,
        appIntegration: true
      },
      memoryAware: memoryContextEnabled
    }
    
    setSessions(prev => [newSession, ...prev])
    setCurrentSession(newSession)
  }

  // M19: Rename session
  const renameSession = (sessionId: string, newTitle: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, title: newTitle } : session
    ))
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, title: newTitle } : null)
    }
  }

  // M19: Delete session with confirmation
  const deleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      if (currentSession?.id === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId)
        setCurrentSession(remainingSessions[0] || null)
        if (remainingSessions.length === 0) {
          createNewSession()
        }
      }
    }
  }

  // M4: Enhanced memory-aware response generation
  const findRelevantMemories = useCallback((query: string): MemoryReference[] => {
    if (!memoryContextEnabled) return []
    
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(' ').filter(word => word.length > 2)
    
    return memoryBank
      .map(memory => {
        // Calculate relevance score based on keyword matching
        const titleWords = memory.title.toLowerCase().split(' ')
        const snippetWords = memory.snippet.toLowerCase().split(' ')
        
        const titleMatches = titleWords.filter(word => queryWords.some(qw => word.includes(qw))).length
        const snippetMatches = snippetWords.filter(word => queryWords.some(qw => word.includes(qw))).length
        
        const relevanceScore = (titleMatches * 2 + snippetMatches) / queryWords.length
        
        return { ...memory, relevanceScore }
      })
      .filter(memory => memory.relevanceScore > 0.1)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3) // Top 3 most relevant memories
  }, [memoryBank, memoryContextEnabled])

  // M23: Enhanced AI response generation with context and memory
  const generateResponse = useCallback(async (userMessage: string): Promise<ChatMessage> => {
    setIsLoading(true)
    
    // M4: Find relevant memories
    const relevantMemories = findRelevantMemories(userMessage)
    
    // M1: Use conversation context for better responses
    const contextualPrompt = `
      Previous topics: ${conversationContext.topics.join(', ')}
      Previous queries: ${conversationContext.previousQueries.slice(-2).join('; ')}
      Current sentiment: ${conversationContext.sentiment}
      User query: ${userMessage}
      ${relevantMemories.length > 0 ? `Relevant memories: ${relevantMemories.map(m => m.snippet).join('; ')}` : ''}
    `
    
    // Simulate AI processing with realistic delay
    const processingTime = selectedModel === 'llama-local' ? 3000 : selectedModel === 'claude-3' ? 1500 : 1200
    await new Promise(resolve => setTimeout(resolve, processingTime))
    
    // Enhanced response generation based on context and memories
    let responseContent = ''
    let appSuggestions: AppSuggestion[] = []
    
    // Context-aware response generation
    if (userMessage.toLowerCase().includes('transcribe') || userMessage.toLowerCase().includes('voice')) {
      responseContent = `I can help you with voice transcription! ${relevantMemories.length > 0 ? `Based on your previous work with "${relevantMemories[0].title}", ` : ''}The Yonder app provides real-time transcription with speaker identification and confidence scoring.`
      
      if (conversationContext.previousQueries.some(q => q.includes('meeting'))) {
        responseContent += ` Since you mentioned meetings earlier, you might find the speaker diarization feature particularly useful.`
      }
      
      appSuggestions = [{
        action: 'Start voice transcription',
        app: 'Yonder',
        description: 'Open Yonder for real-time voice transcription',
        permission: 'ask'
      }]
    } else if (userMessage.toLowerCase().includes('research') || userMessage.toLowerCase().includes('document')) {
      responseContent = `For research and document analysis, Junction offers semantic Q&A capabilities. ${relevantMemories.length > 0 ? `I can see you've worked on "${relevantMemories[0].title}" before - ` : ''}You can upload multiple documents and ask questions with precise citations.`
      
      if (conversationContext.topics.includes('project')) {
        responseContent += ` This would be perfect for your project research needs.`
      }
      
      appSuggestions = [{
        action: 'Start research session',
        app: 'Junction',
        description: 'Open Junction for semantic document research',
        permission: 'ask'
      }]
    } else if (userMessage.toLowerCase().includes('automat') || userMessage.toLowerCase().includes('workflow')) {
      responseContent = `Marathon is perfect for creating automated workflows! ${relevantMemories.length > 0 ? `Building on your previous work with "${relevantMemories[0].title}", ` : ''}You can build visual automation flows with drag-and-drop nodes, triggers, and actions.`
      
      if (conversationContext.sentiment === 'positive') {
        responseContent += ` I can tell you're excited about automation - Marathon will definitely help streamline your processes!`
      }
      
      appSuggestions = [{
        action: 'Create automation workflow',
        app: 'Marathon',
        description: 'Open Marathon workflow builder',
        permission: 'ask'
      }]
    } else {
      // Contextual general responses
      const contextualElements = []
      
      if (relevantMemories.length > 0) {
        contextualElements.push(`building on your previous work with "${relevantMemories[0].title}"`)
      }
      
      if (conversationContext.topics.length > 0) {
        contextualElements.push(`considering your interest in ${conversationContext.topics.slice(-2).join(' and ')}`)
      }
      
      const contextPrefix = contextualElements.length > 0 ? `${contextualElements.join(', ')}, ` : ''
      
      const responses = [
        `That's an interesting question! ${contextPrefix}${verbosity === 'detailed' ? 'Let me provide a comprehensive analysis. ' : verbosity === 'concise' ? 'Here\'s a quick answer: ' : ''}Based on current best practices, I'd recommend...`,
        `I can help you with that! ${contextPrefix}${sessionTone === 'analytical' ? 'From an analytical perspective,' : sessionTone === 'creative' ? 'Here\'s a creative approach:' : sessionTone === 'professional' ? 'Professionally speaking,' : ''} this is what I suggest...`,
        `Great question! ${contextPrefix}${verbosity === 'detailed' ? 'Let me break this down into several key components.' : 'Here\'s what you need to know.'}`
      ]
      responseContent = responses[Math.floor(Math.random() * responses.length)]
    }

    setIsLoading(false)
    
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      model: selectedModel,
      tokenCount: Math.floor(responseContent.length / 4),
      memoryContext: memoryContextEnabled,
      conversationContext: conversationContext.topics,
      memoryReferences: relevantMemories,
      appSuggestions
    }
    
    // Update conversation context
    updateConversationContext(userMessage, responseContent)
    
    return assistantMessage
  }, [selectedModel, verbosity, sessionTone, memoryContextEnabled, conversationContext, findRelevantMemories, updateConversationContext])

  // Handle sending message
  const handleSendMessage = async () => {
    if (!currentInput.trim() || !currentSession) return
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',  
      content: currentInput,
      timestamp: new Date(),
      model: selectedModel
    }
    
    // Add user message
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage]
    }
    setCurrentSession(updatedSession)
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s))
    
    setCurrentInput('')
    setIsTyping(true)
    
    // Generate AI response
    try {
      const assistantMessage = await generateResponse(currentInput)
      
      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage]
      }
      
      setCurrentSession(finalSession)
      setSessions(prev => prev.map(s => s.id === currentSession.id ? finalSession : s))
      setIsTyping(false)
    } catch (error) {
      setIsTyping(false)
    }
  }

  // M20: Handle multiline input (Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // M26: Pin/unpin message
  const togglePinMessage = (messageId: string) => {
    if (!currentSession) return
    
    const message = currentSession.messages.find(m => m.id === messageId)
    if (!message) return
    
    const isPinned = pinnedMessages.some(p => p.id === messageId)
    
    if (isPinned) {
      setPinnedMessages(prev => prev.filter(p => p.id !== messageId))
    } else {
      setPinnedMessages(prev => [...prev, { ...message, isPinned: true }])
    }
  }

  // M51-M70: Handle app suggestions and permissions
  const handleAppSuggestion = (suggestion: AppSuggestion) => {
    const currentPermission = appPermissions[suggestion.app] || suggestion.permission
    
    if (currentPermission === 'never') {
      return
    }
    
    if (currentPermission === 'always') {
      executeAppAction(suggestion)
      return
    }
    
    // Show permission dialog
    const choice = confirm(`${suggestion.description}\n\nWould you like to:\n- Allow this once\n- Always allow for ${suggestion.app}\n- Never allow for ${suggestion.app}`)
    
    if (choice) {
      const permissionChoice = prompt('Choose permission level:\n1. Once\n2. Always\n3. Never', '1')
      
      switch (permissionChoice) {
        case '1':
          executeAppAction(suggestion)
          break
        case '2':
          setAppPermissions(prev => ({ ...prev, [suggestion.app]: 'always' }))
          executeAppAction(suggestion)
          break
        case '3':
          setAppPermissions(prev => ({ ...prev, [suggestion.app]: 'never' }))
          break
      }
    }
  }

  const executeAppAction = (suggestion: AppSuggestion) => {
    // M55: Log app action without switching view
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      type: 'system',
      content: `✓ ${suggestion.action} initiated in ${suggestion.app}`,
      timestamp: new Date(),
      model: selectedModel
    }
    
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, systemMessage]
      }
      setCurrentSession(updatedSession)
      setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s))
    }
  }

  const handleComplete = () => {
    updateWorkflowData({
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((acc, s) => acc + s.messages.length, 0),
      pinnedInsights: pinnedMessages.length,
      memoryAware: memoryContextEnabled
    })
    nextStep()
  }

  if (!currentSession) return null

  return (
    <div className="max-w-6xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="text-center py-6 border-b bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Mere - AI Assistant
        </h2>
        <p className="text-gray-600">
          Your intelligent companion for research, planning, and workflow automation
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Sessions and Apps */}
        <div className="w-80 bg-gray-50 border-r flex flex-col">
          {/* New Chat Button */}
          <div className="p-4 border-b">
            <button
              onClick={() => createNewSession()}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Chat
            </button>
          </div>

          {/* Settings Toggle */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Settings</h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            </div>

            {showSettings && (
              <div className="space-y-4">
                {/* Memory Context Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Memory Context</span>
                  <button
                    onClick={() => setMemoryContextEnabled(!memoryContextEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      memoryContextEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        memoryContextEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* AI Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as typeof selectedModel)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id} disabled={model.status === 'offline'}>
                        {model.name} ({model.provider}) - {model.speed}
                      </option>
                    ))}
                  </select>
                  
                  {/* Model Status Indicator */}
                  <div className="mt-2 flex items-center text-xs">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      availableModels.find(m => m.id === selectedModel)?.status === 'online' 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`} />
                    <span className="text-gray-600">
                      {availableModels.find(m => m.id === selectedModel)?.status === 'online' 
                        ? 'Online' 
                        : 'Offline'}
                    </span>
                    {isAutoSaving && (
                      <span className="ml-2 text-blue-600">
                        Auto-saving...
                      </span>
                    )}
                  </div>
                </div>

                {/* Memory Context Info */}
                {memoryContextEnabled && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <CpuChipIcon className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">Memory Context Active</span>
                    </div>
                    <div className="text-xs text-green-700 space-y-1">
                      <div>Available memories: {memoryBank.length}</div>
                      {conversationContext.topics.length > 0 && (
                        <div>Active topics: {conversationContext.topics.slice(-3).join(', ')}</div>
                      )}
                      <div>Last saved: {lastSaved.toLocaleTimeString()}</div>
                    </div>
                  </div>
                )}

                {/* Tone Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Response Tone
                  </label>
                  <select
                    value={sessionTone}
                    onChange={(e) => setSessionTone(e.target.value as typeof sessionTone)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="analytical">Analytical</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>

                {/* Verbosity Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Response Length
                  </label>
                  <select
                    value={verbosity}
                    onChange={(e) => setVerbosity(e.target.value as typeof verbosity)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="concise">Concise</option>
                    <option value="balanced">Balanced</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Sessions ({sessions.length})
              </h3>
              
              <div className="space-y-2">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSession?.id === session.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentSession(session)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">{session.title}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSession(session.id)
                        }}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{session.messages.length} messages</span>
                      <span>{session.timestamp.toLocaleDateString()}</span>
                    </div>
                    {session.memoryAware && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <CpuChipIcon className="h-3 w-3 mr-1" />
                          Memory-aware
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Session Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{currentSession.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <CpuChipIcon className="h-4 w-4 mr-1" />
                  {selectedModel}
                </span>
                <span>{currentSession.messages.length} messages</span>
                {pinnedMessages.length > 0 && (
                  <span className="flex items-center">
                    <StarIcon className="h-4 w-4 mr-1" />
                    {pinnedMessages.length} pinned
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {memoryContextEnabled && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Memory Active
                </span>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentSession.messages.map(message => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : message.type === 'system'
                    ? 'bg-gray-100 text-gray-700 border'
                    : 'bg-gray-100 text-gray-900'
                } rounded-lg p-4 relative group`}>
                  
                  {message.type === 'assistant' && (
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center">
                          <CpuChipIcon className="h-3 w-3 mr-1" />
                          {message.model}
                        </span>
                        {message.tokenCount && (
                          <span>{message.tokenCount} tokens</span>
                        )}
                        {message.memoryContext && (
                          <span className="flex items-center text-green-600">
                            <BoltIcon className="h-3 w-3 mr-1" />
                            Memory
                          </span>
                        )}
                        {message.conversationContext && message.conversationContext.length > 0 && (
                          <span className="flex items-center text-blue-600">
                            <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
                            Context
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => togglePinMessage(message.id)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                          pinnedMessages.some(p => p.id === message.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <StarIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* Memory References */}
                  {message.memoryReferences && message.memoryReferences.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800 mb-2 flex items-center">
                        <CpuChipIcon className="h-4 w-4 mr-1" />
                        Referenced from your memory:
                      </p>
                      <div className="space-y-2">
                        {message.memoryReferences.map(ref => (
                          <div key={ref.id} className="text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-green-900">{ref.title}</span>
                              <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">
                                {ref.source}
                              </span>
                            </div>
                            <p className="text-green-700 mt-1">{ref.snippet}</p>
                            <div className="text-green-500 mt-1">
                              Relevance: {Math.round(ref.relevanceScore * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Conversation Context */}
                  {message.conversationContext && message.conversationContext.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.conversationContext.map(topic => (
                        <span key={topic} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {message.appSuggestions && message.appSuggestions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Suggested actions:</p>
                      {message.appSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleAppSuggestion(suggestion)}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{suggestion.action}</p>
                              <p className="text-xs text-gray-500">{suggestion.description}</p>
                            </div>
                            <div className="text-xs text-blue-600 font-medium">
                              {suggestion.app}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-400">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4 max-w-xs">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">Mere is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex space-x-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={memoryContextEnabled ? "Ask me anything about your memories and workflows..." : "Ask me anything..."}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Press Shift+Enter for new line, Enter to send</span>
                  <span>{currentInput.length} characters</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
                
                <button
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Voice input (coming soon)"
                  disabled
                >
                  <MicrophoneIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {sessions.length} sessions • {sessions.reduce((acc, s) => acc + s.messages.length, 0)} total messages • {pinnedMessages.length} pinned
        </div>
        
        <button
          onClick={handleComplete}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          Complete Session
        </button>
      </div>
    </div>
  )
} 
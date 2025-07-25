'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  MicrophoneIcon,
  StopIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  streaming?: boolean
}

interface Suggestion {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  category: 'productivity' | 'learning' | 'creative' | 'analysis'
}

const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: 'plan',
    title: 'Plan my day',
    description: 'Create an intelligent daily schedule',
    icon: ClockIcon,
    category: 'productivity'
  },
  {
    id: 'summarize',
    title: 'Summarize my notes',
    description: 'Get insights from your Junction documents',
    icon: DocumentTextIcon,
    category: 'analysis'
  },
  {
    id: 'workflow',
    title: 'Automate a task',
    description: 'Build a Marathon workflow',
    icon: BoltIcon,
    category: 'productivity'
  },
  {
    id: 'learn',
    title: 'Explain a concept',
    description: 'Deep dive into any topic',
    icon: SparklesIcon,
    category: 'learning'
  }
]

export default function MereInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [inputFocused, setInputFocused] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}`)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-focus input on load (desktop only)
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile && inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (messages.length > 0 && !showScrollToBottom) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom, showScrollToBottom])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Simulate streaming response
  const simulateStreaming = async (content: string, messageId: string) => {
    setIsStreaming(true)
    const words = content.split(' ')
    let currentContent = ''
    
    for (let i = 0; i < words.length; i++) {
      if (abortControllerRef.current?.signal.aborted) break
      
      currentContent += (i > 0 ? ' ' : '') + words[i]
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: currentContent, streaming: true }
          : msg
      ))
      
      // Randomize delay to simulate real streaming
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
    }
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, streaming: false }
        : msg
    ))
    setIsStreaming(false)
  }

  // Handle message submission
  const handleSubmit = async () => {
    if (!inputValue.trim() || isStreaming) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    const assistantMessageId = `assistant_${Date.now()}`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInputValue('')
    setShowSuggestions(false)
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    // Simulate AI response
    const response = "I understand you're looking for help with that. Let me analyze your request and provide a comprehensive response.\n\nHere's what I found:\n\n• Your recent activities suggest a focus on productivity optimization\n• I've identified 3 potential automation opportunities\n• This aligns with your learning goals\n\nRecommended Actions:\n1. Create a task in Punctual with smart prioritization\n2. Set up a Marathon workflow for recurring similar requests\n3. Build this into your personal knowledge graph\n\nWould you like me to proceed with any of these recommendations?"

    abortControllerRef.current = new AbortController()
    await simulateStreaming(response, assistantMessageId)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    const prompts = {
      plan: "Help me plan an optimal day based on my current tasks and energy patterns",
      summarize: "Summarize my recent Junction notes and highlight key insights",
      workflow: "Help me create a Marathon workflow to automate my recurring tasks",
      learn: "I'd like to understand how AI can help improve my productivity workflows"
    }
    
    setInputValue(prompts[suggestion.id as keyof typeof prompts] || suggestion.title)
    inputRef.current?.focus()
  }

  // Handle voice recording
  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Voice recording implementation would go here
  }

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header - only show when messages exist */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="border-b border-white/10 bg-white/10 backdrop-blur-xl"
          >
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <SparklesIconSolid className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    Mere
                  </h1>
                  <p className="text-xs text-white/60">
                    Session {sessionId.slice(-8)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100/20 text-blue-300 rounded-full text-xs">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span>Memory Active</span>
                </div>
                <button
                  onClick={() => setMessages([])}
                  className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title="New conversation"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Empty State */}
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center py-12"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <SparklesIconSolid className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Welcome to Mere
                </h1>
                <p className="text-white/70 text-base sm:text-lg">
                  Your memory-native AI assistant
                </p>
              </div>

              {/* Suggestions */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-2xl"
                  >
                    {INITIAL_SUGGESTIONS.map((suggestion, index) => (
                      <motion.button
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="group p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 hover:border-white/30 hover:bg-white/15 transition-all text-left hover:shadow-lg"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <suggestion.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white mb-1">
                              {suggestion.title}
                            </h3>
                            <p className="text-sm text-white/70">
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Messages */}
          <div className="py-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`group relative max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3'
                      : 'bg-white/10 backdrop-blur-lg text-white rounded-2xl rounded-bl-md px-4 py-3 border border-white/20'
                  }`}>
                    
                    {/* Message Content */}
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>

                    {/* Streaming indicator */}
                    {message.streaming && (
                      <div className="flex items-center space-x-1 mt-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-4 text-xs text-white/50">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* Input */}
          <div className="relative">
            <div className={`flex items-end space-x-3 p-3 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 transition-all ${
              inputFocused ? 'ring-2 ring-purple-500 border-purple-500' : ''
            }`}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Ask Mere anything…"
                className="flex-1 resize-none bg-transparent outline-none text-white placeholder-white/50 text-base max-h-[150px] min-h-[44px] py-2"
                rows={1}
                disabled={isStreaming}
                aria-label="Ask Mere anything"
              />
              
              <div className="flex items-center space-x-2">
                {/* Voice button */}
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  {isRecording ? (
                    <StopIcon className="w-5 h-5" />
                  ) : (
                    <MicrophoneIcon className="w-5 h-5" />
                  )}
                </button>

                {/* Send button */}
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isStreaming}
                  className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                  title="Send message"
                >
                  {isStreaming ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
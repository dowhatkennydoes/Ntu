'use client'

import { useState, useEffect } from 'react'
import { PaperAirplaneIcon, CogIcon, EyeIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useWorkflow } from '../WorkflowProvider'
import { marked } from 'marked';

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  aiProcessing?: boolean
  workflowStep?: string
  model?: string; // Added for model badge
  memoryMetadata?: {
    notebook?: string;
    section?: string;
    retrievalTime?: string;
    citations?: Array<{ label: string; url: string }>;
  };
  redacted?: boolean;
  staleMemory?: boolean;
  permissionLevel?: string;
}

export function MereChat({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { currentWorkflow, currentStep, steps } = useWorkflow()
  const [collapsedMessages, setCollapsedMessages] = useState<{[id: string]: boolean}>({});
  const [memoryContextEnabled, setMemoryContextEnabled] = useState(false);

  // LocalStorage keys
  const MSG_KEY = `mere_session_msgs_${sessionId}`
  const SESSIONS_KEY = 'mere_sessions_v1'

  // Load messages for session
  useEffect(() => {
    if (!sessionId) return;
    const raw = localStorage.getItem(MSG_KEY)
    if (raw) {
      try {
        setMessages(JSON.parse(raw))
      } catch {
        setMessages([])
      }
    } else {
      setMessages([])
    }
  }, [sessionId])

  // Save messages on change
  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem(MSG_KEY, JSON.stringify(messages))
    // Update token count in session metadata
    try {
      const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]')
      const idx = sessions.findIndex((s: any) => s.id === sessionId)
      if (idx !== -1) {
        sessions[idx].tokenCount = messages.reduce((acc: number, m: Message) => acc + (m.content?.split(' ').length || 0), 0)
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
      }
    } catch {}
  }, [messages, sessionId])

  // Load memory context state for session
  useEffect(() => {
    if (!sessionId) return;
    const raw = localStorage.getItem(`mere_memctx_${sessionId}`);
    setMemoryContextEnabled(raw === 'true');
  }, [sessionId]);

  // Save memory context state
  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem(`mere_memctx_${sessionId}`, memoryContextEnabled ? 'true' : 'false');
  }, [memoryContextEnabled, sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      workflowStep: currentWorkflow ? `Step ${currentStep + 1}: ${steps[currentStep]?.title}` : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/mere', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, memoryContextEnabled }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from Mere')
      }

      const assistantMessage = await response.json()
      
      setMessages((prev) => [...prev, {
        ...assistantMessage,
        aiProcessing: true,
        workflowStep: currentWorkflow ? `AI Processing: ${steps[currentStep]?.title}` : undefined,
      }])
    } catch (error) {
      toast.error('Failed to get response from Mere')
      console.error('Error in Mere chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background py-8 px-2">
      {/* Pulsing Avatar Icon */}
      <div className="mb-4 flex items-center justify-center">
        <span className={`inline-flex items-center justify-center rounded-full bg-purple-100 p-3 shadow-lg ${isLoading ? 'animate-pulse' : ''}`}
          title="Mere AI Assistant">
          <SparklesIcon className="h-8 w-8 text-purple-600" />
        </span>
      </div>
      <div className="w-full max-w-2xl flex flex-col flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-0 md:p-6">
        {/* Workflow Status Bar */}
        {currentWorkflow && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <CogIcon className="h-4 w-4" />
              <span>Active Workflow: {steps[currentStep]?.title}</span>
              {steps[currentStep]?.aiAssisted && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs">
                  <EyeIcon className="h-3 w-3" />
                  AI Assisted
                </span>
              )}
              {/* Memory Context Toggle */}
              <button
                className={`ml-4 px-2 py-1 rounded-full text-xs font-semibold border ${memoryContextEnabled ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                onClick={() => setMemoryContextEnabled(v => !v)}
                title="Toggle memory context awareness"
              >
                {memoryContextEnabled ? 'Memory Context: ON' : 'Memory Context: OFF'}
              </button>
            </div>
            {memoryContextEnabled && (
              <div className="text-xs text-green-700 mt-1">Mere is using memory, plugins, and agent context for this session.</div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground space-y-3">
                <p className="text-lg font-medium">👋 Welcome to Mere</p>
                <p className="text-sm">Your AI assistant is here to help. Try one of these:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {["Summarize this document","Plan my week","Explain this concept"].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs border border-blue-100"
                      onClick={() => setInput(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                {currentWorkflow && (
                  <p className="text-xs mt-2 text-blue-600">
                    Currently assisting with: {steps[currentStep]?.title}
                  </p>
                )}
              </div>
            )}
            {messages.map((message) => {
              const isLong = message.content.length > 400;
              const isCollapsed = collapsedMessages[message.id];
              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex w-full',
                    message.role === 'assistant' ? 'justify-start' : 'justify-end'
                  )}
                >
                  <div className="max-w-[80%]">
                    {message.workflowStep && (
                      <div className="text-xs text-muted-foreground mb-1 px-1">
                        {message.workflowStep}
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-lg px-4 py-2 relative',
                        message.role === 'assistant'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-primary text-primary-foreground'
                      )}
                    >
                      {/* Model badge */}
                      <span className="absolute -top-3 left-0 text-xs bg-gray-200 text-gray-700 rounded px-2 py-0.5 shadow">
                        {message.model || 'GPT-4'}
                      </span>
                      {/* Collapsible toggle for long answers */}
                      {isLong && (
                        <button
                          className="absolute top-1 right-1 text-xs text-blue-500 underline"
                          onClick={() => setCollapsedMessages(prev => ({ ...prev, [message.id]: !isCollapsed }))}
                        >
                          {isCollapsed ? 'Expand' : 'Collapse'}
                        </button>
                      )}
                      <div className={isCollapsed ? 'line-clamp-3 max-h-20 overflow-hidden' : ''}>
                        <span dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
                      </div>
                    </div>
                    {message.memoryMetadata && (
                      <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                        <div>
                          <span className="font-semibold">Notebook:</span> {message.memoryMetadata.notebook || '—'}
                          {message.memoryMetadata.section && (
                            <span> &nbsp;|&nbsp; <span className="font-semibold">Section:</span> {message.memoryMetadata.section}</span>
                          )}
                        </div>
                        {message.memoryMetadata.retrievalTime && (
                          <div><span className="font-semibold">Retrieved:</span> {message.memoryMetadata.retrievalTime}</div>
                        )}
                        {message.memoryMetadata.citations && message.memoryMetadata.citations.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="font-semibold">Citations:</span>
                            {message.memoryMetadata.citations.map((c, i) => (
                              <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">{c.label}</a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {message.staleMemory && (
                      <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 border-l-4 border-yellow-400 pl-2 py-1 rounded">
                        ⚠️ Some memory used in this response may be outdated. Please refresh or update.
                      </div>
                    )}
                    {message.permissionLevel && (
                      <div className="mt-2 text-xs text-blue-700 flex items-center gap-1">
                        <svg className="inline h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2V7a2 2 0 10-4 0v2c0 1.104.896 2 2 2zm6 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5a2 2 0 012-2h8a2 2 0 012 2z" /></svg>
                        Memory knowledge is scoped to your permission level: <span className="font-semibold">{message.permissionLevel}</span>
                      </div>
                    )}
                    {message.redacted && (
                      <div className="mt-2 text-xs text-red-600 font-semibold">This response omits redacted or Zero-Knowledge data for privacy compliance.</div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-accent rounded-lg px-4 py-2 text-accent-foreground">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.2s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky, centered input */}
        <div className="sticky bottom-0 left-0 w-full border-t bg-background p-4 z-10">
          <form onSubmit={handleSubmit} className="mx-auto max-w-2xl flex flex-col items-center gap-2">
            <div className="flex w-full items-center gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-center resize-none min-h-[44px] max-h-40"
                rows={1}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 
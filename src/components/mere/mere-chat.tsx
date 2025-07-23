'use client'

import { useState } from 'react'
import { PaperAirplaneIcon, CogIcon, EyeIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useWorkflow } from '../WorkflowProvider'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  aiProcessing?: boolean
  workflowStep?: string
}

export function MereChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { currentWorkflow, currentStep, steps } = useWorkflow()

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
        body: JSON.stringify({ message: input }),
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

  return (
    <div className="flex h-full flex-col">
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
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">Welcome to Mere</p>
              <p className="text-sm">Ask me anything to get started</p>
              {currentWorkflow && (
                <p className="text-xs mt-2 text-blue-600">
                  Currently assisting with: {steps[currentStep]?.title}
                </p>
              )}
            </div>
          )}
          {messages.map((message) => (
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
                  {message.aiProcessing && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <CogIcon className="h-2 w-2 text-white animate-spin" />
                      </div>
                    </div>
                  )}
                  <p>{message.content}</p>
                </div>
              </div>
            </div>
          ))}
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

      {/* Input */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
  )
} 
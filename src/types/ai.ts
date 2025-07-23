export interface AIAssistant {
  id: string
  name: string
  version: string
  capabilities: AICapability[]
  status: 'active' | 'inactive' | 'maintenance'
  confidence: number
  lastActive: Date
}

export interface AICapability {
  id: string
  name: string
  description: string
  category: AICategory
  confidence: number
  processingTime: number
  cost: number
  enabled: boolean
}

export type AICategory = 
  | 'transcription'
  | 'summarization'
  | 'translation'
  | 'analysis'
  | 'generation'
  | 'classification'
  | 'extraction'
  | 'reasoning'
  | 'planning'
  | 'optimization'

export interface AIRequest {
  id: string
  type: AIRequestType
  input: any
  parameters: AIParameters
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: AIRequestStatus
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  result?: any
  error?: string
  confidence?: number
  cost?: number
}

export type AIRequestType = 
  | 'summarize'
  | 'transcribe'
  | 'translate'
  | 'analyze'
  | 'generate'
  | 'classify'
  | 'extract'
  | 'reason'
  | 'plan'
  | 'optimize'

export interface AIParameters {
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  language?: string
  format?: string
  includeMetadata?: boolean
  confidenceThreshold?: number
}

export type AIRequestStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused'

export interface AIWorkflow {
  id: string
  name: string
  description: string
  steps: AIWorkflowStep[]
  inputSchema: any
  outputSchema: any
  estimatedTime: number
  cost: number
  status: 'draft' | 'active' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export interface AIWorkflowStep {
  id: string
  name: string
  description: string
  type: AIRequestType
  parameters: AIParameters
  required: boolean
  order: number
  estimatedTime: number
  status: AIRequestStatus
  result?: any
  error?: string
  confidence?: number
}

export interface AIConversation {
  id: string
  title: string
  messages: AIMessage[]
  context: AIContext
  status: 'active' | 'paused' | 'completed' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: any
  confidence?: number
  actions?: AIAction[]
}

export interface AIContext {
  memories: string[]
  workflows: string[]
  preferences: AIPreferences
  session: AISession
}

export interface AIPreferences {
  language: string
  verbosity: 'concise' | 'normal' | 'detailed'
  format: 'text' | 'markdown' | 'json'
  includeExamples: boolean
  includeConfidence: boolean
}

export interface AISession {
  id: string
  startTime: Date
  duration: number
  requests: number
  totalCost: number
  averageConfidence: number
}

export interface AIAction {
  id: string
  type: 'workflow' | 'memory' | 'export' | 'share' | 'schedule'
  name: string
  description: string
  parameters: any
  status: 'suggested' | 'approved' | 'executed' | 'cancelled'
  confidence: number
  createdAt: Date
  executedAt?: Date
}

export interface AIInsight {
  id: string
  type: 'pattern' | 'trend' | 'anomaly' | 'opportunity' | 'risk'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  data: any
  recommendations: string[]
  createdAt: Date
  expiresAt?: Date
}

export interface AIPerformance {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  averageConfidence: number
  totalCost: number
  popularCapabilities: AICapability[]
  recentErrors: string[]
  period: {
    start: Date
    end: Date
  }
} 
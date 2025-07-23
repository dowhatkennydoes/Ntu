export interface Memory {
  id: string
  title: string
  content: string
  summary: string
  tags: string[]
  category: MemoryCategory
  source: MemorySource
  createdAt: Date
  updatedAt: Date
  confidence: number
  relatedMemories: string[]
  metadata: MemoryMetadata
  status: MemoryStatus
}

export type MemoryCategory = 
  | 'conversation'
  | 'document'
  | 'audio'
  | 'video'
  | 'image'
  | 'meeting'
  | 'research'
  | 'personal'
  | 'work'
  | 'learning'

export type MemorySource = 
  | 'transcription'
  | 'manual'
  | 'import'
  | 'ai_generated'
  | 'plugin'
  | 'collaboration'

export type MemoryStatus = 
  | 'draft'
  | 'active'
  | 'archived'
  | 'redacted'
  | 'pending_review'

export interface MemoryMetadata {
  duration?: number // for audio/video
  participants?: string[]
  location?: string
  keywords: string[]
  sentiment?: 'positive' | 'negative' | 'neutral'
  language: string
  fileSize?: number
  mimeType?: string
  transcriptionConfidence?: number
  aiConfidence?: number
}

export interface MemoryChain {
  id: string
  name: string
  description: string
  memories: string[]
  reasoning: string
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'active' | 'archived'
}

export interface MemoryDeck {
  id: string
  name: string
  description: string
  memories: string[]
  cards: MemoryCard[]
  difficulty: 'easy' | 'medium' | 'hard'
  createdAt: Date
  updatedAt: Date
}

export interface MemoryCard {
  id: string
  question: string
  answer: string
  memoryId: string
  difficulty: 'easy' | 'medium' | 'hard'
  lastReviewed?: Date
  reviewCount: number
  successRate: number
}

export interface MemoryTag {
  id: string
  name: string
  color: string
  description?: string
  usageCount: number
  createdAt: Date
}

export interface MemorySearchResult {
  memory: Memory
  relevance: number
  matchedTerms: string[]
  highlights: string[]
}

export interface MemoryWorkflow {
  id: string
  name: string
  description: string
  steps: MemoryWorkflowStep[]
  inputType: 'audio' | 'video' | 'text' | 'file'
  outputType: 'memory' | 'summary' | 'deck' | 'chain'
  estimatedTime: number
  status: 'draft' | 'active' | 'archived'
}

export interface MemoryWorkflowStep {
  id: string
  name: string
  description: string
  type: 'input' | 'process' | 'output'
  processor: 'transcription' | 'summarization' | 'tagging' | 'organization' | 'export'
  required: boolean
  order: number
  estimatedTime: number
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  result?: any
  error?: string
} 
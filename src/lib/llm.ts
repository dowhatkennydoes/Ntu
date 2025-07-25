import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// LLM client configurations
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Ollama configuration
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

// LLM model configurations
export const LLM_MODELS = {
  OPENAI: {
    GPT4: 'gpt-4',
    GPT35: 'gpt-3.5-turbo',
    GPT4O: 'gpt-4o',
  },
  ANTHROPIC: {
    CLAUDE_3_OPUS: 'claude-3-opus-20240229',
    CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
    CLAUDE_3_HAIKU: 'claude-3-haiku-20240307',
  },
  OLLAMA: {
    LLAMA2: 'llama2',
    MISTRAL: 'mistral',
    CODEGEM: 'codegemma',
  },
} as const

// LLM response interface
export interface LLMResponse {
  content: string
  model: string
  tokens: {
    input: number
    output: number
    total: number
  }
  latency: number
  success: boolean
  error?: string
}

// LLM request interface
export interface LLMRequest {
  prompt: string
  systemPrompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

// LLM client interface
export interface LLMClient {
  generate(request: LLMRequest): Promise<LLMResponse>
  generateStream?(request: LLMRequest): AsyncGenerator<string>
}

// OpenAI client implementation
export class OpenAIClient implements LLMClient {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()
    
    try {
      const response = await openai.chat.completions.create({
        model: request.model || LLM_MODELS.OPENAI.GPT4,
        messages: [
          ...(request.systemPrompt ? [{ role: 'system' as const, content: request.systemPrompt }] : []),
          { role: 'user' as const, content: request.prompt },
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1000,
        stream: false, // Force non-streaming for this implementation
      })

      const latency = Date.now() - startTime
      
      return {
        content: response.choices[0]?.message?.content || '',
        model: response.model,
        tokens: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
        latency,
        success: true,
      }
    } catch (error) {
      return {
        content: '',
        model: request.model || LLM_MODELS.OPENAI.GPT4,
        tokens: { input: 0, output: 0, total: 0 },
        latency: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// Anthropic client implementation
export class AnthropicClient implements LLMClient {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()
    
    try {
      const response = await anthropic.messages.create({
        model: request.model || LLM_MODELS.ANTHROPIC.CLAUDE_3_SONNET,
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        messages: [
          { role: 'user', content: request.prompt },
        ],
        system: request.systemPrompt,
      })

      const latency = Date.now() - startTime
      
      return {
        content: response.content[0]?.type === 'text' ? response.content[0].text : '',
        model: response.model,
        tokens: {
          input: response.usage?.input_tokens || 0,
          output: response.usage?.output_tokens || 0,
          total: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
        },
        latency,
        success: true,
      }
    } catch (error) {
      return {
        content: '',
        model: request.model || LLM_MODELS.ANTHROPIC.CLAUDE_3_SONNET,
        tokens: { input: 0, output: 0, total: 0 },
        latency: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// Ollama client implementation
export class OllamaClient implements LLMClient {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model || LLM_MODELS.OLLAMA.MISTRAL,
          prompt: request.prompt,
          system: request.systemPrompt,
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 1000,
          stream: request.stream || false,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = await response.json()
      const latency = Date.now() - startTime
      
      return {
        content: data.response || '',
        model: data.model || request.model || LLM_MODELS.OLLAMA.MISTRAL,
        tokens: {
          input: data.prompt_eval_count || 0,
          output: data.eval_count || 0,
          total: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
        latency,
        success: true,
      }
    } catch (error) {
      return {
        content: '',
        model: request.model || LLM_MODELS.OLLAMA.MISTRAL,
        tokens: { input: 0, output: 0, total: 0 },
        latency: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// LLM client instances
export const openaiClient = new OpenAIClient()
export const anthropicClient = new AnthropicClient()
export const ollamaClient = new OllamaClient()

// LLM fallback strategy
export async function generateWithFallback(
  request: LLMRequest,
  fallbackOrder: ('ollama' | 'openai' | 'anthropic')[] = ['ollama', 'openai', 'anthropic']
): Promise<LLMResponse> {
  for (const provider of fallbackOrder) {
    let client: LLMClient
    
    switch (provider) {
      case 'openai':
        client = openaiClient
        break
      case 'anthropic':
        client = anthropicClient
        break
      case 'ollama':
        client = ollamaClient
        break
      default:
        continue
    }

    const response = await client.generate(request)
    if (response.success) {
      return response
    }
  }

  // All providers failed
  return {
    content: 'Sorry, I am unable to process your request at the moment.',
    model: 'fallback',
    tokens: { input: 0, output: 0, total: 0 },
    latency: 0,
    success: false,
    error: 'All LLM providers failed',
  }
}

// Prompt templates
export const PROMPT_TEMPLATES = {
  SUMMARIZATION: {
    bullets: 'Summarize the following content in bullet points:\n\n{content}',
    narrative: 'Provide a narrative summary of the following content:\n\n{content}',
    tldr: 'Provide a TL;DR summary of the following content:\n\n{content}',
  },
  MEMORY_EXTRACTION: 'Extract key insights and actionable items from the following content:\n\n{content}',
  INTENT_CLASSIFICATION: 'Classify the intent of the following text:\n\n{content}',
  SENTIMENT_ANALYSIS: 'Analyze the sentiment of the following text:\n\n{content}',
  ADVANCED_NLU: 'Perform advanced natural language understanding on the following transcript:\n\n{transcript}',
  MEETING_SUMMARY: 'Generate a comprehensive meeting summary for the following content:\n\n{content}',
  ACTION_ITEM_EXTRACTION: 'Extract action items from the following meeting content:\n\n{content}',
  MEETING_PREDICTION: 'Analyze the following meeting data and predict outcomes:\n\n{meetingData}',
} as const

// Template helper function
export function formatPrompt(template: string, variables: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match)
} 
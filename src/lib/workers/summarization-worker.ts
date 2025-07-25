import { Worker, Job, Queue } from 'bullmq'
import { supabase } from '@/lib/supabase-client'
import { generateWithFallback, PROMPT_TEMPLATES, formatPrompt } from '@/lib/llm'

// Create embedding queue for chaining
const embeddingQueue = new Queue('embedding', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
})

// Job data interface
interface SummarizationJobData {
  content: string
  userId: string
  sourceId: string
  sourceType: string
  format: 'bullets' | 'narrative' | 'tldr'
}

// Summarization worker
export const summarizationWorker = new Worker<SummarizationJobData>(
  'summarization',
  async (job: Job<SummarizationJobData>) => {
    const startTime = Date.now()
    const jobId = job.id
    const jobData = job.data

    try {
      console.log(`[Summarization Worker] Processing job ${jobId} for user ${jobData.userId}`)

      // BD34: Split input if token count exceeds limit
      const maxTokens = 8000 // Safe limit for most LLMs
      const contentLength = jobData.content.length
      const estimatedTokens = Math.ceil(contentLength / 4) // Rough estimate

      let contentToSummarize = jobData.content
      let isChunked = false

      if (estimatedTokens > maxTokens) {
        // Split content into chunks
        const chunks = splitContentIntoChunks(jobData.content, maxTokens * 4)
        contentToSummarize = chunks[0] // Use first chunk for now
        isChunked = true
        
        console.log(`[Summarization Worker] Content chunked from ${contentLength} to ${contentToSummarize.length} characters`)
      }

      // BD161: Generate summary using LLM fallback
      const prompt = formatPrompt(
        PROMPT_TEMPLATES.SUMMARIZATION[jobData.format],
        { content: contentToSummarize }
      )

      const llmResponse = await generateWithFallback({
        prompt,
        systemPrompt: 'You are a helpful assistant that creates concise, accurate summaries.',
        temperature: 0.3,
        maxTokens: 500,
      })

      if (!llmResponse.success) {
        throw new Error(`Failed to generate summary: ${llmResponse.error}`)
      }

      // BD163: Include source memory_id and timestamp
      // BD165: Include model_used, type, input_tokens, output_tokens
      // BD180: Include confidence score
      const confidenceScore = calculateConfidenceScore(llmResponse.latency, llmResponse.tokens.total)

      // Store summary in database
      const { data: summary, error: insertError } = await supabase
        .from('summaries')
        .insert({
          user_id: jobData.userId,
          source_id: jobData.sourceId,
          source_type: jobData.sourceType,
          content: llmResponse.content,
          model_used: llmResponse.model,
          input_tokens: llmResponse.tokens.input,
          output_tokens: llmResponse.tokens.output,
          confidence_score: confidenceScore,
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(`Failed to store summary: ${insertError.message}`)
      }

      // BD164: Generate embeddings for all summaries
      await embeddingQueue.add('embed-summary', {
        content: llmResponse.content,
        userId: jobData.userId,
        sourceType: 'summary',
        sourceApp: 'general',
        memoryId: summary.id,
        usageType: 'summary',
        tags: [jobData.format, jobData.sourceType],
      })

      const processingTime = Date.now() - startTime
      console.log(`[Summarization Worker] Job ${jobId} completed in ${processingTime}ms`)

      return {
        success: true,
        summaryId: summary.id,
        content: llmResponse.content,
        model: llmResponse.model,
        tokens: llmResponse.tokens,
        confidence: confidenceScore,
        isChunked,
        processingTime,
      }

    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[Summarization Worker] Job ${jobId} failed after ${duration}ms:`, error)

      // Log job failure
      await logJobFailure('summarization', jobId?.toString() || 'unknown', jobData.userId, duration, error)

      throw error
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    },
  }
)

// Split content into chunks (BD34)
function splitContentIntoChunks(content: string, maxChunkSize: number): string[] {
  const chunks: string[] = []
  let currentChunk = ''
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += sentence + '. '
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

// Calculate confidence score (BD180)
function calculateConfidenceScore(latency: number, totalTokens: number): number {
  // Base confidence on latency and token efficiency
  const latencyScore = Math.max(0, 1 - (latency / 10000)) // Lower latency = higher score
  const tokenScore = Math.max(0, 1 - (totalTokens / 1000)) // Fewer tokens = higher score
  
  return Math.min(1, (latencyScore + tokenScore) / 2)
}

// Job failure logging
async function logJobFailure(
  jobType: string,
  jobId: string,
  userId: string,
  duration: number,
  error: any
) {
  try {
    await supabase.from('job_logs').insert({
      job_type: jobType,
      job_id: jobId,
      user_id: userId,
      status: 'failed',
      duration_ms: duration,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      created_at: new Date().toISOString(),
    })
  } catch (logError) {
    console.error('Failed to log job failure:', logError)
  }
}

// Worker event handlers
summarizationWorker.on('completed', (job) => {
  console.log(`[Summarization Worker] Job ${job.id} completed successfully`)
})

summarizationWorker.on('failed', (job, err) => {
  console.error(`[Summarization Worker] Job ${job?.id} failed:`, err)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down summarization worker...')
  await summarizationWorker.close()
  await embeddingQueue.close()
  process.exit(0)
}) 
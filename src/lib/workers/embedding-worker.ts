import { Worker, Job } from 'bullmq'
import { supabase } from '@/lib/supabase-client'
import { openai, ollamaClient } from '@/lib/llm'

// Redis connection configuration
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
}

// Job data interface
interface EmbeddingJobData {
  content: string
  userId: string
  sourceType: string
  sourceApp: string
  memoryId?: string
  snapshotId?: string
  confidenceScore?: number
  intentLabel?: string
  usageType?: string
  tags?: string[]
  originatingLLM?: string
  prompt?: string
}

// Memory classification types
type MemoryType = 'fact' | 'task' | 'insight' | 'irrelevant'

// Embedding worker
export const embeddingWorker = new Worker<EmbeddingJobData>(
  'embedding',
  async (job: Job<EmbeddingJobData>) => {
    const startTime = Date.now()
    const jobId = job.id
    const jobData = job.data

    try {
      console.log(`[Embedding Worker] Processing job ${jobId} for user ${jobData.userId}`)

      // BD1: Include source_app, user_id, and snapshot_id metadata
      // BD3: Include confidence_score and intent_label
      // BD5: Support tagging by topic or persona
      // BD6: Support usage_type field
      // BD7: Linkable to sessions in Mere
      // BD4: Log originating LLM and prompt
      // BD17: Classify memory type

      // Generate embedding using OpenAI (primary)
      let embedding: number[] | null = null
      let embeddingModel = 'text-embedding-3-small'
      let embeddingTokens = 0

      try {
        const embeddingResponse = await openai.embeddings.create({
          model: embeddingModel,
          input: jobData.content,
          encoding_format: 'float',
        })

        embedding = embeddingResponse.data[0].embedding
        embeddingTokens = embeddingResponse.usage.total_tokens

        console.log(`[Embedding Worker] OpenAI embedding generated, tokens: ${embeddingTokens}`)
      } catch (error) {
        console.warn(`[Embedding Worker] OpenAI embedding failed, falling back to Ollama`)
        
        // Fallback to Ollama for embedding
        try {
          const ollamaResponse = await fetch(`${process.env.OLLAMA_BASE_URL}/api/embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'nomic-embed-text',
              prompt: jobData.content,
            }),
          })

          if (ollamaResponse.ok) {
            const data = await ollamaResponse.json()
            embedding = data.embedding
            embeddingModel = 'nomic-embed-text'
            console.log(`[Embedding Worker] Ollama embedding generated`)
          }
        } catch (ollamaError) {
          console.error(`[Embedding Worker] Ollama embedding also failed:`, ollamaError)
          throw new Error('All embedding providers failed')
        }
      }

      if (!embedding) {
        throw new Error('Failed to generate embedding')
      }

      // BD16: Log tokens used for LLM fallback
      console.log(`[Embedding Worker] Embedding tokens used: ${embeddingTokens}`)

      // Classify memory type (BD17)
      const memoryType = await classifyMemoryType(jobData.content, jobData.sourceType)

      // Update memory record with embedding and metadata
      const updateData: any = {
        embedding,
        confidence_score: jobData.confidenceScore || 0.8,
        intent_label: jobData.intentLabel || 'general',
        usage_type: jobData.usageType || 'general',
        memory_type: memoryType,
        embedding_model: embeddingModel,
        embedding_tokens: embeddingTokens,
        updated_at: new Date().toISOString(),
      }

      // Add tags if provided (BD5)
      if (jobData.tags && jobData.tags.length > 0) {
        updateData.tags = jobData.tags
      }

      // Add originating LLM and prompt if provided (BD4)
      if (jobData.originatingLLM) {
        updateData.originating_llm = jobData.originatingLLM
      }
      if (jobData.prompt) {
        updateData.originating_prompt = jobData.prompt
      }

      // Update the memory record
      if (!jobData.memoryId) {
        throw new Error('Memory ID is required for embedding update')
      }
      
      const { error: updateError } = await supabase
        .from('memories')
        .update(updateData)
        .eq('id', jobData.memoryId)

      if (updateError) {
        throw new Error(`Failed to update memory: ${updateError.message}`)
      }

      // BD24: Mark embedding job as complete
      const duration = Date.now() - startTime
      console.log(`[Embedding Worker] Job ${jobId} completed in ${duration}ms`)

      return {
        success: true,
        memoryId: jobData.memoryId,
        embeddingLength: embedding.length,
        model: embeddingModel,
        tokens: embeddingTokens,
        memoryType,
        duration,
      }

    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[Embedding Worker] Job ${jobId} failed after ${duration}ms:`, error)

      // BD23: Log job details
      await logJobFailure('embedding', jobId?.toString() || 'unknown', jobData.userId, duration, error)

      throw error
    }
  },
  {
    connection: redisConnection,
  }
)

// Memory type classification (BD17)
async function classifyMemoryType(content: string, sourceType: string): Promise<MemoryType> {
  try {
    const classificationPrompt = `Classify the following content as one of: fact, task, insight, or irrelevant. Consider the source type: ${sourceType}.

Content: ${content.substring(0, 500)}

Respond with only the classification:`

    const response = await ollamaClient.generate({
      prompt: classificationPrompt,
      maxTokens: 10,
      temperature: 0.1,
    })

    if (response.success) {
      const classification = response.content.toLowerCase().trim()
      if (['fact', 'task', 'insight', 'irrelevant'].includes(classification)) {
        return classification as MemoryType
      }
    }
  } catch (error) {
    console.warn('Memory classification failed, defaulting to fact:', error)
  }

  return 'fact' // Default classification
}

// Job failure logging (BD23)
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
embeddingWorker.on('completed', (job) => {
  console.log(`[Embedding Worker] Job ${job.id} completed successfully`)
})

embeddingWorker.on('failed', (job, err) => {
  console.error(`[Embedding Worker] Job ${job?.id} failed:`, err)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down embedding worker...')
  await embeddingWorker.close()
  process.exit(0)
}) 
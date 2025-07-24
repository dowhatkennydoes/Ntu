import { Queue, Worker, Job } from 'bullmq'

// Redis connection configuration for BullMQ
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
}

// Job queue types
export enum JobType {
  TRANSCRIPTION = 'transcription',
  EMBEDDING = 'embedding',
  SUMMARIZATION = 'summarization',
  MEMORY_UPDATE = 'memory_update',
  VECTOR_INDEX = 'vector_index',
  AUDIO_PROCESSING = 'audio_processing',
}

// Job data interfaces
export interface TranscriptionJobData {
  fileId: string
  userId: string
  filePath: string
  language?: string
}

export interface EmbeddingJobData {
  content: string
  userId: string
  sourceType: string
  sourceApp: string
  memoryId?: string
}

export interface SummarizationJobData {
  content: string
  userId: string
  sourceId: string
  sourceType: string
  format: 'bullets' | 'narrative' | 'tldr'
}

export interface MemoryUpdateJobData {
  memoryId: string
  userId: string
  content: string
  sourceApp: string
}

// Create job queues
export const transcriptionQueue = new Queue<TranscriptionJobData>(JobType.TRANSCRIPTION, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})

export const embeddingQueue = new Queue<EmbeddingJobData>(JobType.EMBEDDING, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 200,
    removeOnFail: 100,
  },
})

export const summarizationQueue = new Queue<SummarizationJobData>(JobType.SUMMARIZATION, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})

export const memoryUpdateQueue = new Queue<MemoryUpdateJobData>(JobType.MEMORY_UPDATE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 200,
    removeOnFail: 100,
  },
})

// Queue monitoring
export const getQueueStats = async () => {
  const queues = [transcriptionQueue, embeddingQueue, summarizationQueue, memoryUpdateQueue]
  const stats = await Promise.all(
    queues.map(async (queue) => {
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
      ])
      
      return {
        name: queue.name,
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      }
    })
  )
  
  return stats
}

// Graceful shutdown
export const closeQueues = async () => {
  await Promise.all([
    transcriptionQueue.close(),
    embeddingQueue.close(),
    summarizationQueue.close(),
    memoryUpdateQueue.close(),
  ])
} 
import { Worker, Job, Queue } from 'bullmq'
import { supabase } from '@/lib/supabase-client'

// Create embedding queue for chaining
const embeddingQueue = new Queue('embedding', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
})

// Job data interface
interface TranscriptionJobData {
  fileId: string
  userId: string
  filePath: string
  language?: string
}

// Transcription worker
export const transcriptionWorker = new Worker<TranscriptionJobData>(
  'transcription',
  async (job: Job<TranscriptionJobData>) => {
    const startTime = Date.now()
    const jobId = job.id
    const jobData = job.data

    try {
      console.log(`[Transcription Worker] Processing job ${jobId} for file ${jobData.fileId}`)

      // BD27: Fail gracefully if audio format unsupported
      // BD40: Include word count and speaker labels

      // Download file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('audio-files')
        .download(jobData.filePath)

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`)
      }

      // Convert to buffer
      const audioBuffer = await fileData.arrayBuffer()

      // Validate file format
      const supportedFormats = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/aac']
      const fileType = fileData.type
      
      if (!supportedFormats.includes(fileType)) {
        throw new Error(`Unsupported audio format: ${fileType}`)
      }

      // Use Whisper API for transcription
      let transcription = ''
      let language = jobData.language || 'auto'
      let wordCount = 0
      let speakerCount = 1

      try {
        // Try OpenAI Whisper API first
        const formData = new FormData()
        formData.append('file', new Blob([audioBuffer], { type: fileType }), 'audio.wav')
        formData.append('model', 'whisper-1')
        formData.append('language', language)
        formData.append('response_format', 'verbose_json')

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          transcription = result.text
          language = result.language
          wordCount = result.text.split(/\s+/).length
          
          // Extract speaker information if available
          if (result.segments) {
            const speakers = new Set()
            result.segments.forEach((segment: any) => {
              if (segment.speaker) {
                speakers.add(segment.speaker)
              }
            })
            speakerCount = speakers.size || 1
          }

          console.log(`[Transcription Worker] OpenAI Whisper transcription completed`)
        } else {
          throw new Error(`OpenAI Whisper failed: ${response.status}`)
        }
      } catch (openaiError) {
        console.warn(`[Transcription Worker] OpenAI Whisper failed, trying Ollama Whisper`)
        
        // Fallback to Ollama Whisper
        try {
          const ollamaResponse = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'whisper',
              prompt: 'transcribe',
              stream: false,
              options: {
                audio: Buffer.from(audioBuffer).toString('base64'),
                language: language,
              },
            }),
          })

          if (ollamaResponse.ok) {
            const result = await ollamaResponse.json()
            transcription = result.response
            wordCount = transcription.split(/\s+/).length
            
            console.log(`[Transcription Worker] Ollama Whisper transcription completed`)
          } else {
            throw new Error(`Ollama Whisper failed: ${ollamaResponse.status}`)
          }
        } catch (ollamaError) {
          console.error(`[Transcription Worker] All transcription providers failed`)
          throw new Error('All transcription providers failed')
        }
      }

      if (!transcription) {
        throw new Error('No transcription generated')
      }

      // Calculate duration (approximate)
      const duration = Math.ceil(audioBuffer.byteLength / 16000) // Rough estimate

      // Store transcription in database
      const { data: transcript, error: insertError } = await supabase
        .from('transcripts')
        .insert({
          user_id: jobData.userId,
          file_id: jobData.fileId,
          content: transcription,
          language: language,
          duration: duration,
          speaker_count: speakerCount,
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(`Failed to store transcript: ${insertError.message}`)
      }

      // BD36: Queue embedding job after transcription
      await embeddingQueue.add('embed-transcript', {
        content: transcription,
        userId: jobData.userId,
        sourceType: 'transcript',
        sourceApp: 'yonder',
        memoryId: transcript.id,
      })

      const processingTime = Date.now() - startTime
      console.log(`[Transcription Worker] Job ${jobId} completed in ${processingTime}ms`)

      return {
        success: true,
        transcriptId: transcript.id,
        wordCount,
        speakerCount,
        language,
        duration,
        processingTime,
      }

    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[Transcription Worker] Job ${jobId} failed after ${duration}ms:`, error)

      // Log job failure
      await logJobFailure('transcription', jobId?.toString() || 'unknown', jobData.userId, duration, error)

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
transcriptionWorker.on('completed', (job) => {
  console.log(`[Transcription Worker] Job ${job.id} completed successfully`)
})

transcriptionWorker.on('failed', (job, err) => {
  console.error(`[Transcription Worker] Job ${job?.id} failed:`, err)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down transcription worker...')
  await transcriptionWorker.close()
  process.exit(0)
}) 
import { NextRequest, NextResponse } from 'next/server'
import { streamAudioToWhisper, WhisperLatencyMonitor } from '@/lib/meeting-bot'

// Global latency monitor
const latencyMonitor = new WhisperLatencyMonitor()

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get audio data from request body
    const audioData = await request.arrayBuffer()
    const audioBuffer = Buffer.from(audioData)

    // Get session info from headers
    const sessionId = request.headers.get('x-session-id')
    const timestamp = parseInt(request.headers.get('x-timestamp') || '0')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // MEET58: Check latency before processing
    if (!latencyMonitor.isLatencyAcceptable()) {
      console.warn('Whisper latency too high, skipping chunk')
      return NextResponse.json({
        text: '',
        confidence: 0,
        is_partial: true,
        latency_warning: true,
      })
    }

    // Process audio with Whisper
    const transcription = await processAudioWithWhisper(audioBuffer, sessionId, timestamp)

    // Record latency
    const endTime = Date.now()
    latencyMonitor.recordRequest(startTime, endTime)

    return NextResponse.json({
      text: transcription.text,
      confidence: transcription.confidence,
      is_partial: transcription.is_partial,
      language: transcription.language,
      timestamp: timestamp,
      latency: endTime - startTime,
      average_latency: latencyMonitor.getAverageLatency(),
    })

  } catch (error) {
    console.error('Stream transcription failed:', error)
    return NextResponse.json(
      { 
        error: 'Transcription failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

async function processAudioWithWhisper(audioBuffer: Buffer, sessionId: string, timestamp: number) {
  try {
    // Try OpenAI Whisper API first
    const formData = new FormData()
    formData.append('file', new Blob([audioBuffer], { type: 'audio/wav' }), 'chunk.wav')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'verbose_json')
    formData.append('language', 'en')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (response.ok) {
      const result = await response.json()
      return {
        text: result.text || '',
        confidence: result.confidence || 0.8,
        is_partial: false,
        language: result.language || 'en',
      }
    }

    // Fallback to Ollama Whisper
    const ollamaResponse = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'whisper',
        prompt: 'transcribe',
        stream: false,
        options: {
          audio: audioBuffer.toString('base64'),
          language: 'en',
        },
      }),
    })

    if (ollamaResponse.ok) {
      const result = await ollamaResponse.json()
      return {
        text: result.response || '',
        confidence: 0.7, // Default confidence for Ollama
        is_partial: false,
        language: 'en',
      }
    }

    throw new Error('All transcription providers failed')

  } catch (error) {
    console.error('Whisper processing failed:', error)
    throw error
  }
} 
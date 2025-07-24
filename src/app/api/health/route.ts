import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getQueueStats } from '@/lib/redis'
import { ollamaClient } from '@/lib/llm'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check database connection
    const dbStart = Date.now()
    const { data: dbTest, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    const dbLatency = Date.now() - dbStart

    // Check Redis connection (via queue stats)
    const redisStart = Date.now()
    const queueStats = await getQueueStats()
    const redisLatency = Date.now() - redisStart

    // Check Ollama connection
    const ollamaStart = Date.now()
    const ollamaTest = await ollamaClient.generate({
      prompt: 'test',
      maxTokens: 1,
    })
    const ollamaLatency = Date.now() - ollamaStart

    // Check environment variables
    const envCheck = {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      redis: !!process.env.REDIS_HOST,
    }

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      nodeEnv: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbError ? 'error' : 'healthy',
          latency: dbLatency,
          error: dbError?.message,
        },
        redis: {
          status: 'healthy',
          latency: redisLatency,
          queues: queueStats,
        },
        ollama: {
          status: ollamaTest.success ? 'healthy' : 'error',
          latency: ollamaLatency,
          error: ollamaTest.error,
        },
      },
      environment: envCheck,
      responseTime: Date.now() - startTime,
    }

    const statusCode = healthStatus.services.database.status === 'error' || 
                      healthStatus.services.ollama.status === 'error' ? 503 : 200

    return NextResponse.json(healthStatus, { status: statusCode })
  } catch (error) {
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
} 
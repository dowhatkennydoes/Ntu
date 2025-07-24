import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { summarizationQueue } from '@/lib/redis'
import { generateWithFallback, PROMPT_TEMPLATES, formatPrompt } from '@/lib/llm'

export async function POST(request: NextRequest) {
  try {
    const { content, userId, sourceId, sourceType, format = 'bullets' } = await request.json()

    if (!content || !userId || !sourceId || !sourceType) {
      return NextResponse.json(
        { error: 'Missing required fields: content, userId, sourceId, sourceType' },
        { status: 400 }
      )
    }

    // Validate format
    const validFormats = ['bullets', 'narrative', 'tldr']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be one of: bullets, narrative, tldr' },
        { status: 400 }
      )
    }

    // Check if content is too long for immediate processing
    const contentLength = content.length
    const maxImmediateLength = 10000 // 10k characters

    if (contentLength > maxImmediateLength) {
      // Queue for background processing
      await summarizationQueue.add('summarize-content', {
        content,
        userId,
        sourceId,
        sourceType,
        format,
      })

      return NextResponse.json({
        success: true,
        message: 'Content queued for summarization',
        status: 'queued',
        estimatedTime: '2-5 minutes',
      })
    }

    // Process immediately for shorter content
    const prompt = formatPrompt(PROMPT_TEMPLATES.SUMMARIZATION[format as keyof typeof PROMPT_TEMPLATES.SUMMARIZATION], {
      content: content.substring(0, maxImmediateLength),
    })

    const llmResponse = await generateWithFallback({
      prompt,
      systemPrompt: 'You are a helpful assistant that creates concise, accurate summaries.',
      temperature: 0.3,
      maxTokens: 500,
    })

    if (!llmResponse.success) {
      return NextResponse.json(
        { error: 'Failed to generate summary', details: llmResponse.error },
        { status: 500 }
      )
    }

    // Store summary in database
    const { data: summary, error: dbError } = await supabase
      .from('summaries')
      .insert({
        user_id: userId,
        source_id: sourceId,
        source_type: sourceType,
        content: llmResponse.content,
        model_used: llmResponse.model,
        input_tokens: llmResponse.tokens.input,
        output_tokens: llmResponse.tokens.output,
        confidence_score: 0.8, // Default confidence for immediate summaries
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to store summary', details: dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      summary: {
        id: summary.id,
        content: summary.content,
        model: summary.model_used,
        tokens: {
          input: summary.input_tokens,
          output: summary.output_tokens,
        },
        confidence: summary.confidence_score,
      },
      status: 'completed',
      latency: llmResponse.latency,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const sourceId = searchParams.get('sourceId')
    const sourceType = searchParams.get('sourceType')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    let queryBuilder = supabase
      .from('summaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (sourceId) {
      queryBuilder = queryBuilder.eq('source_id', sourceId)
    }

    if (sourceType) {
      queryBuilder = queryBuilder.eq('source_type', sourceType)
    }

    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: summaries, error, count } = await queryBuilder

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch summaries', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      summaries,
      pagination: {
        limit,
        offset,
        total: count || summaries.length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
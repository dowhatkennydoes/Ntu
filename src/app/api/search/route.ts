import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { openai } from '@/lib/llm'

export async function POST(request: NextRequest) {
  try {
    const { query, userId, sourceApp, sourceType, limit = 10, threshold = 0.7, showReasoning = false } = await request.json()

    if (!query || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: query, userId' },
        { status: 400 }
      )
    }

    // BD19: Vector queries must run in under 300ms for <100k records
    const startTime = Date.now()

    // Generate embedding for the query
    let queryEmbedding: number[]
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float',
      })
      queryEmbedding = embeddingResponse.data[0].embedding
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to generate query embedding', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    // BD8: Search queries must return contextual chunks, not just matches
    // BD169: Notes, summaries, and memories must all support hybrid search
    let searchQuery = supabase
      .rpc('match_memories', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        user_id: userId,
      })

    // Apply filters if provided
    if (sourceApp) {
      searchQuery = searchQuery.eq('source_app', sourceApp)
    }

    if (sourceType) {
      searchQuery = searchQuery.eq('source_type', sourceType)
    }

    const { data: memories, error } = await searchQuery

    if (error) {
      return NextResponse.json(
        { error: 'Failed to search memories', details: error.message },
        { status: 500 }
      )
    }

    // BD10: Similarity queries must return cosine similarity threshold value
    const results = memories?.map((memory: any) => ({
      id: memory.id,
      content: memory.content,
      source_app: memory.source_app,
      source_type: memory.source_type,
      similarity: memory.similarity,
      confidence_score: memory.confidence_score,
      intent_label: memory.intent_label,
      memory_type: memory.memory_type,
      created_at: memory.created_at,
      // BD9: Semantic recall must support a "show reasoning chain" option
      reasoning_chain: showReasoning ? generateReasoningChain(query, memory.content, memory.similarity) : undefined,
    })) || []

    // BD12: User-facing memory results must be sorted by relevance, not recency
    results.sort((a: any, b: any) => b.similarity - a.similarity)

    const queryTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      query,
      results,
      metadata: {
        total_results: results.length,
        query_time_ms: queryTime,
        threshold,
        user_id: userId,
      },
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
    const sourceApp = searchParams.get('sourceApp')
    const sourceType = searchParams.get('sourceType')
    const memoryType = searchParams.get('memoryType')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get memories with filters
    let queryBuilder = supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (sourceApp) {
      queryBuilder = queryBuilder.eq('source_app', sourceApp)
    }

    if (sourceType) {
      queryBuilder = queryBuilder.eq('source_type', sourceType)
    }

    if (memoryType) {
      queryBuilder = queryBuilder.eq('memory_type', memoryType)
    }

    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: memories, error, count } = await queryBuilder

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch memories', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      memories,
      pagination: {
        limit,
        offset,
        total: count || memories?.length || 0,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Generate reasoning chain for search results (BD9)
function generateReasoningChain(query: string, content: string, similarity: number): string {
  const reasoningSteps = [
    `Query: "${query}"`,
    `Content: "${content.substring(0, 200)}..."`,
    `Similarity Score: ${(similarity * 100).toFixed(1)}%`,
    `Reasoning: The content matches the query based on semantic similarity.`,
  ]

  return reasoningSteps.join('\n')
} 
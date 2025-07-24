import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { embeddingQueue } from '@/lib/redis'
import { generateWithFallback, PROMPT_TEMPLATES, formatPrompt } from '@/lib/llm'

export async function POST(request: NextRequest) {
  try {
    const { content, userId, sourceApp, sourceType, confidenceScore, intentLabel } = await request.json()

    if (!content || !userId || !sourceApp || !sourceType) {
      return NextResponse.json(
        { error: 'Missing required fields: content, userId, sourceApp, sourceType' },
        { status: 400 }
      )
    }

    // Create memory record without embedding initially
    const { data: memory, error: insertError } = await supabase
      .from('memories')
      .insert({
        user_id: userId,
        content,
        source_app: sourceApp,
        source_type: sourceType,
        confidence_score: confidenceScore || 0.8,
        intent_label: intentLabel || 'general',
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create memory', details: insertError.message },
        { status: 500 }
      )
    }

    // Queue embedding job
    await embeddingQueue.add('create-embedding', {
      content,
      userId,
      sourceType,
      sourceApp,
      memoryId: memory.id,
    })

    return NextResponse.json({
      success: true,
      memory,
      message: 'Memory created and embedding queued',
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
    const query = searchParams.get('query')
    const sourceApp = searchParams.get('sourceApp')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    let queryBuilder = supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (sourceApp) {
      queryBuilder = queryBuilder.eq('source_app', sourceApp)
    }

    // Apply pagination
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
        total: count || memories.length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, content, confidenceScore, intentLabel } = await request.json()

    if (!id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: id, content' },
        { status: 400 }
      )
    }

    // Update memory record
    const { data: memory, error: updateError } = await supabase
      .from('memories')
      .update({
        content,
        confidence_score: confidenceScore,
        intent_label: intentLabel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update memory', details: updateError.message },
        { status: 500 }
      )
    }

    // Queue embedding update job
    await embeddingQueue.add('update-embedding', {
      content,
      userId: memory.user_id,
      sourceType: memory.source_type,
      sourceApp: memory.source_app,
      memoryId: memory.id,
    })

    return NextResponse.json({
      success: true,
      memory,
      message: 'Memory updated and embedding queued',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('memories')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete memory', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Memory deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateWithFallback } from '@/lib/llm'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId, message, appContext = 'general' } = await request.json()

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, message' },
        { status: 400 }
      )
    }

    let currentSessionId = sessionId

    // Create new session if not provided
    if (!currentSessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          app_context: appContext,
          title: `Chat - ${new Date().toLocaleDateString()}`,
        })
        .select()
        .single()

      if (sessionError) {
        return NextResponse.json(
          { error: 'Failed to create chat session', details: sessionError.message },
          { status: 500 }
        )
      }

      currentSessionId = session.id
    }

    // Store user message
    const { data: userMessage, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        user_id: userId,
        role: 'user',
        content: message,
      })
      .select()
      .single()

    if (userMessageError) {
      return NextResponse.json(
        { error: 'Failed to store user message', details: userMessageError.message },
        { status: 500 }
      )
    }

    // Get chat history for context
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(10) // Last 10 messages for context

    if (historyError) {
      return NextResponse.json(
        { error: 'Failed to fetch chat history', details: historyError.message },
        { status: 500 }
      )
    }

    // Build context-aware prompt
    const systemPrompt = `You are Mere, an AI assistant for the Ntu platform. You are currently in the ${appContext} context. Be helpful, concise, and contextually aware.`

    const conversationHistory = chatHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n')

    const fullPrompt = `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}\nAssistant:`

    // Generate AI response
    const llmResponse = await generateWithFallback({
      prompt: fullPrompt,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    if (!llmResponse.success) {
      return NextResponse.json(
        { error: 'Failed to generate response', details: llmResponse.error },
        { status: 500 }
      )
    }

    // Store AI response
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        user_id: userId,
        role: 'assistant',
        content: llmResponse.content,
        tokens_used: llmResponse.tokens.total,
      })
      .select()
      .single()

    if (aiMessageError) {
      return NextResponse.json(
        { error: 'Failed to store AI response', details: aiMessageError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sessionId: currentSessionId,
      message: {
        id: aiMessage.id,
        content: aiMessage.content,
        role: aiMessage.role,
        tokens: aiMessage.tokens_used,
      },
      latency: llmResponse.latency,
      model: llmResponse.model,
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
    const sessionId = searchParams.get('sessionId')
    const appContext = searchParams.get('appContext')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (sessionId) {
      // Get messages for specific session
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch messages', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        messages,
        pagination: {
          limit,
          offset,
          total: messages.length,
        },
      })
    } else {
      // Get chat sessions
      let queryBuilder = supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (appContext) {
        queryBuilder = queryBuilder.eq('app_context', appContext)
      }

      queryBuilder = queryBuilder.range(offset, offset + limit - 1)

      const { data: sessions, error, count } = await queryBuilder

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch sessions', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        sessions,
        pagination: {
          limit,
          offset,
          total: count || sessions.length,
        },
      })
    }
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
    const sessionId = searchParams.get('sessionId')
    const messageId = searchParams.get('messageId')

    if (!sessionId && !messageId) {
      return NextResponse.json(
        { error: 'sessionId or messageId is required' },
        { status: 400 }
      )
    }

    if (messageId) {
      // Delete specific message
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to delete message', details: error.message },
          { status: 500 }
        )
      }
    } else {
      // Delete entire session and all messages
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId)

      if (messagesError) {
        return NextResponse.json(
          { error: 'Failed to delete session messages', details: messagesError.message },
          { status: 500 }
        )
      }

      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)

      if (sessionError) {
        return NextResponse.json(
          { error: 'Failed to delete session', details: sessionError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: messageId ? 'Message deleted successfully' : 'Session deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
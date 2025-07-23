import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // TODO: Implement actual LLM integration
    // For now, return a mock response
    return NextResponse.json({
      id: Date.now().toString(),
      role: 'assistant',
      content: `This is a mock response to: "${message}". The actual Mere AI integration is pending implementation.`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in Mere API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
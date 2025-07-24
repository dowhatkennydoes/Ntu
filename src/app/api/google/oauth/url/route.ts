import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@/lib/google-oauth'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Generate OAuth URL with state parameter for security
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64')
    const authUrl = getGoogleAuthUrl(state)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating OAuth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate OAuth URL' },
      { status: 500 }
    )
  }
} 
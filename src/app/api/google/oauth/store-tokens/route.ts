import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { storeGoogleTokens } from '@/lib/google-oauth'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify the session token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session token' }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    const { 
      user_id, 
      google_user_id, 
      google_email, 
      access_token, 
      refresh_token, 
      expires_in 
    } = body

    // Validate required fields
    if (!user_id || !google_user_id || !google_email || !access_token) {
      return NextResponse.json({ 
        error: 'Missing required fields: user_id, google_user_id, google_email, access_token' 
      }, { status: 400 })
    }

    // Ensure the user_id matches the authenticated user
    if (user_id !== user.id) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 })
    }

    // Store the Google OAuth tokens
    const result = await storeGoogleTokens(
      user_id,
      google_user_id,
      google_email,
      access_token,
      refresh_token || '', // refresh_token might be null for some OAuth flows
      expires_in || 3600
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Google OAuth tokens stored successfully',
      data: {
        id: result.id,
        google_email: result.google_email,
        created_at: result.created_at
      }
    })

  } catch (error) {
    console.error('Error storing Google tokens:', error)
    
    return NextResponse.json({ 
      error: 'Failed to store Google OAuth tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
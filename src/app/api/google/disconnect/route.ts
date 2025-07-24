import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-meetings'

export async function POST(request: NextRequest) {
  try {
    const { userId, accountId } = await request.json()

    if (!userId || !accountId) {
      return NextResponse.json(
        { error: 'User ID and Account ID are required' },
        { status: 400 }
      )
    }

    // Deactivate the account
    const { error } = await supabase
      .from('google_oauth_tokens')
      .update({ is_active: false })
      .eq('id', accountId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error disconnecting account:', error)
      return NextResponse.json(
        { error: 'Failed to disconnect account' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in disconnect API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
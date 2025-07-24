import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-meetings'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: accounts, error } = await supabase
      .from('google_oauth_tokens')
      .select('id, google_user_id, google_email, is_active, created_at, updated_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching Google accounts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch connected accounts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ accounts: accounts || [] })
  } catch (error) {
    console.error('Error in accounts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
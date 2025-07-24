import { NextRequest, NextResponse } from 'next/server'
import { syncCalendarEvents, checkActiveMeetings, handleCanceledEvents, checkForMeetEvents } from '@/lib/google-calendar'
import { getConnectedAccounts } from '@/lib/google-oauth'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if user has connected Google account
    const connectedAccounts = await getConnectedAccounts(userId)
    if (connectedAccounts.length === 0) {
      return NextResponse.json(
        { error: 'No connected Google account found' },
        { status: 400 }
      )
    }

    // Sync calendar events
    const syncedCount = await syncCalendarEvents(userId)
    
    // Check for active meetings
    const activeMeetings = await checkActiveMeetings(userId)
    
    // Handle canceled events
    const canceledCount = await handleCanceledEvents(userId)
    
    // Check if user has Meet events
    const hasMeetEvents = await checkForMeetEvents(userId)

    return NextResponse.json({
      success: true,
      synced_events: syncedCount,
      active_meetings: activeMeetings.length,
      canceled_events: canceledCount,
      has_meet_events: hasMeetEvents,
      message: `Successfully synced ${syncedCount} events with Meet links`,
    })

  } catch (error) {
    console.error('Calendar sync failed:', error)
    return NextResponse.json(
      { 
        error: 'Calendar sync failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check connection status
    const connectedAccounts = await getConnectedAccounts(userId)
    const hasMeetEvents = await checkForMeetEvents(userId)

    return NextResponse.json({
      success: true,
      connected_accounts: connectedAccounts.length,
      has_meet_events: hasMeetEvents,
      accounts: connectedAccounts.map(account => ({
        email: account.google_email,
        connected_at: account.created_at,
      })),
    })

  } catch (error) {
    console.error('Failed to get sync status:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get sync status', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 
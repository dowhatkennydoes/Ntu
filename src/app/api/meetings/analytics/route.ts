import { NextRequest, NextResponse } from 'next/server'
import { getMeetingAnalytics, filterMeetings } from '@/lib/post-meeting-processor'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const timeRange = searchParams.get('timeRange') as 'week' | 'month' | 'quarter' || 'month'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get analytics data
    const analytics = await getMeetingAnalytics(userId, timeRange)

    return NextResponse.json({
      success: true,
      analytics,
      timeRange,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Failed to get meeting analytics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get meeting analytics', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, filters } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Filter meetings based on criteria
    const filteredMeetings = await filterMeetings(userId, filters || {})

    return NextResponse.json({
      success: true,
      meetings: filteredMeetings,
      total: filteredMeetings.length,
      filters: filters || {},
    })

  } catch (error) {
    console.error('Failed to filter meetings:', error)
    return NextResponse.json(
      { 
        error: 'Failed to filter meetings', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 
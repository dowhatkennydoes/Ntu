import { NextRequest, NextResponse } from 'next/server'
import { getUpcomingMeetings } from '@/lib/supabase-meetings'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get upcoming meetings for sidebar
    const meetings = await getUpcomingMeetings(userId, limit)

    // Format meetings for sidebar display
    const formattedMeetings = meetings.map((meeting: any) => ({
      id: meeting.id,
      title: meeting.title,
      start_time: meeting.start_time,
      end_time: meeting.end_time,
      status: meeting.status,
      hangout_link: meeting.hangout_link,
      has_summary: meeting.meeting_summaries && meeting.meeting_summaries.length > 0,
      transcription_status: getTranscriptionStatus(meeting),
      relative_time: getRelativeTime(meeting.start_time),
    }))

    return NextResponse.json({
      success: true,
      meetings: formattedMeetings,
      total: meetings.length,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Failed to get upcoming meetings:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get upcoming meetings', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Helper function to get transcription status
function getTranscriptionStatus(meeting: any): 'not_started' | 'in_progress' | 'completed' {
  if (meeting.meeting_summaries && meeting.meeting_summaries.length > 0) {
    return 'completed'
  }
  
  if (meeting.meeting_bot_sessions && meeting.meeting_bot_sessions.length > 0) {
    const botSession = meeting.meeting_bot_sessions[0]
    if (botSession.join_status === 'success' && !meeting.meeting_summaries) {
      return 'in_progress'
    }
  }
  
  return 'not_started'
}

// Helper function to get relative time
function getRelativeTime(startTime: string): string {
  const now = new Date()
  const start = new Date(startTime)
  const diffMs = start.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMs < 0) {
    return 'just now'
  } else if (diffMins < 1) {
    return 'starting now'
  } else if (diffMins < 60) {
    return `in ${diffMins} min`
  } else if (diffHours < 24) {
    return `in ${diffHours}h`
  } else if (diffDays === 1) {
    return 'tomorrow'
  } else {
    return `in ${diffDays} days`
  }
} 
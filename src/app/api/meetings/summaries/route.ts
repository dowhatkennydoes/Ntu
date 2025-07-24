import { NextRequest, NextResponse } from 'next/server'
import { 
  generateMeetingSummary, 
  updateMeetingSummary,
  extractActionItems,
  analyzeMeetingSentiment,
  extractMeetingTopics
} from '@/lib/post-meeting-processor'
import { supabase } from '@/lib/supabase-meetings'

export async function POST(request: NextRequest) {
  try {
    const { meetingId, userId, transcript, speakerSegments } = await request.json()

    if (!meetingId || !userId || !transcript) {
      return NextResponse.json(
        { error: 'meetingId, userId, and transcript are required' },
        { status: 400 }
      )
    }

    // Generate meeting summary
    const summary = await generateMeetingSummary(
      transcript,
      speakerSegments || [],
      meetingId,
      userId
    )

    // Extract action items
    const actionItems = await extractActionItems(transcript, userId)

    // Analyze sentiment
    const sentiment = await analyzeMeetingSentiment(transcript)

    // Extract topics
    const topics = await extractMeetingTopics(transcript)

    return NextResponse.json({
      success: true,
      summary,
      actionItems,
      sentiment,
      topics,
      message: 'Meeting summary generated successfully',
    })

  } catch (error) {
    console.error('Failed to generate meeting summary:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate meeting summary', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { summaryId, userId, updates } = await request.json()

    if (!summaryId || !userId || !updates) {
      return NextResponse.json(
        { error: 'summaryId, userId, and updates are required' },
        { status: 400 }
      )
    }

    // Update meeting summary
    const updatedSummary = await updateMeetingSummary(summaryId, userId, updates)

    return NextResponse.json({
      success: true,
      summary: updatedSummary,
      message: 'Meeting summary updated successfully',
    })

  } catch (error) {
    console.error('Failed to update meeting summary:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update meeting summary', 
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
    const meetingId = searchParams.get('meetingId')
    const summaryId = searchParams.get('summaryId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('meeting_summaries')
      .select('*')
      .eq('user_id', userId)

    if (meetingId) {
      query = query.eq('meeting_id', meetingId)
    }

    if (summaryId) {
      query = query.eq('id', summaryId)
    }

    const { data: summaries, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch summaries: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      summaries: summaries || [],
      total: summaries?.length || 0,
    })

  } catch (error) {
    console.error('Failed to get meeting summaries:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get meeting summaries', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 
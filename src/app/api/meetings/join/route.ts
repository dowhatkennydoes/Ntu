import { NextRequest, NextResponse } from 'next/server'
import { 
  inviteBotToMeeting, 
  checkUserMeetingRole, 
  handleBotLobby,
  setupAudioCapture,
  notifyParticipantsOfRecording,
  createTranscriptSession,
  trackBotJoinLeave,
  disconnectFromMeeting,
  stopTranscription
} from '@/lib/meeting-bot'
import { supabase } from '@/lib/supabase-meetings'

export async function POST(request: NextRequest) {
  try {
    const { meetingId, userId, joinAsBot = true, autoTranscribe = true } = await request.json()

    if (!meetingId || !userId) {
      return NextResponse.json(
        { error: 'meetingId and userId are required' },
        { status: 400 }
      )
    }

    // MEET43: Check if user is host or participant
    const userRole = await checkUserMeetingRole(meetingId, userId)
    
    if (userRole === 'guest') {
      return NextResponse.json(
        { error: 'Only hosts and participants can join meetings' },
        { status: 403 }
      )
    }

    // MEET41: Join meeting as bot if requested
    let botSession = null
    if (joinAsBot) {
      try {
        // Get meeting details for bot invitation
        const { data: meeting, error: meetingError } = await supabase
          .from('meetings')
          .select('hangout_link, title')
          .eq('id', meetingId)
          .eq('user_id', userId)
          .single()

        if (meetingError || !meeting) {
          throw new Error('Meeting not found')
        }

        // Invite bot to meeting
        botSession = await inviteBotToMeeting(meetingId, userId, meeting.hangout_link)

        // MEET44: Handle lobby if needed
        if (botSession.join_status === 'pending') {
          await handleBotLobby(meetingId, botSession.id)
        }

        // MEET47: Notify participants of recording
        await notifyParticipantsOfRecording(meetingId, userId)

        // MEET45: Setup audio capture
        if (autoTranscribe) {
          await setupAudioCapture(meetingId)
        }

        // MEET54: Create transcript session
        const transcriptSessionId = await createTranscriptSession(meetingId, userId)

        // MEET55: Track bot join
        await trackBotJoinLeave(botSession.id, 'join')

        return NextResponse.json({
          success: true,
          bot_session: botSession,
          transcript_session_id: transcriptSessionId,
          user_role: userRole,
          message: 'Bot successfully joined meeting',
        })

      } catch (error) {
        console.error('Bot join failed:', error)
        return NextResponse.json(
          { 
            error: 'Failed to join meeting as bot', 
            details: error instanceof Error ? error.message : 'Unknown error' 
          },
          { status: 500 }
        )
      }
    } else {
      // Join as regular participant (for manual transcription)
      const transcriptSessionId = await createTranscriptSession(meetingId, userId)

      return NextResponse.json({
        success: true,
        transcript_session_id: transcriptSessionId,
        user_role: userRole,
        message: 'Joined meeting for manual transcription',
      })
    }

  } catch (error) {
    console.error('Meeting join failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to join meeting', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get('meetingId')
    const userId = searchParams.get('userId')

    if (!meetingId || !userId) {
      return NextResponse.json(
        { error: 'meetingId and userId are required' },
        { status: 400 }
      )
    }

    // MEET60: Disconnect from meeting
    await disconnectFromMeeting(meetingId, userId)

    return NextResponse.json({
      success: true,
      message: 'Successfully disconnected from meeting',
    })

  } catch (error) {
    console.error('Meeting disconnect failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to disconnect from meeting', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { meetingId, userId, action } = await request.json()

    if (!meetingId || !userId || !action) {
      return NextResponse.json(
        { error: 'meetingId, userId, and action are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'stop_transcription':
        // MEET59: Stop transcription
        await stopTranscription(meetingId, userId)
        return NextResponse.json({
          success: true,
          message: 'Transcription stopped',
        })

      case 'pause_transcription':
        // Pause transcription
        const { error: pauseError } = await supabase
          .from('meetings')
          .update({ 
            status: 'transcription_paused',
            updated_at: new Date().toISOString()
          })
          .eq('id', meetingId)
          .eq('user_id', userId)

        if (pauseError) {
          throw new Error(`Failed to pause transcription: ${pauseError.message}`)
        }

        return NextResponse.json({
          success: true,
          message: 'Transcription paused',
        })

      case 'resume_transcription':
        // Resume transcription
        const { error: resumeError } = await supabase
          .from('meetings')
          .update({ 
            status: 'live',
            updated_at: new Date().toISOString()
          })
          .eq('id', meetingId)
          .eq('user_id', userId)

        if (resumeError) {
          throw new Error(`Failed to resume transcription: ${resumeError.message}`)
        }

        return NextResponse.json({
          success: true,
          message: 'Transcription resumed',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Meeting action failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform meeting action', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 
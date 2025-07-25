import { supabase, MeetingBotSession } from './supabase-meetings'
import { supabaseAdmin } from './supabase-admin'
import { getValidAccessToken } from './google-oauth'

// Bot configuration
const BOT_EMAIL = process.env.MEETING_BOT_EMAIL || 'yonder-bot@ntu.app'
const BOT_NAME = 'Yonder AI Assistant'
const BOT_AVATAR = process.env.BOT_AVATAR_URL || '/bot-avatar.png'

// MEET41: Bot joining capabilities
export interface BotJoinRequest {
  meetingId: string
  userId: string
  hangoutLink: string
  meetingTitle: string
  joinAsBot: boolean
  autoTranscribe: boolean
}

// MEET42: Bot invitation via email
export async function inviteBotToMeeting(meetingId: string, userId: string, hangoutLink: string) {
  try {
    const accessToken = await getValidAccessToken(userId)
    
    // Get meeting details
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .eq('user_id', userId)
      .single()

    if (meetingError || !meeting) {
      throw new Error('Meeting not found')
    }

    // Add bot as attendee to Google Calendar event
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${meeting.google_event_id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendees: [
            ...(meeting.attendees || []),
            {
              email: BOT_EMAIL,
              displayName: BOT_NAME,
              responseStatus: 'accepted',
            },
          ],
        }),
      }
    )

    if (!calendarResponse.ok) {
      throw new Error(`Failed to invite bot to calendar event: ${calendarResponse.status}`)
    }

    // Create bot session record
    const { data: botSession, error: sessionError } = await supabase
      .from('meeting_bot_sessions')
      .insert({
        meeting_id: meetingId,
        user_id: userId,
        bot_email: BOT_EMAIL,
        join_status: 'pending',
      })
      .select()
      .single()

    if (sessionError) {
      throw new Error(`Failed to create bot session: ${sessionError.message}`)
    }

    console.log(`Bot invited to meeting: ${meeting.title}`)
    return botSession

  } catch (error) {
    console.error('Failed to invite bot to meeting:', error)
    throw error
  }
}

// MEET43: Check if user is host or participant
export async function checkUserMeetingRole(meetingId: string, userId: string): Promise<'host' | 'participant' | 'guest'> {
  const { data: meeting, error } = await supabase
    .from('meetings')
    .select('creator_email, attendees')
    .eq('id', meetingId)
    .eq('user_id', userId)
    .single()

  if (error || !meeting) {
    throw new Error('Meeting not found')
  }

  // Get user's Google email from OAuth tokens
  const { data: tokenData } = await supabase
    .from('google_oauth_tokens')
    .select('google_email')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (!tokenData) {
    throw new Error('No active Google account found')
  }

  const userEmail = tokenData.google_email

  // Check if user is creator
  if (meeting.creator_email === userEmail) {
    return 'host'
  }

  // Check if user is attendee
  if (meeting.attendees && meeting.attendees.includes(userEmail)) {
    return 'participant'
  }

  return 'guest'
}

// MEET44: Handle lobby/waiting room logic
export async function handleBotLobby(meetingId: string, botSessionId: string): Promise<boolean> {
  try {
    // Update bot session to lobby waiting
    const { error: updateError } = await supabase
      .from('meeting_bot_sessions')
      .update({ 
        join_status: 'lobby_waiting',
        updated_at: new Date().toISOString()
      })
      .eq('id', botSessionId)

    if (updateError) {
      throw new Error(`Failed to update bot session: ${updateError.message}`)
    }

    // In a real implementation, this would integrate with Google Meet API
    // to handle lobby approval. For now, we'll simulate the process.
    
    // Simulate lobby approval after 30 seconds
    setTimeout(async () => {
      await approveBotFromLobby(botSessionId)
    }, 30000)

    return true

  } catch (error) {
    console.error('Failed to handle bot lobby:', error)
    throw error
  }
}

// MEET45: Audio capture and streaming setup
export interface AudioCaptureConfig {
  sampleRate: number
  channels: number
  bitDepth: number
  chunkSize: number
  format: 'wav' | 'mp3' | 'opus'
}

export const DEFAULT_AUDIO_CONFIG: AudioCaptureConfig = {
  sampleRate: 16000,
  channels: 1,
  bitDepth: 16,
  chunkSize: 1024,
  format: 'wav',
}

export async function setupAudioCapture(meetingId: string, config: AudioCaptureConfig = DEFAULT_AUDIO_CONFIG) {
  try {
    // Create audio session for the meeting
    const { data: audioSession, error } = await supabase
      .from('audio_sessions')
      .insert({
        meeting_id: meetingId,
        sample_rate: config.sampleRate,
        channels: config.channels,
        bit_depth: config.bitDepth,
        format: config.format,
        status: 'initializing',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create audio session: ${error.message}`)
    }

    console.log(`Audio capture setup for meeting: ${meetingId}`)
    return audioSession

  } catch (error) {
    console.error('Failed to setup audio capture:', error)
    throw error
  }
}

// MEET46: Chrome extension support (placeholder)
export interface ChromeExtensionConfig {
  extensionId: string
  permissions: string[]
  tabCapture: boolean
  audioCapture: boolean
}

export function getChromeExtensionConfig(): ChromeExtensionConfig {
  return {
    extensionId: process.env.CHROME_EXTENSION_ID || 'yonder-meet-capture',
    permissions: ['tabCapture', 'audioCapture', 'storage'],
    tabCapture: true,
    audioCapture: true,
  }
}

// MEET47: Meeting recording notification
export async function notifyParticipantsOfRecording(meetingId: string, userId: string) {
  try {
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('title, attendees, creator_email')
      .eq('id', meetingId)
      .eq('user_id', userId)
      .single()

    if (error || !meeting) {
      throw new Error('Meeting not found')
    }

    // Create recording notification
    const { error: notificationError } = await supabase
      .from('meeting_notifications')
      .insert({
        meeting_id: meetingId,
        user_id: userId,
        type: 'recording_notice',
        message: `Yonder AI Assistant will be recording and transcribing this meeting: ${meeting.title}`,
        recipients: meeting.attendees || [],
        created_at: new Date().toISOString(),
      })

    if (notificationError) {
      console.error('Failed to create recording notification:', notificationError)
    }

    console.log(`Recording notification sent for meeting: ${meeting.title}`)

  } catch (error) {
    console.error('Failed to notify participants of recording:', error)
    throw error
  }
}

// MEET48: Audio streaming to Whisper
export async function streamAudioToWhisper(audioChunk: Buffer, sessionId: string, timestamp: number) {
  try {
    // Send audio chunk to Whisper for transcription
    const response = await fetch('/api/transcribe/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: audioChunk,
    })

    if (!response.ok) {
      throw new Error(`Whisper transcription failed: ${response.status}`)
    }

    const transcription = await response.json()

    // Store transcription chunk
    const { error: storeError } = await supabase
      .from('meeting_transcripts')
      .insert({
        meeting_id: sessionId,
        user_id: 'bot', // Bot user ID
        session_id: sessionId,
        content: transcription.text,
        timestamp: timestamp,
        confidence_score: transcription.confidence || 0.8,
        language: transcription.language || 'en',
        chunk_index: Math.floor(timestamp / 30), // 30-second chunks
        is_partial: transcription.is_partial || false,
      })

    if (storeError) {
      console.error('Failed to store transcription chunk:', storeError)
    }

    return transcription

  } catch (error) {
    console.error('Failed to stream audio to Whisper:', error)
    throw error
  }
}

// MEET49: Speaker tagging
export async function detectSpeaker(audioChunk: Buffer, sessionId: string): Promise<string | null> {
  try {
    // This would integrate with speaker diarization service
    // For now, we'll use a simple approach based on audio characteristics
    
    const response = await fetch('/api/speaker/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: audioChunk,
    })

    if (response.ok) {
      const result = await response.json()
      return result.speaker_id || null
    }

    return null

  } catch (error) {
    console.error('Failed to detect speaker:', error)
    return null
  }
}

// MEET50: Audio chunking for live transcription
export class AudioChunker {
  private chunks: Buffer[] = []
  private chunkSize: number
  private sampleRate: number

  constructor(chunkSize: number = 1024, sampleRate: number = 16000) {
    this.chunkSize = chunkSize
    this.sampleRate = sampleRate
  }

  addAudioData(data: Buffer) {
    this.chunks.push(data)
    
    // Process when we have enough data for a chunk
    if (this.getTotalSize() >= this.chunkSize) {
      return this.processChunk()
    }
    
    return null
  }

  private getTotalSize(): number {
    return this.chunks.reduce((total, chunk) => total + chunk.length, 0)
  }

  private processChunk(): Buffer | null {
    if (this.chunks.length === 0) return null

    const chunk = Buffer.concat(this.chunks)
    this.chunks = []
    
    return chunk
  }

  flush(): Buffer | null {
    if (this.chunks.length === 0) return null
    
    const remaining = Buffer.concat(this.chunks)
    this.chunks = []
    
    return remaining
  }
}

// MEET51: Real-time transcription display
export interface TranscriptionUpdate {
  text: string
  speaker?: string
  timestamp: number
  confidence: number
  isPartial: boolean
}

export async function broadcastTranscriptionUpdate(meetingId: string, update: TranscriptionUpdate) {
  try {
    // Store the update
    const { error: storeError } = await supabase
      .from('meeting_transcripts')
      .insert({
        meeting_id: meetingId,
        user_id: 'bot',
        session_id: meetingId,
        content: update.text,
        speaker: update.speaker,
        timestamp: update.timestamp,
        confidence_score: update.confidence,
        language: 'en',
        chunk_index: Math.floor(update.timestamp / 30),
        is_partial: update.isPartial,
      })

    if (storeError) {
      console.error('Failed to store transcription update:', storeError)
    }

    // Broadcast to connected clients (WebSocket or Server-Sent Events)
    // This would integrate with your real-time system
    
    return true

  } catch (error) {
    console.error('Failed to broadcast transcription update:', error)
    throw error
  }
}

// MEET52: Fallback to post-meeting summarization
export async function fallbackToPostMeetingSummarization(meetingId: string, error: string) {
  try {
    // Log the error
    const { error: logError } = await supabase
      .from('meeting_errors')
      .insert({
        meeting_id: meetingId,
        error_type: 'transcription_failed',
        error_message: error,
        fallback_action: 'post_meeting_summarization',
        created_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('Failed to log transcription error:', logError)
    }

    // Schedule post-meeting processing
    const { error: scheduleError } = await supabase
      .from('meeting_tasks')
      .insert({
        meeting_id: meetingId,
        task_type: 'post_meeting_summarization',
        status: 'pending',
        priority: 'high',
        created_at: new Date().toISOString(),
      })

    if (scheduleError) {
      console.error('Failed to schedule post-meeting summarization:', scheduleError)
    }

    console.log(`Scheduled post-meeting summarization for meeting: ${meetingId}`)

  } catch (error) {
    console.error('Failed to setup fallback summarization:', error)
    throw error
  }
}

// MEET53: Meeting duration logging
export async function logMeetingDuration(meetingId: string, startTime: Date, endTime: Date) {
  try {
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000) // seconds

    const { error } = await supabase
      .from('meeting_sessions')
      .insert({
        meeting_id: meetingId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_seconds: duration,
        status: 'completed',
        created_at: new Date().toISOString(),
      })

    if (error) {
      throw new Error(`Failed to log meeting duration: ${error.message}`)
    }

    console.log(`Meeting duration logged: ${duration} seconds`)

  } catch (error) {
    console.error('Failed to log meeting duration:', error)
    throw error
  }
}

// MEET54: Transcript session management
export async function createTranscriptSession(meetingId: string, userId: string): Promise<string> {
  try {
    const sessionId = `transcript_${meetingId}_${Date.now()}`

    const { error } = await supabase
      .from('transcript_sessions')
      .insert({
        session_id: sessionId,
        meeting_id: meetingId,
        user_id: userId,
        status: 'active',
        created_at: new Date().toISOString(),
      })

    if (error) {
      throw new Error(`Failed to create transcript session: ${error.message}`)
    }

    console.log(`Transcript session created: ${sessionId}`)
    return sessionId

  } catch (error) {
    console.error('Failed to create transcript session:', error)
    throw error
  }
}

// MEET55: Join/leave time tracking
export async function trackBotJoinLeave(botSessionId: string, action: 'join' | 'leave', delay?: number) {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (action === 'join') {
      updateData.join_time = new Date().toISOString()
      updateData.join_status = 'success'
      if (delay) updateData.join_delay = delay
    } else {
      updateData.leave_time = new Date().toISOString()
      updateData.join_status = 'disconnected'
    }

    const { error } = await supabase
      .from('meeting_bot_sessions')
      .update(updateData)
      .eq('id', botSessionId)

    if (error) {
      throw new Error(`Failed to track bot ${action}: ${error.message}`)
    }

    console.log(`Bot ${action} tracked for session: ${botSessionId}`)

  } catch (error) {
    console.error(`Failed to track bot ${action}:`, error)
    throw error
  }
}

// MEET56: Multi-lingual audio detection
export async function detectLanguage(audioChunk: Buffer): Promise<string> {
  try {
    const response = await fetch('/api/language/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: audioChunk,
    })

    if (response.ok) {
      const result = await response.json()
      return result.language || 'en'
    }

    return 'en' // Default to English

  } catch (error) {
    console.error('Failed to detect language:', error)
    return 'en'
  }
}

// MEET57: Timestamp management
export class TimestampManager {
  private startTime: number
  private currentTime: number

  constructor() {
    this.startTime = Date.now()
    this.currentTime = 0
  }

  getCurrentTimestamp(): number {
    this.currentTime = Math.floor((Date.now() - this.startTime) / 1000)
    return this.currentTime
  }

  formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

// MEET58: Whisper latency monitoring
export class WhisperLatencyMonitor {
  private requestTimes: number[] = []
  private maxSamples: number = 10

  recordRequest(startTime: number, endTime: number) {
    const latency = endTime - startTime
    this.requestTimes.push(latency)

    if (this.requestTimes.length > this.maxSamples) {
      this.requestTimes.shift()
    }
  }

  getAverageLatency(): number {
    if (this.requestTimes.length === 0) return 0
    return this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length
  }

  isLatencyAcceptable(): boolean {
    const avgLatency = this.getAverageLatency()
    return avgLatency < 5000 // 5 seconds threshold
  }
}

// MEET59: Transcription control
export async function stopTranscription(meetingId: string, userId: string) {
  try {
    // Update meeting status
    const { error: meetingError } = await supabase
      .from('meetings')
      .update({ 
        status: 'transcription_stopped',
        updated_at: new Date().toISOString()
      })
      .eq('id', meetingId)
      .eq('user_id', userId)

    if (meetingError) {
      throw new Error(`Failed to stop transcription: ${meetingError.message}`)
    }

    // Update bot session
    const { error: botError } = await supabase
      .from('meeting_bot_sessions')
      .update({ 
        join_status: 'transcription_stopped',
        updated_at: new Date().toISOString()
      })
      .eq('meeting_id', meetingId)

    if (botError) {
      console.error('Failed to update bot session:', botError)
    }

    console.log(`Transcription stopped for meeting: ${meetingId}`)

  } catch (error) {
    console.error('Failed to stop transcription:', error)
    throw error
  }
}

// MEET60: Meeting disconnection
export async function disconnectFromMeeting(meetingId: string, userId: string) {
  try {
    // Get bot session
    const { data: botSession, error: fetchError } = await supabase
      .from('meeting_bot_sessions')
      .select('id')
      .eq('meeting_id', meetingId)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('Failed to fetch bot session:', fetchError)
    } else if (botSession) {
      // Track bot leave
      await trackBotJoinLeave(botSession.id, 'leave')
    }

    // Update meeting status
    const { error: meetingError } = await supabase
      .from('meetings')
      .update({ 
        status: 'disconnected',
        updated_at: new Date().toISOString()
      })
      .eq('id', meetingId)
      .eq('user_id', userId)

    if (meetingError) {
      throw new Error(`Failed to disconnect from meeting: ${meetingError.message}`)
    }

    // Log meeting duration
    const { data: sessionData } = await supabase
      .from('meeting_bot_sessions')
      .select('join_time')
      .eq('meeting_id', meetingId)
      .single()

    if (sessionData?.join_time) {
      const startTime = new Date(sessionData.join_time)
      const endTime = new Date()
      await logMeetingDuration(meetingId, startTime, endTime)
    }

    console.log(`Disconnected from meeting: ${meetingId}`)

  } catch (error) {
    console.error('Failed to disconnect from meeting:', error)
    throw error
  }
}

// Helper function to approve bot from lobby
async function approveBotFromLobby(botSessionId: string) {
  try {
    const { error } = await supabase
      .from('meeting_bot_sessions')
      .update({ 
        join_status: 'success',
        updated_at: new Date().toISOString()
      })
      .eq('id', botSessionId)

    if (error) {
      throw new Error(`Failed to approve bot from lobby: ${error.message}`)
    }

    console.log(`Bot approved from lobby: ${botSessionId}`)

  } catch (error) {
    console.error('Failed to approve bot from lobby:', error)
  }
} 
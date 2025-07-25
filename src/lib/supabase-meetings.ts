import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from './supabase-admin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Re-export the admin client from the server-side file
export { supabaseAdmin }

// Google OAuth tokens table (MEET5, MEET16)
export interface GoogleOAuthTokens {
  id: string
  user_id: string
  google_user_id: string
  google_email: string
  access_token: string
  refresh_token: string
  token_type: string
  expires_at: string
  scope: string
  created_at: string
  updated_at: string
  is_active: boolean
}

// Meetings table (MEET25, MEET181)
export interface Meeting {
  id: string
  user_id: string
  google_event_id: string
  calendar_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  hangout_link: string
  location?: string
  creator_email: string
  attendees: string[]
  is_recurring: boolean
  recurring_event_id?: string
  status: 'upcoming' | 'live' | 'past' | 'cancelled'
  auto_transcribe: boolean
  custom_labels: string[]
  timezone: string
  created_at: string
  updated_at: string
}

// Meeting participants table (MEET195)
export interface MeetingParticipant {
  id: string
  meeting_id: string
  user_id: string
  email: string
  name: string
  role: 'host' | 'participant' | 'guest'
  join_time?: string
  leave_time?: string
  attendance_status: 'invited' | 'accepted' | 'declined' | 'attended' | 'no_show'
  created_at: string
}

// Meeting transcripts table (MEET61, MEET189)
export interface MeetingTranscript {
  id: string
  meeting_id: string
  user_id: string
  session_id: string
  content: string
  speaker?: string
  timestamp: number // seconds from start
  confidence_score: number
  language: string
  chunk_index: number
  is_partial: boolean
  created_at: string
}

// Meeting summaries table (MEET185)
export interface MeetingSummary {
  id: string
  meeting_id: string
  user_id: string
  content: string
  agenda?: string
  key_takeaways: string[]
  action_items: string[]
  participants: string[]
  model_used: string
  input_tokens: number
  output_tokens: number
  confidence_score: number
  is_edited: boolean
  created_at: string
  updated_at: string
}

// Meeting bot sessions table (MEET54, MEET55)
export interface MeetingBotSession {
  id: string
  meeting_id: string
  user_id: string
  bot_email: string
  join_time?: string
  leave_time?: string
  join_delay?: number // seconds
  join_status: 'pending' | 'success' | 'failed' | 'lobby_waiting'
  error_message?: string
  created_at: string
  updated_at: string
}

// Database schema extension
export interface Database {
  public: {
    Tables: {
      google_oauth_tokens: {
        Row: GoogleOAuthTokens
        Insert: Omit<GoogleOAuthTokens, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<GoogleOAuthTokens, 'id' | 'created_at' | 'updated_at'>>
      }
      meetings: {
        Row: Meeting
        Insert: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Meeting, 'id' | 'created_at' | 'updated_at'>>
      }
      meeting_participants: {
        Row: MeetingParticipant
        Insert: Omit<MeetingParticipant, 'id' | 'created_at'>
        Update: Partial<Omit<MeetingParticipant, 'id' | 'created_at'>>
      }
      meeting_transcripts: {
        Row: MeetingTranscript
        Insert: Omit<MeetingTranscript, 'id' | 'created_at'>
        Update: Partial<Omit<MeetingTranscript, 'id' | 'created_at'>>
      }
      meeting_summaries: {
        Row: MeetingSummary
        Insert: Omit<MeetingSummary, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MeetingSummary, 'id' | 'created_at' | 'updated_at'>>
      }
      meeting_bot_sessions: {
        Row: MeetingBotSession
        Insert: Omit<MeetingBotSession, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MeetingBotSession, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

// Helper functions for database operations

// MEET8: Log google_user_id and account email
export async function logGoogleAuth(userId: string, googleUserId: string, googleEmail: string) {
  const { error } = await supabase
    .from('google_oauth_tokens')
    .insert({
      user_id: userId,
      google_user_id: googleUserId,
      google_email: googleEmail,
      is_active: true,
    })

  if (error) {
    console.error('Failed to log Google auth:', error)
    throw error
  }
}

// MEET25: Save events into meetings table
export async function saveMeeting(meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('meetings')
    .insert(meetingData)
    .select()
    .single()

  if (error) {
    console.error('Failed to save meeting:', error)
    throw error
  }

  return data
}

// MEET37: Prevent duplicate imports of recurring meetings
export async function checkDuplicateMeeting(googleEventId: string, userId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select('id')
    .eq('google_event_id', googleEventId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Failed to check duplicate meeting:', error)
    throw error
  }

  return data !== null
}

// MEET32: Remove canceled events from local sync
export async function removeCanceledMeeting(googleEventId: string, userId: string) {
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('google_event_id', googleEventId)
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to remove canceled meeting:', error)
    throw error
  }
}

// Get upcoming meetings for sidebar (MEET103, MEET138)
export async function getUpcomingMeetings(userId: string, limit: number = 5) {
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      meeting_summaries(id, content, created_at),
      meeting_bot_sessions(id, join_status, join_time)
    `)
    .eq('user_id', userId)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Failed to get upcoming meetings:', error)
    throw error
  }

  return data
}

// MEET193: All queries scoped by authenticated user_id
export async function getUserMeetings(userId: string, status?: Meeting['status']) {
  let query = supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('start_time', { ascending: false })

  if (error) {
    console.error('Failed to get user meetings:', error)
    throw error
  }

  return data
} 
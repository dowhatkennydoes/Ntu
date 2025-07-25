import { getValidAccessToken } from './google-oauth'
import { supabase, saveMeeting, checkDuplicateMeeting, removeCanceledMeeting, Meeting } from './supabase-meetings'

// Google Calendar API base URL
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

// MEET21: Fetch next 50 events from Google Calendar
export async function fetchCalendarEvents(userId: string, maxResults: number = 50) {
  try {
    const accessToken = await getValidAccessToken(userId)
    const now = new Date()
    const timeMin = now.toISOString()
    
    // Get events for the next 30 days
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events?` +
      `timeMin=${encodeURIComponent(timeMin)}&` +
      `timeMax=${encodeURIComponent(timeMax)}&` +
      `maxResults=${maxResults}&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Calendar API error: ${response.status}`)
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Failed to fetch calendar events:', error)
    throw error
  }
}

// MEET22: Extract required fields from calendar events
export function extractEventData(event: any) {
  const start = event.start?.dateTime || event.start?.date
  const end = event.end?.dateTime || event.end?.date
  
  return {
    googleEventId: event.id,
    title: event.summary || '(No Title)',
    description: event.description || '',
    startTime: start,
    endTime: end,
    location: event.location || '',
    hangoutLink: event.hangoutLink || '',
    creatorEmail: event.creator?.email || '',
    attendees: event.attendees?.map((a: any) => a.email) || [],
    isRecurring: !!event.recurringEventId,
    recurringEventId: event.recurringEventId,
    timezone: event.start?.timeZone || 'UTC',
  }
}

// MEET23: Check if event has Google Meet link
export function hasMeetLink(event: any): boolean {
  return !!(event.hangoutLink || 
    (event.location && event.location.includes('meet.google.com')) ||
    (event.description && event.description.includes('meet.google.com')))
}

// MEET24: Detect recurring meetings
export function isRecurringEvent(event: any): boolean {
  return !!event.recurringEventId
}

// MEET26: Sync calendar events to database
export async function syncCalendarEvents(userId: string) {
  try {
    const events = await fetchCalendarEvents(userId)
    const meetEvents = events.filter(hasMeetLink)
    
    console.log(`Found ${meetEvents.length} events with Meet links out of ${events.length} total events`)

    for (const event of meetEvents) {
      const eventData = extractEventData(event)
      
      // MEET37: Prevent duplicate imports
      const isDuplicate = await checkDuplicateMeeting(eventData.googleEventId, userId)
      if (isDuplicate) {
        console.log(`Skipping duplicate event: ${eventData.title}`)
        continue
      }

      // MEET25: Save to meetings table
      const meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        google_event_id: eventData.googleEventId,
        calendar_id: 'primary',
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        hangout_link: eventData.hangoutLink,
        location: eventData.location,
        creator_email: eventData.creatorEmail,
        attendees: eventData.attendees,
        is_recurring: eventData.isRecurring,
        recurring_event_id: eventData.recurringEventId,
        status: getEventStatus(eventData.startTime, eventData.endTime),
        auto_transcribe: false, // Default to false, user can enable
        custom_labels: [],
        timezone: eventData.timezone,
      }

      await saveMeeting(meetingData)
      console.log(`Saved meeting: ${eventData.title}`)
    }

    return meetEvents.length
  } catch (error) {
    console.error('Failed to sync calendar events:', error)
    throw error
  }
}

// MEET29: Check for active meetings in real-time
export async function checkActiveMeetings(userId: string) {
  const now = new Date()
  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .lte('start_time', now.toISOString())
    .gte('end_time', now.toISOString())
    .eq('status', 'upcoming')

  if (error) {
    console.error('Failed to check active meetings:', error)
    throw error
  }

  // Update status to 'live' for active meetings
  for (const meeting of meetings || []) {
    await supabase
      .from('meetings')
      .update({ status: 'live' })
      .eq('id', meeting.id)
  }

  return meetings || []
}

// MEET30: Determine event status based on time
export function getEventStatus(startTime: string, endTime: string): Meeting['status'] {
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (now < start) {
    return 'upcoming'
  } else if (now >= start && now <= end) {
    return 'live'
  } else {
    return 'past'
  }
}

// MEET27: Refresh meetings every 15 minutes
export async function scheduleCalendarRefresh(userId: string) {
  // This would typically be handled by a cron job or background worker
  // For now, we'll create a function that can be called periodically
  
  try {
    await syncCalendarEvents(userId)
    await checkActiveMeetings(userId)
    
    console.log(`Calendar refresh completed for user ${userId}`)
  } catch (error) {
    console.error(`Calendar refresh failed for user ${userId}:`, error)
    throw error
  }
}



// MEET28: Handle events without Meet links
export async function handleNonMeetEvents(userId: string) {
  const events = await fetchCalendarEvents(userId)
  const nonMeetEvents = events.filter((event: any) => !hasMeetLink(event))
  
  console.log(`Found ${nonMeetEvents.length} events without Meet links`)
  
  // These events are ignored unless manually flagged
  // Could be stored in a separate table for future reference
  return nonMeetEvents
}

// MEET32: Handle canceled events
export async function handleCanceledEvents(userId: string) {
  const events = await fetchCalendarEvents(userId)
  const canceledEvents = events.filter((event: any) => event.status === 'cancelled')
  
  for (const event of canceledEvents) {
    await removeCanceledMeeting(event.id, userId)
    console.log(`Removed canceled event: ${event.summary}`)
  }
  
  return canceledEvents.length
}

// MEET33: Get meetings for user selection
export async function getMeetingsForSelection(userId: string) {
  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Failed to get meetings for selection:', error)
    throw error
  }

  return meetings || []
}

// MEET34: Toggle auto-transcription for meetings
export async function toggleAutoTranscription(userId: string, meetingId: string, enabled: boolean) {
  const { error } = await supabase
    .from('meetings')
    .update({ auto_transcribe: enabled })
    .eq('id', meetingId)
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to toggle auto-transcription:', error)
    throw error
  }

  return true
}

// MEET36: Add custom labels to meetings
export async function addMeetingLabels(userId: string, meetingId: string, labels: string[]) {
  const { data: meeting, error: fetchError } = await supabase
    .from('meetings')
    .select('custom_labels')
    .eq('id', meetingId)
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    console.error('Failed to fetch meeting labels:', fetchError)
    throw fetchError
  }

  const updatedLabels = Array.from(new Set([...(meeting.custom_labels || []), ...labels]))

  const { error: updateError } = await supabase
    .from('meetings')
    .update({ custom_labels: updatedLabels })
    .eq('id', meetingId)
    .eq('user_id', userId)

  if (updateError) {
    console.error('Failed to update meeting labels:', updateError)
    throw updateError
  }

  return updatedLabels
}

// MEET38: Get meeting metadata
export async function getMeetingMetadata(userId: string, meetingId: string) {
  const { data: meeting, error } = await supabase
    .from('meetings')
    .select('calendar_id, creator_email, timezone')
    .eq('id', meetingId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Failed to get meeting metadata:', error)
    throw error
  }

  return meeting
}

// MEET39: Resolve timezone discrepancies
export function resolveTimezone(timezone: string, fallback: string = 'UTC'): string {
  const validTimezones = Intl.supportedValuesOf('timeZone')
  
  if (validTimezones.includes(timezone)) {
    return timezone
  }
  
  console.warn(`Invalid timezone: ${timezone}, using fallback: ${fallback}`)
  return fallback
}

// MEET40: Check if user has events with Meet links
export async function checkForMeetEvents(userId: string): Promise<boolean> {
  try {
    const events = await fetchCalendarEvents(userId, 10) // Check first 10 events
    const hasMeetEvents = events.some(hasMeetLink)
    
    if (!hasMeetEvents) {
      console.log('No events with Meet links found for user:', userId)
    }
    
    return hasMeetEvents
  } catch (error) {
    console.error('Failed to check for Meet events:', error)
    return false
  }
} 
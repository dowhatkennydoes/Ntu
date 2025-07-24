import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/google-oauth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const accountId = searchParams.get('accountId')

    if (!userId || !accountId) {
      return NextResponse.json(
        { error: 'User ID and Account ID are required' },
        { status: 400 }
      )
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(userId)

    // Calculate date range (next 7 days)
    const now = new Date()
    const timeMin = now.toISOString()
    const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch calendar events
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${encodeURIComponent(timeMin)}&` +
      `timeMax=${encodeURIComponent(timeMax)}&` +
      `singleEvents=true&` +
      `orderBy=startTime&` +
      `maxResults=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!calendarResponse.ok) {
      console.error('Calendar API error:', await calendarResponse.text())
      return NextResponse.json(
        { error: 'Failed to fetch calendar events' },
        { status: 500 }
      )
    }

    const calendarData = await calendarResponse.json()
    const events = calendarData.items || []

    // Filter for events with video conferencing or meetings
    const meetingEvents = events.filter((event: any) => {
      // Include events with video conferencing
      if (event.conferenceData?.entryPoints?.some((entry: any) => entry.entryPointType === 'video')) {
        return true
      }
      
      // Include events with "meeting" in title or description
      const title = event.summary?.toLowerCase() || ''
      const description = event.description?.toLowerCase() || ''
      return title.includes('meeting') || description.includes('meeting')
    })

    return NextResponse.json({ events: meetingEvents })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
} 
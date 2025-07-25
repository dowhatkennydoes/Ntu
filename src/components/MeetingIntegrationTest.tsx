'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/supabase-auth'
import { supabase } from '@/lib/supabase-client'

export default function MeetingIntegrationTest() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<any>({})
  const [meetings, setMeetings] = useState<any[]>([])

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const runMeetingTests = async () => {
    if (!user) {
      alert('Please sign in first to run meeting tests')
      return
    }

    setLoading(true)
    const results: any = {}

    try {
      // Test 1: Create a test meeting
      const testMeeting = {
        user_id: user.id,
        google_event_id: `test-event-${Date.now()}`,
        calendar_id: 'primary',
        title: 'Test Meeting Integration',
        description: 'This is a test meeting for integration testing',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
        hangout_link: 'https://meet.google.com/test-link',
        location: 'Virtual Meeting',
        creator_email: user.email,
        attendees: [user.email],
        is_recurring: false,
        status: 'upcoming',
        auto_transcribe: true,
        custom_labels: ['test', 'integration'],
        timezone: 'UTC'
      }

      const { data: createdMeeting, error: meetingError } = await supabase
        .from('meetings')
        .insert(testMeeting)
        .select()
        .single()

      if (meetingError) {
        results.meetingCreation = { success: false, error: meetingError }
      } else {
        results.meetingCreation = { success: true, data: createdMeeting }

        // Test 2: Create meeting participants
        const testParticipant = {
          meeting_id: createdMeeting.id,
          user_id: user.id,
          email: user.email,
          name: 'Test User',
          role: 'host',
          attendance_status: 'accepted'
        }

        const { data: participant, error: participantError } = await supabase
          .from('meeting_participants')
          .insert(testParticipant)
          .select()
          .single()

        results.participantCreation = { 
          success: !participantError, 
          data: participant, 
          error: participantError 
        }

        // Test 3: Create meeting transcript
        const testTranscript = {
          meeting_id: createdMeeting.id,
          user_id: user.id,
          session_id: `session-${Date.now()}`,
          content: 'Hello, this is a test transcript for the meeting integration.',
          speaker: 'Test User',
          timestamp: 0,
          confidence_score: 0.95,
          language: 'en',
          chunk_index: 0,
          is_partial: false
        }

        const { data: transcript, error: transcriptError } = await supabase
          .from('meeting_transcripts')
          .insert(testTranscript)
          .select()
          .single()

        results.transcriptCreation = { 
          success: !transcriptError, 
          data: transcript, 
          error: transcriptError 
        }

        // Test 4: Create meeting summary
        const testSummary = {
          meeting_id: createdMeeting.id,
          user_id: user.id,
          content: 'This meeting discussed integration testing and was successful.',
          agenda: 'Test meeting integration features',
          key_takeaways: ['Integration works well', 'All features functional'],
          action_items: ['Continue testing', 'Document results'],
          participants: [user.email],
          model_used: 'gpt-4',
          input_tokens: 150,
          output_tokens: 75,
          confidence_score: 0.9,
          is_edited: false
        }

        const { data: summary, error: summaryError } = await supabase
          .from('meeting_summaries')
          .insert(testSummary)
          .select()
          .single()

        results.summaryCreation = { 
          success: !summaryError, 
          data: summary, 
          error: summaryError 
        }

        // Test 5: Create bot session
        const testBotSession = {
          meeting_id: createdMeeting.id,
          user_id: user.id,
          bot_email: 'yonder-bot@ntu.app',
          join_time: new Date().toISOString(),
          join_status: 'success',
          join_delay: 5
        }

        const { data: botSession, error: botError } = await supabase
          .from('meeting_bot_sessions')
          .insert(testBotSession)
          .select()
          .single()

        results.botSessionCreation = { 
          success: !botError, 
          data: botSession, 
          error: botError 
        }

        // Test 6: Fetch meeting with all related data
        const { data: fullMeeting, error: fetchError } = await supabase
          .from('meetings')
          .select(`
            *,
            meeting_participants(*),
            meeting_transcripts(*),
            meeting_summaries(*),
            meeting_bot_sessions(*)
          `)
          .eq('id', createdMeeting.id)
          .single()

        results.dataFetching = { 
          success: !fetchError, 
          data: fullMeeting, 
          error: fetchError 
        }

        // Test 7: Test RLS policies
        const { data: userMeetings, error: rlsError } = await supabase
          .from('meetings')
          .select('*')
          .eq('user_id', user.id)

        results.rlsTest = { 
          success: !rlsError, 
          count: userMeetings?.length || 0, 
          error: rlsError 
        }
      }

      setTestResults(results)
      await fetchUserMeetings()

    } catch (error) {
      console.error('Meeting test error:', error)
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    }

    setLoading(false)
  }

  const fetchUserMeetings = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMeetings(data)
    }
  }

  const cleanupTestData = async () => {
    if (!user) return

    setLoading(true)

    try {
      // Delete test meetings and all related data
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('user_id', user.id)
        .like('title', 'Test Meeting%')

      if (error) {
        console.error('Cleanup error:', error)
      } else {
        setMeetings([])
        setTestResults({})
        alert('Test data cleaned up successfully!')
      }
    } catch (error) {
      console.error('Cleanup error:', error)
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Meeting Integration Test</h1>
      
      {/* User Status */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Current Status</h2>
        {user ? (
          <div>
            <p><strong>User:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        ) : (
          <p><strong>Status:</strong> Not authenticated</p>
        )}
      </div>

      {/* Test Controls */}
      {user && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Test Controls</h2>
          <div className="flex gap-4">
            <button
              onClick={runMeetingTests}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Run Meeting Tests
            </button>
            <button
              onClick={cleanupTestData}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cleanup Test Data
            </button>
            <button
              onClick={fetchUserMeetings}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Refresh Meetings
            </button>
          </div>
        </div>
      )}

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-4">
            {Object.entries(testResults).map(([test, result]: [string, any]) => (
              <div key={test} className="border p-4 rounded">
                <h3 className="font-semibold capitalize">{test.replace(/([A-Z])/g, ' $1')}</h3>
                <p className="text-sm text-gray-600">
                  Status: {result.success ? '✅ Success' : '❌ Failed'}
                </p>
                {result.error && (
                  <p className="text-sm text-red-600">Error: {result.error}</p>
                )}
                {result.count !== undefined && (
                  <p className="text-sm text-blue-600">Count: {result.count}</p>
                )}
                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-blue-600">View Data</summary>
                    <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Meetings */}
      {meetings.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Meetings ({meetings.length})</h2>
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="border p-4 rounded">
                <h3 className="font-semibold">{meeting.title}</h3>
                <p className="text-sm text-gray-600">{meeting.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Status: {meeting.status}</p>
                  <p>Start: {new Date(meeting.start_time).toLocaleString()}</p>
                  <p>Created: {new Date(meeting.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
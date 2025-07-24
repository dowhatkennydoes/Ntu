import { supabase, supabaseAdmin, MeetingSummary, MeetingTranscript } from './supabase-meetings'
import { generateWithFallback, PROMPT_TEMPLATES, formatPrompt } from './llm'
import { embeddingQueue } from './redis'

// MEET61: Full transcript storage and retrieval
export interface TranscriptChunk {
  id: string
  meeting_id: string
  session_id: string
  content: string
  speaker?: string
  timestamp: number
  confidence_score: number
  language: string
  chunk_index: number
  is_partial: boolean
  created_at: string
}

// MEET62: Transcript chunking and organization
export class TranscriptOrganizer {
  private chunks: TranscriptChunk[] = []
  private currentChunk: Partial<TranscriptChunk> = {}
  private chunkIndex = 0

  addTranscription(
    content: string,
    speaker?: string,
    timestamp: number = 0,
    confidence: number = 0.8,
    language: string = 'en',
    isPartial: boolean = false
  ) {
    // If this is a continuation of the previous chunk, merge it
    if (this.currentChunk.content && !isPartial) {
      this.currentChunk.content += ' ' + content
      this.currentChunk.confidence_score = Math.min(
        this.currentChunk.confidence_score || 0.8,
        confidence
      )
    } else {
      // Save previous chunk if exists
      if (this.currentChunk.content) {
        this.chunks.push(this.currentChunk as TranscriptChunk)
      }

      // Start new chunk
      this.currentChunk = {
        content,
        speaker,
        timestamp,
        confidence_score: confidence,
        language,
        chunk_index: this.chunkIndex++,
        is_partial: isPartial,
      }
    }
  }

  finalizeChunk() {
    if (this.currentChunk.content) {
      this.chunks.push(this.currentChunk as TranscriptChunk)
      this.currentChunk = {}
    }
  }

  getChunks(): TranscriptChunk[] {
    return [...this.chunks]
  }

  getFullTranscript(): string {
    return this.chunks
      .map(chunk => chunk.content)
      .join(' ')
      .trim()
  }

  getSpeakerSegments(): { speaker: string; content: string; timestamp: number }[] {
    const segments: { speaker: string; content: string; timestamp: number }[] = []
    let currentSpeaker = ''
    let currentContent = ''
    let currentTimestamp = 0

    for (const chunk of this.chunks) {
      if (chunk.speaker !== currentSpeaker && currentContent) {
        segments.push({
          speaker: currentSpeaker,
          content: currentContent.trim(),
          timestamp: currentTimestamp,
        })
        currentContent = ''
      }

      currentSpeaker = chunk.speaker || 'Unknown'
      currentContent += ' ' + chunk.content
      currentTimestamp = chunk.timestamp
    }

    if (currentContent) {
      segments.push({
        speaker: currentSpeaker,
        content: currentContent.trim(),
        timestamp: currentTimestamp,
      })
    }

    return segments
  }
}

// MEET63: Automatic summarization triggering
export async function triggerPostMeetingProcessing(meetingId: string, userId: string) {
  try {
    console.log(`Starting post-meeting processing for meeting: ${meetingId}`)

    // Get all transcript chunks for the meeting
    const { data: transcriptChunks, error: fetchError } = await supabase
      .from('meeting_transcripts')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('timestamp', { ascending: true })

    if (fetchError) {
      throw new Error(`Failed to fetch transcript chunks: ${fetchError.message}`)
    }

    if (!transcriptChunks || transcriptChunks.length === 0) {
      console.log('No transcript chunks found for meeting')
      return null
    }

    // Organize transcript
    const organizer = new TranscriptOrganizer()
    transcriptChunks.forEach(chunk => {
      organizer.addTranscription(
        chunk.content,
        chunk.speaker,
        chunk.timestamp,
        chunk.confidence_score,
        chunk.language,
        chunk.is_partial
      )
    })
    organizer.finalizeChunk()

    const fullTranscript = organizer.getFullTranscript()
    const speakerSegments = organizer.getSpeakerSegments()

    // MEET64: Generate AI-powered meeting summary
    const summary = await generateMeetingSummary(
      fullTranscript,
      speakerSegments,
      meetingId,
      userId
    )

    // MEET66: Queue embedding job for vector search
    await queueTranscriptEmbedding(meetingId, userId, fullTranscript)

    // MEET68: Extract action items
    const actionItems = await extractActionItems(fullTranscript, userId)

    // Update meeting status
    await supabase
      .from('meetings')
      .update({ 
        status: 'processed',
        updated_at: new Date().toISOString()
      })
      .eq('id', meetingId)
      .eq('user_id', userId)

    console.log(`Post-meeting processing completed for meeting: ${meetingId}`)

    return {
      summary,
      actionItems,
      transcriptLength: fullTranscript.length,
      speakerCount: new Set(speakerSegments.map(s => s.speaker)).size,
    }

  } catch (error) {
    console.error('Post-meeting processing failed:', error)
    throw error
  }
}

// MEET64: AI-powered meeting summary generation
export async function generateMeetingSummary(
  transcript: string,
  speakerSegments: { speaker: string; content: string; timestamp: number }[],
  meetingId: string,
  userId: string
): Promise<MeetingSummary> {
  try {
    // Get meeting metadata
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('title, attendees, start_time, end_time')
      .eq('id', meetingId)
      .eq('user_id', userId)
      .single()

    if (meetingError) {
      throw new Error(`Failed to fetch meeting metadata: ${meetingError.message}`)
    }

    // Prepare summary prompt
    const participants = speakerSegments.map(s => s.speaker).filter((s, i, arr) => arr.indexOf(s) === i)
    const meetingDuration = meeting.end_time && meeting.start_time 
      ? Math.floor((new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000)
      : 0

    const summaryPrompt = formatPrompt(PROMPT_TEMPLATES.MEETING_SUMMARY, {
      title: meeting.title,
      participants: participants.join(', '),
      duration: meetingDuration.toString(),
      transcript: transcript.substring(0, 8000), // Limit for API
    })

    // Generate summary using LLM
    const summaryResponse = await generateWithFallback({
      prompt: summaryPrompt,
      systemPrompt: `You are an expert meeting summarizer. Create comprehensive, actionable summaries that include:
1. Key discussion points and decisions
2. Action items with assignees
3. Important insights and takeaways
4. Next steps and follow-ups
Format the response as structured JSON with sections for agenda, key_takeaways, action_items, and next_steps.`,
      maxTokens: 2000,
      temperature: 0.3,
    })

    if (!summaryResponse.success) {
      throw new Error('Failed to generate meeting summary')
    }

    // Parse summary response
    let summaryData
    try {
      summaryData = JSON.parse(summaryResponse.content)
    } catch (parseError) {
      // Fallback to simple text parsing
      summaryData = {
        agenda: 'Meeting discussion and decisions',
        key_takeaways: [summaryResponse.content],
        action_items: [],
        next_steps: [],
      }
    }

    // Create summary record
    const summaryRecord: Omit<MeetingSummary, 'id' | 'created_at' | 'updated_at'> = {
      meeting_id: meetingId,
      user_id: userId,
      content: summaryResponse.content,
      agenda: summaryData.agenda || '',
      key_takeaways: summaryData.key_takeaways || [],
      action_items: summaryData.action_items || [],
      participants: participants,
      model_used: summaryResponse.model,
      input_tokens: summaryResponse.tokens.input,
      output_tokens: summaryResponse.tokens.output,
      confidence_score: 0.9,
      is_edited: false,
    }

    const { data: savedSummary, error: saveError } = await supabase
      .from('meeting_summaries')
      .insert(summaryRecord)
      .select()
      .single()

    if (saveError) {
      throw new Error(`Failed to save meeting summary: ${saveError.message}`)
    }

    console.log(`Meeting summary generated and saved: ${savedSummary.id}`)
    return savedSummary

  } catch (error) {
    console.error('Failed to generate meeting summary:', error)
    throw error
  }
}

// MEET65: Summary editing capabilities
export async function updateMeetingSummary(
  summaryId: string,
  userId: string,
  updates: Partial<Pick<MeetingSummary, 'content' | 'agenda' | 'key_takeaways' | 'action_items'>>
) {
  try {
    const { data: summary, error: fetchError } = await supabase
      .from('meeting_summaries')
      .select('*')
      .eq('id', summaryId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !summary) {
      throw new Error('Summary not found or access denied')
    }

    const { data: updatedSummary, error: updateError } = await supabase
      .from('meeting_summaries')
      .update({
        ...updates,
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', summaryId)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update summary: ${updateError.message}`)
    }

    console.log(`Meeting summary updated: ${summaryId}`)
    return updatedSummary

  } catch (error) {
    console.error('Failed to update meeting summary:', error)
    throw error
  }
}

// MEET66: Vector embedding for transcripts
export async function queueTranscriptEmbedding(
  meetingId: string,
  userId: string,
  transcript: string
) {
  try {
    // Queue embedding job for the full transcript
    await embeddingQueue.add('meeting-transcript', {
      content: transcript,
      userId,
      sourceType: 'meeting_transcript',
      sourceApp: 'yonder',
      memoryId: meetingId,
      snapshotId: `meeting_${meetingId}`,
      confidenceScore: 0.9,
      intentLabel: 'meeting_discussion',
      usageType: 'meeting_analysis',
      tags: ['meeting', 'transcript', 'yonder'],
      originatingLLM: 'whisper',
      prompt: 'Meeting transcript for vector embedding',
    })

    console.log(`Transcript embedding queued for meeting: ${meetingId}`)

  } catch (error) {
    console.error('Failed to queue transcript embedding:', error)
    throw error
  }
}

// MEET67: Semantic search across meetings
export async function searchMeetingTranscripts(
  userId: string,
  query: string,
  limit: number = 10
) {
  try {
    // This would use pgvector similarity search
    // For now, we'll implement a basic text search
    const { data: results, error } = await supabase
      .from('meeting_transcripts')
      .select(`
        *,
        meetings!inner(title, start_time, user_id)
      `)
      .eq('meetings.user_id', userId)
      .textSearch('content', query)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Search failed: ${error.message}`)
    }

    return results || []

  } catch (error) {
    console.error('Failed to search meeting transcripts:', error)
    throw error
  }
}

// MEET68: Action item extraction
export async function extractActionItems(
  transcript: string,
  userId: string
): Promise<Array<{ text: string; assignee?: string; due_date?: string; priority: 'low' | 'medium' | 'high' }>> {
  try {
    const actionItemPrompt = formatPrompt(PROMPT_TEMPLATES.ACTION_ITEM_EXTRACTION, {
      transcript: transcript.substring(0, 4000),
    })

    const response = await generateWithFallback({
      prompt: actionItemPrompt,
      systemPrompt: `Extract action items from the meeting transcript. For each action item, identify:
1. The specific task or action required
2. Who is responsible (assignee)
3. When it's due (if mentioned)
4. Priority level (low/medium/high)

Return the results as a JSON array of objects with fields: text, assignee, due_date, priority.`,
      maxTokens: 1000,
      temperature: 0.2,
    })

    if (!response.success) {
      return []
    }

    try {
      const actionItems = JSON.parse(response.content)
      return Array.isArray(actionItems) ? actionItems : []
    } catch (parseError) {
      console.warn('Failed to parse action items, returning empty array')
      return []
    }

  } catch (error) {
    console.error('Failed to extract action items:', error)
    return []
  }
}

// MEET69: Meeting analytics dashboard data
export async function getMeetingAnalytics(userId: string, timeRange: 'week' | 'month' | 'quarter' = 'month') {
  try {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get meetings in time range
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select(`
        *,
        meeting_summaries(id, content, created_at),
        meeting_transcripts(id, content, timestamp)
      `)
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', now.toISOString())

    if (meetingsError) {
      throw new Error(`Failed to fetch meetings: ${meetingsError.message}`)
    }

    // Calculate analytics
    const analytics = {
      totalMeetings: meetings?.length || 0,
      totalDuration: 0,
      totalTranscripts: 0,
      totalSummaries: 0,
      averageMeetingLength: 0,
      mostActiveSpeakers: [] as Array<{ speaker: string; count: number }>,
      commonTopics: [] as string[],
      actionItemsCompleted: 0,
      actionItemsPending: 0,
    }

    if (meetings) {
      for (const meeting of meetings) {
        // Calculate duration
        if (meeting.start_time && meeting.end_time) {
          const duration = Math.floor(
            (new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000
          )
          analytics.totalDuration += duration
        }

        // Count transcripts and summaries
        if (meeting.meeting_transcripts) {
          analytics.totalTranscripts += meeting.meeting_transcripts.length
        }
        if (meeting.meeting_summaries) {
          analytics.totalSummaries += meeting.meeting_summaries.length
        }
      }

      analytics.averageMeetingLength = analytics.totalMeetings > 0 
        ? Math.round(analytics.totalDuration / analytics.totalMeetings)
        : 0
    }

    return analytics

  } catch (error) {
    console.error('Failed to get meeting analytics:', error)
    throw error
  }
}

// MEET70: Integration with Mere AI assistant
export async function notifyMereOfMeetingCompletion(
  meetingId: string,
  userId: string,
  summary: MeetingSummary
) {
  try {
    // Create a notification for Mere AI assistant
    const { error } = await supabase
      .from('mere_notifications')
      .insert({
        user_id: userId,
        type: 'meeting_completed',
        title: `Meeting Summary: ${summary.content.substring(0, 100)}...`,
        content: `A new meeting has been processed and summarized. You can ask me about the key points, action items, or specific topics discussed.`,
        metadata: {
          meeting_id: meetingId,
          summary_id: summary.id,
          action_items_count: summary.action_items.length,
          key_takeaways_count: summary.key_takeaways.length,
        },
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Failed to create Mere notification:', error)
    } else {
      console.log(`Mere notification created for meeting: ${meetingId}`)
    }

  } catch (error) {
    console.error('Failed to notify Mere of meeting completion:', error)
  }
}

// MEET71: Sentiment analysis
export async function analyzeMeetingSentiment(transcript: string): Promise<{
  overall_sentiment: 'positive' | 'neutral' | 'negative'
  sentiment_score: number
  emotional_tone: string
  key_emotions: string[]
}> {
  try {
    const sentimentPrompt = `Analyze the sentiment and emotional tone of this meeting transcript:

${transcript.substring(0, 3000)}

Provide a JSON response with:
- overall_sentiment: "positive", "neutral", or "negative"
- sentiment_score: number between -1 and 1
- emotional_tone: brief description
- key_emotions: array of primary emotions detected`

    const response = await generateWithFallback({
      prompt: sentimentPrompt,
      maxTokens: 500,
      temperature: 0.1,
    })

    if (!response.success) {
      return {
        overall_sentiment: 'neutral',
        sentiment_score: 0,
        emotional_tone: 'neutral',
        key_emotions: [],
      }
    }

    try {
      return JSON.parse(response.content)
    } catch (parseError) {
      return {
        overall_sentiment: 'neutral',
        sentiment_score: 0,
        emotional_tone: 'neutral',
        key_emotions: [],
      }
    }

  } catch (error) {
    console.error('Failed to analyze meeting sentiment:', error)
    return {
      overall_sentiment: 'neutral',
      sentiment_score: 0,
      emotional_tone: 'neutral',
      key_emotions: [],
    }
  }
}

// MEET72: Topic modeling
export async function extractMeetingTopics(transcript: string): Promise<Array<{
  topic: string
  confidence: number
  mentions: number
  key_phrases: string[]
}>> {
  try {
    const topicPrompt = `Identify the main topics and themes discussed in this meeting transcript:

${transcript.substring(0, 4000)}

Return a JSON array of topics with:
- topic: the main topic name
- confidence: confidence score (0-1)
- mentions: number of times mentioned
- key_phrases: array of related phrases`

    const response = await generateWithFallback({
      prompt: topicPrompt,
      maxTokens: 800,
      temperature: 0.2,
    })

    if (!response.success) {
      return []
    }

    try {
      const topics = JSON.parse(response.content)
      return Array.isArray(topics) ? topics : []
    } catch (parseError) {
      return []
    }

  } catch (error) {
    console.error('Failed to extract meeting topics:', error)
    return []
  }
}

// MEET73: Meeting templates
export interface MeetingTemplate {
  id: string
  name: string
  description: string
  agenda_template: string[]
  auto_transcribe: boolean
  custom_labels: string[]
  created_by: string
  created_at: string
}

export async function createMeetingTemplate(
  userId: string,
  template: Omit<MeetingTemplate, 'id' | 'created_by' | 'created_at'>
) {
  try {
    const { data, error } = await supabase
      .from('meeting_templates')
      .insert({
        ...template,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create meeting template: ${error.message}`)
    }

    return data

  } catch (error) {
    console.error('Failed to create meeting template:', error)
    throw error
  }
}

// MEET74: Export capabilities
export async function exportMeetingData(
  meetingId: string,
  userId: string,
  format: 'json' | 'txt' | 'pdf' = 'json'
) {
  try {
    // Get meeting data
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select(`
        *,
        meeting_summaries(*),
        meeting_transcripts(*)
      `)
      .eq('id', meetingId)
      .eq('user_id', userId)
      .single()

    if (meetingError || !meeting) {
      throw new Error('Meeting not found or access denied')
    }

    switch (format) {
      case 'json':
        return JSON.stringify(meeting, null, 2)
      
      case 'txt':
        let textContent = `Meeting: ${meeting.title}\n`
        textContent += `Date: ${meeting.start_time}\n`
        textContent += `Duration: ${meeting.end_time ? Math.floor((new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000) : 0} minutes\n\n`
        
        if (meeting.meeting_summaries && meeting.meeting_summaries.length > 0) {
          textContent += `SUMMARY:\n${meeting.meeting_summaries[0].content}\n\n`
        }
        
        if (meeting.meeting_transcripts) {
          textContent += `TRANSCRIPT:\n`
          meeting.meeting_transcripts.forEach((transcript: any) => {
            textContent += `[${transcript.timestamp}s] ${transcript.speaker || 'Unknown'}: ${transcript.content}\n`
          })
        }
        
        return textContent
      
      case 'pdf':
        // This would require a PDF generation library
        throw new Error('PDF export not yet implemented')
      
      default:
        throw new Error('Unsupported export format')
    }

  } catch (error) {
    console.error('Failed to export meeting data:', error)
    throw error
  }
}

// MEET75: Advanced filtering
export async function filterMeetings(
  userId: string,
  filters: {
    dateRange?: { start: string; end: string }
    participants?: string[]
    topics?: string[]
    sentiment?: 'positive' | 'neutral' | 'negative'
    hasActionItems?: boolean
    duration?: { min?: number; max?: number }
    customLabels?: string[]
  }
) {
  try {
    let query = supabase
      .from('meetings')
      .select(`
        *,
        meeting_summaries(*),
        meeting_transcripts(*)
      `)
      .eq('user_id', userId)

    // Apply filters
    if (filters.dateRange) {
      query = query
        .gte('start_time', filters.dateRange.start)
        .lte('start_time', filters.dateRange.end)
    }

    if (filters.participants && filters.participants.length > 0) {
      query = query.overlaps('attendees', filters.participants)
    }

    if (filters.customLabels && filters.customLabels.length > 0) {
      query = query.overlaps('custom_labels', filters.customLabels)
    }

    const { data: meetings, error } = await query.order('start_time', { ascending: false })

    if (error) {
      throw new Error(`Failed to filter meetings: ${error.message}`)
    }

    // Apply additional filters that require processing
    let filteredMeetings = meetings || []

    if (filters.hasActionItems) {
      filteredMeetings = filteredMeetings.filter(meeting => 
        meeting.meeting_summaries?.some((summary: any) => 
          summary.action_items && summary.action_items.length > 0
        )
      )
    }

    if (filters.duration) {
      filteredMeetings = filteredMeetings.filter(meeting => {
        if (!meeting.start_time || !meeting.end_time) return true
        
        const duration = Math.floor(
          (new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000
        )
        
        if (filters.duration?.min && duration < filters.duration.min) return false
        if (filters.duration?.max && duration > filters.duration.max) return false
        return true
      })
    }

    return filteredMeetings

  } catch (error) {
    console.error('Failed to filter meetings:', error)
    throw error
  }
} 
import { useState, useCallback, useMemo } from 'react'
import { 
  TranscriptSegment, 
  ActionItem, 
  Highlight, 
  Topic, 
  RealTimeSentiment,
  Quote
} from '@/types/voice-transcription'

export function useVoiceAnalytics() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [realTimeSentiment, setRealTimeSentiment] = useState<RealTimeSentiment>({
    overall: 0,
    bySpeaker: {},
    recentChanges: []
  })
  const [rankedQuotes, setRankedQuotes] = useState<Quote[]>([])

  const extractActionItems = useCallback((segments: TranscriptSegment[]) => {
    const items = segments
      .filter(segment => segment.isActionItem)
      .map(segment => ({
        id: `action_${segment.id}`,
        text: segment.text,
        speaker: segment.speaker,
        timestamp: segment.startTime,
        priority: (segment.urgencyScore || 0) > 0.7 ? 'high' as const : 
                 (segment.urgencyScore || 0) > 0.4 ? 'medium' as const : 'low' as const
      }))

    setActionItems(items)
    return items
  }, [])

  const extractHighlights = useCallback((segments: TranscriptSegment[]) => {
    const highlights = segments
      .filter(segment => 
        segment.isActionItem || 
        segment.isQuestion || 
        segment.isDecision || 
        segment.isBookmarked ||
        (segment.urgencyScore || 0) > 0.6
      )
      .map(segment => ({
        id: `highlight_${segment.id}`,
        segmentId: segment.id,
        text: segment.text,
        type: segment.isActionItem ? 'action_item' as const :
              segment.isQuestion ? 'question' as const :
              segment.isDecision ? 'decision' as const :
              segment.isBookmarked ? 'important' as const : 'quote' as const,
        timestamp: segment.startTime,
        speaker: segment.speaker,
        isLive: segment.isLive
      }))

    setHighlights(highlights)
    return highlights
  }, [])

  const extractTopics = useCallback((segments: TranscriptSegment[]) => {
    const topicMap = new Map<string, { frequency: number, firstMention: number, segments: string[] }>()
    
    segments.forEach(segment => {
      // Simple topic extraction based on keywords
      const words = segment.text.toLowerCase().split(' ')
      const potentialTopics = words
        .filter(word => word.length > 4 && !['about', 'there', 'would', 'could', 'should'].includes(word))
        .slice(0, 3) // Take top 3 words per segment

      potentialTopics.forEach(topic => {
        if (topicMap.has(topic)) {
          const existing = topicMap.get(topic)!
          topicMap.set(topic, {
            ...existing,
            frequency: existing.frequency + 1,
            segments: [...existing.segments, segment.id]
          })
        } else {
          topicMap.set(topic, {
            frequency: 1,
            firstMention: segment.startTime,
            segments: [segment.id]
          })
        }
      })
    })

    const extractedTopics = Array.from(topicMap.entries())
      .filter(([_, data]) => data.frequency > 1)
      .sort((a, b) => b[1].frequency - a[1].frequency)
      .slice(0, 10)
      .map(([name, data]) => ({ name, ...data }))

    setTopics(extractedTopics)
    return extractedTopics
  }, [])

  const updateSentimentAnalysis = useCallback((segments: TranscriptSegment[]) => {
    const speakerSentiments: Record<string, number[]> = {}
    let overallSentiments: number[] = []

    segments.forEach(segment => {
      const sentiment = segment.sentimentScore || 0
      overallSentiments.push(sentiment)

      if (!speakerSentiments[segment.speaker]) {
        speakerSentiments[segment.speaker] = []
      }
      speakerSentiments[segment.speaker].push(sentiment)
    })

    const overall = overallSentiments.length > 0 
      ? overallSentiments.reduce((sum, s) => sum + s, 0) / overallSentiments.length 
      : 0

    const bySpeaker: Record<string, number> = {}
    Object.entries(speakerSentiments).forEach(([speaker, sentiments]) => {
      bySpeaker[speaker] = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length
    })

    const recentChanges = segments
      .slice(-5) // Last 5 segments
      .map(segment => ({
        timestamp: segment.startTime,
        speaker: segment.speaker,
        sentiment: segment.sentimentScore || 0
      }))

    const sentiment: RealTimeSentiment = {
      overall,
      bySpeaker,
      recentChanges
    }

    setRealTimeSentiment(sentiment)
    return sentiment
  }, [])

  const rankQuotes = useCallback((segments: TranscriptSegment[]) => {
    const quotes = segments
      .filter(segment => segment.text.length > 20) // Only longer segments
      .map(segment => ({
        text: segment.text,
        importance: (segment.confidence || 0) * 
                   (segment.urgencyScore || 0.5) * 
                   (segment.sentimentScore ? Math.abs(segment.sentimentScore) : 0.5),
        segmentId: segment.id
      }))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)

    setRankedQuotes(quotes)
    return quotes
  }, [])

  const analyzeSegments = useCallback((segments: TranscriptSegment[]) => {
    extractActionItems(segments)
    extractHighlights(segments)
    extractTopics(segments)
    updateSentimentAnalysis(segments)
    rankQuotes(segments)
  }, [extractActionItems, extractHighlights, extractTopics, updateSentimentAnalysis, rankQuotes])

  const analytics = useMemo(() => ({
    totalSegments: actionItems.length + highlights.length,
    averageSentiment: realTimeSentiment.overall,
    topTopics: topics.slice(0, 5),
    urgentItems: actionItems.filter(item => item.priority === 'high').length,
    speakerEngagement: Object.keys(realTimeSentiment.bySpeaker).length
  }), [actionItems, highlights, realTimeSentiment, topics])

  return {
    actionItems,
    highlights,
    topics,
    realTimeSentiment,
    rankedQuotes,
    analytics,
    extractActionItems,
    extractHighlights,
    extractTopics,
    updateSentimentAnalysis,
    rankQuotes,
    analyzeSegments,
    setActionItems,
    setHighlights,
    setTopics,
    setRealTimeSentiment,
    setRankedQuotes
  }
}
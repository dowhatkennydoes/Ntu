import { useState, useCallback, useRef } from 'react'
import { TranscriptSegment, Speaker, ProcessingState } from '@/types/voice-transcription'

export function useTranscription() {
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: 'speaker1', name: 'Speaker 1', color: 'bg-blue-500', segments: 0, totalDuration: 0, averageConfidence: 0 },
    { id: 'speaker2', name: 'Speaker 2', color: 'bg-green-500', segments: 0, totalDuration: 0, averageConfidence: 0 },
    { id: 'speaker3', name: 'Speaker 3', color: 'bg-purple-500', segments: 0, totalDuration: 0, averageConfidence: 0 }
  ])
  
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    processingStatus: '',
    lastSaveTime: new Date(),
    confidenceThreshold: 0.7
  })

  const transcriptEndRef = useRef<HTMLDivElement>(null)

  const addTranscriptSegment = useCallback((segment: Omit<TranscriptSegment, 'id'>) => {
    const newSegment: TranscriptSegment = {
      ...segment,
      id: `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    setTranscriptSegments(prev => [...prev, newSegment])

    // Update speaker statistics
    setSpeakers(prev => prev.map(speaker => {
      if (speaker.id === segment.speaker) {
        const newSegments = speaker.segments + 1
        const newTotalDuration = speaker.totalDuration + (segment.endTime - segment.startTime)
        const newAverageConfidence = (speaker.averageConfidence * speaker.segments + segment.speakerConfidence) / newSegments
        
        return {
          ...speaker,
          segments: newSegments,
          totalDuration: newTotalDuration,
          averageConfidence: newAverageConfidence
        }
      }
      return speaker
    }))

    // Auto-scroll to latest segment
    setTimeout(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)

    return newSegment.id
  }, [])

  const updateTranscriptSegment = useCallback((segmentId: string, updates: Partial<TranscriptSegment>) => {
    setTranscriptSegments(prev => prev.map(segment => 
      segment.id === segmentId ? { ...segment, ...updates } : segment
    ))
  }, [])

  const deleteTranscriptSegment = useCallback((segmentId: string) => {
    setTranscriptSegments(prev => prev.filter(segment => segment.id !== segmentId))
  }, [])

  const simulateRealTimeTranscription = useCallback(async (audioBlob: Blob) => {
    setProcessingState(prev => ({ ...prev, isProcessing: true, processingStatus: 'Processing audio...' }))

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockSegments: Omit<TranscriptSegment, 'id'>[] = [
        {
          speaker: 'speaker1',
          speakerConfidence: 0.95,
          startTime: 0,
          endTime: 3.5,
          text: "Good morning everyone, thank you for joining today's meeting.",
          confidence: 0.92,
          isLive: false,
          punctuationCorrected: true,
          sentimentScore: 0.3,
          emotionalTone: 'neutral',
          intentCategory: 'neutral'
        },
        {
          speaker: 'speaker2',
          speakerConfidence: 0.88,
          startTime: 4.0,
          endTime: 8.2,
          text: "I have some important updates to share about the project timeline.",
          confidence: 0.89,
          isLive: false,
          punctuationCorrected: true,
          sentimentScore: 0.1,
          emotionalTone: 'neutral',
          intentCategory: 'request',
          isActionItem: true
        }
      ]

      for (const segment of mockSegments) {
        addTranscriptSegment(segment)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setProcessingState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        processingStatus: 'Transcription complete',
        lastSaveTime: new Date()
      }))

      return { success: true }
    } catch (error) {
      setProcessingState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        processingStatus: 'Processing failed' 
      }))
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Transcription failed'
      }
    }
  }, [addTranscriptSegment])

  const processUploadedFile = useCallback(async (file: File) => {
    if (!file.type.match(/(audio|video)\/(mp3|wav|m4a|mp4|mov|webm|ogg)/)) {
      return { success: false, error: 'Unsupported file format. Please upload an audio or video file.' }
    }

    setProcessingState(prev => ({ ...prev, isProcessing: true, processingStatus: 'Processing uploaded file...' }))

    try {
      // Create audio blob from file
      const audioBlob = new Blob([file], { type: file.type })
      return await simulateRealTimeTranscription(audioBlob)
    } catch (error) {
      setProcessingState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        processingStatus: 'File processing failed' 
      }))
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'File processing failed'
      }
    }
  }, [simulateRealTimeTranscription])

  const clearTranscription = useCallback(() => {
    setTranscriptSegments([])
    setSpeakers(prev => prev.map(speaker => ({
      ...speaker,
      segments: 0,
      totalDuration: 0,
      averageConfidence: 0
    })))
  }, [])

  return {
    transcriptSegments,
    speakers,
    processingState,
    addTranscriptSegment,
    updateTranscriptSegment,
    deleteTranscriptSegment,
    simulateRealTimeTranscription,
    processUploadedFile,
    clearTranscription,
    transcriptEndRef,
    setProcessingState
  }
}
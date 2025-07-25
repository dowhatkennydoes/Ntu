import { useState, useRef, useCallback } from 'react'
import { RecordingState } from '@/types/voice-transcription'

export function useVoiceRecording() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    recordingTime: 0
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl
          audioRef.current.onloadedmetadata = () => {
            setRecordingState(prev => ({
              ...prev,
              duration: audioRef.current?.duration || 0
            }))
          }
        }

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(1000) // Collect data every second
      setRecordingState(prev => ({ ...prev, isRecording: true }))

      return { success: true }
    } catch (error) {
      console.error('Recording error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start recording'
      }
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop()
      setRecordingState(prev => ({ ...prev, isRecording: false }))
    }
  }, [recordingState.isRecording])

  const playAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
      setRecordingState(prev => ({ ...prev, isPlaying: true }))
    }
  }, [])

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setRecordingState(prev => ({ ...prev, isPlaying: false }))
    }
  }, [])

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setRecordingState(prev => ({ ...prev, currentTime: time }))
    }
  }, [])

  return {
    recordingState,
    startRecording,
    stopRecording,
    playAudio,
    pauseAudio,
    seekTo,
    audioRef,
    getAudioBlob: () => new Blob(audioChunksRef.current, { type: 'audio/webm' })
  }
}
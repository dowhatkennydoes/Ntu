import React from 'react'
import { 
  MicrophoneIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'
import { RecordingState } from '@/types/voice-transcription'

interface RecordingControlsProps {
  recordingState: RecordingState
  onStartRecording: () => Promise<{ success: boolean; error?: string }>
  onStopRecording: () => void
  onPlayAudio: () => void
  onPauseAudio: () => void
  onFileUpload: (file: File) => Promise<{ success: boolean; error?: string }>
  onSeekTo: (time: number) => void
  isProcessing?: boolean
}

export const RecordingControls = React.memo<RecordingControlsProps>(({
  recordingState,
  onStartRecording,
  onStopRecording,
  onPlayAudio,
  onPauseAudio,
  onFileUpload,
  onSeekTo,
  isProcessing = false
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Voice Recording</h3>
        <div className="flex items-center space-x-2">
          {recordingState.isRecording && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {formatTime(recordingState.recordingTime)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {!recordingState.isRecording ? (
          <button
            onClick={onStartRecording}
            disabled={isProcessing}
            className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MicrophoneIcon className="w-8 h-8" />
          </button>
        ) : (
          <button
            onClick={onStopRecording}
            className="flex items-center justify-center w-16 h-16 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
          >
            <StopIcon className="w-8 h-8" />
          </button>
        )}

        {recordingState.duration > 0 && (
          <>
            {!recordingState.isPlaying ? (
              <button
                onClick={onPlayAudio}
                disabled={recordingState.isRecording}
                className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={onPauseAudio}
                className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
              >
                <PauseIcon className="w-6 h-6" />
              </button>
            )}
          </>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={recordingState.isRecording || isProcessing}
          className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DocumentArrowUpIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Audio Progress Bar */}
      {recordingState.duration > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{formatTime(recordingState.currentTime)}</span>
            <span>{formatTime(recordingState.duration)}</span>
          </div>
          <div className="relative w-full h-2 bg-gray-200 rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(recordingState.currentTime / recordingState.duration) * 100}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max={recordingState.duration}
              value={recordingState.currentTime}
              onChange={(e) => onSeekTo(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* File Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Status Messages */}
      {isProcessing && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-700">Processing audio...</span>
          </div>
        </div>
      )}
    </div>
  )
})

RecordingControls.displayName = 'RecordingControls'
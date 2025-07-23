'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  MicrophoneIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  UserIcon,
  DocumentTextIcon,
  CloudArrowDownIcon,
  PencilIcon,
  ClockIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'

interface TranscriptSegment {
  id: string
  speaker: string
  timestamp: number
  text: string
  confidence: number
}

interface Speaker {
  id: string
  name: string
  color: string
}

export function TranscriptEditingWorkflow() {
  const { nextStep, addError, updateWorkflowData } = useWorkflow()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([
    {
      id: '1',
      speaker: 'speaker1',
      timestamp: 0,
      text: 'Welcome to today\'s meeting. Let\'s start by reviewing the quarterly metrics.',
      confidence: 0.95
    },
    {
      id: '2', 
      speaker: 'speaker2',
      timestamp: 15,
      text: 'Thanks for having me. I\'ve prepared the financial overview we discussed.',
      confidence: 0.88
    },
    {
      id: '3',
      speaker: 'speaker1', 
      timestamp: 32,
      text: 'Perfect. Before we dive in, does anyone have questions about the agenda?',
      confidence: 0.92
    }
  ])
  
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: 'speaker1', name: 'Speaker 1', color: 'bg-blue-500' },
    { id: 'speaker2', name: 'Speaker 2', color: 'bg-green-500' }
  ])
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [editingSegment, setEditingSegment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Initialize workflow data
    updateWorkflowData({ transcriptSegments, speakers })
  }, [updateWorkflowData, transcriptSegments, speakers])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const handleEditSegment = (segmentId: string, text: string) => {
    setEditingSegment(segmentId)
    setEditText(text)
  }

  const handleSaveEdit = () => {
    if (editingSegment) {
      setTranscriptSegments(prev => prev.map(segment => 
        segment.id === editingSegment 
          ? { ...segment, text: editText }
          : segment
      ))
      setEditingSegment(null)
      setEditText('')
    }
  }

  const handleSpeakerNameChange = (speakerId: string, newName: string) => {
    setSpeakers(prev => prev.map(speaker =>
      speaker.id === speakerId
        ? { ...speaker, name: newName }
        : speaker
    ))
  }

  const handleMergeSpeakers = (fromId: string, toId: string) => {
    setTranscriptSegments(prev => prev.map(segment =>
      segment.speaker === fromId
        ? { ...segment, speaker: toId }
        : segment
    ))
    setSpeakers(prev => prev.filter(speaker => speaker.id !== fromId))
  }

  const handleExport = (format: 'json' | 'txt' | 'csv' | 'docx' | 'pdf') => {
    try {
      let blob: Blob, filename: string
      if (format === 'json') {
        const exportData = {
          speakers: speakers.map(s => ({ id: s.id, name: s.name })),
          segments: transcriptSegments.map(segment => ({
            speaker: speakers.find(s => s.id === segment.speaker)?.name || segment.speaker,
            timestamp: formatTime(segment.timestamp),
            text: segment.text,
            confidence: segment.confidence
          })),
          metadata: {
            exportedAt: new Date().toISOString(),
            totalSegments: transcriptSegments.length,
            duration: Math.max(...transcriptSegments.map(s => s.timestamp)) + 30
          }
        }
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        filename = 'transcript-edited.json'
      } else if (format === 'txt') {
        const txt = transcriptSegments.map(s => `${formatTime(s.timestamp)} [${speakers.find(sp => sp.id === s.speaker)?.name || s.speaker}]: ${s.text}`).join('\n')
        blob = new Blob([txt], { type: 'text/plain' })
        filename = 'transcript.txt'
      } else if (format === 'csv') {
        const csv = ['Timestamp,Speaker,Text,Confidence']
        transcriptSegments.forEach(s => {
          csv.push(`"${formatTime(s.timestamp)}","${speakers.find(sp => sp.id === s.speaker)?.name || s.speaker}","${s.text}",${s.confidence}`)
        })
        blob = new Blob([csv.join('\n')], { type: 'text/csv' })
        filename = 'transcript.csv'
      } else if (format === 'docx' || format === 'pdf') {
        // Placeholder: just export as txt for now
        const txt = transcriptSegments.map(s => `${formatTime(s.timestamp)} [${speakers.find(sp => sp.id === s.speaker)?.name || s.speaker}]: ${s.text}`).join('\n')
        blob = new Blob([txt], { type: 'application/octet-stream' })
        filename = `transcript.${format}`
      } else {
        throw new Error('Unsupported export format')
      }
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 1500)
    } catch (error) {
      addError({
        id: 'export-error',
        type: 'processing',
        step: 'transcript-export',
        message: 'Failed to export transcript',
        timestamp: new Date().toISOString(),
        recoverable: true,
        retryCount: 0,
        maxRetries: 2,
        context: { error: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Edit Transcript
        </h2>
        <p className="text-gray-600">
          Review, edit, and enhance your voice transcript with speaker identification
        </p>
      </div>

      {/* Audio Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <SpeakerWaveIcon className="h-5 w-5 mr-2" />
            Audio Playback
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>{formatTime(currentTime)} / 5:24</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePlay}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {isPlaying ? (
              <PauseIcon className="h-6 w-6" />
            ) : (
              <PlayIcon className="h-6 w-6 ml-1" />
            )}
          </button>
          
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentTime / 324) * 100}%` }}
            />
          </div>
        </div>
        
        <audio ref={audioRef} className="hidden">
          <source src="/demo-audio.mp3" type="audio/mpeg" />
        </audio>
      </div>

      {/* Speaker Management */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <UserIcon className="h-5 w-5 mr-2" />
          Speaker Identification
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className={`w-4 h-4 rounded-full ${speaker.color}`} />
              <input
                type="text"
                value={speaker.name}
                onChange={(e) => handleSpeakerNameChange(speaker.id, e.target.value)}
                className="flex-1 px-2 py-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-sm text-gray-500">
                {transcriptSegments.filter(s => s.speaker === speaker.id).length} segments
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transcript Segments */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Transcript Segments
          </h3>
        </div>
        
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {transcriptSegments.map((segment) => {
            const speaker = speakers.find(s => s.id === segment.speaker)
            const isEditing = editingSegment === segment.id
            
            return (
              <div key={segment.id} className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${speaker?.color || 'bg-gray-400'}`} />
                    <span className="font-medium text-sm">{speaker?.name || 'Unknown Speaker'}</span>
                    <span className="text-xs text-gray-500">{formatTime(segment.timestamp)}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {Math.round(segment.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleEditSegment(segment.id, segment.text)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSegment(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800 leading-relaxed">{segment.text}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Transcript exported successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Export Controls */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => handleExport('json')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Export JSON</button>
        <button onClick={() => handleExport('txt')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Export TXT</button>
        <button onClick={() => handleExport('csv')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Export CSV</button>
        <button onClick={() => handleExport('docx')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Export DOCX</button>
        <button onClick={() => handleExport('pdf')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Export PDF</button>
      </div>
      {showSuccessMessage && <div className="text-green-600 mb-2">Export successful!</div>}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {transcriptSegments.length} segments • {speakers.length} speakers
        </div>
        
        <button
          onClick={() => handleExport('json')}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CloudArrowDownIcon className="h-5 w-5 mr-2" />
          Export Transcript
        </button>
      </div>
    </div>
  )
} 
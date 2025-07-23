'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  MicrophoneIcon, 
  CpuChipIcon, 
  SparklesIcon, 
  DocumentTextIcon,
  VideoCameraIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Memory } from '@/types/memory'
import { useWorkflow } from './WorkflowProvider'
import { WorkflowRunner } from './WorkflowRunner'

interface MemoryCreationWorkflowProps {
  onComplete: (memory: Memory) => void
  onCancel: () => void
}

export default function MemoryCreationWorkflow({ onComplete, onCancel }: MemoryCreationWorkflowProps) {
  const { 
    startWorkflow, 
    currentWorkflow, 
    updateWorkflowData, 
    workflowData,
    finishWorkflow,
    cancelWorkflow,
    nextStep
  } = useWorkflow()
  
  const [inputType, setInputType] = useState<'audio' | 'video' | 'text' | 'file'>('text')
  const [inputContent, setInputContent] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [memory, setMemory] = useState<Partial<Memory>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const InputStepComponent = () => {
    const handleSubmit = () => {
      updateWorkflowData({ 
        inputType, 
        content: inputContent,
        file: uploadedFile?.name 
      })
      nextStep()
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Input Type</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { type: 'text', icon: DocumentTextIcon, label: 'Text Input', description: 'Type or paste text directly' },
              { type: 'audio', icon: MicrophoneIcon, label: 'Audio File', description: 'Upload audio recording' },
              { type: 'video', icon: VideoCameraIcon, label: 'Video File', description: 'Upload video recording' },
              { type: 'file', icon: PhotoIcon, label: 'Document', description: 'Upload PDF, DOC, etc.' }
            ].map((option) => (
              <button
                key={option.type}
                onClick={() => setInputType(option.type as any)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  inputType === option.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <option.icon className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">{option.label}</h4>
                <p className="text-sm text-gray-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Provide Content</h3>
          {inputType === 'text' ? (
            <textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Type or paste your content here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                accept={
                  inputType === 'audio' ? 'audio/*' :
                  inputType === 'video' ? 'video/*' :
                  '.pdf,.doc,.docx,.txt'
                }
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Choose File
              </button>
              {uploadedFile && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800">{uploadedFile.name}</span>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!inputContent && !uploadedFile}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    )
  }

  const TranscribeStepComponent = () => {
    useEffect(() => {
      const timer = setTimeout(() => {
        updateWorkflowData({ transcription: 'Mock transcription content...' })
        nextStep()
      }, 2000)
      
      return () => clearTimeout(timer)
    }, [])

    return (
      <div className="text-center py-8">
        <CpuChipIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Audio</h3>
        <p className="text-gray-600">Converting audio to text using AI...</p>
      </div>
    )
  }

  const SummarizeStepComponent = () => {
    useEffect(() => {
      const timer = setTimeout(() => {
        updateWorkflowData({ summary: 'AI-generated summary of the content...' })
        nextStep()
      }, 2000)
      
      return () => clearTimeout(timer)
    }, [])

    return (
      <div className="text-center py-8">
        <SparklesIcon className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Summary</h3>
        <p className="text-gray-600">Creating key insights and summary...</p>
      </div>
    )
  }

  const OrganizeStepComponent = () => {
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')

    const addTag = (tag: string) => {
      if (!tags.includes(tag)) {
        const newTags = [...tags, tag]
        setTags(newTags)
        updateWorkflowData({ tags: newTags })
      }
    }

    const handleComplete = () => {
      const finalMemory: Memory = {
        id: `memory-${Date.now()}`,
        title: memory.title || `Memory from ${inputType}`,
        content: workflowData.content || inputContent || `Content from ${uploadedFile?.name || 'input'}`,
        summary: workflowData.summary || memory.summary || 'AI-generated summary of the content',
        tags: workflowData.tags || memory.tags || ['auto-generated'],
        category: memory.category || 'document',
        source: inputType === 'text' ? 'manual' : 'transcription',
        createdAt: new Date(),
        updatedAt: new Date(),
        confidence: 0.85,
        relatedMemories: [],
        metadata: {
          keywords: ['keyword1', 'keyword2'],
          language: 'en',
          fileSize: uploadedFile?.size,
          mimeType: uploadedFile?.type,
          transcriptionConfidence: 0.92,
          aiConfidence: 0.85
        },
        status: 'active'
      }

      finishWorkflow()
      onComplete(finalMemory)
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Add Tags</label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && tagInput.trim()) {
                addTag(tagInput.trim())
                setTagInput('')
              }
            }}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a tag and press Enter"
          />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Suggested Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {['meeting', 'notes', 'project', 'idea', 'research'].map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        {tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Selected Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={handleComplete}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Complete Memory Creation
        </button>
      </div>
    )
  }

  const workflowSteps = [
    {
      id: 'input',
      title: 'Input Source',
      description: 'Upload audio, video, or text',
      component: <InputStepComponent />,
    },
    {
      id: 'transcribe',
      title: 'Transcribe',
      description: 'AI-powered transcription',
      component: <TranscribeStepComponent />,
      aiAssisted: true,
    },
    {
      id: 'summarize',
      title: 'Summarize',
      description: 'Generate key insights and summary',
      component: <SummarizeStepComponent />,
      aiAssisted: true,
    },
    {
      id: 'organize',
      title: 'Organize',
      description: 'Tag and categorize for easy retrieval',
      component: <OrganizeStepComponent />,
    }
  ]

  useEffect(() => {
    if (!currentWorkflow) {
      startWorkflow('memory-creation', 'Memory Creation', workflowSteps)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Memory Creation</h2>
        <button 
          onClick={() => { cancelWorkflow(); onCancel(); }} 
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <WorkflowRunner />
    </div>
  )
}
'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  lastModified: number
  content?: string
  preview?: string
}

interface ParsedContent {
  title: string
  content: string
  metadata: {
    fileType: string
    wordCount?: number
    duration?: string
    language?: string
    confidence: number
  }
  tags: string[]
  summary: string
}

export function FileProcessingWorkflow() {
  const { updateWorkflowData, nextStep, handleAsyncOperation, finishWorkflow } = useWorkflow()
  const [files, setFiles] = useState<FileInfo[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set())
  const [parsedResults, setParsedResults] = useState<Map<string, ParsedContent>>(new Map())
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supportedTypes = {
    'application/pdf': { icon: DocumentTextIcon, label: 'PDF Document', color: 'text-red-600' },
    'application/msword': { icon: DocumentTextIcon, label: 'Word Document', color: 'text-blue-600' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: DocumentTextIcon, label: 'Word Document', color: 'text-blue-600' },
    'text/plain': { icon: DocumentTextIcon, label: 'Text File', color: 'text-gray-600' },
    'text/markdown': { icon: DocumentTextIcon, label: 'Markdown File', color: 'text-purple-600' },
    'image/jpeg': { icon: PhotoIcon, label: 'JPEG Image', color: 'text-green-600' },
    'image/png': { icon: PhotoIcon, label: 'PNG Image', color: 'text-green-600' },
    'audio/mpeg': { icon: MusicalNoteIcon, label: 'MP3 Audio', color: 'text-orange-600' },
    'audio/wav': { icon: MusicalNoteIcon, label: 'WAV Audio', color: 'text-orange-600' },
    'video/mp4': { icon: VideoCameraIcon, label: 'MP4 Video', color: 'text-purple-600' },
    'video/quicktime': { icon: VideoCameraIcon, label: 'MOV Video', color: 'text-purple-600' }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    await processUploadedFiles(droppedFiles)
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || [])
    await processUploadedFiles(uploadedFiles)
  }

  const processUploadedFiles = async (uploadedFiles: File[]) => {
    const newFiles: FileInfo[] = uploadedFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }))

    setFiles(prev => [...prev, ...newFiles])

    // Auto-trigger parsing for each file
    for (const fileInfo of newFiles) {
      const correspondingFile = uploadedFiles.find(f => 
        f.name === fileInfo.name && f.size === fileInfo.size
      )
      if (correspondingFile) {
        parseFile(fileInfo, correspondingFile)
      }
    }
  }

  const parseFile = async (fileInfo: FileInfo, file: File) => {
    setProcessingFiles(prev => {
      const newSet = new Set(prev)
      newSet.add(fileInfo.id)
      return newSet
    })

    const result = await handleAsyncOperation(
      async () => {
        // Simulate file parsing based on type
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

        let parsedContent: ParsedContent

        if (fileInfo.type.startsWith('text/') || fileInfo.type.includes('document')) {
          // Text/Document processing
          const text = fileInfo.type === 'text/plain' ? await file.text() : 
                      `Extracted text content from ${fileInfo.name}. This would contain the actual document content after OCR/parsing.`
          
          parsedContent = {
            title: fileInfo.name.replace(/\.[^/.]+$/, ''),
            content: text,
            metadata: {
              fileType: 'document',
              wordCount: text.split(' ').length,
              language: 'en',
              confidence: 0.92
            },
            tags: ['document', 'uploaded', 'text'],
            summary: `Document summary: ${text.substring(0, 150)}...`
          }
        } else if (fileInfo.type.startsWith('audio/')) {
          // Audio processing
          parsedContent = {
            title: `Transcript: ${fileInfo.name}`,
            content: `[Transcribed audio content from ${fileInfo.name}]\n\nSpeaker 1: Welcome to our meeting today.\nSpeaker 2: Thank you for joining us.\n[AI would provide actual transcription here]`,
            metadata: {
              fileType: 'audio',
              duration: '15:30',
              language: 'en',
              confidence: 0.87
            },
            tags: ['audio', 'transcript', 'meeting'],
            summary: 'Audio transcript covering meeting discussion and key points.'
          }
        } else if (fileInfo.type.startsWith('image/')) {
          // Image processing (OCR)
          parsedContent = {
            title: `Image Analysis: ${fileInfo.name}`,
            content: `[OCR extracted text from ${fileInfo.name}]\n\nDetected text content:\n- Visual elements described\n- Text extraction results\n[AI would provide actual OCR results here]`,
            metadata: {
              fileType: 'image',
              language: 'en',
              confidence: 0.78
            },
            tags: ['image', 'ocr', 'visual'],
            summary: 'Image analysis with extracted text and visual content description.'
          }
        } else if (fileInfo.type.startsWith('video/')) {
          // Video processing
          parsedContent = {
            title: `Video Analysis: ${fileInfo.name}`,
            content: `[Video content analysis from ${fileInfo.name}]\n\nVideo transcript:\n[Extracted audio would be transcribed here]\n\nVisual analysis:\n[Scene descriptions and key frames]`,
            metadata: {
              fileType: 'video',
              duration: '8:45',
              language: 'en',
              confidence: 0.82
            },
            tags: ['video', 'multimedia', 'analysis'],
            summary: 'Video content analysis including transcript and visual elements.'
          }
        } else {
          throw new Error(`Unsupported file type: ${fileInfo.type}`)
        }

        return parsedContent
      },
      `Parse ${fileInfo.name}`,
      { fileName: fileInfo.name, fileType: fileInfo.type }
    )

    setProcessingFiles(prev => {
      const newSet = new Set(prev)
      newSet.delete(fileInfo.id)
      return newSet
    })

    if (result.success && result.data) {
      setParsedResults(prev => {
        const newMap = new Map(prev)
        newMap.set(fileInfo.id, result.data as ParsedContent)
        return newMap
      })
      setSelectedFiles(prev => {
        const newSet = new Set(prev)
        newSet.add(fileInfo.id)
        return newSet
      })
      toast.success(`Successfully parsed ${fileInfo.name}`)
    }
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  const createMemoriesFromFiles = () => {
    const selectedResults = Array.from(selectedFiles)
      .map(id => ({ id, ...parsedResults.get(id)! }))
      .filter(result => result.title)

    updateWorkflowData({
      uploadedFiles: files.filter(f => selectedFiles.has(f.id)),
      parsedContent: selectedResults,
      memoryCount: selectedResults.length
    })

    toast.success(`Created ${selectedResults.length} memories from uploaded files`)
    finishWorkflow()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    const config = supportedTypes[type as keyof typeof supportedTypes]
    return config ? config.icon : DocumentTextIcon
  }

  const getFileLabel = (type: string) => {
    const config = supportedTypes[type as keyof typeof supportedTypes]
    return config ? config.label : 'Unknown File'
  }

  const getFileColor = (type: string) => {
    const config = supportedTypes[type as keyof typeof supportedTypes]
    return config ? config.color : 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.mp3,.wav,.mp4,.mov"
          className="hidden"
        />
        
        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Files for Auto-Processing
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop files here, or click to browse. Files will be automatically parsed and converted to memories.
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Choose Files
        </button>
        
        <div className="mt-4 text-sm text-gray-500">
          Supported: PDF, Word, Text, Markdown, Images (JPG, PNG), Audio (MP3, WAV), Video (MP4, MOV)
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-medium text-gray-900">Uploaded Files</h3>
            <p className="text-sm text-gray-600">
              {files.length} file{files.length !== 1 ? 's' : ''} uploaded • 
              {parsedResults.size} processed • 
              {selectedFiles.size} selected for memory creation
            </p>
          </div>
          
          <div className="divide-y">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type)
              const isProcessing = processingFiles.has(file.id)
              const parsed = parsedResults.get(file.id)
              const isSelected = selectedFiles.has(file.id)
              
              return (
                <div key={file.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center',
                      parsed ? 'bg-green-100' : isProcessing ? 'bg-blue-100' : 'bg-gray-100'
                    )}>
                      {isProcessing ? (
                        <SparklesIcon className="h-5 w-5 text-blue-600 animate-pulse" />
                      ) : parsed ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <FileIcon className={cn('h-5 w-5', getFileColor(file.type))} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{file.name}</h4>
                          <p className="text-sm text-gray-600">
                            {getFileLabel(file.type)} • {formatFileSize(file.size)}
                          </p>
                          
                          {isProcessing && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                              <span>Processing file...</span>
                            </div>
                          )}
                          
                          {parsed && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
                                <CheckCircleIcon className="h-3 w-3" />
                                <span>Parsed successfully • {Math.round(parsed.metadata.confidence * 100)}% confidence</span>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {parsed.summary}
                              </p>
                              <div className="flex gap-1 mt-2">
                                {parsed.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {parsed && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const content = `Title: ${parsed.title}\n\nContent:\n${parsed.content}\n\nSummary:\n${parsed.summary}\n\nTags: ${parsed.tags.join(', ')}`
                                navigator.clipboard.writeText(content)
                                toast.success('Content copied to clipboard')
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Preview content"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFileSelection(file.id)}
                                className="sr-only"
                              />
                              <div className={cn(
                                'w-4 h-4 border-2 rounded flex items-center justify-center',
                                isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                              )}>
                                {isSelected && (
                                  <CheckCircleIcon className="h-3 w-3 text-white" />
                                )}
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {parsedResults.size > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected for memory creation
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedFiles(new Set(parsedResults.keys()))}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Select All
            </button>
            
            <button
              onClick={createMemoriesFromFiles}
              disabled={selectedFiles.size === 0}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <SparklesIcon className="h-4 w-4" />
              Create {selectedFiles.size} Memor{selectedFiles.size !== 1 ? 'ies' : 'y'}
            </button>
          </div>
        </div>
      )}

      {/* Processing Stats */}
      {(files.length > 0 || processingFiles.size > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Processing Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-600 font-medium">{files.length}</div>
              <div className="text-blue-700">Files Uploaded</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">{processingFiles.size}</div>
              <div className="text-blue-700">Currently Processing</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">{parsedResults.size}</div>
              <div className="text-blue-700">Successfully Parsed</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">{selectedFiles.size}</div>
              <div className="text-blue-700">Ready for Memory</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
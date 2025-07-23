'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  DocumentTextIcon,
  CloudArrowUpIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  EyeIcon,
  TagIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface KnowledgeSource {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'docx' | 'txt' | 'md' | 'notes'
  size: number
  content: string
  extractedData: {
    title: string
    summary: string
    keyTopics: string[]
    pageCount?: number
    wordCount: number
    sections: Array<{
      title: string
      content: string
      page?: number
    }>
  }
  tags: string[]
  category: string
  searchable: boolean
  processed: boolean
}

interface KnowledgeBase {
  id: string
  title: string
  description: string
  sources: KnowledgeSource[]
  categories: string[]
  totalDocuments: number
  isPublic: boolean
}

export function KnowledgeUploadWorkflow() {
  const { updateWorkflowData, finishWorkflow, handleAsyncOperation } = useWorkflow()
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>({
    id: `kb-${Date.now()}`,
    title: '',
    description: '',
    sources: [],
    categories: ['general'],
    totalDocuments: 0,
    isPublic: false
  })
  
  const [currentStep, setCurrentStep] = useState<'setup' | 'upload' | 'organize' | 'review'>('setup')
  const [dragActive, setDragActive] = useState(false)
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set())
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supportedTypes = {
    'application/pdf': { icon: DocumentTextIcon, label: 'PDF Document', color: 'text-red-600' },
    'application/msword': { icon: DocumentTextIcon, label: 'Word Document', color: 'text-blue-600' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: DocumentTextIcon, label: 'Word Document', color: 'text-blue-600' },
    'text/plain': { icon: DocumentTextIcon, label: 'Text File', color: 'text-gray-600' },
    'text/markdown': { icon: DocumentTextIcon, label: 'Markdown File', color: 'text-purple-600' }
  }

  const predefinedCategories = [
    'general', 'research', 'documentation', 'legal', 'technical', 'business',
    'education', 'reference', 'policies', 'procedures', 'templates', 'guides'
  ]

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
    for (const file of uploadedFiles) {
      const sourceId = `source-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const newSource: KnowledgeSource = {
        id: sourceId,
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() as any || 'txt',
        size: file.size,
        content: '',
        extractedData: {
          title: file.name.replace(/\.[^/.]+$/, ''),
          summary: '',
          keyTopics: [],
          wordCount: 0,
          sections: []
        },
        tags: [],
        category: 'general',
        searchable: true,
        processed: false
      }

      setKnowledgeBase(prev => ({
        ...prev,
        sources: [...prev.sources, newSource]
      }))

      // Start processing file
      processKnowledgeSource(newSource, file)
    }
  }

  const processKnowledgeSource = async (source: KnowledgeSource, file: File) => {
    setProcessingFiles(prev => {
      const newSet = new Set(prev)
      newSet.add(source.id)
      return newSet
    })

    const result = await handleAsyncOperation(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

        // Simulate knowledge extraction based on file type
        let extractedData
        let content = ''

        if (source.type === 'pdf') {
          content = `[Extracted PDF content from ${source.name}]

This document contains detailed information about knowledge management systems and best practices for document organization.

SECTION 1: Introduction to Knowledge Management
Knowledge management is the process of creating, sharing, using and managing the knowledge and information of an organization...

SECTION 2: Document Classification Systems
Effective classification enables quick retrieval and proper categorization of documents based on content, purpose, and audience...

SECTION 3: Search and Discovery
Modern knowledge bases implement semantic search capabilities that understand context and meaning beyond keyword matching...`

          extractedData = {
            title: `Knowledge Management Guide - ${source.name.replace('.pdf', '')}`,
            summary: 'Comprehensive guide covering knowledge management systems, document classification, and search optimization for organizational knowledge bases.',
            keyTopics: ['knowledge management', 'document classification', 'semantic search', 'information architecture', 'content organization'],
            pageCount: 45,
            wordCount: 12500,
            sections: [
              { title: 'Introduction to Knowledge Management', content: 'Overview of KM principles and methodologies', page: 1 },
              { title: 'Document Classification Systems', content: 'Taxonomies and categorization strategies', page: 15 },
              { title: 'Search and Discovery', content: 'Semantic search and findability techniques', page: 28 }
            ]
          }
        } else if (source.type === 'docx' || source.type === 'doc') {
          content = `[Extracted Word document content from ${source.name}]

PROJECT PROPOSAL: Enterprise Knowledge Portal

EXECUTIVE SUMMARY
This proposal outlines the development of a centralized knowledge portal to improve information sharing and collaboration across departments.

OBJECTIVES
- Centralize scattered documentation
- Improve search and discovery capabilities  
- Enable collaborative content creation
- Establish knowledge retention processes

TECHNICAL REQUIREMENTS
- Document management system with version control
- Full-text search with advanced filtering
- User access controls and permissions
- Integration with existing tools and workflows`

          extractedData = {
            title: `Project Proposal - ${source.name.replace(/\.(docx?)/g, '')}`,
            summary: 'Enterprise knowledge portal proposal covering centralized documentation, search capabilities, and collaborative features for organizational knowledge sharing.',
            keyTopics: ['project proposal', 'knowledge portal', 'document management', 'collaboration', 'enterprise systems'],
            wordCount: 3200,
            sections: [
              { title: 'Executive Summary', content: 'High-level project overview and goals' },
              { title: 'Objectives', content: 'Specific aims and success criteria' },
              { title: 'Technical Requirements', content: 'System specifications and integration needs' }
            ]
          }
        } else {
          // Text/Markdown files
          content = await file.text()
          
          extractedData = {
            title: source.name.replace(/\.(txt|md)$/g, ''),
            summary: `Text document containing ${Math.floor(content.length / 5)} words of content. ${content.includes('\n#') ? 'Contains structured headings and sections.' : 'Plain text format.'}`,
            keyTopics: ['text document', 'notes', 'reference'],
            wordCount: content.split(/\s+/).length,
            sections: content.includes('\n#') ? [
              { title: 'Main Content', content: 'Structured document with multiple sections' }
            ] : [
              { title: 'Content', content: 'Plain text content' }
            ]
          }
        }

        return {
          content,
          extractedData,
          tags: ['uploaded', 'document', source.type],
          category: content.toLowerCase().includes('project') ? 'business' :
                   content.toLowerCase().includes('guide') || content.toLowerCase().includes('manual') ? 'documentation' :
                   content.toLowerCase().includes('policy') ? 'policies' : 'general'
        }
      },
      `Process knowledge source: ${source.name}`,
      { fileName: source.name, fileSize: source.size }
    )

    setProcessingFiles(prev => {
      const newSet = new Set(prev)
      newSet.delete(source.id)
      return newSet
    })

    if (result.success && result.data) {
      const data = result.data as any
      setKnowledgeBase(prev => ({
        ...prev,
        sources: prev.sources.map(s => 
          s.id === source.id ? {
            ...s,
            content: data.content,
            extractedData: data.extractedData,
            tags: data.tags,
            category: data.category,
            processed: true
          } : s
        )
      }))
      toast.success(`Processed ${source.name}`)
    }
  }

  const toggleFileSelection = (sourceId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId)
      } else {
        newSet.add(sourceId)
      }
      return newSet
    })
  }

  const addCategory = (category: string) => {
    if (category.trim() && !knowledgeBase.categories.includes(category.trim())) {
      setKnowledgeBase(prev => ({
        ...prev,
        categories: [...prev.categories, category.trim()]
      }))
    }
  }

  const removeCategory = (category: string) => {
    setKnowledgeBase(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }))
  }

  const updateSourceCategory = (sourceId: string, category: string) => {
    setKnowledgeBase(prev => ({
      ...prev,
      sources: prev.sources.map(s => 
        s.id === sourceId ? { ...s, category } : s
      )
    }))
  }

  const filteredSources = knowledgeBase.sources.filter(source =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.extractedData.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.extractedData.keyTopics.some(topic => 
      topic.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const completeKnowledgeBase = () => {
    const processedSources = knowledgeBase.sources.filter(s => s.processed)
    
    updateWorkflowData({
      knowledgeBase: {
        ...knowledgeBase,
        sources: processedSources,
        totalDocuments: processedSources.length,
        createdAt: new Date().toISOString()
      }
    })
    
    toast.success(`Created knowledge base with ${processedSources.length} sources!`)
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
    const mimeType = `text/${type}` as keyof typeof supportedTypes
    const config = supportedTypes[mimeType]
    return config ? config.icon : DocumentTextIcon
  }

  const canProceed = knowledgeBase.title.trim() && knowledgeBase.sources.length > 0

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {['Setup', 'Upload', 'Organize', 'Review'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === step.toLowerCase() ? 'bg-blue-600 text-white' :
              ['setup', 'upload', 'organize', 'review'].indexOf(currentStep) > index ? 'bg-green-500 text-white' :
              'bg-gray-200 text-gray-600'
            )}>
              {['setup', 'upload', 'organize', 'review'].indexOf(currentStep) > index ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">{step}</span>
            {index < 3 && (
              <div className="w-8 h-px bg-gray-300 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Setup */}
      {currentStep === 'setup' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-blue-600" />
            Knowledge Base Setup
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Knowledge Base Title *
              </label>
              <input
                type="text"
                value={knowledgeBase.title}
                onChange={(e) => setKnowledgeBase(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter knowledge base title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={knowledgeBase.description}
                onChange={(e) => setKnowledgeBase(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe what this knowledge base contains..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={knowledgeBase.isPublic}
                  onChange={(e) => setKnowledgeBase(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Make this knowledge base publicly searchable</span>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep('upload')}
                disabled={!knowledgeBase.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Upload Documents */}
      {currentStep === 'upload' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <CloudArrowUpIcon className="h-5 w-5 text-blue-600" />
              Upload Knowledge Sources
            </h4>
            
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
                accept=".pdf,.doc,.docx,.txt,.md"
                className="hidden"
              />
              
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Knowledge Documents
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your PDFs, Word documents, and notes here, or click to browse.
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Choose Files
              </button>
              
              <div className="mt-4 text-sm text-gray-500">
                Supported: PDF, Word Documents (.doc, .docx), Text Files (.txt, .md)
              </div>
            </div>
          </div>

          {/* Uploaded Files */}
          {knowledgeBase.sources.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">
                Uploaded Sources ({knowledgeBase.sources.length})
              </h4>
              
              <div className="space-y-3">
                {knowledgeBase.sources.map((source) => {
                  const FileIcon = getFileIcon(source.type)
                  const isProcessing = processingFiles.has(source.id)
                  
                  return (
                    <div key={source.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center',
                          source.processed ? 'bg-green-100' : isProcessing ? 'bg-blue-100' : 'bg-gray-100'
                        )}>
                          {isProcessing ? (
                            <SparklesIcon className="h-5 w-5 text-blue-600 animate-pulse" />
                          ) : source.processed ? (
                            <CheckIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <FileIcon className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{source.name}</h5>
                          <p className="text-sm text-gray-600">
                            {source.type.toUpperCase()} • {formatFileSize(source.size)}
                          </p>
                          
                          {isProcessing && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                              <span>Processing document...</span>
                            </div>
                          )}
                          
                          {source.processed && (
                            <div className="mt-2">
                              <div className="text-sm text-green-600 mb-1">
                                ✓ Processed • {source.extractedData.wordCount.toLocaleString()} words
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {source.extractedData.summary}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep('setup')}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep('organize')}
              disabled={knowledgeBase.sources.filter(s => s.processed).length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Organization
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Organize */}
      {currentStep === 'organize' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FolderIcon className="h-5 w-5 text-blue-600" />
            Organize Knowledge Sources
          </h4>
          
          <div className="space-y-6">
            {/* Categories Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {knowledgeBase.categories.map(category => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {category}
                      {category !== 'general' && (
                        <button
                          onClick={() => removeCategory(category)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => e.target.value && addCategory(e.target.value)}
                    value=""
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Add predefined category...</option>
                    {predefinedCategories
                      .filter(cat => !knowledgeBase.categories.includes(cat))
                      .map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </div>

            {/* Search & Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Sources
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by filename, title, or topics..."
                />
              </div>
            </div>

            {/* Source Organization */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">
                Organize Sources ({filteredSources.length})
              </h5>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredSources.map((source) => (
                  <div key={source.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900">{source.extractedData.title}</h6>
                        <p className="text-sm text-gray-600 mt-1">{source.extractedData.summary}</p>
                        
                        {source.extractedData.keyTopics.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {source.extractedData.keyTopics.slice(0, 3).map(topic => (
                              <span key={topic} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {topic}
                              </span>
                            ))}
                            {source.extractedData.keyTopics.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{source.extractedData.keyTopics.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <select
                          value={source.category}
                          onChange={(e) => updateSourceCategory(source.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          {knowledgeBase.categories.map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep('upload')}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep('review')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Complete */}
      {currentStep === 'review' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-blue-600" />
            Review Knowledge Base
          </h4>
          
          <div className="space-y-6">
            {/* Knowledge Base Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Knowledge Base Overview</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {knowledgeBase.sources.filter(s => s.processed).length}
                  </div>
                  <div className="text-sm text-blue-700">Documents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {knowledgeBase.sources.reduce((sum, s) => sum + s.extractedData.wordCount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">Total Words</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {knowledgeBase.categories.length}
                  </div>
                  <div className="text-sm text-blue-700">Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {knowledgeBase.isPublic ? 'Public' : 'Private'}
                  </div>
                  <div className="text-sm text-blue-700">Visibility</div>
                </div>
              </div>
            </div>

            {/* Categories Overview */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Categories & Distribution</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {knowledgeBase.categories.map(category => {
                  const count = knowledgeBase.sources.filter(s => s.category === category).length
                  return (
                    <div key={category} className="bg-gray-50 border rounded-lg p-3 text-center">
                      <div className="font-medium text-gray-900 capitalize">{category}</div>
                      <div className="text-sm text-gray-600">{count} document{count !== 1 ? 's' : ''}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('organize')}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back to Organization
                </button>
                <button
                  onClick={completeKnowledgeBase}
                  disabled={!canProceed}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <BookOpenIcon className="h-4 w-4" />
                  Create Knowledge Base
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
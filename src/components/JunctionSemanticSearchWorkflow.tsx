'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  DocumentArrowUpIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  LinkIcon,
  StarIcon,
  DocumentTextIcon,
  BeakerIcon,
  ChatBubbleLeftIcon,
  ClipboardDocumentCheckIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'

interface KnowledgeSource {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'txt' | 'md'
  content: string
  uploadedAt: Date
  pages?: number
  size: number
  processingStatus: 'uploading' | 'processing' | 'indexed' | 'error' // J1: Enhanced upload tracking
  extractedConcepts?: ExtractedConcept[] // J3: Concept extraction
  entities?: ExtractedEntity[] // J3: Entity recognition
  relationships?: ConceptRelationship[] // J3: Relationship mapping
}

interface ExtractedConcept {
  id: string
  term: string
  definition: string
  frequency: number
  importance: number
  category: 'technical' | 'business' | 'academic' | 'general'
  relatedTerms: string[]
}

interface ExtractedEntity {
  id: string
  name: string
  type: 'person' | 'organization' | 'location' | 'date' | 'technology' | 'concept'
  mentions: number
  contexts: string[]
  confidence: number
}

interface ConceptRelationship {
  id: string
  fromConcept: string
  toConcept: string
  relationshipType: 'defines' | 'influences' | 'requires' | 'implements' | 'contradicts'
  strength: number
  evidence: string[]
}

interface Citation {
  sourceId: string
  sourceName: string
  pageNumber?: number
  paragraph: number
  confidence: number
  text: string
  context: string // J2: Enhanced citation context
  highlightedTerms: string[] // J2: Precise term highlighting
  conceptsReferenced: string[] // J3: Linked concepts
}

interface QAResponse {
  id: string
  question: string
  answer: string
  citations: Citation[]
  timestamp: Date
  model: string
  tone: 'analytical' | 'comprehensive' | 'concise'
  isPinned: boolean
  conceptsDiscussed: string[] // J3: Concept tracking
  collaborativeNotes?: CollaborativeNote[] // J4: Collaborative features
  crossSourceInsights?: CrossSourceInsight[] // Enhanced cross-referencing
}

interface CollaborativeNote {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
  type: 'annotation' | 'question' | 'insight'
}

interface CrossSourceInsight {
  id: string
  topic: string
  sources: string[]
  agreements: string[]
  contradictions: string[]
  gaps: string[]
  synthesisScore: number
}

// J26: Block system interfaces for Notion-style editing
interface Block {
  id: string
  type: 'text' | 'heading' | 'list' | 'table' | 'code' | 'image' | 'quote' | 'divider' | 'toggle'
  content: any
  position: number
  parentId?: string
  children?: Block[]
  metadata?: {
    level?: number // for headings
    language?: string // for code blocks
    listType?: 'bullet' | 'numbered' // for lists
    collapsed?: boolean // for toggles
  }
}

interface TextBlock extends Block {
  type: 'text'
  content: {
    text: string
    formatting: {
      bold?: boolean
      italic?: boolean
      strikethrough?: boolean
      code?: boolean
    }[]
  }
}

interface TableBlock extends Block {
  type: 'table'
  content: {
    headers: string[]
    rows: string[][]
    columnWidths?: number[]
  }
}

interface CodeBlock extends Block {
  type: 'code'
  content: {
    code: string
    language: string
  }
}

interface ListBlock extends Block {
  type: 'list'
  content: {
    items: {
      text: string
      checked?: boolean // for checklists
      children?: ListBlock[]
    }[]
  }
}

interface CollaborativeSession {
  id: string
  name: string
  participants: string[]
  sharedQuestions: string[]
  sharedInsights: string[]
  isActive: boolean
}

interface Citation {
  sourceId: string
  sourceName: string
  pageNumber?: number
  paragraph: number
  confidence: number
  text: string
}

interface Summary {
  id: string
  sourceId: string
  content: string
  type: 'overview' | 'key-points' | 'analysis'
  length: 'short' | 'medium' | 'long'
  focus?: string
}

export function JunctionSemanticSearchWorkflow() {
  const { nextStep, addError, updateWorkflowData } = useWorkflow()
  
  // Enhanced knowledge base state
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set())
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({}) // J1: Upload progress tracking
  
  // Enhanced Q&A state
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [qaHistory, setQAHistory] = useState<QAResponse[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState<'gpt-4' | 'claude' | 'gemini'>('gpt-4')
  const [responseTone, setResponseTone] = useState<'analytical' | 'comprehensive' | 'concise'>('comprehensive')
  
  // J3: Concept and entity analysis state
  const [extractedConcepts, setExtractedConcepts] = useState<ExtractedConcept[]>([])
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntity[]>([])
  const [conceptRelationships, setConceptRelationships] = useState<ConceptRelationship[]>([])
  const [showConceptMap, setShowConceptMap] = useState(false)
  
  // J4: Collaborative features state
  const [collaborativeSession, setCollaborativeSession] = useState<CollaborativeSession | null>(null)
  const [isCollaborating, setIsCollaborating] = useState(false)
  const [collaborativeNotes, setCollaborativeNotes] = useState<CollaborativeNote[]>([])
  const [shareableLink, setShareableLink] = useState<string>('')
  
  // Enhanced search and analysis state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Citation[]>([])
  const [crossSourceInsights, setCrossSourceInsights] = useState<CrossSourceInsight[]>([])
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [pinnedInsights, setPinnedInsights] = useState<QAResponse[]>([])
  
  // UI state
  const [dragActive, setDragActive] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'qa' | 'concepts' | 'collaborate'>('qa')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // J3: Mock concept extraction for demo
  const extractConceptsFromSource = useCallback((source: KnowledgeSource): ExtractedConcept[] => {
    // Simulate concept extraction
    const mockConcepts: ExtractedConcept[] = [
      {
        id: 'concept-1',
        term: 'Transformer Architecture',
        definition: 'A neural network architecture that relies entirely on attention mechanisms',
        frequency: 15,
        importance: 0.95,
        category: 'technical',
        relatedTerms: ['attention mechanism', 'self-attention', 'encoder-decoder']
      },
      {
        id: 'concept-2',
        term: 'Attention Mechanism',
        definition: 'A technique that allows models to focus on relevant parts of input',
        frequency: 23,
        importance: 0.88,
        category: 'technical',
        relatedTerms: ['transformer', 'neural networks', 'deep learning']
      },
      {
        id: 'concept-3',
        term: 'Natural Language Processing',
        definition: 'Field of AI focused on interaction between computers and human language',
        frequency: 31,
        importance: 0.92,
        category: 'academic',
        relatedTerms: ['machine learning', 'linguistics', 'AI']
      }
    ]
    return mockConcepts
  }, [])

  // J3: Mock entity extraction
  const extractEntitiesFromSource = useCallback((source: KnowledgeSource): ExtractedEntity[] => {
    const mockEntities: ExtractedEntity[] = [
      {
        id: 'entity-1',
        name: 'Google',
        type: 'organization',
        mentions: 8,
        contexts: ['developed the Transformer architecture', 'published research on attention'],
        confidence: 0.94
      },
      {
        id: 'entity-2',
        name: 'BERT',
        type: 'technology',
        mentions: 12,
        contexts: ['bidirectional encoder', 'pre-trained language model'],
        confidence: 0.91
      },
      {
        id: 'entity-3',
        name: '2017',
        type: 'date',
        mentions: 5,
        contexts: ['Attention is All You Need paper', 'transformer introduction'],
        confidence: 0.89
      }
    ]
    return mockEntities
  }, [])

  // J1: Enhanced file processing with concept extraction
  const processUploadedFile = useCallback(async (source: KnowledgeSource) => {
    setSources(prev => prev.map(s => 
      s.id === source.id ? { ...s, processingStatus: 'processing' } : s
    ))
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Extract concepts and entities
    const concepts = extractConceptsFromSource(source)
    const entities = extractEntitiesFromSource(source)
    
    // Generate relationships
    const relationships: ConceptRelationship[] = [
      {
        id: 'rel-1',
        fromConcept: 'Transformer Architecture',
        toConcept: 'Attention Mechanism',
        relationshipType: 'requires',
        strength: 0.95,
        evidence: ['Transformers rely entirely on attention mechanisms']
      }
    ]
    
    setSources(prev => prev.map(s => 
      s.id === source.id ? { 
        ...s, 
        processingStatus: 'indexed',
        extractedConcepts: concepts,
        entities: entities,
        relationships: relationships
      } : s
    ))
    
    // Update global concept and entity lists
    setExtractedConcepts(prev => [...prev, ...concepts])
    setExtractedEntities(prev => [...prev, ...entities])
    setConceptRelationships(prev => [...prev, ...relationships])
  }, [extractConceptsFromSource, extractEntitiesFromSource])

  // J1: Enhanced file upload with processing
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    Array.from(files).forEach(async (file) => {
      // J1: Support multiple formats with validation
      const supportedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown']
      
      if (!supportedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|md)$/i)) {
        addError({
          id: 'unsupported-format',
          type: 'validation',
          step: 'file-upload',
          message: `Unsupported file format: ${file.name}. Please use PDF, DOC, DOCX, TXT, or MD files.`,
          timestamp: new Date().toISOString(),
          recoverable: true,
          retryCount: 0,
          maxRetries: 1
        })
        return
      }

      const newSource: KnowledgeSource = {
        id: `source-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'doc' | 'txt' | 'md',
        content: '', // Will be loaded
        uploadedAt: new Date(),
        pages: file.type === 'application/pdf' ? Math.ceil(file.size / 50000) : undefined,
        size: file.size,
        processingStatus: 'uploading'
      }
      
      setSources(prev => [...prev, newSource])
      setSelectedSources(prev => new Set([...Array.from(prev), newSource.id]))
      
      // Simulate file reading with progress
      setUploadProgress(prev => ({ ...prev, [newSource.id]: 0 }))
      
      const reader = new FileReader()
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          setUploadProgress(prev => ({ ...prev, [newSource.id]: progress }))
        }
      }
      
      reader.onload = async (e) => {
        const updatedSource = {
          ...newSource,
          content: e.target?.result as string,
          processingStatus: 'processing' as const
        }
        setSources(prev => prev.map(s => s.id === newSource.id ? updatedSource : s))
        
        // Process the file for concepts and entities
        await processUploadedFile(updatedSource)
        
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[newSource.id]
          return newProgress
        })
      }
      
      reader.readAsText(file)
    })
  }

  // J4: Start collaborative session
  const startCollaborativeSession = () => {
    const sessionId = `session-${Date.now()}`
    const newSession: CollaborativeSession = {
      id: sessionId,
      name: `Junction Session ${new Date().toLocaleString()}`,
      participants: ['You'],
      sharedQuestions: [],
      sharedInsights: [],
      isActive: true
    }
    
    setCollaborativeSession(newSession)
    setIsCollaborating(true)
    setShareableLink(`https://junction.example.com/session/${sessionId}`)
  }

  // J4: Add collaborative note
  const addCollaborativeNote = (content: string, type: CollaborativeNote['type']) => {
    const newNote: CollaborativeNote = {
      id: `note-${Date.now()}`,
      userId: 'user-1',
      userName: 'You',
      content,
      timestamp: new Date(),
      type
    }
    
    setCollaborativeNotes(prev => [...prev, newNote])
  }

  // Utility function for file size formatting
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Mock knowledge sources for demo
  useEffect(() => {
    const mockSources: KnowledgeSource[] = [
      {
        id: 'source-1',
        name: 'AI Research Paper - Transformers.pdf',
        type: 'pdf',
        content: 'The Transformer architecture has revolutionized natural language processing...',
        uploadedAt: new Date(Date.now() - 86400000),
        pages: 15,
        size: 2.4 * 1024 * 1024,
        processingStatus: 'indexed'
      },
      {
        id: 'source-2', 
        name: 'Machine Learning Notes.docx',
        type: 'doc',
        content: 'Deep learning models require large amounts of training data...',
        uploadedAt: new Date(Date.now() - 172800000),
        size: 856 * 1024,
        processingStatus: 'indexed'
      },
      {
        id: 'source-3',
        name: 'Industry Report - AI Trends.txt',
        type: 'txt', 
        content: 'Current trends in artificial intelligence show exponential growth...',
        uploadedAt: new Date(Date.now() - 259200000),
        size: 124 * 1024,
        processingStatus: 'indexed'
      }
    ]
    setSources(mockSources)
    setSelectedSources(new Set(mockSources.map(s => s.id)))
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  // J2 & J3: Enhanced semantic Q&A with cross-source insights
  const handleAskQuestion = async () => {
    if (!currentQuestion.trim() || selectedSources.size === 0) return
    
    setIsProcessing(true)
    
    // Simulate AI processing delay
    setTimeout(() => {
      // J2: Generate enhanced citations with concept links
      const selectedSourcesList = Array.from(selectedSources)
      const mockCitations: Citation[] = selectedSourcesList.slice(0, 2).map((sourceId, index) => {
        const source = sources.find(s => s.id === sourceId)
        return {
          sourceId,
          sourceName: source?.name || 'Unknown',
          pageNumber: Math.floor(Math.random() * 10) + 1,
          paragraph: index + 1,
          confidence: 0.85 + Math.random() * 0.15,
          text: `This section discusses ${currentQuestion.toLowerCase().includes('transformer') ? 'transformer architectures and their applications' : 'the relevant concepts'} in detail...`,
          context: 'The surrounding context provides additional insights about the methodology and implications.',
          highlightedTerms: ['transformer', 'attention', 'architecture'],
          conceptsReferenced: ['Transformer Architecture', 'Attention Mechanism']
        }
      })

      // J3: Generate cross-source insights
      const crossSourceInsight: CrossSourceInsight = {
        id: `insight-${Date.now()}`,
        topic: currentQuestion,
        sources: selectedSourcesList,
        agreements: ['All sources agree on the importance of attention mechanisms'],
        contradictions: ['Sources differ on optimal model size'],
        gaps: ['Limited discussion of computational efficiency'],
        synthesisScore: 0.78
      }

      const mockAnswer = `Based on analysis across ${selectedSources.size} sources, ${currentQuestion.toLowerCase().includes('transformer') ? 'Transformer architectures represent a paradigm shift in NLP' : 'the topic demonstrates significant complexity'}. Key concepts identified include: ${extractedConcepts.slice(0, 3).map(c => c.term).join(', ')}. ${responseTone === 'concise' ? 'The evidence strongly supports this conclusion.' : responseTone === 'analytical' ? 'From multiple analytical perspectives, we can identify several key patterns and relationships.' : 'This comprehensive analysis reveals nuanced insights across technical, practical, and theoretical dimensions.'}`

      const newResponse: QAResponse = {
        id: `qa-${Date.now()}`,
        question: currentQuestion,
        answer: mockAnswer,
        citations: mockCitations,
        timestamp: new Date(),
        model: selectedModel,
        tone: responseTone,
        isPinned: false,
        conceptsDiscussed: extractedConcepts.slice(0, 5).map(c => c.term),
        crossSourceInsights: [crossSourceInsight]
      }
      
      setQAHistory(prev => [newResponse, ...prev])
      setCrossSourceInsights(prev => [...prev, crossSourceInsight])
      setCurrentQuestion('')
      setIsProcessing(false)
      
      // J4: Share with collaborative session
      if (isCollaborating && collaborativeSession) {
        setCollaborativeSession(prev => prev ? {
          ...prev,
          sharedQuestions: [...prev.sharedQuestions, currentQuestion]
        } : null)
      }
      
      updateWorkflowData({ 
        sources: sources.length,
        qaHistory: qaHistory.length + 1,
        pinnedInsights: pinnedInsights.length,
        conceptsExtracted: extractedConcepts.length,
        entitiesExtracted: extractedEntities.length
      })
    }, 2500)
  }

  // J10: Handle follow-up questions with context
  const handleFollowUp = (previousQA: QAResponse, followUpText: string) => {
    setCurrentQuestion(`Following up on "${previousQA.question}": ${followUpText}`)
    setTimeout(() => handleAskQuestion(), 100)
  }

  // J8: Pin important insights
  const togglePinInsight = (qaId: string) => {
    const qa = qaHistory.find(q => q.id === qaId)
    if (!qa) return
    
    if (qa.isPinned) {
      setPinnedInsights(prev => prev.filter(p => p.id !== qaId))
    } else {
      setPinnedInsights(prev => [...prev, { ...qa, isPinned: true }])
    }
    
    setQAHistory(prev => prev.map(q => 
      q.id === qaId ? { ...q, isPinned: !q.isPinned } : q
    ))
  }

  // J7: Cross-source comparison
  const handleCrossSourceComparison = (topic: string) => {
    setCurrentQuestion(`Compare how different sources discuss ${topic}`)
    handleAskQuestion()
  }

  // J9: Switch LLM engines
  const regenerateWithDifferentModel = (qaId: string, newModel: typeof selectedModel) => {
    const originalModel = selectedModel
    setSelectedModel(newModel)
    
    const qa = qaHistory.find(q => q.id === qaId)
    if (qa) {
      setCurrentQuestion(qa.question)
      setTimeout(() => {
        handleAskQuestion()
        setSelectedModel(originalModel)
      }, 100)
    }
  }

  // J16: Enhanced search across sources
  const handleSearch = () => {
    if (!searchQuery.trim()) return
    
    // Mock search results with enhanced citations
    const mockResults: Citation[] = sources
      .filter(s => Array.from(selectedSources).includes(s.id)) // Fix Set iteration
      .flatMap(source => [
        {
          sourceId: source.id,
          sourceName: source.name,
          pageNumber: Math.floor(Math.random() * 10) + 1,
          paragraph: Math.floor(Math.random() * 5) + 1,
          confidence: 0.8 + Math.random() * 0.2,
          text: `...${searchQuery} appears in this context with relevant information about the topic...`,
          context: 'Additional context surrounding the search term provides deeper insights.',
          highlightedTerms: [searchQuery],
          conceptsReferenced: extractedConcepts.slice(0, 2).map(c => c.term)
        }
      ])
    
    setSearchResults(mockResults)
  }

  const handleComplete = () => {
    updateWorkflowData({
      totalSources: sources.length,
      totalQuestions: qaHistory.length,
      pinnedInsights: pinnedInsights.length,
      searchQueries: searchResults.length > 0 ? 1 : 0
    })
    nextStep()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Junction - Semantic Research
        </h2>
        <p className="text-gray-600">
          Upload documents and ask AI questions with precise citations and analysis
        </p>
      </div>

      {/* Knowledge Sources Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Upload Area */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2" />
              Knowledge Sources ({sources.length})
            </h3>
            
            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              
              <DocumentArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag files here or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  browse to upload
                </button>
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, TXT, MD files
              </p>
            </div>
            
            {/* Source List */}
            <div className="mt-6 space-y-3 max-h-64 overflow-y-auto">
              {sources.map(source => (
                <div 
                  key={source.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    selectedSources.has(source.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedSources.has(source.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedSources)
                          if (e.target.checked) {
                            newSelected.add(source.id)
                          } else {
                            newSelected.delete(source.id)
                          }
                          setSelectedSources(newSelected)
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{source.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(source.size)}
                          {source.pages && ` • ${source.pages} pages`}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Q&A Interface */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedTab('qa')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTab === 'qa' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 inline mr-2" />
                  Q&A
                </button>
                <button
                  onClick={() => setSelectedTab('concepts')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTab === 'concepts' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BeakerIcon className="h-4 w-4 inline mr-2" />
                  Concepts ({extractedConcepts.length})
                </button>
                <button
                  onClick={() => setSelectedTab('collaborate')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTab === 'collaborate' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LinkIcon className="h-4 w-4 inline mr-2" />
                  Collaborate
                  {isCollaborating && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block"></span>}
                </button>
              </div>
              
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
                Settings
              </button>
            </div>

            {/* Q&A Tab Content */}
            {selectedTab === 'qa' && (
              <>
                {/* Advanced Options */}
                {showAdvancedOptions && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        AI Model
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value as typeof selectedModel)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="claude">Claude</option>
                        <option value="gemini">Gemini</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Response Tone
                      </label>
                      <select
                        value={responseTone}
                        onChange={(e) => setResponseTone(e.target.value as typeof responseTone)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="comprehensive">Comprehensive</option>
                        <option value="analytical">Analytical</option>
                        <option value="concise">Concise</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selected Sources
                      </label>
                      <div className="text-sm text-gray-600 py-2">
                        {selectedSources.size} of {sources.length} sources
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Question Input */}
                <div className="mb-6">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        placeholder="Ask a question about your uploaded documents..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={3}
                        disabled={selectedSources.size === 0}
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={handleAskQuestion}
                        disabled={!currentQuestion.trim() || selectedSources.size === 0 || isProcessing}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isProcessing ? 'Processing...' : 'Ask'}
                      </button>
                    </div>
                  </div>
                  
                  {selectedSources.size === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      Please select at least one knowledge source to ask questions.
                    </p>
                  )}
                </div>

                {/* Search Functionality */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Search</h4>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search across all sources..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={!searchQuery.trim()}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      <MagnifyingGlassIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Search Results ({searchResults.length})</p>
                      {searchResults.slice(0, 3).map((result, index) => (
                        <div key={index} className="p-2 bg-white rounded border text-sm">
                          <p className="text-gray-800">{result.text}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {result.sourceName} • Page {result.pageNumber} • {Math.round(result.confidence * 100)}% match
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Concepts Tab Content */}
            {selectedTab === 'concepts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Extracted Concepts & Entities</h3>
                  <button
                    onClick={() => setShowConceptMap(!showConceptMap)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showConceptMap ? 'Hide' : 'Show'} Concept Map
                  </button>
                </div>

                {/* Concept Map Visualization */}
                {showConceptMap && (
                  <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500">
                      <BeakerIcon className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg font-medium">Concept Relationship Map</p>
                      <p className="text-sm">Visual representation of concept relationships would appear here</p>
                      <div className="mt-4 flex justify-center space-x-4 text-xs">
                        <span className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>Technical Concepts</span>
                        <span className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>Academic Concepts</span>
                        <span className="flex items-center"><div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>Business Concepts</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extracted Concepts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Key Concepts ({extractedConcepts.length})</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {extractedConcepts.map(concept => (
                        <div key={concept.id} className="p-3 bg-white border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm text-gray-900">{concept.term}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              concept.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                              concept.category === 'academic' ? 'bg-green-100 text-green-800' :
                              concept.category === 'business' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {concept.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{concept.definition}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Frequency: {concept.frequency}</span>
                            <span>Importance: {Math.round(concept.importance * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Entities ({extractedEntities.length})</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {extractedEntities.map(entity => (
                        <div key={entity.id} className="p-3 bg-white border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm text-gray-900">{entity.name}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              entity.type === 'organization' ? 'bg-blue-100 text-blue-800' :
                              entity.type === 'technology' ? 'bg-green-100 text-green-800' :
                              entity.type === 'person' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {entity.type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Mentions: {entity.mentions}</span>
                            <span>Confidence: {Math.round(entity.confidence * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cross-Source Insights */}
                {crossSourceInsights.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Cross-Source Insights</h4>
                    <div className="space-y-3">
                      {crossSourceInsights.map(insight => (
                        <div key={insight.id} className="p-4 bg-white border rounded-lg">
                          <h5 className="font-medium text-sm text-gray-900 mb-2">{insight.topic}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="font-medium text-green-700">Agreements:</span>
                              <ul className="mt-1 space-y-1">
                                {insight.agreements.map((agreement, idx) => (
                                  <li key={idx} className="text-gray-600">• {agreement}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-medium text-red-700">Contradictions:</span>
                              <ul className="mt-1 space-y-1">
                                {insight.contradictions.map((contradiction, idx) => (
                                  <li key={idx} className="text-gray-600">• {contradiction}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-medium text-amber-700">Gaps:</span>
                              <ul className="mt-1 space-y-1">
                                {insight.gaps.map((gap, idx) => (
                                  <li key={idx} className="text-gray-600">• {gap}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <span className="text-xs text-gray-500">
                              Synthesis Score: {Math.round(insight.synthesisScore * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Collaborate Tab Content */}
            {selectedTab === 'collaborate' && (
              <div className="space-y-6">
                {!isCollaborating ? (
                  <div className="text-center py-8">
                    <LinkIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Collaborative Session</h3>
                    <p className="text-gray-600 mb-6">
                      Share your research session with others for real-time collaboration
                    </p>
                    <button
                      onClick={startCollaborativeSession}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Shareable Link
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Session Info */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-green-800">Active Collaborative Session</h3>
                        <span className="flex items-center text-sm text-green-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Live
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mb-3">{collaborativeSession?.name}</p>
                      <div className="flex items-center space-x-4">
                        <input
                          type="text"
                          value={shareableLink}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(shareableLink)}
                          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Participants */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Participants ({collaborativeSession?.participants.length || 0})
                      </h4>
                      <div className="flex space-x-2">
                        {collaborativeSession?.participants.map((participant, idx) => (
                          <div key={idx} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {participant.charAt(0)}
                            </div>
                            <span className="text-sm font-medium">{participant}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Collaborative Notes */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Shared Notes</h4>
                      <div className="space-y-3">
                        <div className="flex space-x-3">
                          <input
                            type="text"
                            placeholder="Add a collaborative note..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                addCollaborativeNote(e.currentTarget.value, 'annotation')
                                e.currentTarget.value = ''
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const input = document.querySelector('input[placeholder="Add a collaborative note..."]') as HTMLInputElement
                              if (input && input.value.trim()) {
                                addCollaborativeNote(input.value, 'annotation')
                                input.value = ''
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                        
                        {collaborativeNotes.map(note => (
                          <div key={note.id} className="p-3 bg-white border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{note.userName}</span>
                              <span className="text-xs text-gray-500">
                                {note.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{note.content}</p>
                          </div>
                        ))}
                        
                        {collaborativeNotes.length === 0 && (
                          <p className="text-center text-gray-500 py-4">No collaborative notes yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pinned Insights */}
      {pinnedInsights.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-yellow-800">
            <StarIcon className="h-5 w-5 mr-2" />
            Pinned Insights ({pinnedInsights.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedInsights.map(insight => (
              <div key={insight.id} className="bg-white p-4 rounded border">
                <p className="font-medium text-sm text-gray-900 mb-2">{insight.question}</p>
                <p className="text-sm text-gray-700 mb-3">{insight.answer.substring(0, 150)}...</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{insight.citations.length} citations</span>
                  <button
                    onClick={() => togglePinInsight(insight.id)}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    Unpin
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Q&A History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            Conversation History ({qaHistory.length})
          </h3>
        </div>
        
        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          {qaHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <QuestionMarkCircleIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>Ask your first question to get started</p>
              <p className="text-sm mt-2">Try: "What are the main themes in these documents?"</p>
            </div>
          ) : (
            qaHistory.map(qa => (
              <div key={qa.id} className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg">
                {/* Question */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Q: {qa.question}</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => togglePinInsight(qa.id)}
                        className={`p-1 rounded ${qa.isPinned ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                        title={qa.isPinned ? 'Unpin' : 'Pin insight'}
                      >
                        <StarIcon className="h-4 w-4" />
                      </button>
                      
                      <div className="text-xs text-gray-500">
                        {qa.model} • {qa.tone}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Answer */}
                <div className="mb-4">
                  <p className="text-gray-800 leading-relaxed">{qa.answer}</p>
                </div>
                
                {/* Citations */}
                {qa.citations.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Citations ({qa.citations.length})
                    </h5>
                    <div className="space-y-2">
                      {qa.citations.map((citation, index) => (
                        <div key={index} className="bg-white p-3 rounded border text-sm">
                          <p className="text-gray-800 mb-1">"{citation.text}"</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {citation.sourceName}
                              {citation.pageNumber && ` • Page ${citation.pageNumber}`}
                              {' • Paragraph '}
                              {citation.paragraph}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {Math.round(citation.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center space-x-4 text-sm">
                  <button
                    onClick={() => handleFollowUp(qa, 'Can you elaborate on this?')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Follow up
                  </button>
                  
                  <button
                    onClick={() => regenerateWithDifferentModel(qa.id, qa.model === 'gpt-4' ? 'claude' : 'gpt-4')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Try different model
                  </button>
                  
                  <span className="text-gray-500 text-xs">
                    {qa.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {sources.length} sources • {qaHistory.length} questions • {pinnedInsights.length} pinned
        </div>
        
        <button
          onClick={handleComplete}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
          Complete Research Session
        </button>
      </div>
    </div>
  )
} 
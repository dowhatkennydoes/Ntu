'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  DocumentTextIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  BellIcon,
  BookOpenIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  CursorArrowRaysIcon,
  DocumentMagnifyingGlassIcon,
  ClipboardDocumentIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

interface Document {
  id: string
  title: string
  content: string
  notebookId: string
  notebookName: string
  author: string
  createdAt: Date
  updatedAt: Date
  version: number
  status: 'draft' | 'published' | 'archived'
  visibility: 'private' | 'team' | 'public'
  tags: string[]
  collaborators: Collaborator[]
  aiAssisted: boolean
  memoryTags: string[]
  complianceLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  wordCount: number
  readingTime: number
  lastAccessed: Date
  references: Reference[]
  aiActions: AIAction[]
}

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'viewer' | 'commenter' | 'editor' | 'owner'
  lastActive: Date
  cursorPosition?: number
  isOnline: boolean
}

interface Reference {
  id: string
  type: 'memory' | 'document' | 'external' | 'citation'
  title: string
  url?: string
  memoryId?: string
  documentId?: string
  relevance: number
  context: string
}

interface AIAction {
  id: string
  type: 'continue' | 'rewrite' | 'outline' | 'summarize' | 'expand' | 'clarify' | 'translate'
  prompt: string
  response: string
  timestamp: Date
  model: string
  confidence: number
  userAccepted: boolean
}

interface Notebook {
  id: string
  name: string
  description: string
  documents: Document[]
  collaborators: Collaborator[]
  visibility: 'private' | 'team' | 'public'
  createdAt: Date
  updatedAt: Date
  tags: string[]
  memoryZone: 'standard' | 'zero-knowledge' | 'phi-ferpa'
}

interface AIWritingSession {
  id: string
  documentId: string
  mode: 'continue' | 'rewrite' | 'outline' | 'summarize' | 'expand' | 'clarify' | 'translate'
  context: string
  prompt: string
  response: string
  status: 'generating' | 'completed' | 'failed'
  model: string
  timestamp: Date
  userFeedback?: 'accepted' | 'rejected' | 'modified'
}

interface DocumentQASession {
  id: string
  documentId: string
  question: string
  answer: string
  sources: Reference[]
  confidence: number
  timestamp: Date
  model: string
  followUpQuestions: string[]
}

export default function JunctionAIWritingWorkflow() {
  const [currentView, setCurrentView] = useState<'overview' | 'documents' | 'writing' | 'qa' | 'collaboration' | 'settings'>('overview')
  const [documents, setDocuments] = useState<Document[]>([])
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null)
  const [aiSessions, setAiSessions] = useState<AIWritingSession[]>([])
  const [qaSessions, setQaSessions] = useState<DocumentQASession[]>([])
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showNotebookModal, setShowNotebookModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVisibility, setFilterVisibility] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [editorContent, setEditorContent] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isAskingQuestion, setIsAskingQuestion] = useState(false)

  // Sample data
  const sampleNotebooks: Notebook[] = [
    {
      id: '1',
      name: 'Product Strategy',
      description: 'Product development and strategy documents',
      documents: [],
      collaborators: [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@company.com',
          role: 'owner',
          lastActive: new Date(),
          isOnline: true
        }
      ],
      visibility: 'team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-12-14'),
      tags: ['product', 'strategy'],
      memoryZone: 'standard'
    },
    {
      id: '2',
      name: 'Research Notes',
      description: 'Research findings and analysis',
      documents: [],
      collaborators: [
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@company.com',
          role: 'owner',
          lastActive: new Date(),
          isOnline: false
        }
      ],
      visibility: 'private',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-12-14'),
      tags: ['research', 'analysis'],
      memoryZone: 'standard'
    }
  ]

  const sampleDocuments: Document[] = [
    {
      id: '1',
      title: 'Q4 Product Roadmap',
      content: 'This document outlines our product development strategy for Q4 2024. We will focus on three key areas: user experience improvements, performance optimization, and new feature development.\n\nThe roadmap includes detailed timelines, resource allocation, and success metrics for each initiative.',
      notebookId: '1',
      notebookName: 'Product Strategy',
      author: 'Alice Johnson',
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-14'),
      version: 1,
      status: 'published',
      visibility: 'team',
      tags: ['roadmap', 'product', 'q4'],
      collaborators: [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@company.com',
          role: 'owner',
          lastActive: new Date(),
          isOnline: true
        },
        {
          id: '3',
          name: 'Carol Davis',
          email: 'carol@company.com',
          role: 'editor',
          lastActive: new Date(),
          isOnline: true,
          cursorPosition: 150
        }
      ],
      aiAssisted: true,
      memoryTags: ['product-strategy', 'roadmap'],
      complianceLevel: 'internal',
      wordCount: 250,
      readingTime: 2,
      lastAccessed: new Date(),
      references: [
        {
          id: '1',
          type: 'memory',
          title: 'Previous Q3 Roadmap',
          memoryId: 'mem-123',
          relevance: 0.9,
          context: 'Previous quarter planning'
        }
      ],
      aiActions: [
        {
          id: '1',
          type: 'outline',
          prompt: 'Create an outline for Q4 product roadmap',
          response: 'Generated outline with key sections and subsections',
          timestamp: new Date('2024-12-01'),
          model: 'GPT-4',
          confidence: 0.95,
          userAccepted: true
        }
      ]
    },
    {
      id: '2',
      title: 'Market Analysis Report',
      content: 'Our comprehensive analysis of the current market landscape reveals several key trends and opportunities. The competitive landscape has shifted significantly over the past quarter, with new entrants and evolving customer preferences.\n\nKey findings include increased demand for AI-powered solutions, growing emphasis on data privacy, and the rise of remote collaboration tools.',
      notebookId: '2',
      notebookName: 'Research Notes',
      author: 'Bob Smith',
      createdAt: new Date('2024-12-10'),
      updatedAt: new Date('2024-12-14'),
      version: 2,
      status: 'draft',
      visibility: 'private',
      tags: ['market', 'analysis', 'research'],
      collaborators: [
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@company.com',
          role: 'owner',
          lastActive: new Date(),
          isOnline: false
        }
      ],
      aiAssisted: false,
      memoryTags: ['market-analysis', 'research'],
      complianceLevel: 'confidential',
      wordCount: 450,
      readingTime: 3,
      lastAccessed: new Date(),
      references: [],
      aiActions: []
    }
  ]

  useEffect(() => {
    setNotebooks(sampleNotebooks)
    setDocuments(sampleDocuments)
  }, [])

  // Create new document
  const createDocument = (title: string, notebookId: string) => {
    const notebook = notebooks.find(n => n.id === notebookId)
    const newDocument: Document = {
      id: Date.now().toString(),
      title,
      content: '',
      notebookId,
      notebookName: notebook?.name || '',
      author: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      status: 'draft',
      visibility: 'private',
      tags: [],
      collaborators: [],
      aiAssisted: false,
      memoryTags: [],
      complianceLevel: 'internal',
      wordCount: 0,
      readingTime: 0,
      lastAccessed: new Date(),
      references: [],
      aiActions: []
    }
    setDocuments(prev => [...prev, newDocument])
    setSelectedDocument(newDocument)
    setEditorContent('')
    setShowDocumentModal(false)
  }

  // AI writing assistance
  const generateAIWriting = async (mode: AIWritingSession['mode'], prompt: string) => {
    if (!selectedDocument) return

    setIsGenerating(true)
    const session: AIWritingSession = {
      id: Date.now().toString(),
      documentId: selectedDocument.id,
      mode,
      context: selectedDocument.content,
      prompt,
      response: '',
      status: 'generating',
      model: 'GPT-4',
      timestamp: new Date()
    }
    setAiSessions(prev => [...prev, session])

    // Simulate AI generation
    setTimeout(() => {
      const responses = {
        continue: 'Continuing from the current content, we should also consider the impact of these changes on our existing user base and how we can ensure a smooth transition.',
        rewrite: 'Rewritten version with improved clarity and structure while maintaining the original intent and key points.',
        outline: '1. Executive Summary\n2. Current State Analysis\n3. Strategic Objectives\n4. Implementation Plan\n5. Success Metrics\n6. Risk Assessment',
        summarize: 'This document outlines a comprehensive strategy for Q4 product development, focusing on user experience improvements, performance optimization, and new feature development with detailed timelines and success metrics.',
        expand: 'Expanded content with additional details, examples, and supporting information to provide more comprehensive coverage of the topic.',
        clarify: 'Clarified version with improved explanations, removed ambiguity, and enhanced readability.',
        translate: 'Translated content maintaining the original meaning and tone.'
      }

      const updatedSession = { ...session, response: responses[mode], status: 'completed' as const }
      setAiSessions(prev => prev.map(s => s.id === session.id ? updatedSession : s))
      setIsGenerating(false)
    }, 3000)
  }

  // Document Q&A
  const askQuestion = async (question: string) => {
    if (!selectedDocument || !question.trim()) return

    setIsAskingQuestion(true)
    const session: DocumentQASession = {
      id: Date.now().toString(),
      documentId: selectedDocument.id,
      question,
      answer: '',
      sources: [],
      confidence: 0,
      timestamp: new Date(),
      model: 'GPT-4',
      followUpQuestions: []
    }
    setQaSessions(prev => [...prev, session])

    // Simulate AI response
    setTimeout(() => {
      const updatedSession: DocumentQASession = {
        ...session,
        answer: 'Based on the document content, the Q4 roadmap focuses on three main areas: user experience improvements, performance optimization, and new feature development. Each initiative has specific timelines and success metrics defined.',
        sources: [
          {
            id: '1',
            type: 'document',
            title: 'Q4 Product Roadmap',
            documentId: selectedDocument.id,
            relevance: 0.95,
            context: 'Document content relevant to the question'
          }
        ],
        confidence: 0.92,
        followUpQuestions: [
          'What are the specific success metrics?',
          'How will performance optimization be measured?',
          'What new features are planned?'
        ]
      }
      setQaSessions(prev => prev.map(s => s.id === session.id ? updatedSession : s))
      setIsAskingQuestion(false)
      setCurrentQuestion('')
    }, 2000)
  }

  // Share document
  const shareDocument = (documentId: string, email: string, role: Collaborator['role']) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        const newCollaborator: Collaborator = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email,
          role,
          lastActive: new Date(),
          isOnline: false
        }
        return {
          ...doc,
          collaborators: [...doc.collaborators, newCollaborator]
        }
      }
      return doc
    }))
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notebooks</p>
              <p className="text-2xl font-bold text-gray-900">{notebooks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI Assisted</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => d.aiAssisted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Collaborators</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(documents.flatMap(d => d.collaborators.map(c => c.id))).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Documents</h3>
          <div className="space-y-3">
            {documents.slice(0, 5).map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <h4 className="font-medium">{doc.title}</h4>
                  <p className="text-sm text-gray-600">
                    {doc.notebookName} • {doc.updatedAt.toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      doc.status === 'published' ? 'bg-green-100 text-green-800' :
                      doc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      doc.visibility === 'public' ? 'bg-blue-100 text-blue-800' :
                      doc.visibility === 'team' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.visibility}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.aiAssisted && (
                    <SparklesIcon className="w-4 h-4 text-purple-600" />
                  )}
                  <button
                    onClick={() => {
                      setSelectedDocument(doc)
                      setEditorContent(doc.content)
                      setCurrentView('writing')
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">AI Writing Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>AI Assisted Documents</span>
                <span>{documents.filter(d => d.aiAssisted).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(documents.filter(d => d.aiAssisted).length / documents.length) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>AI Actions Performed</span>
                <span>{documents.reduce((acc, doc) => acc + doc.aiActions.length, 0)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Collaborative Documents</span>
                <span>{documents.filter(d => d.collaborators.length > 1).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documents</h2>
        <button
          onClick={() => setShowDocumentModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 inline mr-2" />
          New Document
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Visibility</option>
            <option value="private">Private</option>
            <option value="team">Team</option>
            <option value="public">Public</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="space-y-4">
          {documents
            .filter(doc => 
              (filterVisibility === 'all' || doc.visibility === filterVisibility) &&
              (filterStatus === 'all' || doc.status === filterStatus) &&
              (searchTerm === '' || doc.title.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map(doc => (
              <div key={doc.id} className="border rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{doc.title}</h3>
                    {doc.aiAssisted && (
                      <SparklesIcon className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      doc.status === 'published' ? 'bg-green-100 text-green-800' :
                      doc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      doc.visibility === 'public' ? 'bg-blue-100 text-blue-800' :
                      doc.visibility === 'team' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.visibility}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{doc.content.substring(0, 150)}...</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>{doc.notebookName}</span>
                    <span>{doc.wordCount} words</span>
                    <span>{doc.collaborators.length} collaborators</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedDocument(doc)
                        setEditorContent(doc.content)
                        setCurrentView('writing')
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDocument(doc)
                        setCurrentView('qa')
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      Q&A
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  const renderWriting = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Writing Assistant</h2>
        <div className="flex items-center space-x-2">
          {selectedDocument && (
            <>
              <span className="text-sm text-gray-600">
                {selectedDocument.title} • {selectedDocument.wordCount} words
              </span>
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                <ShareIcon className="w-4 h-4 inline mr-2" />
                Share
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Document title..."
                value={selectedDocument?.title || ''}
                className="w-full text-xl font-semibold border-none outline-none"
                readOnly
              />
            </div>
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              placeholder="Start writing your document..."
              className="w-full h-96 p-4 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                {editorContent.split(' ').length} words • {Math.ceil(editorContent.split(' ').length / 200)} min read
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Save
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">AI Writing Tools</h3>
            <div className="space-y-3">
              {[
                { mode: 'continue' as const, label: 'Continue Writing', icon: PencilIcon },
                { mode: 'rewrite' as const, label: 'Rewrite Section', icon: ArrowPathIcon },
                { mode: 'outline' as const, label: 'Generate Outline', icon: DocumentDuplicateIcon },
                { mode: 'summarize' as const, label: 'Summarize', icon: ClipboardDocumentIcon },
                { mode: 'expand' as const, label: 'Expand Content', icon: CloudArrowUpIcon },
                { mode: 'clarify' as const, label: 'Clarify Text', icon: DocumentMagnifyingGlassIcon }
              ].map(tool => (
                <button
                  key={tool.mode}
                  onClick={() => generateAIWriting(tool.mode, `Please ${tool.label.toLowerCase()} for this document.`)}
                  disabled={isGenerating}
                  className="w-full text-left p-3 border rounded hover:bg-gray-50 disabled:bg-gray-100"
                >
                  <tool.icon className="w-4 h-4 inline mr-2" />
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          {isGenerating && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-blue-600">Generating AI content...</span>
              </div>
            </div>
          )}

          {aiSessions.filter(s => s.documentId === selectedDocument?.id).slice(0, 3).map(session => (
            <div key={session.id} className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold mb-2">{session.mode.charAt(0).toUpperCase() + session.mode.slice(1)}</h4>
              <p className="text-sm text-gray-600 mb-3">{session.prompt}</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                {session.response}
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <button className="text-green-600 hover:text-green-800 text-sm">
                  Accept
                </button>
                <button className="text-red-600 hover:text-red-800 text-sm">
                  Reject
                </button>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  Modify
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderQA = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Document Q&A</h2>
        {selectedDocument && (
          <span className="text-sm text-gray-600">
            Asking questions about: {selectedDocument.title}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Ask a Question</h3>
          <div className="space-y-4">
            <textarea
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="Ask a question about the document content..."
              className="w-full p-3 border rounded resize-none h-24"
            />
            <button
              onClick={() => askQuestion(currentQuestion)}
              disabled={!currentQuestion.trim() || isAskingQuestion}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isAskingQuestion ? 'Asking...' : 'Ask Question'}
            </button>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Suggested Questions</h4>
            <div className="space-y-2">
              {[
                'What are the main points of this document?',
                'How does this relate to our current strategy?',
                'What are the key recommendations?',
                'What are the potential risks mentioned?'
              ].map((question, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(question)}
                  className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Q&A</h3>
          <div className="space-y-4">
            {qaSessions
              .filter(qa => qa.documentId === selectedDocument?.id)
              .slice(0, 5)
              .map(qa => (
                <div key={qa.id} className="border rounded p-4">
                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-900">{qa.question}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {qa.timestamp.toLocaleString()} • Confidence: {(qa.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{qa.answer}</p>
                  {qa.followUpQuestions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Follow-up questions:</p>
                      <div className="space-y-1">
                        {qa.followUpQuestions.slice(0, 2).map((question, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentQuestion(question)}
                            className="block w-full text-left text-xs text-blue-600 hover:bg-blue-50 p-1 rounded"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderCollaboration = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Collaboration</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Active Collaborators</h3>
          <div className="space-y-3">
            {documents
              .flatMap(doc => doc.collaborators)
              .filter((collaborator, index, arr) => arr.findIndex(c => c.id === collaborator.id) === index)
              .map(collaborator => (
                <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${collaborator.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="font-medium">{collaborator.name}</p>
                      <p className="text-sm text-gray-600">{collaborator.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    collaborator.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                    collaborator.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                    collaborator.role === 'commenter' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {collaborator.role}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Shared Documents</h3>
          <div className="space-y-3">
            {documents
              .filter(doc => doc.collaborators.length > 1)
              .map(doc => (
                <div key={doc.id} className="p-3 border rounded">
                  <h4 className="font-medium">{doc.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{doc.collaborators.length} collaborators</p>
                  <div className="flex items-center space-x-2">
                    {doc.collaborators.slice(0, 3).map(collaborator => (
                      <div key={collaborator.id} className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${collaborator.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-xs">{collaborator.name}</span>
                      </div>
                    ))}
                    {doc.collaborators.length > 3 && (
                      <span className="text-xs text-gray-500">+{doc.collaborators.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Junction Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">AI Writing Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Enable AI co-writing</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Auto-save drafts</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Memory integration</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-2">Default AI Model</label>
              <select className="w-full border rounded px-3 py-2">
                <option>GPT-4</option>
                <option>Claude-3</option>
                <option>Gemini Pro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Collaboration Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Show live cursors</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Real-time sync</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Conflict resolution</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-2">Default Visibility</label>
              <select className="w-full border rounded px-3 py-2">
                <option>Private</option>
                <option>Team</option>
                <option>Public</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Junction AI Writing</h1>
          <p className="text-gray-600">AI-powered document creation, co-writing, and collaboration platform</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: DocumentTextIcon },
              { id: 'documents', label: 'Documents', icon: BookOpenIcon },
              { id: 'writing', label: 'Writing', icon: PencilIcon },
              { id: 'qa', label: 'Q&A', icon: ChatBubbleLeftRightIcon },
              { id: 'collaboration', label: 'Collaboration', icon: UserGroupIcon },
              { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  currentView === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {currentView === 'overview' && renderOverview()}
        {currentView === 'documents' && renderDocuments()}
        {currentView === 'writing' && renderWriting()}
        {currentView === 'qa' && renderQA()}
        {currentView === 'collaboration' && renderCollaboration()}
        {currentView === 'settings' && renderSettings()}

        {/* Modals */}
        {showDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Create New Document</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Document title"
                    className="w-full px-3 py-2 border rounded"
                    id="document-title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notebook</label>
                  <select className="w-full px-3 py-2 border rounded" id="notebook-select">
                    {notebooks.map(notebook => (
                      <option key={notebook.id} value={notebook.id}>
                        {notebook.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const title = (document.getElementById('document-title') as HTMLInputElement)?.value
                      const notebookId = (document.getElementById('notebook-select') as HTMLSelectElement)?.value
                      if (title && notebookId) {
                        createDocument(title, notebookId)
                      }
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
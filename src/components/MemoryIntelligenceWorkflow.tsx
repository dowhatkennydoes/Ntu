'use client'

import { useState, useEffect } from 'react'
import { 
  CpuChipIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  BellIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowPathIcon,
  CloudIcon,
  ComputerDesktopIcon,
  KeyIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CodeBracketIcon,
  LinkIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  HeartIcon,
  FaceSmileIcon,
  FaceFrownIcon
} from '@heroicons/react/24/outline'

interface Memory {
  id: string
  title: string
  content: string
  type: 'text' | 'audio' | 'image' | 'document' | 'conversation'
  notebookId: string
  notebookName: string
  createdAt: Date
  updatedAt: Date
  lastAccessed: Date
  decayScore: number
  confidence: number
  status: 'active' | 'decayed' | 'archived' | 'forked' | 'merged'
  tags: string[]
  metadata: MemoryMetadata
  relationships: MemoryRelationship[]
  healthMetrics: MemoryHealth
  compliance: ComplianceInfo
  aiAnalysis: AIAnalysis
}

interface MemoryMetadata {
  wordCount: number
  readingTime: number
  language: string
  sentiment: number
  topics: string[]
  entities: string[]
  keywords: string[]
  source: string
  author: string
  version: number
}

interface MemoryRelationship {
  id: string
  targetMemoryId: string
  type: 'similar' | 'contradictory' | 'related' | 'parent' | 'child' | 'fork'
  strength: number
  confidence: number
  createdAt: Date
  aiGenerated: boolean
}

interface MemoryHealth {
  freshness: number
  relevance: number
  completeness: number
  accuracy: number
  consistency: number
  overall: number
  lastAssessment: Date
  recommendations: string[]
}

interface ComplianceInfo {
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  dataTypes: string[]
  retentionPolicy: string
  accessControls: string[]
  auditRequired: boolean
}

interface AIAnalysis {
  summary: string
  keyInsights: string[]
  contradictions: Contradiction[]
  semanticDuplicates: SemanticDuplicate[]
  suggestedActions: string[]
  confidence: number
  model: string
  timestamp: Date
}

interface Contradiction {
  id: string
  memoryId: string
  conflictingMemoryId: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  detectedAt: Date
  resolved: boolean
  resolution?: string
}

interface SemanticDuplicate {
  id: string
  memoryId: string
  duplicateMemoryId: string
  similarity: number
  overlap: string[]
  detectedAt: Date
  merged: boolean
  mergeStrategy?: string
}

interface MemoryFork {
  id: string
  originalMemoryId: string
  forkedMemoryId: string
  reason: string
  createdAt: Date
  createdBy: string
  status: 'active' | 'merged' | 'abandoned'
}

interface MemoryMerge {
  id: string
  sourceMemoryIds: string[]
  targetMemoryId: string
  strategy: 'keep_latest' | 'combine_content' | 'manual_review'
  conflicts: string[]
  resolvedAt?: Date
  resolvedBy?: string
}

export default function MemoryIntelligenceWorkflow() {
  const [currentView, setCurrentView] = useState<'overview' | 'memories' | 'analysis' | 'health' | 'settings'>('overview')
  const [memories, setMemories] = useState<Memory[]>([])
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Sample memories
  const sampleMemories: Memory[] = [
    {
      id: '1',
      title: 'Q4 Strategy Planning',
      content: 'Our Q4 strategy focuses on three key areas: user experience improvements, performance optimization, and new feature development. We will allocate 40% of resources to UX improvements, 30% to performance, and 30% to new features.',
      type: 'text',
      notebookId: '1',
      notebookName: 'Product Strategy',
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date('2024-12-14'),
      lastAccessed: new Date('2024-12-14'),
      decayScore: 0.85,
      confidence: 0.92,
      status: 'active',
      tags: ['strategy', 'q4', 'planning'],
      metadata: {
        wordCount: 45,
        readingTime: 1,
        language: 'en',
        sentiment: 0.7,
        topics: ['strategy', 'planning', 'resource allocation'],
        entities: ['Q4', 'UX', 'performance'],
        keywords: ['strategy', 'planning', 'resources', 'features'],
        source: 'manual',
        author: 'Alice Johnson',
        version: 1
      },
      relationships: [
        {
          id: 'rel-1',
          targetMemoryId: '2',
          type: 'related',
          strength: 0.8,
          confidence: 0.9,
          createdAt: new Date('2024-12-14'),
          aiGenerated: true
        }
      ],
      healthMetrics: {
        freshness: 0.85,
        relevance: 0.9,
        completeness: 0.8,
        accuracy: 0.95,
        consistency: 0.88,
        overall: 0.88,
        lastAssessment: new Date('2024-12-14'),
        recommendations: ['Consider updating resource allocation based on recent performance data']
      },
      compliance: {
        level: 'internal',
        dataTypes: ['strategy'],
        retentionPolicy: '7-years',
        accessControls: ['team-members'],
        auditRequired: false
      },
      aiAnalysis: {
        summary: 'Strategic planning document outlining Q4 resource allocation across three key areas.',
        keyInsights: [
          'Balanced resource allocation across UX, performance, and features',
          'Clear prioritization strategy for Q4 initiatives'
        ],
        contradictions: [],
        semanticDuplicates: [],
        suggestedActions: [
          'Review resource allocation based on current performance metrics',
          'Update strategy with recent market analysis'
        ],
        confidence: 0.92,
        model: 'GPT-4',
        timestamp: new Date('2024-12-14')
      }
    },
    {
      id: '2',
      title: 'Q4 Strategy Update',
      content: 'Updated Q4 strategy: We will allocate 50% of resources to user experience improvements, 25% to performance optimization, and 25% to new feature development. This reflects our recent performance data showing UX as the highest priority.',
      type: 'text',
      notebookId: '1',
      notebookName: 'Product Strategy',
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-14'),
      lastAccessed: new Date('2024-12-14'),
      decayScore: 0.95,
      confidence: 0.88,
      status: 'active',
      tags: ['strategy', 'q4', 'update'],
      metadata: {
        wordCount: 50,
        readingTime: 1,
        language: 'en',
        sentiment: 0.6,
        topics: ['strategy', 'update', 'resource allocation'],
        entities: ['Q4', 'UX', 'performance'],
        keywords: ['strategy', 'update', 'resources', 'priority'],
        source: 'manual',
        author: 'Alice Johnson',
        version: 2
      },
      relationships: [
        {
          id: 'rel-2',
          targetMemoryId: '1',
          type: 'contradictory',
          strength: 0.9,
          confidence: 0.95,
          createdAt: new Date('2024-12-14'),
          aiGenerated: true
        }
      ],
      healthMetrics: {
        freshness: 0.95,
        relevance: 0.95,
        completeness: 0.85,
        accuracy: 0.9,
        consistency: 0.75,
        overall: 0.88,
        lastAssessment: new Date('2024-12-14'),
        recommendations: ['Resolve contradiction with previous strategy document']
      },
      compliance: {
        level: 'internal',
        dataTypes: ['strategy'],
        retentionPolicy: '7-years',
        accessControls: ['team-members'],
        auditRequired: false
      },
      aiAnalysis: {
        summary: 'Updated strategic planning document with revised resource allocation based on performance data.',
        keyInsights: [
          'Increased focus on UX improvements based on performance data',
          'Reduced allocation to performance and features'
        ],
        contradictions: [
          {
            id: 'cont-1',
            memoryId: '2',
            conflictingMemoryId: '1',
            description: 'Resource allocation percentages differ significantly between documents',
            severity: 'high',
            detectedAt: new Date('2024-12-14'),
            resolved: false
          }
        ],
        semanticDuplicates: [],
        suggestedActions: [
          'Resolve contradiction with previous strategy document',
          'Document reasoning for allocation changes'
        ],
        confidence: 0.88,
        model: 'GPT-4',
        timestamp: new Date('2024-12-14')
      }
    }
  ]

  useEffect(() => {
    setMemories(sampleMemories)
  }, [])

  // Analyze memory
  const analyzeMemory = async (memoryId: string) => {
    setIsAnalyzing(true)
    console.log(`Analyzing memory: ${memoryId}`)
    
    // Simulate AI analysis
    setTimeout(() => {
      setMemories(prev => prev.map(memory => 
        memory.id === memoryId 
          ? {
              ...memory,
              aiAnalysis: {
                ...memory.aiAnalysis,
                timestamp: new Date(),
                confidence: 0.9 + Math.random() * 0.1
              },
              healthMetrics: {
                ...memory.healthMetrics,
                lastAssessment: new Date(),
                overall: 0.8 + Math.random() * 0.2
              }
            }
          : memory
      ))
      setIsAnalyzing(false)
    }, 3000)
  }

  // Detect contradictions
  const detectContradictions = async () => {
    console.log('Detecting contradictions across memories...')
    
    // Simulate contradiction detection
    setTimeout(() => {
      const contradictions: Contradiction[] = [
        {
          id: 'cont-1',
          memoryId: '2',
          conflictingMemoryId: '1',
          description: 'Resource allocation percentages differ significantly',
          severity: 'high',
          detectedAt: new Date(),
          resolved: false
        }
      ]
      
      console.log('Contradictions detected:', contradictions)
    }, 2000)
  }

  // Merge memories
  const mergeMemories = async (sourceIds: string[], targetId: string, strategy: string) => {
    console.log(`Merging memories ${sourceIds.join(', ')} into ${targetId} using strategy: ${strategy}`)
    
    // Simulate merge process
    setTimeout(() => {
      setMemories(prev => prev.map(memory => 
        sourceIds.includes(memory.id) 
          ? { ...memory, status: 'merged' as const }
          : memory.id === targetId
          ? { ...memory, status: 'active' as const }
          : memory
      ))
    }, 2000)
  }

  // Fork memory
  const forkMemory = async (originalId: string, reason: string) => {
    const original = memories.find(m => m.id === originalId)
    if (!original) return

    const forkedMemory: Memory = {
      ...original,
      id: Date.now().toString(),
      title: `${original.title} (Fork)`,
      status: 'forked',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessed: new Date(),
      decayScore: 1.0,
      confidence: 0.9,
      metadata: {
        ...original.metadata,
        version: original.metadata.version + 1
      },
      relationships: [
        ...original.relationships,
        {
          id: Date.now().toString(),
          targetMemoryId: originalId,
          type: 'fork',
          strength: 1.0,
          confidence: 1.0,
          createdAt: new Date(),
          aiGenerated: false
        }
      ]
    }

    setMemories(prev => [...prev, forkedMemory])
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
                              <CpuChipIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Memories</p>
              <p className="text-2xl font-bold text-gray-900">{memories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Memories</p>
              <p className="text-2xl font-bold text-gray-900">
                {memories.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contradictions</p>
              <p className="text-2xl font-bold text-gray-900">
                {memories.reduce((acc, m) => acc + m.aiAnalysis.contradictions.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LinkIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Relationships</p>
              <p className="text-2xl font-bold text-gray-900">
                {memories.reduce((acc, m) => acc + m.relationships.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Memory Health Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Health Score</span>
                <span>{(memories.reduce((acc, m) => acc + m.healthMetrics.overall, 0) / memories.length * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${memories.reduce((acc, m) => acc + m.healthMetrics.overall, 0) / memories.length * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Decay Score</span>
                <span>{(memories.reduce((acc, m) => acc + m.decayScore, 0) / memories.length * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${memories.reduce((acc, m) => acc + m.decayScore, 0) / memories.length * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Confidence</span>
                <span>{(memories.reduce((acc, m) => acc + m.confidence, 0) / memories.length * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${memories.reduce((acc, m) => acc + m.confidence, 0) / memories.length * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent AI Analysis</h3>
          <div className="space-y-3">
            {memories
              .filter(m => m.aiAnalysis.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
              .slice(0, 3)
              .map(memory => (
                <div key={memory.id} className="p-3 border rounded">
                  <h4 className="font-medium text-sm">{memory.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {memory.aiAnalysis.summary.substring(0, 100)}...
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {(memory.aiAnalysis.confidence * 100).toFixed(0)}% confidence
                    </span>
                    <span className="text-xs text-gray-500">
                      {memory.aiAnalysis.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderMemories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Memory Intelligence</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={detectContradictions}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            <ExclamationTriangleIcon className="w-4 h-4 inline mr-2" />
            Detect Contradictions
          </button>
          <button
            onClick={() => setShowMemoryModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 inline mr-2" />
            New Memory
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="decayed">Decayed</option>
            <option value="archived">Archived</option>
            <option value="forked">Forked</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="audio">Audio</option>
            <option value="image">Image</option>
            <option value="document">Document</option>
          </select>
        </div>

        <div className="space-y-4">
          {memories
            .filter(memory => 
              (filterStatus === 'all' || memory.status === filterStatus) &&
              (filterType === 'all' || memory.type === filterType) &&
              (searchTerm === '' || memory.title.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map(memory => (
              <div key={memory.id} className="border rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{memory.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      memory.status === 'active' ? 'bg-green-100 text-green-800' :
                      memory.status === 'decayed' ? 'bg-yellow-100 text-yellow-800' :
                      memory.status === 'forked' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {memory.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {(memory.decayScore * 100).toFixed(0)}% decay
                    </span>
                    <span className="text-sm text-gray-500">
                      {(memory.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{memory.content.substring(0, 150)}...</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>{memory.notebookName}</span>
                    <span>{memory.metadata.wordCount} words</span>
                    <span>{memory.relationships.length} relationships</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMemory(memory)
                        setCurrentView('analysis')
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Analyze
                    </button>
                    <button
                      onClick={() => forkMemory(memory.id, 'Manual fork')}
                      className="text-green-600 hover:text-green-800"
                    >
                      Fork
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  const renderAnalysis = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Memory Analysis</h2>
        {selectedMemory && (
          <span className="text-sm text-gray-600">
            Analyzing: {selectedMemory.title}
          </span>
        )}
      </div>

      {selectedMemory && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Summary</h4>
                <p className="text-sm text-gray-600">{selectedMemory.aiAnalysis.summary}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Key Insights</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedMemory.aiAnalysis.keyInsights.map((insight, index) => (
                    <li key={index}>• {insight}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Suggested Actions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedMemory.aiAnalysis.suggestedActions.map((action, index) => (
                    <li key={index}>• {action}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Confidence: {(selectedMemory.aiAnalysis.confidence * 100).toFixed(0)}%</span>
                <span>Model: {selectedMemory.aiAnalysis.model}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Health Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Freshness</span>
                  <span>{(selectedMemory.healthMetrics.freshness * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${selectedMemory.healthMetrics.freshness * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Relevance</span>
                  <span>{(selectedMemory.healthMetrics.relevance * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${selectedMemory.healthMetrics.relevance * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completeness</span>
                  <span>{(selectedMemory.healthMetrics.completeness * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${selectedMemory.healthMetrics.completeness * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Health</span>
                  <span>{(selectedMemory.healthMetrics.overall * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${selectedMemory.healthMetrics.overall * 100}%` }}></div>
                </div>
              </div>
            </div>

            {selectedMemory.healthMetrics.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedMemory.healthMetrics.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedMemory && selectedMemory.aiAnalysis.contradictions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Contradictions Detected</h3>
          <div className="space-y-3">
            {selectedMemory.aiAnalysis.contradictions.map(contradiction => (
              <div key={contradiction.id} className="p-3 border rounded bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-red-800">{contradiction.description}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    contradiction.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    contradiction.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    contradiction.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {contradiction.severity}
                  </span>
                </div>
                <p className="text-sm text-red-700">
                  Detected: {contradiction.detectedAt.toLocaleDateString()}
                </p>
                {!contradiction.resolved && (
                  <button className="mt-2 text-sm text-red-600 hover:text-red-800">
                    Resolve Contradiction
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderHealth = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Memory Health Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Health Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Excellent (90%+)</span>
                <span>{memories.filter(m => m.healthMetrics.overall >= 0.9).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Good (70-89%)</span>
                <span>{memories.filter(m => m.healthMetrics.overall >= 0.7 && m.healthMetrics.overall < 0.9).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Needs Attention (&lt;70%)</span>
                <span>{memories.filter(m => m.healthMetrics.overall < 0.7).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Decay Analysis</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Fresh (90%+)</span>
                <span>{memories.filter(m => m.decayScore >= 0.9).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Decaying (50-89%)</span>
                <span>{memories.filter(m => m.decayScore >= 0.5 && m.decayScore < 0.9).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Decayed (&lt;50%)</span>
                <span>{memories.filter(m => m.decayScore < 0.5).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Relationship Network</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Similar</span>
                <span>{memories.reduce((acc, m) => acc + m.relationships.filter(r => r.type === 'similar').length, 0)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Contradictory</span>
                <span>{memories.reduce((acc, m) => acc + m.relationships.filter(r => r.type === 'contradictory').length, 0)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Related</span>
                <span>{memories.reduce((acc, m) => acc + m.relationships.filter(r => r.type === 'related').length, 0)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Memory Intelligence Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Analysis Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Auto-analyze new memories</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Detect contradictions</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Find semantic duplicates</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Calculate decay scores</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-2">Analysis Model</label>
              <select className="w-full border rounded px-3 py-2">
                <option>GPT-4</option>
                <option>Claude-3</option>
                <option>Gemini Pro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Health Monitoring</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Health Assessment Frequency</label>
              <select className="w-full border rounded px-3 py-2">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Decay Threshold</label>
              <select className="w-full border rounded px-3 py-2">
                <option>0.5 (50%)</option>
                <option>0.7 (70%)</option>
                <option>0.8 (80%)</option>
              </select>
            </div>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Auto-archive decayed memories</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Generate health recommendations</span>
            </label>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Memory Intelligence</h1>
          <p className="text-gray-600">Advanced memory management with AI analysis, health monitoring, and semantic linking</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'memories', label: 'Memories', icon: CpuChipIcon },
              { id: 'analysis', label: 'Analysis', icon: SparklesIcon },
              { id: 'health', label: 'Health', icon: HeartIcon },
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
        {currentView === 'memories' && renderMemories()}
        {currentView === 'analysis' && renderAnalysis()}
        {currentView === 'health' && renderHealth()}
        {currentView === 'settings' && renderSettings()}
      </div>
    </div>
  )
} 
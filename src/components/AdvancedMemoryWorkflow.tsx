'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  CpuChipIcon,
  LinkIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShareIcon,
  LockClosedIcon,
  LockOpenIcon,
  DocumentTextIcon,
  TagIcon,
  StarIcon,
  Cog6ToothIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline'

interface Memory {
  id: string
  title: string
  content: string
  type: 'note' | 'transcript' | 'meeting' | 'research' | 'decision' | 'idea' | 'task'
  tags: string[]
  createdAt: Date
  updatedAt: Date
  lastAccessed: Date
  accessCount: number
  decayScore: number // 0-100, higher = more likely to decay
  healthScore: number // 0-100, higher = healthier
  confidence: number // 0-100, AI confidence in content
  status: 'active' | 'decaying' | 'archived' | 'forked' | 'merged'
  parentId?: string
  children: string[]
  relatedMemories: string[]
  semanticLinks: SemanticLink[]
  permissions: {
    visibility: 'private' | 'team' | 'public'
    canEdit: string[]
    canView: string[]
    canShare: string[]
  }
  metadata: {
    wordCount: number
    readingTime: number
    complexity: number
    sentiment: number
    topics: string[]
    entities: string[]
    language: string
  }
  version: number
  history: MemoryVersion[]
}

interface SemanticLink {
  id: string
  targetMemoryId: string
  strength: number // 0-100
  type: 'similar' | 'related' | 'contradictory' | 'extends' | 'references'
  confidence: number
  createdAt: Date
}

interface MemoryVersion {
  id: string
  version: number
  content: string
  timestamp: Date
  author: string
  changes: string[]
}

interface MemoryFork {
  id: string
  originalMemoryId: string
  forkedMemoryId: string
  reason: string
  timestamp: Date
  author: string
}

interface MemoryMerge {
  id: string
  sourceMemoryIds: string[]
  targetMemoryId: string
  strategy: 'append' | 'replace' | 'smart'
  timestamp: Date
  author: string
  conflicts: MergeConflict[]
}

interface MergeConflict {
  id: string
  field: string
  sourceValue: string
  targetValue: string
  resolution: 'source' | 'target' | 'manual' | 'unresolved'
}

export default function AdvancedMemoryWorkflow() {
  const [currentView, setCurrentView] = useState<'overview' | 'decay' | 'forking' | 'merging' | 'semantic' | 'analytics'>('overview')
  const [memories, setMemories] = useState<Memory[]>([])
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [decayThreshold, setDecayThreshold] = useState(70)
  const [showForkModal, setShowForkModal] = useState(false)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [forkReason, setForkReason] = useState('')
  const [mergeStrategy, setMergeStrategy] = useState<'append' | 'replace' | 'smart'>('smart')
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([])

  // Sample memories for demonstration
  const sampleMemories: Memory[] = [
    {
      id: '1',
      title: 'Q4 Strategy Planning Session',
      content: 'Our quarterly strategy session focused on expanding into new markets. Key decisions: 1) Launch in Asia Pacific by Q2, 2) Increase R&D budget by 20%, 3) Hire 50 new engineers. Budget allocated: $5M for expansion.',
      type: 'meeting',
      tags: ['strategy', 'q4', 'planning', 'expansion'],
      createdAt: new Date('2024-10-15'),
      updatedAt: new Date('2024-10-15'),
      lastAccessed: new Date('2024-11-20'),
      accessCount: 12,
      decayScore: 25,
      healthScore: 85,
      confidence: 92,
      status: 'active',
      children: [],
      relatedMemories: ['2', '3'],
      semanticLinks: [
        {
          id: '1',
          targetMemoryId: '2',
          strength: 85,
          type: 'related',
          confidence: 90,
          createdAt: new Date('2024-10-16')
        }
      ],
      permissions: {
        visibility: 'team',
        canEdit: ['user1', 'user2'],
        canView: ['user1', 'user2', 'user3'],
        canShare: ['user1']
      },
      metadata: {
        wordCount: 45,
        readingTime: 2,
        complexity: 7,
        sentiment: 0.8,
        topics: ['strategy', 'expansion', 'budget'],
        entities: ['Asia Pacific', 'R&D', 'engineers'],
        language: 'en'
      },
      version: 1,
      history: []
    },
    {
      id: '2',
      title: 'Asia Pacific Market Research',
      content: 'Comprehensive analysis of APAC markets. Singapore and Australia show highest potential. Market size: $2.3B. Competition: 3 major players. Entry strategy: Partner with local distributors.',
      type: 'research',
      tags: ['research', 'apac', 'market', 'competition'],
      createdAt: new Date('2024-10-20'),
      updatedAt: new Date('2024-10-25'),
      lastAccessed: new Date('2024-11-15'),
      accessCount: 8,
      decayScore: 35,
      healthScore: 78,
      confidence: 88,
      status: 'active',
      children: [],
      relatedMemories: ['1', '3'],
      semanticLinks: [],
      permissions: {
        visibility: 'team',
        canEdit: ['user1'],
        canView: ['user1', 'user2'],
        canShare: ['user1']
      },
      metadata: {
        wordCount: 38,
        readingTime: 2,
        complexity: 8,
        sentiment: 0.6,
        topics: ['market research', 'apac', 'competition'],
        entities: ['Singapore', 'Australia', 'distributors'],
        language: 'en'
      },
      version: 2,
      history: []
    },
    {
      id: '3',
      title: 'Budget Allocation Decision',
      content: 'Final budget allocation for Q4 expansion: Marketing: $2M, R&D: $1.5M, Operations: $1M, Contingency: $0.5M. Approved by board on Nov 1st.',
      type: 'decision',
      tags: ['budget', 'q4', 'decision', 'board'],
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-11-01'),
      lastAccessed: new Date('2024-11-10'),
      accessCount: 5,
      decayScore: 15,
      healthScore: 92,
      confidence: 95,
      status: 'active',
      children: [],
      relatedMemories: ['1', '2'],
      semanticLinks: [],
      permissions: {
        visibility: 'team',
        canEdit: ['user1'],
        canView: ['user1', 'user2', 'user3'],
        canShare: ['user1']
      },
      metadata: {
        wordCount: 28,
        readingTime: 1,
        complexity: 6,
        sentiment: 0.9,
        topics: ['budget', 'allocation', 'approval'],
        entities: ['Marketing', 'R&D', 'Operations', 'board'],
        language: 'en'
      },
      version: 1,
      history: []
    }
  ]

  useEffect(() => {
    setMemories(sampleMemories)
  }, [])

  // Calculate decay score based on various factors
  const calculateDecayScore = (memory: Memory): number => {
    const daysSinceCreation = (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    const daysSinceLastAccess = (Date.now() - memory.lastAccessed.getTime()) / (1000 * 60 * 60 * 24)
    const accessFrequency = memory.accessCount / Math.max(daysSinceCreation, 1)
    
    let score = 0
    score += Math.min(daysSinceLastAccess * 2, 40) // Time since last access
    score += Math.min((100 - memory.confidence) * 0.3, 20) // Low confidence
    score += Math.min((100 - memory.healthScore) * 0.2, 20) // Poor health
    score -= Math.min(accessFrequency * 10, 20) // Frequent access reduces decay
    
    return Math.max(0, Math.min(100, score))
  }

  // Update decay scores for all memories
  const updateDecayScores = () => {
    setMemories(prev => prev.map(memory => ({
      ...memory,
      decayScore: calculateDecayScore(memory)
    })))
  }

  useEffect(() => {
    updateDecayScores()
    const interval = setInterval(updateDecayScores, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Filter memories based on search and tags
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => memory.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  // Fork memory
  const forkMemory = (originalMemory: Memory, reason: string) => {
    const forkedMemory: Memory = {
      ...originalMemory,
      id: Date.now().toString(),
      title: `${originalMemory.title} (Fork)`,
      parentId: originalMemory.id,
      status: 'forked',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 0,
      decayScore: 0,
      version: 1,
      history: []
    }

    setMemories(prev => [
      ...prev,
      forkedMemory,
      ...prev.map(m => m.id === originalMemory.id ? { ...m, children: [...m.children, forkedMemory.id] } : m)
    ])

    setForkReason('')
    setShowForkModal(false)
  }

  // Merge memories
  const mergeMemories = (sourceIds: string[], targetId: string, strategy: 'append' | 'replace' | 'smart') => {
    const sourceMemories = memories.filter(m => sourceIds.includes(m.id))
    const targetMemory = memories.find(m => m.id === targetId)
    
    if (!targetMemory) return

    let mergedContent = targetMemory.content
    let conflicts: MergeConflict[] = []

    sourceMemories.forEach(source => {
      switch (strategy) {
        case 'append':
          mergedContent += '\n\n' + source.content
          break
        case 'replace':
          mergedContent = source.content
          break
        case 'smart':
          // Smart merge logic - detect and resolve conflicts
          if (source.content !== targetMemory.content) {
            conflicts.push({
              id: Date.now().toString(),
              field: 'content',
              sourceValue: source.content,
              targetValue: targetMemory.content,
              resolution: 'unresolved'
            })
          }
          break
      }
    })

    const mergedMemory: Memory = {
      ...targetMemory,
      content: mergedContent,
      status: 'merged',
      updatedAt: new Date(),
      version: targetMemory.version + 1,
      history: [
        ...targetMemory.history,
        {
          id: Date.now().toString(),
          version: targetMemory.version,
          content: targetMemory.content,
          timestamp: new Date(),
          author: 'user1',
          changes: ['Merged with memories: ' + sourceIds.join(', ')]
        }
      ]
    }

    setMemories(prev => [
      ...prev.filter(m => !sourceIds.includes(m.id)),
      mergedMemory
    ])

    setSelectedForMerge([])
    setShowMergeModal(false)
  }

  // Create semantic link
  const createSemanticLink = (sourceMemory: Memory, targetMemory: Memory, type: SemanticLink['type']) => {
    const link: SemanticLink = {
      id: Date.now().toString(),
      targetMemoryId: targetMemory.id,
      strength: Math.random() * 100,
      type,
      confidence: Math.random() * 100,
      createdAt: new Date()
    }

    setMemories(prev => prev.map(m => 
      m.id === sourceMemory.id 
        ? { ...m, semanticLinks: [...m.semanticLinks, link] }
        : m
    ))
  }

  // Archive decaying memories
  const archiveDecayingMemories = () => {
    setMemories(prev => prev.map(memory => 
      memory.decayScore > decayThreshold 
        ? { ...memory, status: 'archived' as const }
        : memory
    ))
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Memory Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Active Memories</span>
              <span className="font-semibold">{memories.filter(m => m.status === 'active').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Decaying</span>
              <span className="font-semibold text-orange-600">{memories.filter(m => m.decayScore > 50).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Archived</span>
              <span className="font-semibold text-gray-600">{memories.filter(m => m.status === 'archived').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Memory Operations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Forked</span>
              <span className="font-semibold">{memories.filter(m => m.status === 'forked').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Merged</span>
              <span className="font-semibold">{memories.filter(m => m.status === 'merged').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Semantic Links</span>
              <span className="font-semibold">{memories.reduce((sum, m) => sum + m.semanticLinks.length, 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setCurrentView('decay')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded"
            >
              <ClockIcon className="w-4 h-4 inline mr-2" />
              Manage Decay
            </button>
            <button 
              onClick={() => setCurrentView('forking')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded"
            >
              <ArrowPathIcon className="w-4 h-4 inline mr-2" />
              Fork Memories
            </button>
            <button 
              onClick={() => setCurrentView('merging')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded"
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Merge Memories
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Search & Filter</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="space-y-1">
                {Array.from(new Set(memories.flatMap(m => m.tags))).slice(0, 5).map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags(prev => [...prev, tag])
                        } else {
                          setSelectedTags(prev => prev.filter(t => t !== tag))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="ml-2 text-sm">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Memories</h3>
        <div className="space-y-3">
          {filteredMemories.slice(0, 5).map(memory => (
            <div key={memory.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex-1">
                <h4 className="font-medium">{memory.title}</h4>
                <p className="text-sm text-gray-600">{memory.type} • {memory.tags.join(', ')}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500">
                    Decay: {memory.decayScore.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    Health: {memory.healthScore.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    Access: {memory.accessCount}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  memory.status === 'active' ? 'bg-green-100 text-green-800' :
                  memory.status === 'decaying' ? 'bg-yellow-100 text-yellow-800' :
                  memory.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                  memory.status === 'forked' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {memory.status}
                </span>
                <button 
                  onClick={() => setSelectedMemory(memory)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDecay = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Memory Decay Management</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Decay Threshold:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={decayThreshold}
              onChange={(e) => setDecayThreshold(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm font-medium">{decayThreshold}%</span>
          </div>
          <button
            onClick={archiveDecayingMemories}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Archive Decaying
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {memories
          .filter(m => m.decayScore > 30)
          .sort((a, b) => b.decayScore - a.decayScore)
          .map(memory => (
            <div key={memory.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{memory.title}</h3>
                  <p className="text-sm text-gray-600">{memory.type} • {memory.tags.join(', ')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded text-sm ${
                    memory.decayScore > 70 ? 'bg-red-100 text-red-800' :
                    memory.decayScore > 50 ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {memory.decayScore.toFixed(1)}% decay
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Last Accessed</span>
                  <p className="font-medium">{memory.lastAccessed.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Access Count</span>
                  <p className="font-medium">{memory.accessCount}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Health Score</span>
                  <p className="font-medium">{memory.healthScore.toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Confidence</span>
                  <p className="font-medium">{memory.confidence.toFixed(1)}%</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setMemories(prev => prev.map(m => 
                      m.id === memory.id 
                        ? { ...m, lastAccessed: new Date(), accessCount: m.accessCount + 1 }
                        : m
                    ))
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Access Now
                </button>
                <button
                  onClick={() => {
                    setMemories(prev => prev.map(m => 
                      m.id === memory.id ? { ...m, status: 'archived' } : m
                    ))
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Archive
                </button>
                <button
                  onClick={() => {
                    setSelectedMemory(memory)
                    setShowForkModal(true)
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Fork
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )

  const renderForking = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Memory Forking</h2>
      
      <div className="space-y-4">
        {memories.filter(m => m.status === 'active').map(memory => (
          <div key={memory.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{memory.title}</h3>
                <p className="text-sm text-gray-600">{memory.type} • {memory.tags.join(', ')}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedMemory(memory)
                  setShowForkModal(true)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <ArrowPathIcon className="w-4 h-4 inline mr-2" />
                Fork Memory
              </button>
            </div>

            <p className="text-gray-700 mb-4">{memory.content.substring(0, 200)}...</p>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Created: {memory.createdAt.toLocaleDateString()}</span>
              <span>Access: {memory.accessCount} times</span>
              <span>Children: {memory.children.length}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMerging = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Memory Merging</h2>
      
      <div className="space-y-4">
        {memories.filter(m => m.status === 'active').map(memory => (
          <div key={memory.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{memory.title}</h3>
                <p className="text-sm text-gray-600">{memory.type} • {memory.tags.join(', ')}</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedForMerge.includes(memory.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedForMerge(prev => [...prev, memory.id])
                    } else {
                      setSelectedForMerge(prev => prev.filter(id => id !== memory.id))
                    }
                  }}
                  className="rounded"
                />
                <button
                  onClick={() => {
                    if (selectedForMerge.length > 0) {
                      setShowMergeModal(true)
                    }
                  }}
                  disabled={selectedForMerge.length < 2}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
                >
                  Merge Selected ({selectedForMerge.length})
                </button>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{memory.content.substring(0, 200)}...</p>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Created: {memory.createdAt.toLocaleDateString()}</span>
              <span>Version: {memory.version}</span>
              <span>Related: {memory.relatedMemories.length}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSemantic = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Semantic Linking</h2>
      
      <div className="space-y-4">
        {memories.map(memory => (
          <div key={memory.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{memory.title}</h3>
                <p className="text-sm text-gray-600">{memory.type} • {memory.tags.join(', ')}</p>
              </div>
              <span className="text-sm text-gray-600">
                {memory.semanticLinks.length} links
              </span>
            </div>

            <p className="text-gray-700 mb-4">{memory.content.substring(0, 200)}...</p>

            {memory.semanticLinks.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Semantic Links</h4>
                <div className="space-y-2">
                  {memory.semanticLinks.map(link => {
                    const targetMemory = memories.find(m => m.id === link.targetMemoryId)
                    return targetMemory ? (
                      <div key={link.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{targetMemory.title}</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            link.type === 'similar' ? 'bg-blue-100 text-blue-800' :
                            link.type === 'related' ? 'bg-green-100 text-green-800' :
                            link.type === 'contradictory' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {link.type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Strength: {link.strength.toFixed(1)}%
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Find Similar
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Suggest Links
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Memory Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Memory Health Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Excellent (90-100%)</span>
              <span className="font-semibold text-green-600">
                {memories.filter(m => m.healthScore >= 90).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Good (70-89%)</span>
              <span className="font-semibold text-blue-600">
                {memories.filter(m => m.healthScore >= 70 && m.healthScore < 90).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fair (50-69%)</span>
              <span className="font-semibold text-yellow-600">
                {memories.filter(m => m.healthScore >= 50 && m.healthScore < 70).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Poor (&lt;50%)</span>
              <span className="font-semibold text-red-600">
                {memories.filter(m => m.healthScore < 50).length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Memory Types</h3>
          <div className="space-y-3">
            {Object.entries(
              memories.reduce((acc, m) => {
                acc[m.type] = (acc[m.type] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            ).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="capitalize">{type}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Tags</h3>
          <div className="space-y-3">
            {Object.entries(
              memories.flatMap(m => m.tags).reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            )
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between">
                  <span>{tag}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Memory Management</h1>
          <p className="text-gray-600">Manage memory decay, forking, merging, and semantic linking</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: CpuChipIcon },
              { id: 'decay', label: 'Decay Management', icon: ClockIcon },
              { id: 'forking', label: 'Forking', icon: ArrowPathIcon },
              { id: 'merging', label: 'Merging', icon: LinkIcon },
              { id: 'semantic', label: 'Semantic Links', icon: MagnifyingGlassIcon },
              { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
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
        {currentView === 'decay' && renderDecay()}
        {currentView === 'forking' && renderForking()}
        {currentView === 'merging' && renderMerging()}
        {currentView === 'semantic' && renderSemantic()}
        {currentView === 'analytics' && renderAnalytics()}

        {/* Fork Modal */}
        {showForkModal && selectedMemory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Fork Memory</h3>
              <p className="text-gray-600 mb-4">
                Create a fork of "{selectedMemory.title}"?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Reason for forking</label>
                <textarea
                  value={forkReason}
                  onChange={(e) => setForkReason(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Why are you forking this memory?"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowForkModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => forkMemory(selectedMemory, forkReason)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Fork Memory
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Merge Modal */}
        {showMergeModal && selectedForMerge.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Merge Memories</h3>
              <p className="text-gray-600 mb-4">
                Merge {selectedForMerge.length} selected memories?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Merge Strategy</label>
                <select
                  value={mergeStrategy}
                  onChange={(e) => setMergeStrategy(e.target.value as any)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="smart">Smart Merge (AI-powered)</option>
                  <option value="append">Append Content</option>
                  <option value="replace">Replace Content</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMergeModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => mergeMemories(selectedForMerge.slice(1), selectedForMerge[0], mergeStrategy)}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Merge Memories
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
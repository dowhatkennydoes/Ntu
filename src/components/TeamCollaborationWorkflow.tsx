'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShareIcon,
  EyeIcon,
  EyeSlashIcon,
  BellIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

// T1: Real-time collaborative notetaking interfaces
interface Collaborator {
  id: string
  name: string
  email: string
  avatar: string
  role: 'owner' | 'editor' | 'viewer' | 'commenter'
  status: 'online' | 'offline' | 'away'
  lastSeen: Date
  cursor?: {
    x: number
    y: number
    selection?: string
  }
}

interface TeamMemory {
  id: string
  title: string
  content: string
  type: 'note' | 'transcript' | 'meeting' | 'research' | 'decision'
  visibility: 'private' | 'team' | 'public'
  collaborators: Collaborator[]
  permissions: {
    canEdit: string[]
    canComment: string[]
    canView: string[]
    canShare: string[]
  }
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected'
  approvalWorkflow: ApprovalStep[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastEditedBy?: string
  version: number
  comments: Comment[]
  activityLog: ActivityLogEntry[]
}

interface ApprovalStep {
  id: string
  type: 'sequential' | 'parallel'
  approvers: string[]
  status: 'pending' | 'approved' | 'rejected'
  comments: string[]
  completedAt?: Date
  order: number
}

interface Comment {
  id: string
  content: string
  author: string
  timestamp: Date
  resolved: boolean
  replies: Comment[]
  mentions: string[]
  attachments: string[]
}

interface ActivityLogEntry {
  id: string
  action: 'created' | 'edited' | 'commented' | 'approved' | 'rejected' | 'shared' | 'viewed'
  user: string
  timestamp: Date
  details: Record<string, any>
}

interface TeamDigest {
  id: string
  title: string
  period: 'daily' | 'weekly' | 'monthly'
  content: {
    newMemories: TeamMemory[]
    pendingApprovals: TeamMemory[]
    recentActivity: ActivityLogEntry[]
    teamMetrics: {
      memoriesCreated: number
      approvalsCompleted: number
      activeCollaborators: number
    }
  }
  recipients: string[]
  sentAt?: Date
  status: 'draft' | 'sent' | 'failed'
}

export default function TeamCollaborationWorkflow() {
  const [currentView, setCurrentView] = useState<'overview' | 'collaborate' | 'approvals' | 'digests' | 'settings'>('overview')
  const [selectedMemory, setSelectedMemory] = useState<TeamMemory | null>(null)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@company.com',
      avatar: 'AJ',
      role: 'owner',
      status: 'online',
      lastSeen: new Date()
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@company.com',
      avatar: 'BS',
      role: 'editor',
      status: 'online',
      lastSeen: new Date()
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@company.com',
      avatar: 'CD',
      role: 'commenter',
      status: 'away',
      lastSeen: new Date(Date.now() - 300000)
    }
  ])

  const [teamMemories, setTeamMemories] = useState<TeamMemory[]>([
    {
      id: '1',
      title: 'Q4 Strategy Planning',
      content: 'Our quarterly strategy session focused on expanding into new markets...',
      type: 'meeting',
      visibility: 'team',
      collaborators: collaborators.slice(0, 2),
      permissions: {
        canEdit: ['1', '2'],
        canComment: ['1', '2', '3'],
        canView: ['1', '2', '3'],
        canShare: ['1']
      },
      approvalStatus: 'pending',
      approvalWorkflow: [
        {
          id: '1',
          type: 'sequential',
          approvers: ['2'],
          status: 'pending',
          comments: [],
          order: 1
        }
      ],
      tags: ['strategy', 'q4', 'planning'],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '1',
      version: 1,
      comments: [],
      activityLog: []
    }
  ])

  const [pendingApprovals, setPendingApprovals] = useState<TeamMemory[]>([])
  const [teamDigests, setTeamDigests] = useState<TeamDigest[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false)
  const [newCollaborator, setNewCollaborator] = useState<Partial<Collaborator>>({})

  // T1: Real-time collaboration simulation
  const [liveCollaborators, setLiveCollaborators] = useState<Collaborator[]>([])
  const collaborationInterval = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Simulate real-time collaboration
    collaborationInterval.current = setInterval(() => {
      setLiveCollaborators(prev => 
        prev.map(collaborator => ({
          ...collaborator,
          cursor: {
            x: Math.random() * 800,
            y: Math.random() * 600,
            selection: Math.random() > 0.7 ? 'selected text' : undefined
          }
        }))
      )
    }, 2000)

    return () => {
      if (collaborationInterval.current) {
        clearInterval(collaborationInterval.current)
      }
    }
  }, [])

  // T2: Memory approval workflow
  const approveMemory = (memoryId: string, approved: boolean, comment?: string) => {
    setTeamMemories(prev => 
      prev.map(memory => {
        if (memory.id === memoryId) {
          const updatedWorkflow = memory.approvalWorkflow.map(step => ({
            ...step,
            status: approved ? 'approved' : 'rejected',
            comments: comment ? [...step.comments, comment] : step.comments,
            completedAt: new Date()
          }))

          return {
            ...memory,
            approvalStatus: approved ? 'approved' : 'rejected',
            approvalWorkflow: updatedWorkflow,
            activityLog: [
              ...memory.activityLog,
              {
                id: Date.now().toString(),
                action: approved ? 'approved' : 'rejected',
                user: '1', // Current user
                timestamp: new Date(),
                details: { comment }
              }
            ]
          }
        }
        return memory
      })
    )
  }

  // T3: Role-based sharing
  const updateMemoryPermissions = (memoryId: string, permissions: Partial<TeamMemory['permissions']>) => {
    setTeamMemories(prev =>
      prev.map(memory => 
        memory.id === memoryId 
          ? { ...memory, permissions: { ...memory.permissions, ...permissions } }
          : memory
      )
    )
  }

  // T4: Action item tracking
  const [actionItems, setActionItems] = useState<Array<{
    id: string
    title: string
    assignee: string
    dueDate: Date
    status: 'pending' | 'in-progress' | 'completed'
    memoryId: string
  }>>([])

  const createActionItem = (title: string, assignee: string, dueDate: Date, memoryId: string) => {
    const newActionItem = {
      id: Date.now().toString(),
      title,
      assignee,
      dueDate,
      status: 'pending' as const,
      memoryId
    }
    setActionItems(prev => [...prev, newActionItem])
  }

  // T5: Team digest generation
  const generateTeamDigest = (period: 'daily' | 'weekly' | 'monthly') => {
    const newDigest: TeamDigest = {
      id: Date.now().toString(),
      title: `${period.charAt(0).toUpperCase() + period.slice(1)} Team Digest`,
      period,
      content: {
        newMemories: teamMemories.filter(m => 
          m.createdAt > new Date(Date.now() - (period === 'daily' ? 86400000 : period === 'weekly' ? 604800000 : 2592000000))
        ),
        pendingApprovals: teamMemories.filter(m => m.approvalStatus === 'pending'),
        recentActivity: teamMemories.flatMap(m => m.activityLog).slice(-10),
        teamMetrics: {
          memoriesCreated: teamMemories.length,
          approvalsCompleted: teamMemories.filter(m => m.approvalStatus === 'approved').length,
          activeCollaborators: collaborators.filter(c => c.status === 'online').length
        }
      },
      recipients: collaborators.map(c => c.email),
      status: 'draft'
    }
    setTeamDigests(prev => [...prev, newDigest])
  }

  // T6: Team communication
  const [teamMessages, setTeamMessages] = useState<Array<{
    id: string
    content: string
    author: string
    timestamp: Date
    mentions: string[]
    memoryId?: string
  }>>([])

  const sendTeamMessage = (content: string, memoryId?: string) => {
    const mentions = content.match(/@(\w+)/g)?.map(m => m.slice(1)) || []
    const newMessage = {
      id: Date.now().toString(),
      content,
      author: '1', // Current user
      timestamp: new Date(),
      mentions,
      memoryId
    }
    setTeamMessages(prev => [...prev, newMessage])
  }

  // T7: Task delegation
  const delegateTask = (taskId: string, assignee: string, memoryId: string) => {
    // Implementation for task delegation
    console.log(`Delegating task ${taskId} to ${assignee} for memory ${memoryId}`)
  }

  // T8: Workflow assignment
  const assignWorkflow = (workflowId: string, assignees: string[], memoryId: string) => {
    // Implementation for workflow assignment
    console.log(`Assigning workflow ${workflowId} to ${assignees.join(', ')} for memory ${memoryId}`)
  }

  // T9: Status visibility
  const [workflowStatuses, setWorkflowStatuses] = useState<Record<string, 'pending' | 'approved'>>({})

  // T10: Feedback workflow
  const [feedbackItems, setFeedbackItems] = useState<Array<{
    id: string
    content: string
    type: 'suggestion' | 'correction' | 'improvement'
    status: 'pending' | 'reviewed' | 'applied' | 'rejected'
    author: string
    memoryId: string
    timestamp: Date
  }>>([])

  const submitFeedback = (content: string, type: 'suggestion' | 'correction' | 'improvement', memoryId: string) => {
    const newFeedback = {
      id: Date.now().toString(),
      content,
      type,
      status: 'pending',
      author: '1',
      memoryId,
      timestamp: new Date()
    }
    setFeedbackItems(prev => [...prev, newFeedback])
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Team Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Active Collaborators</span>
              <span className="font-semibold">{collaborators.filter(c => c.status === 'online').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending Approvals</span>
              <span className="font-semibold text-orange-600">{teamMemories.filter(m => m.approvalStatus === 'pending').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Recent Memories</span>
              <span className="font-semibold">{teamMemories.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setCurrentView('collaborate')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded"
            >
              <PlusIcon className="w-4 h-4 inline mr-2" />
              Create Team Memory
            </button>
            <button 
              onClick={() => setCurrentView('approvals')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded"
            >
              <CheckCircleIcon className="w-4 h-4 inline mr-2" />
              Review Approvals
            </button>
            <button 
              onClick={() => generateTeamDigest('weekly')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded"
            >
              <DocumentTextIcon className="w-4 h-4 inline mr-2" />
              Generate Digest
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Live Collaboration</h3>
          <div className="space-y-2">
            {liveCollaborators.map(collaborator => (
              <div key={collaborator.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  collaborator.status === 'online' ? 'bg-green-500' : 
                  collaborator.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm">{collaborator.name}</span>
                {collaborator.cursor?.selection && (
                  <span className="text-xs text-gray-500">(editing)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Team Memories</h3>
        <div className="space-y-3">
          {teamMemories.slice(0, 5).map(memory => (
            <div key={memory.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">{memory.title}</h4>
                <p className="text-sm text-gray-600">{memory.type} • {memory.visibility}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  memory.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                  memory.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {memory.approvalStatus}
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

  const renderCollaboration = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Collaboration</h2>
        <button 
          onClick={() => setShowCollaboratorModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 inline mr-2" />
          Add Collaborator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Collaborative Editor</h3>
          <div className="space-y-4">
            <div className="relative">
              <textarea 
                className="w-full h-64 p-4 border rounded-lg resize-none"
                placeholder="Start collaborating on team content..."
                value={selectedMemory?.content || ''}
                onChange={(e) => {
                  if (selectedMemory) {
                    setTeamMemories(prev => 
                      prev.map(m => 
                        m.id === selectedMemory.id 
                          ? { ...m, content: e.target.value, updatedAt: new Date() }
                          : m
                      )
                    )
                  }
                }}
              />
              {/* Live cursors overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {liveCollaborators.map(collaborator => (
                  <div
                    key={collaborator.id}
                    className="absolute w-4 h-4 bg-blue-500 rounded-full animate-pulse"
                    style={{
                      left: collaborator.cursor?.x || 0,
                      top: collaborator.cursor?.y || 0
                    }}
                    title={`${collaborator.name} is editing`}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Save
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Share
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                Request Approval
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Team Chat</h3>
          <div className="space-y-4">
            <div className="h-64 overflow-y-auto border rounded p-4 space-y-3">
              {teamMessages.map(message => (
                <div key={message.id} className="flex space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    {collaborators.find(c => c.id === message.author)?.avatar || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {collaborators.find(c => c.id === message.author)?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border rounded px-3 py-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newComment.trim()) {
                    sendTeamMessage(newComment, selectedMemory?.id)
                    setNewComment('')
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (newComment.trim()) {
                    sendTeamMessage(newComment, selectedMemory?.id)
                    setNewComment('')
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderApprovals = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Approval Workflow</h2>
      
      <div className="space-y-4">
        {teamMemories.filter(m => m.approvalStatus === 'pending').map(memory => (
          <div key={memory.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{memory.title}</h3>
                <p className="text-gray-600">{memory.type} • Created by {collaborators.find(c => c.id === memory.createdBy)?.name}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Pending Approval
              </span>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{memory.content.substring(0, 200)}...</p>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Approval Steps</h4>
              {memory.approvalWorkflow.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium">Step {index + 1}:</span>
                  <span className="text-sm">
                    {step.approvers.map(id => collaborators.find(c => c.id === id)?.name).join(', ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    step.status === 'approved' ? 'bg-green-100 text-green-800' :
                    step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {step.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => approveMemory(memory.id, true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                <CheckIcon className="w-4 h-4 inline mr-2" />
                Approve
              </button>
              <button 
                onClick={() => approveMemory(memory.id, false)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                <XMarkIcon className="w-4 h-4 inline mr-2" />
                Reject
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-2" />
                Comment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDigests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Digests</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => generateTeamDigest('daily')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Daily Digest
          </button>
          <button 
            onClick={() => generateTeamDigest('weekly')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Weekly Digest
          </button>
          <button 
            onClick={() => generateTeamDigest('monthly')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Monthly Digest
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {teamDigests.map(digest => (
          <div key={digest.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{digest.title}</h3>
                <p className="text-gray-600">{digest.period} digest • {digest.recipients.length} recipients</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                digest.status === 'sent' ? 'bg-green-100 text-green-800' :
                digest.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {digest.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{digest.content.teamMetrics.memoriesCreated}</div>
                <div className="text-sm text-gray-600">New Memories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{digest.content.teamMetrics.approvalsCompleted}</div>
                <div className="text-sm text-gray-600">Approvals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{digest.content.teamMetrics.activeCollaborators}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Preview
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Send Now
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Team Settings</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Collaboration Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Default Memory Visibility</label>
            <select className="w-full border rounded px-3 py-2">
              <option>Private</option>
              <option>Team</option>
              <option>Public</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Approval Workflow</label>
            <select className="w-full border rounded px-3 py-2">
              <option>Sequential</option>
              <option>Parallel</option>
              <option>None</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Auto-generate Digests</label>
            <select className="w-full border rounded px-3 py-2">
              <option>Never</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Collaboration</h1>
          <p className="text-gray-600">Real-time collaboration, approval workflows, and team memory sharing</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: UserGroupIcon },
              { id: 'collaborate', label: 'Collaborate', icon: ChatBubbleLeftRightIcon },
              { id: 'approvals', label: 'Approvals', icon: CheckCircleIcon },
              { id: 'digests', label: 'Digests', icon: DocumentTextIcon },
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
        {currentView === 'collaborate' && renderCollaboration()}
        {currentView === 'approvals' && renderApprovals()}
        {currentView === 'digests' && renderDigests()}
        {currentView === 'settings' && renderSettings()}
      </div>
    </div>
  )
} 
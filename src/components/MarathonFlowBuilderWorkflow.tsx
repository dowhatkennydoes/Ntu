'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  WrenchScrewdriverIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
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
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CloudIcon,
  ComputerDesktopIcon,
  KeyIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentTextIcon,
  UserGroupIcon,

  CodeBracketIcon,
  ChartBarIcon,
  SparklesIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline'

interface Flow {
  id: string
  name: string
  description: string
  version: string
  status: 'draft' | 'review' | 'published' | 'archived'
  environment: 'dev' | 'staging' | 'prod'
  nodes: FlowNode[]
  edges: FlowEdge[]
  triggers: FlowTrigger[]
  roles: FlowRole[]
  compliance: ComplianceSettings
  statistics: FlowStatistics
  auditTrail: AuditEntry[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastExecuted?: Date
  executionCount: number
}

interface FlowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'integration' | 'custom'
  name: string
  description: string
  position: { x: number; y: number }
  config: Record<string, any>
  status: 'active' | 'inactive' | 'error'
  executionTime: number
  successRate: number
  lastExecuted?: Date
  auditHash: string
  metadata: NodeMetadata
}

interface FlowEdge {
  id: string
  source: string
  target: string
  condition?: string
  label?: string
}

interface FlowTrigger {
  id: string
  type: 'memory' | 'schedule' | 'webhook' | 'manual' | 'event'
  config: Record<string, any>
  enabled: boolean
  lastTriggered?: Date
  triggerCount: number
}

interface FlowRole {
  id: string
  userId: string
  userName: string
  role: 'builder' | 'reviewer' | 'publisher' | 'executor'
  permissions: string[]
  assignedAt: Date
}

interface ComplianceSettings {
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  dataTypes: string[]
  requiresApproval: boolean
  auditEnabled: boolean
  encryptionRequired: boolean
  retentionPolicy: string
}

interface FlowStatistics {
  totalExecutions: number
  successRate: number
  averageExecutionTime: number
  lastExecutionTime?: number
  errorCount: number
  memoryHits: number
  complianceViolations: number
}

interface AuditEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  action: string
  details: Record<string, any>
  auditHash: string
  tamperDetected: boolean
}

interface NodeMetadata {
  classification: string[]
  dataTypes: string[]
  complianceTags: string[]
  memoryAccess: boolean
  exportCapability: boolean
  externalConnections: boolean
}

export default function MarathonFlowBuilderWorkflow() {
  const [currentView, setCurrentView] = useState<'overview' | 'builder' | 'executions' | 'audit' | 'settings'>('overview')
  const [flows, setFlows] = useState<Flow[]>([])
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showFlowModal, setShowFlowModal] = useState(false)
  const [showNodeModal, setShowNodeModal] = useState(false)
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all')
  const canvasRef = useRef<HTMLDivElement>(null)

  // Sample flows
  const sampleFlows: Flow[] = [
    {
      id: '1',
      name: 'Memory Processing Pipeline',
      description: 'Automated memory processing with AI analysis and compliance checks',
      version: '1.2.0',
      status: 'published',
      environment: 'prod',
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          name: 'Memory Created',
          description: 'Triggers when new memory is created',
          position: { x: 100, y: 100 },
          config: { eventType: 'memory.created' },
          status: 'active',
          executionTime: 50,
          successRate: 0.99,
          auditHash: 'hash-1',
          metadata: {
            classification: ['internal'],
            dataTypes: ['memory'],
            complianceTags: ['standard'],
            memoryAccess: true,
            exportCapability: false,
            externalConnections: false
          }
        },
        {
          id: 'node-2',
          type: 'action',
          name: 'AI Analysis',
          description: 'Performs AI analysis on memory content',
          position: { x: 300, y: 100 },
          config: { model: 'gpt-4', analysisType: 'sentiment' },
          status: 'active',
          executionTime: 2000,
          successRate: 0.95,
          auditHash: 'hash-2',
          metadata: {
            classification: ['internal'],
            dataTypes: ['text', 'memory'],
            complianceTags: ['ai-processing'],
            memoryAccess: true,
            exportCapability: false,
            externalConnections: true
          }
        },
        {
          id: 'node-3',
          type: 'condition',
          name: 'Compliance Check',
          description: 'Checks for compliance violations',
          position: { x: 500, y: 100 },
          config: { complianceLevel: 'confidential' },
          status: 'active',
          executionTime: 100,
          successRate: 0.98,
          auditHash: 'hash-3',
          metadata: {
            classification: ['confidential'],
            dataTypes: ['memory'],
            complianceTags: ['compliance-check'],
            memoryAccess: true,
            exportCapability: false,
            externalConnections: false
          }
        }
      ],
      edges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2' },
        { id: 'edge-2', source: 'node-2', target: 'node-3' }
      ],
      triggers: [
        {
          id: 'trigger-1',
          type: 'memory',
          config: { eventType: 'memory.created' },
          enabled: true,
          lastTriggered: new Date('2024-12-14T10:00:00'),
          triggerCount: 150
        }
      ],
      roles: [
        {
          id: 'role-1',
          userId: 'user1',
          userName: 'Alice Johnson',
          role: 'builder',
          permissions: ['edit', 'test'],
          assignedAt: new Date('2024-01-01')
        },
        {
          id: 'role-2',
          userId: 'user2',
          userName: 'Bob Smith',
          role: 'reviewer',
          permissions: ['review', 'approve'],
          assignedAt: new Date('2024-01-01')
        }
      ],
      compliance: {
        level: 'confidential',
        dataTypes: ['PHI', 'FERPA'],
        requiresApproval: true,
        auditEnabled: true,
        encryptionRequired: true,
        retentionPolicy: '7-years'
      },
      statistics: {
        totalExecutions: 150,
        successRate: 0.94,
        averageExecutionTime: 2150,
        lastExecutionTime: 2100,
        errorCount: 9,
        memoryHits: 150,
        complianceViolations: 2
      },
      auditTrail: [
        {
          id: 'audit-1',
          timestamp: new Date('2024-12-14T10:00:00'),
          userId: 'user1',
          userName: 'Alice Johnson',
          action: 'flow_executed',
          details: { nodeId: 'node-1', result: 'success' },
          auditHash: 'audit-hash-1',
          tamperDetected: false
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-12-14'),
      createdBy: 'Alice Johnson',
      lastExecuted: new Date('2024-12-14T10:00:00'),
      executionCount: 150
    }
  ]

  useEffect(() => {
    setFlows(sampleFlows)
  }, [])

  // Create new flow
  const createFlow = (name: string, description: string) => {
    const newFlow: Flow = {
      id: Date.now().toString(),
      name,
      description,
      version: '1.0.0',
      status: 'draft',
      environment: 'dev',
      nodes: [],
      edges: [],
      triggers: [],
      roles: [],
      compliance: {
        level: 'internal',
        dataTypes: [],
        requiresApproval: false,
        auditEnabled: true,
        encryptionRequired: false,
        retentionPolicy: '30-days'
      },
      statistics: {
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        errorCount: 0,
        memoryHits: 0,
        complianceViolations: 0
      },
      auditTrail: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Current User',
      executionCount: 0
    }
    setFlows(prev => [...prev, newFlow])
    setSelectedFlow(newFlow)
    setShowFlowModal(false)
  }

  // Execute flow
  const executeFlow = async (flowId: string) => {
    setIsExecuting(true)
    console.log(`Executing flow: ${flowId}`)
    
    // Simulate execution
    setTimeout(() => {
      setFlows(prev => prev.map(flow => 
        flow.id === flowId 
          ? { 
              ...flow, 
              lastExecuted: new Date(),
              executionCount: flow.executionCount + 1,
              statistics: {
                ...flow.statistics,
                totalExecutions: flow.statistics.totalExecutions + 1,
                lastExecutionTime: 2000 + Math.floor(Math.random() * 1000)
              }
            }
          : flow
      ))
      setIsExecuting(false)
    }, 3000)
  }

  // Add node to flow
  const addNode = (flowId: string, nodeType: FlowNode['type'], name: string) => {
    const newNode: FlowNode = {
      id: Date.now().toString(),
      type: nodeType,
      name,
      description: `New ${nodeType} node`,
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      config: {},
      status: 'active',
      executionTime: 0,
      successRate: 0,
      auditHash: `hash-${Date.now()}`,
      metadata: {
        classification: ['internal'],
        dataTypes: [],
        complianceTags: [],
        memoryAccess: false,
        exportCapability: false,
        externalConnections: false
      }
    }
    
    setFlows(prev => prev.map(flow => 
      flow.id === flowId 
        ? { ...flow, nodes: [...flow.nodes, newNode] }
        : flow
    ))
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <WrenchScrewdriverIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Flows</p>
              <p className="text-2xl font-bold text-gray-900">{flows.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <PlayIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Flows</p>
              <p className="text-2xl font-bold text-gray-900">
                {flows.filter(f => f.status === 'published').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold text-gray-900">
                {flows.reduce((acc, flow) => acc + flow.statistics.totalExecutions, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Compliance Violations</p>
              <p className="text-2xl font-bold text-gray-900">
                {flows.reduce((acc, flow) => acc + flow.statistics.complianceViolations, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Flows</h3>
          <div className="space-y-3">
            {flows.slice(0, 5).map(flow => (
              <div key={flow.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <h4 className="font-medium">{flow.name}</h4>
                  <p className="text-sm text-gray-600">
                    {flow.environment} • v{flow.version}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      flow.status === 'published' ? 'bg-green-100 text-green-800' :
                      flow.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {flow.status}
                    </span>
                    <span className="text-xs text-gray-500">{flow.executionCount} executions</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedFlow(flow)
                      setCurrentView('builder')
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => executeFlow(flow.id)}
                    disabled={isExecuting}
                    className="text-green-600 hover:text-green-800"
                  >
                    Execute
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Flow Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Success Rate</span>
                <span>{(flows.reduce((acc, flow) => acc + flow.statistics.successRate, 0) / flows.length * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${flows.reduce((acc, flow) => acc + flow.statistics.successRate, 0) / flows.length * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Execution Time</span>
                <span>{(flows.reduce((acc, flow) => acc + flow.statistics.averageExecutionTime, 0) / flows.length / 1000).toFixed(1)}s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Integration</span>
                <span>{flows.filter(f => f.nodes.some(n => n.metadata.memoryAccess)).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBuilder = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Flow Builder</h2>
        <div className="flex items-center space-x-2">
          {selectedFlow && (
            <>
              <span className="text-sm text-gray-600">
                {selectedFlow.name} • {selectedFlow.environment}
              </span>
              <button
                onClick={() => executeFlow(selectedFlow.id)}
                disabled={isExecuting}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {isExecuting ? 'Executing...' : 'Execute Flow'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Flow Canvas</h3>
              <div 
                ref={canvasRef}
                className="border rounded h-96 bg-gray-50 relative"
              >
                {selectedFlow?.nodes.map(node => (
                  <div
                    key={node.id}
                    className="absolute bg-white border rounded p-3 shadow cursor-move"
                    style={{ left: node.position.x, top: node.position.y }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        node.status === 'active' ? 'bg-green-500' :
                        node.status === 'error' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="font-medium text-sm">{node.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{node.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {node.executionTime}ms • {(node.successRate * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Add Nodes</h3>
            <div className="space-y-2">
              {[
                { type: 'trigger' as const, label: 'Trigger', icon: BellIcon },
                { type: 'action' as const, label: 'Action', icon: PlayIcon },
                { type: 'condition' as const, label: 'Condition', icon: Cog6ToothIcon },
                { type: 'integration' as const, label: 'Integration', icon: CloudIcon },
                { type: 'custom' as const, label: 'Custom', icon: CodeBracketIcon }
              ].map(nodeType => (
                <button
                  key={nodeType.type}
                  onClick={() => {
                    setSelectedNode({
                      id: '',
                      type: nodeType.type,
                      name: `New ${nodeType.label}`,
                      description: '',
                      position: { x: 0, y: 0 },
                      config: {},
                      status: 'active',
                      executionTime: 0,
                      successRate: 0,
                      auditHash: '',
                      metadata: {
                        classification: [],
                        dataTypes: [],
                        complianceTags: [],
                        memoryAccess: false,
                        exportCapability: false,
                        externalConnections: false
                      }
                    })
                    setShowNodeModal(true)
                  }}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center space-x-2"
                >
                  <nodeType.icon className="w-4 h-4" />
                  <span>{nodeType.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedFlow && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Flow Properties</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={selectedFlow.status}
                    onChange={(e) => setSelectedFlow(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Environment</label>
                  <select
                    value={selectedFlow.environment}
                    onChange={(e) => setSelectedFlow(prev => prev ? { ...prev, environment: e.target.value as any } : null)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="dev">Development</option>
                    <option value="staging">Staging</option>
                    <option value="prod">Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Compliance Level</label>
                  <select
                    value={selectedFlow.compliance.level}
                    onChange={(e) => setSelectedFlow(prev => prev ? { 
                      ...prev, 
                      compliance: { ...prev.compliance, level: e.target.value as any }
                    } : null)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="public">Public</option>
                    <option value="internal">Internal</option>
                    <option value="confidential">Confidential</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderExecutions = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Flow Executions</h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search executions..."
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
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="running">Running</option>
          </select>
        </div>

        <div className="space-y-4">
          {flows.map(flow => (
            <div key={flow.id} className="border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{flow.name}</h3>
                <span className="text-sm text-gray-500">
                  Last executed: {flow.lastExecuted?.toLocaleString() || 'Never'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Executions:</span>
                  <span className="ml-2 font-medium">{flow.statistics.totalExecutions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="ml-2 font-medium">{(flow.statistics.successRate * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Time:</span>
                  <span className="ml-2 font-medium">{(flow.statistics.averageExecutionTime / 1000).toFixed(1)}s</span>
                </div>
                <div>
                  <span className="text-gray-600">Errors:</span>
                  <span className="ml-2 font-medium">{flow.statistics.errorCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAudit = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Audit Trail</h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Timestamp</th>
                <th className="text-left py-2">User</th>
                <th className="text-left py-2">Action</th>
                <th className="text-left py-2">Flow</th>
                <th className="text-left py-2">Details</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {flows.flatMap(flow => flow.auditTrail).map(entry => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 text-sm">
                    {entry.timestamp.toLocaleString()}
                  </td>
                  <td className="py-2 text-sm">{entry.userName}</td>
                  <td className="py-2 text-sm">{entry.action}</td>
                  <td className="py-2 text-sm">
                    {flows.find(f => f.auditTrail.includes(entry))?.name}
                  </td>
                  <td className="py-2 text-sm">
                    {Object.entries(entry.details).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      entry.tamperDetected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {entry.tamperDetected ? 'Tampered' : 'Valid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Marathon Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Flow Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Enable audit logging</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Require approval for production</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Enable version control</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded" />
              <span className="ml-2">Emergency shutdown mode</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Compliance Level</label>
              <select className="w-full border rounded px-3 py-2">
                <option>Internal</option>
                <option>Confidential</option>
                <option>Restricted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Audit Retention</label>
              <select className="w-full border rounded px-3 py-2">
                <option>30 days</option>
                <option>90 days</option>
                <option>1 year</option>
                <option>7 years</option>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marathon Flow Builder</h1>
          <p className="text-gray-600">Advanced workflow automation with version control, audit trails, and compliance</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'builder', label: 'Builder', icon: WrenchScrewdriverIcon },
              { id: 'executions', label: 'Executions', icon: PlayIcon },
              { id: 'audit', label: 'Audit', icon: ArchiveBoxIcon },
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
        {currentView === 'builder' && renderBuilder()}
        {currentView === 'executions' && renderExecutions()}
        {currentView === 'audit' && renderAudit()}
        {currentView === 'settings' && renderSettings()}

        {/* Modals */}
        {showFlowModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Create New Flow</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Flow name"
                    className="w-full px-3 py-2 border rounded"
                    id="flow-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    placeholder="Flow description"
                    className="w-full px-3 py-2 border rounded"
                    id="flow-description"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowFlowModal(false)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const name = (document.getElementById('flow-name') as HTMLInputElement)?.value
                      const description = (document.getElementById('flow-description') as HTMLTextAreaElement)?.value
                      if (name) {
                        createFlow(name, description || '')
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
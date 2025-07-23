'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon,
  CubeIcon,
  BoltIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'

interface NodePosition {
  x: number
  y: number
}

interface NodePort {
  id: string
  type: 'input' | 'output'
  dataType: string
  connected: boolean
}

interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'data'
  title: string
  description: string
  position: NodePosition
  ports: {
    inputs: NodePort[]
    outputs: NodePort[]
  }
  config: Record<string, any>
  status: 'idle' | 'running' | 'success' | 'error' | 'waiting'
  category: string
  icon: React.ComponentType<any>
  color: string
}

interface NodeConnection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
  dataType: string // Added dataType for validation
}

interface WorkflowExecution {
  id: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  startTime: Date
  endTime?: Date
  executedNodes: string[]
  errors: Array<{
    nodeId: string
    message: string
    timestamp: Date
  }>
}

interface WorkflowPermissions {
  visibility: 'private' | 'team' | 'org' | 'public'
  allowedRoles: string[]
  allowedUsers: string[]
  canEdit: string[]
  canExecute: string[]
  canView: string[]
}

interface WorkflowMetadata {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  permissions: WorkflowPermissions
  tags: string[]
  category: string
  version: string
  versionHistory: WorkflowVersion[]
}

// MA7: Version control interfaces
interface WorkflowVersion {
  id: string
  version: string
  timestamp: Date
  createdBy: string
  description: string
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  metadata: Partial<WorkflowMetadata>
  isRollbackPoint: boolean
}

// MA9: Runtime logging interfaces
interface WorkflowLog {
  id: string
  executionId: string
  nodeId: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  data?: any
  duration?: number
}

// MA10: Webhook interfaces
interface WebhookEndpoint {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers: Record<string, string>
  enabled: boolean
  lastTriggered?: Date
  triggerCount: number
  secret?: string
}

export function MarathonWorkflowBuilder() {
  const { nextStep, updateWorkflowData } = useWorkflow()
  
  // Canvas state
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<WorkflowNode | null>(null)
  const [dragOffset, setDragOffset] = useState<NodePosition>({ x: 0, y: 0 })
  
  // Canvas interaction
  const [canvasScale, setCanvasScale] = useState(1)
  const [canvasOffset, setCanvasOffset] = useState<NodePosition>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<NodePosition>({ x: 0, y: 0 })
  
  // Workflow execution
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [executionMode, setExecutionMode] = useState<'realtime' | 'scheduled'>('realtime')
  const [scheduleConfig, setScheduleConfig] = useState('')
  
  // UI state
  const [showNodePalette, setShowNodePalette] = useState(true)
  const [showExecutionLogs, setShowExecutionLogs] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // MA7: Version control state
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [currentVersion, setCurrentVersion] = useState('1.0.0')
  
  // MA8: Testing state
  const [testMode, setTestMode] = useState(false)
  const [testNodeId, setTestNodeId] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any>(null)
  
  // MA9: Runtime logging state
  const [executionLogs, setExecutionLogs] = useState<WorkflowLog[]>([])
  const [logLevel, setLogLevel] = useState<'info' | 'warning' | 'error' | 'debug'>('info')
  
  // MA10: Webhook state
  const [webhookEndpoints, setWebhookEndpoints] = useState<WebhookEndpoint[]>([])
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  
  // MA71, MA72: Workflow permissions and metadata
  const [workflowMetadata, setWorkflowMetadata] = useState<WorkflowMetadata>({
    id: `workflow-${Date.now()}`,
    name: 'Untitled Workflow',
    description: '',
    createdBy: 'current-user', // Would come from auth context
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: {
      visibility: 'private',
      allowedRoles: ['admin', 'editor'],
      allowedUsers: [],
      canEdit: ['current-user'],
      canExecute: ['current-user'],
      canView: ['current-user']
    },
    tags: [],
    category: 'general',
    version: '1.0.0',
    versionHistory: []
  })
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<string>('editor') // Would come from auth context
  
  // MA72: RBAC permission checking functions
  const canUserPerformAction = (action: 'view' | 'edit' | 'execute'): boolean => {
    const permissions = workflowMetadata.permissions
    const currentUser = 'current-user' // Would come from auth context
    
    // Check if user has required role
    if (!permissions.allowedRoles.includes(currentUserRole)) {
      return false
    }
    
    // Check specific action permissions
    switch (action) {
      case 'view':
        return permissions.canView.includes(currentUser) || permissions.canView.includes('*')
      case 'edit':
        return permissions.canEdit.includes(currentUser) || permissions.canEdit.includes('*')
      case 'execute':
        return permissions.canExecute.includes(currentUser) || permissions.canExecute.includes('*')
      default:
        return false
    }
  }
  
  const updateWorkflowPermissions = (newPermissions: Partial<WorkflowPermissions>) => {
    setWorkflowMetadata(prev => ({
      ...prev,
      permissions: { ...prev.permissions, ...newPermissions },
      updatedAt: new Date()
    }))
  }
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const connectionRef = useRef<SVGPathElement>(null)

  // Connection drawing state
  const [connecting, setConnecting] = useState<{
    fromNodeId: string
    fromPortId: string
    fromPosition: NodePosition
    toPosition: NodePosition
  } | null>(null)

  // Node movement state
  const [movingNodeId, setMovingNodeId] = useState<string | null>(null)
  const [moveOffset, setMoveOffset] = useState<NodePosition>({ x: 0, y: 0 })

  // Node config panel state
  const [configPanelNodeId, setConfigPanelNodeId] = useState<string | null>(null)

  // Undo/redo state
  const [history, setHistory] = useState<{nodes: WorkflowNode[], connections: NodeConnection[]}[]>([])
  const [future, setFuture] = useState<{nodes: WorkflowNode[], connections: NodeConnection[]}[]>([])

  // Helper to push current state to history
  const pushHistory = useCallback(() => {
    setHistory(prev => [...prev, { nodes: nodes, connections: connections }])
    setFuture([])
  }, [nodes, connections])

  // Undo action
  const handleUndo = () => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setFuture(f => [{ nodes, connections }, ...f])
    setNodes(prev.nodes)
    setConnections(prev.connections)
    setHistory(h => h.slice(0, h.length - 1))
  }

  // Redo action
  const handleRedo = () => {
    if (future.length === 0) return
    const next = future[0]
    setHistory(h => [...h, { nodes, connections }])
    setNodes(next.nodes)
    setConnections(next.connections)
    setFuture(f => f.slice(1))
  }

  // Wrap all mutating actions to push history
  // Example: when adding, moving, deleting nodes or connections, call pushHistory() first
  // For example, in handleNodeMove, handleNodeConfigChange, handleConnectionCreate, etc.

  // Open config panel when node is selected
  useEffect(() => {
    if (selectedNode) setConfigPanelNodeId(selectedNode)
  }, [selectedNode])

  // MA72: Handler for updating node config with permission check
  const handleNodeConfigChange = (nodeId: string, updates: Partial<WorkflowNode>) => {
    // Check edit permissions
    if (!canUserPerformAction('edit')) {
      console.error('User does not have permission to edit this workflow')
      return
    }
    
    pushHistory() // Save state before change
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, ...updates } : n))
    
    // Update workflow metadata
    setWorkflowMetadata(prev => ({ ...prev, updatedAt: new Date() }))
  }

  // Helper to get port absolute position
  const getPortPosition = (node: WorkflowNode, portId: string, type: 'input' | 'output') => {
    const nodeEl = document.getElementById(`node-${node.id}`)
    const portEl = document.getElementById(`port-${portId}`)
    if (nodeEl && portEl && canvasRef.current) {
      const nodeRect = nodeEl.getBoundingClientRect()
      const portRect = portEl.getBoundingClientRect()
      const canvasRect = canvasRef.current.getBoundingClientRect()
      return {
        x: nodeRect.left - canvasRect.left + (portRect.left - nodeRect.left) + portRect.width / 2,
        y: nodeRect.top - canvasRect.top + (portRect.top - nodeRect.top) + portRect.height / 2
      }
    }
    return { x: node.position.x, y: node.position.y }
  }

  // Handle starting a connection from an output port
  const handleStartConnection = (nodeId: string, portId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    const pos = getPortPosition(node, portId, 'output')
    setConnecting({
      fromNodeId: nodeId,
      fromPortId: portId,
      fromPosition: pos,
      toPosition: pos
    })
  }

  // Handle moving the mouse while drawing a connection
  const handleMouseMove = (e: React.MouseEvent) => {
    if (connecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setConnecting({
        ...connecting,
        toPosition: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      })
    }
  }

  // Handle completing a connection to an input port
  const handleCompleteConnection = (toNodeId: string, toPortId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (connecting) {
      createConnection(connecting.fromNodeId, connecting.fromPortId, toNodeId, toPortId)
      setConnecting(null)
    }
  }

  // Cancel connection on canvas click
  const handleCanvasClick = () => {
    setConnecting(null)
  }

  // Start moving a node
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    setMovingNodeId(nodeId)
    setMoveOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    })
  }

  // Snap-to-grid helper
  const GRID_SIZE = 20
  const snapToGrid = (x: number, y: number) => ({
    x: Math.round(x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(y / GRID_SIZE) * GRID_SIZE,
  })

  // Update node movement to snap to grid
  const handleNodeMove = (e: React.MouseEvent) => {
    if (movingNodeId) {
      setNodes(prev => prev.map(n =>
        n.id === movingNodeId
          ? { ...n, position: snapToGrid(e.clientX - moveOffset.x, e.clientY - moveOffset.y) }
          : n
      ))
    }
    // Also update connection preview if connecting
    if (connecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setConnecting({
        ...connecting,
        toPosition: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      })
    }
  }

  // End node movement
  const handleNodeMouseUp = () => {
    setMovingNodeId(null)
  }

  // Node duplication handler
  const handleDuplicateNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    const newId = `${node.id}-copy-${Date.now()}`
    const offset = 40
    const newNode = {
      ...node,
      id: newId,
      position: { x: node.position.x + offset, y: node.position.y + offset },
      title: node.title ? `${node.title} (copy)` : '',
    }
    setNodes(prev => [...prev, newNode])
    pushHistory()
  }

  // Enhanced port connection validation
  const isValidConnection = (fromPort: NodePort, toPort: NodePort): boolean => {
    // Can't connect output to output or input to input
    if (fromPort.type === toPort.type) return false
    
    // Can't connect to already connected input
    if (toPort.type === 'input' && toPort.connected) return false
    
    // Data type compatibility check
    if (fromPort.dataType !== 'any' && toPort.dataType !== 'any' && fromPort.dataType !== toPort.dataType) {
      return false
    }
    
    return true
  }

  // Enhanced connection creation with validation
  const createConnection = (fromNodeId: string, fromPortId: string, toNodeId: string, toPortId: string) => {
    const fromNode = nodes.find(n => n.id === fromNodeId)
    const toNode = nodes.find(n => n.id === toNodeId)
    if (!fromNode || !toNode) return

    const fromPort = [...fromNode.ports.inputs, ...fromNode.ports.outputs].find(p => p.id === fromPortId)
    const toPort = [...toNode.ports.inputs, ...toNode.ports.outputs].find(p => p.id === toPortId)
    if (!fromPort || !toPort) return

    // Validate connection
    if (!isValidConnection(fromPort, toPort)) {
      console.warn('Invalid connection attempt:', { fromPort, toPort })
      return
    }

    // Create connection
    const newConnection: NodeConnection = {
      id: `${fromNodeId}-${fromPortId}-${toNodeId}-${toPortId}`,
      sourceNodeId: fromNodeId,
      sourcePortId: fromPortId,
      targetNodeId: toNodeId,
      targetPortId: toPortId,
      dataType: fromPort.dataType
    }

    // Update port states
    setNodes(prev => prev.map(node => {
      if (node.id === fromNodeId) {
        return {
          ...node,
          ports: {
            ...node.ports,
            outputs: node.ports.outputs.map(p => p.id === fromPortId ? { ...p, connected: true } : p)
          }
        }
      }
      if (node.id === toNodeId) {
        return {
          ...node,
          ports: {
            ...node.ports,
            inputs: node.ports.inputs.map(p => p.id === toPortId ? { ...p, connected: true } : p)
          }
        }
      }
      return node
    }))

    setConnections(prev => [...prev, newConnection])
    pushHistory()
  }

  // MA12: Canvas zoom and pan
  const handleZoom = (delta: number, clientX: number, clientY: number) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    const newScale = Math.max(0.1, Math.min(3, canvasScale + delta * 0.1))
    const scaleFactor = newScale / canvasScale
    
    setCanvasScale(newScale)
    setCanvasOffset({
      x: x - (x - canvasOffset.x) * scaleFactor,
      y: y - (y - canvasOffset.y) * scaleFactor
    })
  }

  const handlePanStart = (clientX: number, clientY: number) => {
    setIsPanning(true)
    setPanStart({ x: clientX - canvasOffset.x, y: clientY - canvasOffset.y })
  }

  const handlePanMove = (clientX: number, clientY: number) => {
    if (!isPanning) return
    setCanvasOffset({
      x: clientX - panStart.x,
      y: clientY - panStart.y
    })
  }

  const handlePanEnd = () => {
    setIsPanning(false)
  }

  // MA13: Add node from palette
  const addNodeToCanvas = (template: WorkflowNode, position: NodePosition) => {
    const newNode: WorkflowNode = {
      ...template,
      id: `${template.id}-${Date.now()}`,
      position: {
        x: (position.x - canvasOffset.x) / canvasScale,
        y: (position.y - canvasOffset.y) / canvasScale
      },
      ports: {
        inputs: template.ports.inputs.map(port => ({ ...port, id: `${port.id}-${Date.now()}` })),
        outputs: template.ports.outputs.map(port => ({ ...port, id: `${port.id}-${Date.now()}` }))
      }
    }
    
    setNodes(prev => [...prev, newNode])
  }

  // MA18, MA19: Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNode) {
        handleDeleteNode(selectedNode)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        handleUndo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        handleRedo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedNode) {
        e.preventDefault()
        handleDuplicateNode(selectedNode)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode])

  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId))
    setConnections(prev => prev.filter(c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId))
    setSelectedNode(null)
  }

  // MA6, MA72: Enhanced workflow execution with async, parallel path support, and RBAC
  const executeWorkflow = async () => {
    // MA72: Check execution permissions
    if (!canUserPerformAction('execute')) {
      console.error('User does not have permission to execute this workflow')
      return
    }
    
    setIsRunning(true)
    
    const newExecution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      status: 'running',
      startTime: new Date(),
      executedNodes: [],
      errors: []
    }
    
    setExecution(newExecution)
    
    // Reset all nodes to idle
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })))
    
    try {
      // Find trigger nodes to start execution
      const triggerNodes = nodes.filter(n => n.type === 'trigger')
      
      // MA6: Execute trigger nodes in parallel for async execution
      const triggerPromises = triggerNodes.map(trigger => 
        executeNodeWithBranching(trigger.id, {}, newExecution)
      )
      
      // Wait for all parallel trigger paths to complete
      await Promise.allSettled(triggerPromises)
      
      newExecution.status = newExecution.errors.length > 0 ? 'failed' : 'completed'
      newExecution.endTime = new Date()
      
    } catch (error) {
      newExecution.errors.push({
        nodeId: 'system',
        message: `Workflow execution failed: ${error}`,
        timestamp: new Date()
      })
      newExecution.status = 'failed'
      newExecution.endTime = new Date()
    } finally {
      setExecution(newExecution)
      setIsRunning(false)
      
      // Reset node statuses after 3 seconds
      setTimeout(() => {
        setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })))
      }, 3000)
    }
  }

  // Execute node with conditional branching support
  const executeNodeWithBranching = async (nodeId: string, inputData: any, execution: WorkflowExecution): Promise<any> => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    
    // Set node to running
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'running' } : n))
    execution.executedNodes.push(nodeId)
    
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    let outputData = inputData
    let outputPorts: string[] = []
    
    try {
      // Handle different node types
      switch (node.type) {
        case 'condition':
          const result = await executeConditionalNode(node, inputData, execution)
          outputData = result.data
          outputPorts = result.outputPorts
          break
        
        case 'action':
          outputData = await executeActionNode(node, inputData)
          outputPorts = node.ports.outputs.map(p => p.id)
          break
          
        case 'trigger':
          outputData = { ...inputData, triggered: true, timestamp: Date.now() }
          outputPorts = node.ports.outputs.map(p => p.id)
          break
          
        default:
          outputPorts = node.ports.outputs.map(p => p.id)
      }
      
      // Set node to success
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'success' } : n))
      
      // MA6: Execute connected nodes in parallel for each output port
      const executionPromises: Promise<any>[] = []
      
      for (const portId of outputPorts) {
        const connectedNodes = connections
          .filter(c => c.sourceNodeId === nodeId && c.sourcePortId === portId)
          .map(c => c.targetNodeId)
        
        // Execute all connected nodes in parallel
        const portPromises = connectedNodes.map(connectedNodeId => 
          executeNodeWithBranching(connectedNodeId, outputData, execution)
        )
        executionPromises.push(...portPromises)
      }
      
      // Wait for all parallel paths to complete
      if (executionPromises.length > 0) {
        await Promise.allSettled(executionPromises)
      }
      
      return outputData
    } catch (error) {
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'error' } : n))
      throw error
    }
  }

  // Execute conditional logic nodes
  const executeConditionalNode = async (node: WorkflowNode, inputData: any, execution: WorkflowExecution): Promise<{data: any, outputPorts: string[]}> => {
    switch (node.id) {
      case 'if-else':
        const condition = evaluateCondition(node.config.condition, inputData)
        return {
          data: inputData,
          outputPorts: condition ? ['true'] : ['false']
        }
      
      case 'switch':
        const value = inputData?.value || inputData
        const matchedCase = node.config.cases?.find((c: any) => c.value === value)
        return {
          data: inputData,
          outputPorts: matchedCase ? [`case${node.config.cases.indexOf(matchedCase) + 1}`] : ['default']
        }
      
      case 'for-loop':
        const array = inputData?.array || []
        const results = []
        for (let i = 0; i < array.length; i++) {
          const itemData = { ...inputData, item: array[i], index: i }
          results.push(itemData)
          // Execute connected nodes for each iteration
          const connectedNodes = connections
            .filter(c => c.sourceNodeId === node.id && c.sourcePortId === 'item')
            .map(c => c.targetNodeId)
          
          for (const connectedNodeId of connectedNodes) {
            await executeNodeWithBranching(connectedNodeId, itemData, execution)
          }
        }
        return {
          data: { ...inputData, results, completed: true },
          outputPorts: ['complete']
        }
      
      case 'while-loop':
        const maxIterations = node.config.maxIterations || 100
        let iteration = 0
        let currentData = inputData
        
        while (evaluateCondition(node.config.condition, currentData) && iteration < maxIterations) {
          const loopData = { ...currentData, iteration }
          
          // Execute connected loop nodes
          const loopConnections = connections
            .filter(c => c.sourceNodeId === node.id && c.sourcePortId === 'loop')
            .map(c => c.targetNodeId)
          
          for (const connectedNodeId of loopConnections) {
            currentData = await executeNodeWithBranching(connectedNodeId, loopData, execution)
          }
          
          iteration++
        }
        
        return {
          data: { ...currentData, iterations: iteration },
          outputPorts: ['exit']
        }
      
      default:
        return { data: inputData, outputPorts: node.ports.outputs.map(p => p.id) }
    }
  }

  // Simple condition evaluator
  const evaluateCondition = (condition: string, data: any): boolean => {
    try {
      // Simple evaluation - in production, use a safer evaluator
      const func = new Function('data', `return ${condition}`)
      return Boolean(func(data))
    } catch {
      return false
    }
  }

  // Execute action nodes
  const executeActionNode = async (node: WorkflowNode, inputData: any): Promise<any> => {
    // Simulate action execution
    const result = { ...inputData, processed: true, nodeId: node.id }
    return result
  }

  const handleComplete = () => {
    updateWorkflowData({
      totalNodes: nodes.length,
      totalConnections: connections.length,
      hasExecuted: execution !== null,
      executionMode
    })
    nextStep()
  }

  // MA7: Version control functions
  const createVersion = (description: string, isRollbackPoint: boolean = false) => {
    const newVersion: WorkflowVersion = {
      id: `version-${Date.now()}`,
      version: incrementVersion(currentVersion),
      timestamp: new Date(),
      createdBy: 'current-user',
      description,
      nodes: [...nodes],
      connections: [...connections],
      metadata: { ...workflowMetadata },
      isRollbackPoint
    }
    
    setWorkflowMetadata(prev => ({
      ...prev,
      version: newVersion.version,
      versionHistory: [...prev.versionHistory, newVersion]
    }))
    
    setCurrentVersion(newVersion.version)
    return newVersion
  }

  const incrementVersion = (version: string): string => {
    const parts = version.split('.')
    const major = parseInt(parts[0])
    const minor = parseInt(parts[1])
    const patch = parseInt(parts[2])
    return `${major}.${minor}.${patch + 1}`
  }

  const rollbackToVersion = (versionId: string) => {
    const targetVersion = workflowMetadata.versionHistory.find(v => v.id === versionId)
    if (!targetVersion) return
    
    setNodes([...targetVersion.nodes])
    setConnections([...targetVersion.connections])
    setWorkflowMetadata(prev => ({
      ...prev,
      version: targetVersion.version,
      updatedAt: new Date()
    }))
    setCurrentVersion(targetVersion.version)
  }

  // MA8: Testing functions
  const testIndividualNode = async (nodeId: string, testData: any = {}) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    
    setTestMode(true)
    setTestNodeId(nodeId)
    
    try {
      const startTime = Date.now()
      let result: any
      
      switch (node.type) {
        case 'trigger':
          result = { triggered: true, timestamp: Date.now(), ...testData }
          break
        case 'action':
          result = await executeActionNode(node, testData)
          break
        case 'condition':
          const conditionResult = await executeConditionalNode(node, testData, {
            id: 'test-execution',
            status: 'running',
            startTime: new Date(),
            executedNodes: [],
            errors: []
          })
          result = conditionResult.data
          break
        default:
          result = { ...testData, processed: true }
      }
      
      const duration = Date.now() - startTime
      
      setTestResults({
        success: true,
        duration,
        input: testData,
        output: result,
        nodeId,
        timestamp: new Date()
      })
      
      // Add to logs
      addExecutionLog('info', `Node test completed: ${node.title}`, {
        nodeId,
        duration,
        success: true
      })
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setTestResults({
        success: false,
        error: errorMessage,
        nodeId,
        timestamp: new Date()
      })
      
      addExecutionLog('error', `Node test failed: ${node.title}`, {
        nodeId,
        error: errorMessage
      })
    } finally {
      setTestMode(false)
    }
  }

  const testEntireWorkflow = async (testData: any = {}) => {
    setTestMode(true)
    
    try {
      const testExecution: WorkflowExecution = {
        id: `test-${Date.now()}`,
        status: 'running',
        startTime: new Date(),
        executedNodes: [],
        errors: []
      }
      
      // Execute workflow with test data
      await executeWorkflow()
      
      setTestResults({
        success: execution?.status === 'completed',
        execution: execution,
        timestamp: new Date()
      })
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setTestResults({
        success: false,
        error: errorMessage,
        timestamp: new Date()
      })
    } finally {
      setTestMode(false)
    }
  }

  // MA9: Runtime logging functions
  const addExecutionLog = (level: 'info' | 'warning' | 'error' | 'debug', message: string, data?: any) => {
    const log: WorkflowLog = {
      id: `log-${Date.now()}`,
      executionId: execution?.id || 'manual',
      nodeId: 'system',
      timestamp: new Date(),
      level,
      message,
      data
    }
    
    setExecutionLogs(prev => [...prev, log])
  }

  const clearLogs = () => {
    setExecutionLogs([])
  }

  const exportLogs = () => {
    const logData = executionLogs.map(log => ({
      ...log,
      timestamp: log.timestamp.toISOString()
    }))
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workflow-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // MA10: Webhook functions
  const createWebhookEndpoint = (endpoint: Omit<WebhookEndpoint, 'id' | 'triggerCount'>) => {
    const newEndpoint: WebhookEndpoint = {
      ...endpoint,
      id: `webhook-${Date.now()}`,
      triggerCount: 0
    }
    
    setWebhookEndpoints(prev => [...prev, newEndpoint])
    return newEndpoint
  }

  const triggerWebhook = async (endpointId: string, data: any) => {
    const endpoint = webhookEndpoints.find(w => w.id === endpointId)
    if (!endpoint || !endpoint.enabled) return
    
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...endpoint.headers
        },
        body: endpoint.method !== 'GET' ? JSON.stringify(data) : undefined
      })
      
      // Update trigger count and last triggered
      setWebhookEndpoints(prev => prev.map(w => 
        w.id === endpointId 
          ? { ...w, triggerCount: w.triggerCount + 1, lastTriggered: new Date() }
          : w
      ))
      
      addExecutionLog('info', `Webhook triggered: ${endpoint.name}`, {
        endpointId,
        status: response.status,
        success: response.ok
      })
      
      return response.ok
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addExecutionLog('error', `Webhook failed: ${endpoint.name}`, {
        endpointId,
        error: errorMessage
      })
      return false
    }
  }

  const deleteWebhookEndpoint = (endpointId: string) => {
    setWebhookEndpoints(prev => prev.filter(w => w.id !== endpointId))
  }

  // Ensure nodeTemplates is defined and typed
  const nodeTemplates: Record<string, WorkflowNode[]> = {
    triggers: [
      {
        id: 'memory-created',
        type: 'trigger',
        title: 'Memory Created',
        description: 'Triggers when a new memory is created',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [],
          outputs: [
            { id: 'memory', type: 'output', dataType: 'object', connected: false }
          ]
        },
        config: {
          eventType: 'memory.created',
          filters: {
            memoryType: 'any',
            tags: []
          }
        },
        status: 'idle',
        category: 'triggers',
        icon: DocumentTextIcon,
        color: 'bg-blue-500'
      },
      {
        id: 'note-tagged',
        type: 'trigger',
        title: 'Note Tagged',
        description: 'Triggers when a note is tagged with specific tags',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [],
          outputs: [
            { id: 'note', type: 'output', dataType: 'object', connected: false },
            { id: 'tags', type: 'output', dataType: 'array', connected: false }
          ]
        },
        config: {
          eventType: 'note.tagged',
          filters: {
            tags: ['important', 'review'],
            matchType: 'any'
          }
        },
        status: 'idle',
        category: 'triggers',
        icon: DocumentTextIcon,
        color: 'bg-green-500'
      },
      {
        id: 'file-uploaded',
        type: 'trigger',
        title: 'File Uploaded',
        description: 'Triggers when a file is uploaded to the system',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [],
          outputs: [
            { id: 'file', type: 'output', dataType: 'object', connected: false },
            { id: 'metadata', type: 'output', dataType: 'object', connected: false }
          ]
        },
        config: {
          eventType: 'file.uploaded',
          filters: {
            fileTypes: ['pdf', 'txt', 'md'],
            maxSize: 10485760 // 10MB
          }
        },
        status: 'idle',
        category: 'triggers',
        icon: DocumentTextIcon,
        color: 'bg-purple-500'
      },
      {
        id: 'schedule-trigger',
        type: 'trigger',
        title: 'Schedule Trigger',
        description: 'Triggers on a specific schedule or time interval',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [],
          outputs: [
            { id: 'timestamp', type: 'output', dataType: 'number', connected: false }
          ]
        },
        config: {
          eventType: 'schedule.trigger',
          schedule: {
            type: 'recurring',
            interval: 'daily',
            time: '09:00'
          }
        },
        status: 'idle',
        category: 'triggers',
        icon: ClockIcon,
        color: 'bg-orange-500'
      },
      {
        id: 'webhook-trigger',
        type: 'trigger',
        title: 'Webhook Trigger',
        description: 'Triggers when a webhook endpoint receives data',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [],
          outputs: [
            { id: 'payload', type: 'output', dataType: 'object', connected: false },
            { id: 'headers', type: 'output', dataType: 'object', connected: false }
          ]
        },
        config: {
          eventType: 'webhook.received',
          endpoint: '/webhook/marathon',
          method: 'POST',
          authentication: 'token'
        },
        status: 'idle',
        category: 'triggers',
        icon: BoltIcon,
        color: 'bg-yellow-500'
      }
    ],
    actions: [
      {
        id: 'create-note',
        type: 'action',
        title: 'Create Note in Notebook',
        description: 'Creates a new note in a specified notebook section',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'title', type: 'input', dataType: 'string', connected: false },
            { id: 'content', type: 'input', dataType: 'string', connected: false },
            { id: 'section', type: 'input', dataType: 'string', connected: false }
          ],
          outputs: [
            { id: 'note', type: 'output', dataType: 'object', connected: false },
            { id: 'success', type: 'output', dataType: 'boolean', connected: false }
          ]
        },
        config: {
          notebookId: '',
          sectionId: '',
          defaultTitle: 'New Note',
          tags: [],
          template: 'basic'
        },
        status: 'idle',
        category: 'actions',
        icon: DocumentTextIcon,
        color: 'bg-blue-500'
      },
      {
        id: 'tag-memory',
        type: 'action',
        title: 'Tag Memory',
        description: 'Adds tags to a memory with dynamic input from prior node',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'memory', type: 'input', dataType: 'object', connected: false },
            { id: 'tags', type: 'input', dataType: 'array', connected: false },
            { id: 'metadata', type: 'input', dataType: 'object', connected: false }
          ],
          outputs: [
            { id: 'taggedMemory', type: 'output', dataType: 'object', connected: false },
            { id: 'success', type: 'output', dataType: 'boolean', connected: false }
          ]
        },
        config: {
          defaultTags: ['workflow-generated'],
          overwriteExisting: false,
          tagSource: 'dynamic', // 'static', 'dynamic', or 'mixed'
          staticTags: []
        },
        status: 'idle',
        category: 'actions',
        icon: DocumentTextIcon,
        color: 'bg-purple-500'
      },
      {
        id: 'send-notification',
        type: 'action',
        title: 'Send Notification',
        description: 'Sends push, email, and in-app notifications',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'message', type: 'input', dataType: 'string', connected: false },
            { id: 'recipients', type: 'input', dataType: 'array', connected: false },
            { id: 'metadata', type: 'input', dataType: 'object', connected: false }
          ],
          outputs: [
            { id: 'sent', type: 'output', dataType: 'object', connected: false },
            { id: 'failed', type: 'output', dataType: 'object', connected: false }
          ]
        },
        config: {
          channels: ['push', 'email', 'in-app'],
          priority: 'normal', // 'low', 'normal', 'high', 'critical'
          template: 'default',
          schedule: 'immediate',
          retryCount: 3
        },
        status: 'idle',
        category: 'actions',
        icon: EnvelopeIcon,
        color: 'bg-red-500'
      },
      {
        id: 'action-print',
        type: 'action',
        title: 'Print Message',
        description: 'Outputs a message to the console.',
        position: { x: 100, y: 300 },
        ports: { inputs: [{ id: 'input-1', type: 'input', dataType: 'String', connected: false }], outputs: [] },
        config: { message: 'Hello, World!' },
        status: 'idle',
        category: 'actions',
        icon: BoltIcon,
        color: 'bg-green-500'
      },
      {
        id: 'action-api-call',
        type: 'action',
        title: 'API Call',
        description: 'Makes an HTTP request to a specified URL.',
        position: { x: 100, y: 400 },
        ports: { inputs: [{ id: 'input-1', type: 'input', dataType: 'String', connected: false }], outputs: [] },
        config: { url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
        status: 'idle',
        category: 'actions',
        icon: EnvelopeIcon,
        color: 'bg-purple-500'
      }
    ],
    ai: [
      {
        id: 'summarize-memory',
        type: 'action',
        title: 'Summarize Memory',
        description: 'Uses AI to generate a summary of memory content',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'memory', type: 'input', dataType: 'object', connected: false },
            { id: 'options', type: 'input', dataType: 'object', connected: false }
          ],
          outputs: [
            { id: 'summary', type: 'output', dataType: 'string', connected: false },
            { id: 'metadata', type: 'output', dataType: 'object', connected: false }
          ]
        },
        config: {
          llmEngine: 'gpt-4', // 'gpt-4', 'claude-3', 'gemini-pro'
          summaryLength: 'medium', // 'short', 'medium', 'long'
          tone: 'neutral', // 'neutral', 'formal', 'casual'
          includeKeyPoints: true,
          includeEntities: false
        },
        status: 'idle',
        category: 'ai',
        icon: BoltIcon,
        color: 'bg-indigo-500'
      },
      {
        id: 'ask-mere',
        type: 'action',
        title: 'Ask Mere',
        description: 'Sends a prompt to Mere AI with chaining support',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'prompt', type: 'input', dataType: 'string', connected: false },
            { id: 'context', type: 'input', dataType: 'object', connected: false },
            { id: 'previousResponse', type: 'input', dataType: 'string', connected: false }
          ],
          outputs: [
            { id: 'response', type: 'output', dataType: 'string', connected: false },
            { id: 'metadata', type: 'output', dataType: 'object', connected: false },
            { id: 'citations', type: 'output', dataType: 'array', connected: false }
          ]
        },
        config: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 1000,
          enableChaining: true,
          includeMemoryContext: true,
          systemPrompt: ''
        },
        status: 'idle',
        category: 'ai',
        icon: UserIcon,
        color: 'bg-teal-500'
      },
      {
        id: 'generate-summary',
        type: 'action',
        title: 'Generate Summary',
        description: 'Creates AI-powered summaries with LLM selection',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'content', type: 'input', dataType: 'string', connected: false },
            { id: 'instructions', type: 'input', dataType: 'string', connected: false }
          ],
          outputs: [
            { id: 'summary', type: 'output', dataType: 'string', connected: false },
            { id: 'keyPoints', type: 'output', dataType: 'array', connected: false }
          ]
        },
        config: {
          llmEngine: 'gpt-4',
          outputFormat: 'paragraph', // 'paragraph', 'bullets', 'structured'
          focusAreas: [],
          wordLimit: 200
        },
        status: 'idle',
        category: 'ai',
        icon: BoltIcon,
        color: 'bg-cyan-500'
      }
    ],
    data: [
      {
        id: 'set-variable',
        type: 'data',
        title: 'Set Variable',
        description: 'Stores temporary data for use in the workflow',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'value', type: 'input', dataType: 'any', connected: false },
            { id: 'name', type: 'input', dataType: 'string', connected: false }
          ],
          outputs: [
            { id: 'variable', type: 'output', dataType: 'any', connected: false }
          ]
        },
        config: {
          variableName: '',
          variableType: 'string', // 'string', 'number', 'boolean', 'object', 'array'
          persistent: false,
          scope: 'workflow' // 'workflow', 'global', 'session'
        },
        status: 'idle',
        category: 'data',
        icon: CubeIcon,
        color: 'bg-gray-500'
      },
      {
        id: 'merge-streams',
        type: 'data',
        title: 'Merge Streams',
        description: 'Combines multiple data streams with field selection',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'stream1', type: 'input', dataType: 'object', connected: false },
            { id: 'stream2', type: 'input', dataType: 'object', connected: false },
            { id: 'stream3', type: 'input', dataType: 'object', connected: false }
          ],
          outputs: [
            { id: 'merged', type: 'output', dataType: 'object', connected: false }
          ]
        },
        config: {
          mergeStrategy: 'combine', // 'combine', 'overwrite', 'append'
          fieldMapping: {},
          conflictResolution: 'last-wins', // 'first-wins', 'last-wins', 'merge-arrays'
          includeMetadata: true
        },
        status: 'idle',
        category: 'data',
        icon: ArrowPathIcon,
        color: 'bg-orange-500'
      },
      {
        id: 'filter-by-field',
        type: 'data',
        title: 'Filter By Field',
        description: 'Filters data based on conditional expressions',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'data', type: 'input', dataType: 'array', connected: false },
            { id: 'condition', type: 'input', dataType: 'string', connected: false }
          ],
          outputs: [
            { id: 'filtered', type: 'output', dataType: 'array', connected: false },
            { id: 'rejected', type: 'output', dataType: 'array', connected: false }
          ]
        },
        config: {
          filterExpression: '',
          outputRejected: false,
          caseSensitive: true,
          allowEmpty: false
        },
        status: 'idle',
        category: 'data',
        icon: WrenchScrewdriverIcon,
        color: 'bg-yellow-500'
      }
    ],
    integrations: [
      {
        id: 'http-request',
        type: 'action',
        title: 'HTTP Request',
        description: 'Makes HTTP requests to external APIs',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'url', type: 'input', dataType: 'string', connected: false },
            { id: 'method', type: 'input', dataType: 'string', connected: false },
            { id: 'headers', type: 'input', dataType: 'object', connected: false },
            { id: 'body', type: 'input', dataType: 'object', connected: false }
          ],
          outputs: [
            { id: 'response', type: 'output', dataType: 'object', connected: false },
            { id: 'error', type: 'output', dataType: 'object', connected: false }
          ]
        },
        config: {
          method: 'GET',
          timeout: 30000,
          retryCount: 3,
          followRedirects: true,
          validateSSL: true,
          authentication: {
            type: 'none', // 'none', 'bearer', 'basic', 'api-key'
            credentials: {}
          }
        },
        status: 'idle',
        category: 'integrations',
        icon: BoltIcon,
        color: 'bg-green-600'
      }
    ],
    conditions: [
      {
        id: 'if-else',
        type: 'condition',
        title: 'If/Else',
        description: 'Branch execution based on condition',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'condition', type: 'input', dataType: 'boolean', connected: false },
            { id: 'data', type: 'input', dataType: 'any', connected: false }
          ],
          outputs: [
            { id: 'true', type: 'output', dataType: 'any', connected: false },
            { id: 'false', type: 'output', dataType: 'any', connected: false }
          ]
        },
        config: {
          condition: 'data.value > 10',
          description: 'Branch execution based on condition'
        },
        status: 'idle',
        category: 'conditions',
        icon: AdjustmentsHorizontalIcon,
        color: 'bg-orange-500'
      },
      {
        id: 'switch',
        type: 'condition',
        title: 'Switch',
        description: 'Multi-branch execution based on value',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'value', type: 'input', dataType: 'any', connected: false }
          ],
          outputs: [
            { id: 'case1', type: 'output', dataType: 'any', connected: false },
            { id: 'case2', type: 'output', dataType: 'any', connected: false },
            { id: 'default', type: 'output', dataType: 'any', connected: false }
          ]
        },
        config: {
          cases: [
            { value: 'option1', label: 'Case 1' },
            { value: 'option2', label: 'Case 2' }
          ],
          description: 'Multi-branch execution based on value'
        },
        status: 'idle',
        category: 'conditions',
        icon: AdjustmentsHorizontalIcon,
        color: 'bg-orange-500'
      },
      {
        id: 'for-loop',
        type: 'condition',
        title: 'For Loop',
        description: 'Iterate over array items',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'array', type: 'input', dataType: 'array', connected: false }
          ],
          outputs: [
            { id: 'item', type: 'output', dataType: 'any', connected: false },
            { id: 'complete', type: 'output', dataType: 'array', connected: false }
          ]
        },
        config: {
          variable: 'item',
          description: 'Iterate over array items'
        },
        status: 'idle',
        category: 'conditions',
        icon: ArrowPathIcon,
        color: 'bg-purple-500'
      },
      {
        id: 'while-loop',
        type: 'condition',
        title: 'While Loop',
        description: 'Loop while condition is true',
        position: { x: 0, y: 0 },
        ports: {
          inputs: [
            { id: 'condition', type: 'input', dataType: 'boolean', connected: false },
            { id: 'data', type: 'input', dataType: 'any', connected: false }
          ],
          outputs: [
            { id: 'loop', type: 'output', dataType: 'any', connected: false },
            { id: 'exit', type: 'output', dataType: 'any', connected: false }
          ]
        },
        config: {
          condition: 'data.count < 10',
          maxIterations: 100,
          description: 'Loop while condition is true'
        },
        status: 'idle',
        category: 'conditions',
        icon: ArrowPathIcon,
        color: 'bg-purple-500'
      }
    ]
  }

  // MA4: Scheduling state
  const [scheduledWorkflows, setScheduledWorkflows] = useState<ScheduledWorkflow[]>([])
  const [showScheduler, setShowScheduler] = useState(false)

  interface ScheduledWorkflow {
    id: string
    name: string
    schedule: {
      type: 'once' | 'recurring'
      datetime?: Date
      interval?: 'hourly' | 'daily' | 'weekly' | 'monthly'
      cron?: string
    }
    enabled: boolean
    lastRun?: Date
    nextRun?: Date
  }

  // Schedule workflow execution
  const scheduleWorkflow = (schedule: ScheduledWorkflow['schedule']) => {
    const newSchedule: ScheduledWorkflow = {
      id: `schedule-${Date.now()}`,
      name: `Workflow Schedule ${scheduledWorkflows.length + 1}`,
      schedule,
      enabled: true,
      nextRun: calculateNextRun(schedule)
    }
    
    setScheduledWorkflows(prev => [...prev, newSchedule])
    setShowScheduler(false)
  }

  // Calculate next run time
  const calculateNextRun = (schedule: ScheduledWorkflow['schedule']): Date => {
    const now = new Date()
    
    if (schedule.type === 'once' && schedule.datetime) {
      return schedule.datetime
    }
    
    if (schedule.type === 'recurring' && schedule.interval) {
      switch (schedule.interval) {
        case 'hourly':
          return new Date(now.getTime() + 60 * 60 * 1000)
        case 'daily':
          return new Date(now.getTime() + 24 * 60 * 60 * 1000)
        case 'weekly':
          return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        case 'monthly':
          return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        default:
          return new Date(now.getTime() + 60 * 60 * 1000)
      }
    }
    
    return new Date(now.getTime() + 60 * 60 * 1000)
  }

  // Check and execute scheduled workflows
  useEffect(() => {
    const checkSchedules = () => {
      const now = new Date()
      
      scheduledWorkflows.forEach(schedule => {
        if (schedule.enabled && schedule.nextRun && schedule.nextRun <= now) {
          // Execute workflow
          executeWorkflow()
          
          // Update schedule
          setScheduledWorkflows(prev => prev.map(s => 
            s.id === schedule.id 
              ? {
                  ...s,
                  lastRun: now,
                  nextRun: schedule.schedule.type === 'recurring' 
                    ? calculateNextRun(schedule.schedule)
                    : undefined
                }
              : s
          ))
        }
      })
    }
    
    const interval = setInterval(checkSchedules, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [scheduledWorkflows])

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Marathon - Visual Workflow Builder</h2>
            <p className="text-sm text-gray-600">Create powerful automation flows with drag-and-drop nodes</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Execution Mode */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Mode:</label>
              <select
                value={executionMode}
                onChange={(e) => setExecutionMode(e.target.value as 'realtime' | 'scheduled')}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="realtime">Real-time</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={executeWorkflow}
                disabled={isRunning || nodes.length === 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                {isRunning ? 'Running...' : 'Run Workflow'}
              </button>
              
              {/* MA8: Testing Controls */}
              <button
                onClick={() => testEntireWorkflow()}
                disabled={isRunning || nodes.length === 0}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Test Workflow
              </button>
              
              {/* MA7: Version Control */}
              <button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                Versions
              </button>
              
              {/* MA10: Webhooks */}
              <button
                onClick={() => setShowWebhookModal(!showWebhookModal)}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <BoltIcon className="h-4 w-4 mr-2" />
                Webhooks
              </button>
              
              <button
                onClick={() => setShowExecutionLogs(!showExecutionLogs)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Logs
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        {showNodePalette && (
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Node Palette</h3>
                <button
                  onClick={() => setShowNodePalette(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="triggers">Triggers</option>
                <option value="actions">Actions</option>
                <option value="conditions">Conditions</option>
                <option value="data">Data</option>
              </select>
            </div>
            
            {/* Node Templates */}
            <div className="p-4 space-y-4">
              {Object.entries(nodeTemplates).map(([category, templates]: [string, WorkflowNode[]]) => {
                if (selectedCategory !== 'all' && selectedCategory !== category) return null
                
                return (
                  <div key={category}>
                    <h4 className="font-medium text-gray-900 mb-2 capitalize">{category}</h4>
                    <div className="space-y-2">
                      {templates.map((template: WorkflowNode) => (
                        <div
                          key={template.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedNode(template)
                            e.dataTransfer.effectAllowed = 'copy'
                          }}
                          className="p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded ${template.color}`}>
                              <template.icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900">{template.title}</p>
                              <p className="text-xs text-gray-500 truncate">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden"
          onMouseMove={(e) => { handleNodeMove(e); handleMouseMove(e); }}
          onMouseUp={handleNodeMouseUp}
          onClick={handleCanvasClick}
        >
          <div
            ref={canvasRef}
            className="w-full h-full bg-gray-50 relative cursor-grab"
            onDrop={(e) => {
              e.preventDefault()
              if (draggedNode) {
                const rect = canvasRef.current!.getBoundingClientRect()
                const canvasX = e.clientX - rect.left
                const canvasY = e.clientY - rect.top
                const pos = snapToGrid(canvasX, canvasY)
                addNodeToCanvas(draggedNode, pos)
                setDraggedNode(null)
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onMouseDown={(e) => {
              if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse or Alt+click
                handlePanStart(e.clientX, e.clientY)
              }
            }}
            onMouseMove={(e) => handlePanMove(e.clientX, e.clientY)}
            onMouseUp={handlePanEnd}
            onWheel={(e) => {
              e.preventDefault()
              handleZoom(-e.deltaY / 1000, e.clientX, e.clientY)
            }}
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Grid Background */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})` }}
            >
              <defs>
                <pattern
                  id="grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
              <div
                key={node.id}
                id={`node-${node.id}`}
                className={`absolute bg-white border-2 rounded-lg shadow-sm cursor-pointer transition-all ${
                  selectedNode === node.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                } ${node.status === 'running' ? 'animate-pulse' : ''}`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: 200,
                  minHeight: 80,
                  zIndex: movingNodeId === node.id ? 10 : 1
                }}
                onClick={() => setSelectedNode(node.id)}
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              >
                {/* Node Header */}
                <div className={`p-3 rounded-t-lg ${node.color} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <node.icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{node.title}</span>
                    </div>
                    {/* Status Indicator */}
                    <div className="flex items-center space-x-1">
                      {node.status === 'running' && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      )}
                      {node.status === 'success' && (
                        <CheckCircleIcon className="h-4 w-4 text-green-400" />
                      )}
                      {node.status === 'error' && (
                        <XMarkIcon className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
                {/* Node Body */}
                <div className="p-3">
                  <p className="text-xs text-gray-600 mb-3">{node.description}</p>
                  {/* Input Ports */}
                  {node.ports.inputs.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Inputs:</p>
                      {node.ports.inputs.map(port => (
                        <div key={port.id} id={`port-${port.id}`}
                          className="flex items-center text-xs text-gray-600 mb-1"
                          onMouseUp={connecting ? (e) => handleCompleteConnection(node.id, port.id, e) : undefined}
                          style={{ cursor: connecting ? 'pointer' : 'default' }}
                        >
                          <div className={`w-3 h-3 rounded-full mr-2 border-2 ${
                            port.connected ? 'bg-green-500 border-green-700' : 'bg-gray-300 border-gray-400'
                          }`} />
                          {port.dataType}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Output Ports */}
                  {node.ports.outputs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Outputs:</p>
                      {node.ports.outputs.map(port => (
                        <div key={port.id} id={`port-${port.id}`}
                          className="flex items-center text-xs text-gray-600 mb-1"
                          onMouseDown={(e) => handleStartConnection(node.id, port.id, e)}
                          style={{ cursor: 'crosshair' }}
                        >
                          <div className={`w-3 h-3 rounded-full mr-2 border-2 ${
                            port.connected ? 'bg-green-500 border-green-700' : 'bg-gray-300 border-gray-400'
                          }`} />
                          {port.dataType}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Render connections as SVG paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {connections.map(conn => {
                const fromNode = nodes.find(n => n.id === conn.sourceNodeId)
                const toNode = nodes.find(n => n.id === conn.targetNodeId)
                if (!fromNode || !toNode) return null
                const fromPort = fromNode.ports.outputs.find(p => p.id === conn.sourcePortId)
                const toPort = toNode.ports.inputs.find(p => p.id === conn.targetPortId)
                if (!fromPort || !toPort) return null
                const fromPos = getPortPosition(fromNode, fromPort.id, 'output')
                const toPos = getPortPosition(toNode, toPort.id, 'input')
                const path = `M${fromPos.x},${fromPos.y} C${fromPos.x+50},${fromPos.y} ${toPos.x-50},${toPos.y} ${toPos.x},${toPos.y}`
                return (
                  <path key={conn.id} d={path} stroke="#6366f1" strokeWidth={3} fill="none" markerEnd="url(#arrowhead)" />
                )
              })}
              {/* Arrowhead marker */}
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#6366f1" />
                </marker>
              </defs>
              {/* Draw connection in progress */}
              {connecting && (
                <path d={`M${connecting.fromPosition.x},${connecting.fromPosition.y} C${connecting.fromPosition.x+50},${connecting.fromPosition.y} ${connecting.toPosition.x-50},${connecting.toPosition.y} ${connecting.toPosition.x},${connecting.toPosition.y}`}
                  stroke="#6366f1" strokeWidth={2} fill="none" strokeDasharray="4 2" />
              )}
            </svg>
          </div>

          {/* Canvas Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
            <button
              onClick={() => setCanvasScale(1)}
              className="px-3 py-2 bg-white border border-gray-300 rounded shadow text-sm hover:bg-gray-50"
            >
              Reset Zoom
            </button>
            <button
              onClick={() => setShowNodePalette(!showNodePalette)}
              className="px-3 py-2 bg-white border border-gray-300 rounded shadow text-sm hover:bg-gray-50"
            >
              {showNodePalette ? 'Hide' : 'Show'} Palette
            </button>
          </div>

          {/* Zoom Indicator */}
          <div className="absolute bottom-4 left-4 px-3 py-2 bg-white border border-gray-300 rounded shadow text-sm">
            {Math.round(canvasScale * 100)}%
          </div>
        </div>
      </div>

      {/* Execution Logs */}
      {showExecutionLogs && execution && (
        <div className="bg-white border-t p-4 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Execution Log</h3>
            <button
              onClick={() => setShowExecutionLogs(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span>Status: <span className={`font-medium ${
                execution.status === 'completed' ? 'text-green-600' :
                execution.status === 'failed' ? 'text-red-600' :
                execution.status === 'running' ? 'text-blue-600' : 'text-gray-600'
              }`}>{execution.status}</span></span>
              <span>Duration: {execution.endTime ? 
                `${Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)}s` : 
                'Running...'
              }</span>
            </div>
            
            <div>
              <p className="font-medium text-gray-700">Executed Nodes: {execution.executedNodes.length}</p>
              {execution.errors.map((error, index) => (
                <div key={index} className="text-red-600 text-xs mt-1">
                  Node {error.nodeId}: {error.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Execution Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={executeWorkflow}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          <PlayIcon className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Run Workflow'}
        </button>
        
        <button
          onClick={() => setShowScheduler(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <ClockIcon className="w-4 h-4" />
          Schedule
        </button>
        
        {scheduledWorkflows.length > 0 && (
          <div className="text-sm text-gray-600">
            {scheduledWorkflows.filter(s => s.enabled).length} scheduled
          </div>
        )}
      </div>

      {/* Scheduler Modal */}
      {showScheduler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Schedule Workflow</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Schedule Type</label>
                <select className="w-full p-2 border rounded">
                  <option value="once">Run Once</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Interval</label>
                <select className="w-full p-2 border rounded">
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => scheduleWorkflow({ type: 'recurring', interval: 'daily' })}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Schedule
                </button>
                <button
                  onClick={() => setShowScheduler(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Workflows List */}
      {scheduledWorkflows.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Scheduled Workflows</h3>
          <div className="space-y-2">
            {scheduledWorkflows.map(schedule => (
              <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{schedule.name}</div>
                  <div className="text-sm text-gray-600">
                    {schedule.schedule.type} - {schedule.schedule.interval}
                    {schedule.nextRun && ` (Next: ${schedule.nextRun.toLocaleString()})`}
                  </div>
                </div>
                <button
                  onClick={() => setScheduledWorkflows(prev => prev.filter(s => s.id !== schedule.id))}
                  className="text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Node Configuration Panel */}
      {configPanelNodeId && (
        <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-50 p-6 flex flex-col">
          <button className="self-end text-gray-400 hover:text-gray-700" onClick={() => setConfigPanelNodeId(null)}>
            ×
          </button>
          <h2 className="text-xl font-bold mb-4">Node Configuration</h2>
          {(() => {
            const node = nodes.find(n => n.id === configPanelNodeId)
            if (!node) return <div>Node not found</div>
            return (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Label</label>
                  <input
                    className="mt-1 block w-full border rounded px-2 py-1"
                    value={node.title || ''}
                    onChange={e => handleNodeConfigChange(node.id, { title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <input
                    className="mt-1 block w-full border rounded px-2 py-1"
                    value={node.description || ''}
                    onChange={e => handleNodeConfigChange(node.id, { description: e.target.value })}
                  />
                </div>
                {node.config && Object.keys(node.config).map(key => (
                  <div key={key}>
                    <label className="block text-sm font-medium">{key}</label>
                    <input
                      className="mt-1 block w-full border rounded px-2 py-1"
                      value={node.config[key]}
                      onChange={e => handleNodeConfigChange(node.id, { config: { ...node.config, [key]: e.target.value } })}
                    />
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {/* MA7: Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Version History</h3>
              <button onClick={() => setShowVersionHistory(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Version description"
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                  id="version-description"
                />
                <button
                  onClick={() => {
                    const description = (document.getElementById('version-description') as HTMLInputElement)?.value || 'New version'
                    createVersion(description, true)
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Version
                </button>
              </div>
              
              <div className="space-y-2">
                {workflowMetadata.versionHistory.map(version => (
                  <div key={version.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">v{version.version}</div>
                      <div className="text-sm text-gray-600">{version.description}</div>
                      <div className="text-xs text-gray-500">{version.timestamp.toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      {version.isRollbackPoint && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Rollback Point</span>
                      )}
                      <button
                        onClick={() => rollbackToVersion(version.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Rollback
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MA8: Testing Results Modal */}
      {testResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Test Results</h3>
              <button onClick={() => setTestResults(null)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className={`p-3 rounded ${testResults.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="font-medium">{testResults.success ? 'Test Passed' : 'Test Failed'}</div>
                {testResults.duration && <div className="text-sm">Duration: {testResults.duration}ms</div>}
                {testResults.error && <div className="text-sm text-red-600">{testResults.error}</div>}
              </div>
              
              {testResults.input && (
                <div>
                  <div className="font-medium mb-2">Input:</div>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(testResults.input, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResults.output && (
                <div>
                  <div className="font-medium mb-2">Output:</div>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(testResults.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MA10: Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Webhook Endpoints</h3>
              <button onClick={() => setShowWebhookModal(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  const newEndpoint = createWebhookEndpoint({
                    name: 'New Webhook',
                    url: 'https://api.example.com/webhook',
                    method: 'POST',
                    headers: {},
                    enabled: true
                  })
                  // Trigger the webhook with test data
                  triggerWebhook(newEndpoint.id, { test: true, timestamp: Date.now() })
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create Test Webhook
              </button>
              
              <div className="space-y-2">
                {webhookEndpoints.map(endpoint => (
                  <div key={endpoint.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{endpoint.name}</div>
                      <div className="text-sm text-gray-600">{endpoint.url}</div>
                      <div className="text-xs text-gray-500">
                        {endpoint.method} • {endpoint.triggerCount} triggers
                        {endpoint.lastTriggered && ` • Last: ${endpoint.lastTriggered.toLocaleString()}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => triggerWebhook(endpoint.id, { test: true, timestamp: Date.now() })}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => deleteWebhookEndpoint(endpoint.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MA9: Enhanced Execution Logs */}
      {showExecutionLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Execution Logs</h3>
              <div className="flex gap-2">
                <select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value as any)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                </select>
                <button onClick={clearLogs} className="text-red-600 hover:text-red-800 text-sm">
                  Clear
                </button>
                <button onClick={exportLogs} className="text-blue-600 hover:text-blue-800 text-sm">
                  Export
                </button>
                <button onClick={() => setShowExecutionLogs(false)} className="text-gray-500 hover:text-gray-700">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {executionLogs
                .filter(log => logLevel === 'info' || log.level === logLevel)
                .map(log => (
                  <div key={log.id} className={`p-2 rounded text-sm ${
                    log.level === 'error' ? 'bg-red-100' :
                    log.level === 'warning' ? 'bg-yellow-100' :
                    log.level === 'debug' ? 'bg-gray-100' : 'bg-blue-100'
                  }`}>
                    <div className="flex justify-between">
                      <span className="font-medium">{log.message}</span>
                      <span className="text-xs text-gray-500">{log.timestamp.toLocaleTimeString()}</span>
                    </div>
                    {log.data && (
                      <pre className="text-xs mt-1 overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white border-t p-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {nodes.length} nodes • {connections.length} connections • {execution?.executedNodes.length || 0} executed
        </div>
        
        <button
          onClick={handleComplete}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          Complete Workflow
        </button>
      </div>
    </div>
  )
} 
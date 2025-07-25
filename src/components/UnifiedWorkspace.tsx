'use client'

import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  CommandLineIcon, 
  SparklesIcon, 
  MicrophoneIcon,
  DocumentTextIcon,
  ClockIcon,
  BoltIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowRightIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { CommandPalette } from './CommandPalette'

interface WorkflowCard {
  id: string
  title: string
  type: 'memory' | 'voice' | 'task' | 'automation' | 'document' | 'ai'
  status: 'active' | 'completed' | 'pending'
  progress?: number
  icon: React.ComponentType<any>
  gradient: string
  preview?: string
  timestamp?: string
  aiSuggestion?: string
}

interface ActiveContext {
  workflow?: WorkflowCard
  relatedItems: WorkflowCard[]
  suggestions: string[]
}

// Workflow Context for seamless state management
const WorkspaceContext = createContext<{
  activeWorkflow: WorkflowCard | null
  setActiveWorkflow: (workflow: WorkflowCard | null) => void
  workflowHistory: WorkflowCard[]
  pushWorkflow: (workflow: WorkflowCard) => void
} | null>(null)

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}

export function UnifiedWorkspace() {
  // Workspace state management
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowCard | null>(null)
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowCard[]>([])
  
  const pushWorkflow = (workflow: WorkflowCard) => {
    setWorkflowHistory(prev => [...prev, workflow])
    setActiveWorkflow(workflow)
  }

  const [activeContext, setActiveContext] = useState<ActiveContext>({
    relatedItems: [],
    suggestions: [
      "Create memory from this conversation",
      "Schedule follow-up tasks", 
      "Generate meeting summary",
      "Record voice note about insights"
    ]
  })

  // Sample workflow cards for demonstration
  const [workflowCards] = useState<WorkflowCard[]>([
    {
      id: '1',
      title: 'Project Planning Session',
      type: 'memory',
      status: 'active',
      progress: 75,
      icon: DocumentTextIcon,
      gradient: 'from-blue-500 to-cyan-500',
      preview: 'Discussed Q4 objectives, resource allocation...',
      timestamp: '2 minutes ago',
      aiSuggestion: 'Extract action items and create tasks'
    },
    {
      id: '2',
      title: 'Team Meeting Recording',
      type: 'voice',
      status: 'completed',
      icon: MicrophoneIcon,
      gradient: 'from-red-500 to-pink-500',
      preview: '45 min recording, 3 speakers identified',
      timestamp: '1 hour ago',
      aiSuggestion: 'Generate transcript and summary'
    },
    {
      id: '3',
      title: 'Q4 Deliverables',
      type: 'task',
      status: 'pending',
      progress: 40,
      icon: ClockIcon,
      gradient: 'from-green-500 to-emerald-500',
      preview: '8 tasks remaining, 3 overdue',
      timestamp: 'Due in 2 days',
      aiSuggestion: 'Reschedule based on priorities'
    },
    {
      id: '4',
      title: 'Weekly Report Automation',
      type: 'automation',
      status: 'active',
      icon: BoltIcon,
      gradient: 'from-orange-500 to-yellow-500',
      preview: 'Running data collection workflow',
      timestamp: 'In progress',
      aiSuggestion: 'Add memory context to report'
    }
  ])

  // Update AI context based on active workflow
  useEffect(() => {
    if (activeWorkflow) {
      const workflowSpecificSuggestions = {
        memory: [
          "Extract key insights and save to memory",
          "Create related task from this memory",
          "Tag and categorize this information",
          "Set reminder to review this memory"
        ],
        voice: [
          "Generate transcript with speaker detection",
          "Create summary and action items",
          "Convert to text memory note",
          "Schedule follow-up meeting"
        ],
        task: [
          "Break down into subtasks",
          "Set smart deadline based on priority",
          "Add to specific project context",
          "Create dependency relationships"
        ],
        automation: [
          "Configure trigger conditions",
          "Set up notification preferences",
          "Test automation workflow",
          "Monitor execution logs"
        ],
        ai: [
          "Configure AI model preferences",
          "Review AI-generated content",
          "Set up intelligent automation",
          "Monitor AI processing metrics"
        ],
        document: [
          "Organize document structure",
          "Set sharing permissions",
          "Create document templates",
          "Track version history"
        ]
      }
      
      setActiveContext(prev => ({
        ...prev,
        workflow: activeWorkflow,
        suggestions: workflowSpecificSuggestions[activeWorkflow.type] || prev.suggestions,
        relatedItems: workflowCards.filter(card => 
          card.type === activeWorkflow.type && card.id !== activeWorkflow.id
        ).slice(0, 3)
      }))
    } else {
      setActiveContext(prev => ({
        ...prev,
        workflow: undefined,
        suggestions: [
          "Create memory from this conversation",
          "Schedule follow-up tasks", 
          "Generate meeting summary",
          "Record voice note about insights"
        ],
        relatedItems: []
      }))
    }
  }, [activeWorkflow, workflowCards])
  
  const [commandOpen, setCommandOpen] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const commandRef = useRef<HTMLInputElement>(null)

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
        setTimeout(() => commandRef.current?.focus(), 100)
      }
      if (e.key === 'Escape') {
        setCommandOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleCardDrag = (id: string, info: PanInfo) => {
    if (info.offset.x > 100) {
      // Trigger AI suggestion
      const card = workflowCards.find(c => c.id === id)
      if (card?.aiSuggestion) {
        // Show AI suggestion popup
        console.log('AI Suggestion:', card.aiSuggestion)
      }
    }
  }

  const handleWorkflowStart = (type: 'memory' | 'voice' | 'task' | 'automation') => {
    const newWorkflow: WorkflowCard = {
      id: `${type}-${Date.now()}`,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Workflow`,
      type,
      status: 'active',
      progress: 0,
      icon: type === 'memory' ? DocumentTextIcon :
           type === 'voice' ? MicrophoneIcon :
           type === 'task' ? ClockIcon : BoltIcon,
      gradient: type === 'memory' ? 'from-blue-500 to-cyan-500' :
               type === 'voice' ? 'from-red-500 to-pink-500' :
               type === 'task' ? 'from-green-500 to-emerald-500' :
               'from-orange-500 to-yellow-500',
      preview: 'Getting started...',
      timestamp: 'Just now',
      aiSuggestion: 'Let AI guide you through this workflow'
    }
    pushWorkflow(newWorkflow)
    setCommandOpen(false)
  }

  return (
    <WorkspaceContext.Provider value={{
      activeWorkflow,
      setActiveWorkflow,
      workflowHistory,
      pushWorkflow
    }}>
      <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950 overflow-hidden">
        {/* Floating Command Palette */}
        <AnimatePresence>
          {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} onWorkflowStart={handleWorkflowStart} />}
        </AnimatePresence>

      {/* Main Workspace */}
      <div className="flex h-full">
        {/* Context-Aware Sidebar */}
        <motion.div 
          className="w-80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-white/20 dark:border-zinc-800/20 flex flex-col"
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
        >
          {/* AI Context Header */}
          <div className="p-6 border-b border-zinc-200/50 dark:border-zinc-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-zinc-900 dark:text-white">AI Context</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Intelligent workflow suggestions</p>
              </div>
            </div>
            
            {/* AI Suggestions */}
            <div className="space-y-2">
              {activeContext.suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  className="w-full text-left p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/30 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-all group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{suggestion}</span>
                    <ArrowRightIcon className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Active Workflows */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-4">
              Active Workflows
            </h3>
            
            {workflowCards.map((card, index) => (
              <motion.div
                key={card.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                drag="x"
                dragConstraints={{ left: 0, right: 200 }}
                onDragEnd={(_, info) => handleCardDrag(card.id, info)}
                whileHover={{ scale: 1.02 }}
                whileDrag={{ scale: 1.05, rotate: 2 }}
              >
                <div className={cn(
                  "p-4 rounded-2xl border transition-all duration-300",
                  card.status === 'active' 
                    ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-lg" 
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
                )}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-1 truncate">{card.title}</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">{card.preview}</p>
                      
                      {card.progress !== undefined && (
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 mb-2">
                          <motion.div 
                            className={`h-1.5 bg-gradient-to-r ${card.gradient} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${card.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">{card.timestamp}</span>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          card.status === 'active' ? 'bg-green-500 animate-pulse' :
                          card.status === 'completed' ? 'bg-blue-500' : 'bg-zinc-400'
                        )} />
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Suggestion on Hover */}
                  <motion.div
                    className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                  >
                    <div className="flex items-center space-x-2">
                      <CpuChipIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">{card.aiSuggestion}</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Workflow Breadcrumb Navigation */}
          {activeWorkflow && (
            <motion.div
              className="absolute top-4 left-6 z-40"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center space-x-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl px-4 py-2 shadow-lg border border-white/20 dark:border-zinc-800/20">
                <motion.button
                  onClick={() => setActiveWorkflow(null)}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeftIcon className="w-4 h-4 text-zinc-500" />
                </motion.button>
                <div className="text-sm text-zinc-500">Workspace</div>
                <ChevronRightIcon className="w-3 h-3 text-zinc-400" />
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 bg-gradient-to-br ${activeWorkflow.gradient} rounded`} />
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {activeWorkflow.title}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Floating Action Bar */}
          <motion.div 
            className="absolute top-6 left-1/2 transform -translate-x-1/2 z-40"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", damping: 25 }}
          >
            <div className="flex items-center space-x-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-2xl border border-white/20 dark:border-zinc-800/20">
              <motion.button
                onClick={() => setCommandOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <CommandLineIcon className="w-4 h-4" />
                <span>Command</span>
                <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-xs">⌘K</kbd>
              </motion.button>
              
              <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
              
              {[
                { icon: DocumentTextIcon, label: 'Memory', color: 'from-blue-500 to-cyan-500', type: 'memory' as const },
                { icon: MicrophoneIcon, label: 'Voice', color: 'from-red-500 to-pink-500', type: 'voice' as const },
                { icon: ClockIcon, label: 'Task', color: 'from-green-500 to-emerald-500', type: 'task' as const },
                { icon: BoltIcon, label: 'Auto', color: 'from-orange-500 to-yellow-500', type: 'automation' as const }
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  onClick={() => handleWorkflowStart(item.type)}
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Dynamic Canvas Content */}
          <div className="flex-1 p-12 pt-24">
            <WorkflowCanvas activeWorkflow={activeWorkflow} />
          </div>
        </div>
      </div>
      </div>
    </WorkspaceContext.Provider>
  )
}


// Dynamic Canvas for Workflow Visualization
function WorkflowCanvas({ activeWorkflow }: { activeWorkflow: WorkflowCard | null }) {
  if (activeWorkflow) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          className="text-center max-w-4xl w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Active Workflow Interface */}
          <motion.div
            className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-zinc-800/20"
            layoutId={`workflow-${activeWorkflow.id}`}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${activeWorkflow.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                <activeWorkflow.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{activeWorkflow.title}</h2>
                <p className="text-zinc-600 dark:text-zinc-400">{activeWorkflow.preview}</p>
              </div>
              <div className="ml-auto">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeWorkflow.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  {activeWorkflow.status}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            {activeWorkflow.progress !== undefined && (
              <div className="mb-8">
                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  <span>Progress</span>
                  <span>{activeWorkflow.progress}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <motion.div 
                    className={`h-2 bg-gradient-to-r ${activeWorkflow.gradient} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${activeWorkflow.progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            )}
            
            {/* Workflow Content Area */}
            <div className="min-h-96 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                />
                <p className="text-zinc-600 dark:text-zinc-400">
                  Workflow interface will load here...
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full flex items-center justify-center">
      <motion.div
        className="text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="w-32 h-32 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <SparklesIcon className="w-16 h-16 text-white" />
        </motion.div>
        
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
          Your Unified Workspace
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
          AI-powered workflows that adapt to your thinking. Start with ⌘K or click any workflow type above.
        </p>
        
        <motion.button
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const event = new KeyboardEvent('keydown', { 
              key: 'k', 
              metaKey: true,
              bubbles: true 
            })
            window.dispatchEvent(event)
          }}
        >
          <span className="flex items-center space-x-2">
            <CommandLineIcon className="w-5 h-5" />
            <span>Open Command Palette</span>
            <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-xs">⌘K</kbd>
          </span>
        </motion.button>
      </motion.div>
    </div>
  )
}
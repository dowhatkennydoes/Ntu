'use client'

import { useState, useEffect } from 'react'
import { 
  LinkIcon, 
  SparklesIcon, 
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'
import { cn } from '@/lib/utils'

interface MemoryNode {
  id: string
  title: string
  content: string
  type: 'source' | 'reasoning' | 'conclusion'
  connections: string[]
  confidence: number
}

interface ReasoningChain {
  id: string
  title: string
  nodes: MemoryNode[]
  reasoning: string
}

export function MemoryChainWorkflow() {
  const { updateWorkflowData, nextStep, finishWorkflow } = useWorkflow()
  const [chain, setChain] = useState<ReasoningChain>({
    id: Date.now().toString(),
    title: '',
    nodes: [],
    reasoning: ''
  })
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [actionCount, setActionCount] = useState(0)

  // Mock available memories
  const availableMemories = [
    {
      id: '1',
      title: 'Project Meeting Notes',
      content: 'Discussed Q4 goals and resource allocation',
      type: 'source' as const,
      connections: [],
      confidence: 0.9
    },
    {
      id: '2',
      title: 'Budget Analysis',
      content: 'Current budget allows for 3 new hires',
      type: 'source' as const,
      connections: [],
      confidence: 0.85
    },
    {
      id: '3',
      title: 'Market Research',
      content: 'Customer demand increased 25% this quarter',
      type: 'source' as const,
      connections: [],
      confidence: 0.8
    },
    {
      id: '4',
      title: 'Team Feedback',
      content: 'Engineering team needs additional support',
      type: 'source' as const,
      connections: [],
      confidence: 0.75
    }
  ]

  const MAX_ACTIONS = 4

  const handleMemorySelect = (memoryId: string) => {
    if (actionCount >= MAX_ACTIONS) return

    setSelectedMemories(prev => {
      const isSelected = prev.includes(memoryId)
      const newSelection = isSelected 
        ? prev.filter(id => id !== memoryId)
        : [...prev, memoryId]
      
      if (!isSelected) {
        setActionCount(count => count + 1)
      } else {
        setActionCount(count => count - 1)
      }
      
      return newSelection
    })
  }

  const generateReasoning = () => {
    if (actionCount >= MAX_ACTIONS) return

    const selectedMems = availableMemories.filter(m => selectedMemories.includes(m.id))
    
    const reasoning = `Based on the selected memories, I can see a clear pattern:

1. ${selectedMems[0]?.title}: ${selectedMems[0]?.content}
2. ${selectedMems[1]?.title}: ${selectedMems[1]?.content}

These memories suggest that we should prioritize hiring to meet increased demand while staying within budget constraints.`

    setChain(prev => ({
      ...prev,
      reasoning,
      nodes: selectedMems
    }))

    setActionCount(count => count + 1)
  }

  const addConclusion = () => {
    if (actionCount >= MAX_ACTIONS) return

    const conclusion: MemoryNode = {
      id: 'conclusion-' + Date.now(),
      title: 'Strategic Recommendation',
      content: 'Hire 2 engineers and 1 designer to support Q4 goals while maintaining budget compliance',
      type: 'conclusion',
      connections: selectedMemories,
      confidence: 0.85
    }

    setChain(prev => ({
      ...prev,
      nodes: [...prev.nodes, conclusion],
      title: 'Q4 Hiring Strategy Chain'
    }))

    setActionCount(count => count + 1)
  }

  const completeChain = () => {
    updateWorkflowData({ 
      memoryChain: chain,
      actionCount: actionCount 
    })
    finishWorkflow()
  }

  const canProceed = chain.nodes.length > 0 && chain.reasoning && actionCount <= MAX_ACTIONS

  return (
    <div className="space-y-6">
      {/* Action Counter */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Memory Chain Generation</h3>
            <p className="text-sm text-blue-700">
              Create reasoning flows in ≤ 4 actions
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">
              {actionCount}/{MAX_ACTIONS}
            </div>
            <div className="text-xs text-blue-600">actions used</div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(actionCount / MAX_ACTIONS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step 1: Select Source Memories */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
          Select Source Memories
        </h4>
        
        <div className="grid grid-cols-1 gap-3">
          {availableMemories.map((memory) => (
            <button
              key={memory.id}
              onClick={() => handleMemorySelect(memory.id)}
              disabled={actionCount >= MAX_ACTIONS && !selectedMemories.includes(memory.id)}
              className={cn(
                'p-3 border-2 rounded-lg text-left transition-all',
                selectedMemories.includes(memory.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300',
                actionCount >= MAX_ACTIONS && !selectedMemories.includes(memory.id)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{memory.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{memory.content}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <div className="text-xs text-gray-500">
                    {Math.round(memory.confidence * 100)}%
                  </div>
                  {selectedMemories.includes(memory.id) && (
                    <CheckIcon className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Generate Reasoning */}
      {selectedMemories.length >= 2 && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
            Generate Reasoning
          </h4>
          
          {!chain.reasoning ? (
            <button
              onClick={generateReasoning}
              disabled={actionCount >= MAX_ACTIONS}
              className="w-full p-4 border-2 border-dashed border-green-300 rounded-lg text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <SparklesIcon className="h-5 w-5" />
              Generate AI Reasoning ({actionCount + 1}/{MAX_ACTIONS})
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">AI-Generated Reasoning</h5>
              <p className="text-sm text-green-800 whitespace-pre-line">{chain.reasoning}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Add Conclusion */}
      {chain.reasoning && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
            Add Conclusion
          </h4>
          
          {!chain.nodes.some(n => n.type === 'conclusion') ? (
            <button
              onClick={addConclusion}
              disabled={actionCount >= MAX_ACTIONS}
              className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Strategic Conclusion ({actionCount + 1}/{MAX_ACTIONS})
            </button>
          ) : (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-medium text-purple-900 mb-2">Strategic Conclusion</h5>
              <p className="text-sm text-purple-800">
                {chain.nodes.find(n => n.type === 'conclusion')?.content}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Chain Visualization */}
      {chain.nodes.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">4</span>
            Memory Chain Visualization
          </h4>
          
          <div className="space-y-3">
            {chain.nodes.map((node, index) => (
              <div key={node.id} className="flex items-center gap-3">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  node.type === 'source' ? 'bg-blue-500' :
                  node.type === 'reasoning' ? 'bg-green-500' :
                  'bg-purple-500'
                )} />
                <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                  <h6 className="font-medium text-gray-900">{node.title}</h6>
                  <p className="text-sm text-gray-600 mt-1">{node.content}</p>
                </div>
                {index < chain.nodes.length - 1 && (
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Button */}
      {canProceed && (
        <button
          onClick={completeChain}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <LinkIcon className="h-5 w-5" />
          Complete Memory Chain ({actionCount}/{MAX_ACTIONS} actions)
        </button>
      )}

      {/* Progress Indicator */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-2">Chain Progress</h5>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              'w-2 h-2 rounded-full',
              selectedMemories.length >= 2 ? 'bg-green-500' : 'bg-gray-300'
            )} />
            <span className={selectedMemories.length >= 2 ? 'text-green-700' : 'text-gray-500'}>
              Select source memories ({selectedMemories.length}/2+)
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              'w-2 h-2 rounded-full',
              chain.reasoning ? 'bg-green-500' : 'bg-gray-300'
            )} />
            <span className={chain.reasoning ? 'text-green-700' : 'text-gray-500'}>
              Generate AI reasoning
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              'w-2 h-2 rounded-full',
              chain.nodes.some(n => n.type === 'conclusion') ? 'bg-green-500' : 'bg-gray-300'
            )} />
            <span className={chain.nodes.some(n => n.type === 'conclusion') ? 'text-green-700' : 'text-gray-500'}>
              Add strategic conclusion
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
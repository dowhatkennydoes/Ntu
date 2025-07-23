'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  DocumentTextIcon, 
  CpuChipIcon, 
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  ShieldCheckIcon,
  MicrophoneIcon,
  SparklesIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  PlayIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import MemoryCreationWorkflow from './MemoryCreationWorkflow'
import AIAssistant from './AIAssistant'
import NotebookWorkflow from './NotebookWorkflow'
import LearningWorkflow from './LearningWorkflow'
import PluginWorkflow from './PluginWorkflow'

interface WorkflowStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress: number
}

interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  category: string
  priority: 'high' | 'medium' | 'low'
  estimatedSteps: number
}

export default function Dashboard() {
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null)
  const [showMemoryCreation, setShowMemoryCreation] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showNotebookWorkflow, setShowNotebookWorkflow] = useState(false)
  const [notebookWorkflowType, setNotebookWorkflowType] = useState<'create' | 'merge' | 'convert' | 'publish' | 'import'>('create')
  const [showLearningWorkflow, setShowLearningWorkflow] = useState(false)
  const [learningWorkflowType, setLearningWorkflowType] = useState<'flashcard' | 'quiz' | 'timeline' | 'audio' | 'course' | 'interview' | 'journal'>('flashcard')
  const [showPluginWorkflow, setShowPluginWorkflow] = useState(false)
  const [pluginWorkflowType, setPluginWorkflowType] = useState<'install' | 'configure' | 'test' | 'uninstall' | 'integrate' | 'automate'>('install')
  const [createdMemories, setCreatedMemories] = useState<any[]>([])
  const [createdNotebooks, setCreatedNotebooks] = useState<any[]>([])
  const [createdLearning, setCreatedLearning] = useState<any[]>([])
  const [createdPlugins, setCreatedPlugins] = useState<any[]>([])
  const [workflows] = useState<Workflow[]>([
    {
      id: 'create-note',
      name: 'Create & Share Note',
      description: 'Create a new note and share it with your team in 3 steps or less',
      category: 'Notebook',
      priority: 'high',
      estimatedSteps: 3,
      steps: [
        {
          id: 'step-1',
          title: 'Create Note',
          description: 'Start with a blank note or template',
          icon: DocumentTextIcon,
          status: 'pending',
          progress: 0
        },
        {
          id: 'step-2',
          title: 'Add Content',
          description: 'Write, paste, or import your content',
          icon: PlusIcon,
          status: 'pending',
          progress: 0
        },
        {
          id: 'step-3',
          title: 'Share',
          description: 'Share with team members or publish',
          icon: UserGroupIcon,
          status: 'pending',
          progress: 0
        }
      ]
    },
    {
      id: 'memory-creation',
      name: 'Memory Creation',
      description: 'Build memory from transcription and summarization in one flow',
      category: 'Memory',
      priority: 'high',
      estimatedSteps: 4,
      steps: [
        {
          id: 'step-1',
          title: 'Input Source',
          description: 'Upload audio, video, or text',
          icon: MicrophoneIcon,
          status: 'pending',
          progress: 0
        },
                 {
           id: 'step-2',
           title: 'Transcribe',
           description: 'AI-powered transcription',
           icon: CpuChipIcon,
           status: 'pending',
           progress: 0
         },
        {
          id: 'step-3',
          title: 'Summarize',
          description: 'Generate key insights and summary',
          icon: SparklesIcon,
          status: 'pending',
          progress: 0
        },
        {
          id: 'step-4',
          title: 'Organize',
          description: 'Tag and categorize for easy retrieval',
          icon: CogIcon,
          status: 'pending',
          progress: 0
        }
      ]
    },
    {
      id: 'ai-assistant',
      name: 'AI Assistant (Mere)',
      description: 'Let Mere handle complex workflows with transparency',
      category: 'Assistant',
      priority: 'high',
      estimatedSteps: 2,
      steps: [
                 {
           id: 'step-1',
           title: 'Request',
           description: 'Tell Mere what you need',
           icon: CpuChipIcon,
           status: 'pending',
           progress: 0
         },
        {
          id: 'step-2',
          title: 'Execute',
          description: 'Mere handles the workflow',
          icon: SparklesIcon,
          status: 'pending',
          progress: 0
        }
      ]
    }
  ])

  const handleWorkflowStart = (workflow: Workflow) => {
    setActiveWorkflow(workflow)
  }

  const handleStepComplete = (stepId: string) => {
    if (!activeWorkflow) return

    const updatedWorkflow = {
      ...activeWorkflow,
      steps: activeWorkflow.steps.map(step =>
        step.id === stepId
          ? { ...step, status: 'completed' as const, progress: 100 }
          : step
      )
    }
    setActiveWorkflow(updatedWorkflow)
  }

  const handleWorkflowComplete = () => {
    setActiveWorkflow(null)
  }

  const handleMemoryComplete = (memory: any) => {
    setCreatedMemories(prev => [...prev, memory])
    setShowMemoryCreation(false)
  }

  const handleAIAssistantComplete = (result: any) => {
    console.log('AI Assistant result:', result)
    setShowAIAssistant(false)
  }

  const handleNotebookComplete = (notebook: any) => {
    setCreatedNotebooks(prev => [...prev, notebook])
    setShowNotebookWorkflow(false)
  }

  const handleNotebookWorkflowStart = (type: 'create' | 'merge' | 'convert' | 'publish' | 'import') => {
    setNotebookWorkflowType(type)
    setShowNotebookWorkflow(true)
  }

  const handleLearningComplete = (learning: any) => {
    setCreatedLearning(prev => [...prev, learning])
    setShowLearningWorkflow(false)
  }

  const handleLearningWorkflowStart = (type: 'flashcard' | 'quiz' | 'timeline' | 'audio' | 'course' | 'interview' | 'journal') => {
    setLearningWorkflowType(type)
    setShowLearningWorkflow(true)
  }

  const handlePluginComplete = (plugin: any) => {
    setCreatedPlugins(prev => [...prev, plugin])
    setShowPluginWorkflow(false)
  }

  const handlePluginWorkflowStart = (type: 'install' | 'configure' | 'test' | 'uninstall' | 'integrate' | 'automate') => {
    setPluginWorkflowType(type)
    setShowPluginWorkflow(true)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Notebook':
        return DocumentTextIcon
             case 'Memory':
         return CpuChipIcon
      case 'Assistant':
        return SparklesIcon
      case 'Learning':
        return ChartBarIcon
      case 'Privacy':
        return ShieldCheckIcon
      case 'Plugin':
        return PuzzlePieceIcon
      case 'Team':
        return UserGroupIcon
      case 'Admin':
        return CogIcon
      case 'Multimodal':
        return MicrophoneIcon
      default:
        return PlusIcon
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Ntu Dashboard</h1>
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Beta
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn btn-outline btn-sm">
                <CogIcon className="h-4 w-4 mr-2" />
                Settings
              </button>
              <button className="btn btn-primary btn-sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Workflow
              </button>
            </div>
          </div>
        </div>
      </header>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {showMemoryCreation ? (
                      <MemoryCreationWorkflow
                        onComplete={handleMemoryComplete}
                        onCancel={() => setShowMemoryCreation(false)}
                      />
                    ) : showAIAssistant ? (
                      <AIAssistant
                        onComplete={handleAIAssistantComplete}
                        onCancel={() => setShowAIAssistant(false)}
                      />
                    ) : showNotebookWorkflow ? (
                      <NotebookWorkflow
                        workflowType={notebookWorkflowType}
                        onComplete={handleNotebookComplete}
                        onCancel={() => setShowNotebookWorkflow(false)}
                      />
                    ) : showLearningWorkflow ? (
                      <LearningWorkflow
                        workflowType={learningWorkflowType}
                        onComplete={handleLearningComplete}
                        onCancel={() => setShowLearningWorkflow(false)}
                      />
                    ) : showPluginWorkflow ? (
                      <PluginWorkflow
                        workflowType={pluginWorkflowType}
                        onComplete={handlePluginComplete}
                        onCancel={() => setShowPluginWorkflow(false)}
                      />
                    ) : activeWorkflow ? (
          <WorkflowRunner 
            workflow={activeWorkflow}
            onStepComplete={handleStepComplete}
            onComplete={handleWorkflowComplete}
            onBack={() => setActiveWorkflow(null)}
          />
        ) : (
                                <WorkflowGrid 
                        workflows={workflows}
                        onWorkflowStart={handleWorkflowStart}
                        getCategoryIcon={getCategoryIcon}
                        getPriorityColor={getPriorityColor}
                        onMemoryCreation={() => setShowMemoryCreation(true)}
                        onAIAssistant={() => setShowAIAssistant(true)}
                        onNotebookWorkflow={handleNotebookWorkflowStart}
                        onLearningWorkflow={handleLearningWorkflowStart}
                        onPluginWorkflow={handlePluginWorkflowStart}
                      />
        )}
      </div>
    </div>
  )
}

function WorkflowGrid({ 
  workflows, 
  onWorkflowStart, 
  getCategoryIcon, 
  getPriorityColor,
  onMemoryCreation,
  onAIAssistant,
  onNotebookWorkflow,
  onLearningWorkflow,
  onPluginWorkflow
}: {
  workflows: Workflow[]
  onWorkflowStart: (workflow: Workflow) => void
  getCategoryIcon: (category: string) => React.ComponentType<any>
  getPriorityColor: (priority: string) => string
  onMemoryCreation: () => void
  onAIAssistant: () => void
  onNotebookWorkflow: (type: 'create' | 'merge' | 'convert' | 'publish' | 'import') => void
  onLearningWorkflow: (type: 'flashcard' | 'quiz' | 'timeline' | 'audio' | 'course' | 'interview' | 'journal') => void
  onPluginWorkflow: (type: 'install' | 'configure' | 'test' | 'uninstall' | 'integrate' | 'automate') => void
}) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Workflows</h2>
        <p className="text-gray-600">
          Choose a workflow to get started. All workflows are designed to be completed in 3 steps or less.
        </p>
        
                            {/* Quick Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-4">
                      <button
                        onClick={onMemoryCreation}
                        className="btn btn-primary"
                      >
                        <CpuChipIcon className="h-4 w-4 mr-2" />
                        Create Memory
                      </button>
                      <button
                        onClick={onAIAssistant}
                        className="btn btn-outline"
                      >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Ask Mere
                      </button>
                      
                      {/* Notebook Workflow Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onNotebookWorkflow('create')}
                          className="btn btn-outline"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          Create Note
                        </button>
                        <button
                          onClick={() => onNotebookWorkflow('merge')}
                          className="btn btn-outline"
                        >
                          <CogIcon className="h-4 w-4 mr-2" />
                          Merge Notes
                        </button>
                        <button
                          onClick={() => onNotebookWorkflow('convert')}
                          className="btn btn-outline"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-2" />
                          Convert to Study
                        </button>
                        <button
                          onClick={() => onNotebookWorkflow('publish')}
                          className="btn btn-outline"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                          Publish
                        </button>
                        <button
                          onClick={() => onNotebookWorkflow('import')}
                          className="btn btn-outline"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                          Import
                        </button>
                      </div>

                      {/* Learning Workflow Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onLearningWorkflow('flashcard')}
                          className="btn btn-outline"
                        >
                          <AcademicCapIcon className="h-4 w-4 mr-2" />
                          Flashcards
                        </button>
                        <button
                          onClick={() => onLearningWorkflow('quiz')}
                          className="btn btn-outline"
                        >
                          <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
                          Quiz
                        </button>
                        <button
                          onClick={() => onLearningWorkflow('timeline')}
                          className="btn btn-outline"
                        >
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Study Timeline
                        </button>
                        <button
                          onClick={() => onLearningWorkflow('audio')}
                          className="btn btn-outline"
                        >
                          <MicrophoneIcon className="h-4 w-4 mr-2" />
                          Audio to Study
                        </button>
                        <button
                          onClick={() => onLearningWorkflow('interview')}
                          className="btn btn-outline"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                          Interview Prep
                        </button>
                        <button
                          onClick={() => onLearningWorkflow('journal')}
                          className="btn btn-outline"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Journal
                        </button>
                      </div>

                      {/* Plugin Workflow Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onPluginWorkflow('install')}
                          className="btn btn-outline"
                        >
                          <PuzzlePieceIcon className="h-4 w-4 mr-2" />
                          Install Plugin
                        </button>
                        <button
                          onClick={() => onPluginWorkflow('configure')}
                          className="btn btn-outline"
                        >
                          <CogIcon className="h-4 w-4 mr-2" />
                          Configure Plugin
                        </button>
                        <button
                          onClick={() => onPluginWorkflow('test')}
                          className="btn btn-outline"
                        >
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Test Plugin
                        </button>
                        <button
                          onClick={() => onPluginWorkflow('integrate')}
                          className="btn btn-outline"
                        >
                          <PuzzlePieceIcon className="h-4 w-4 mr-2" />
                          Integrate Plugin
                        </button>
                        <button
                          onClick={() => onPluginWorkflow('automate')}
                          className="btn btn-outline"
                        >
                          <ClockIcon className="h-4 w-4 mr-2" />
                          Automate Plugin
                        </button>
                        <button
                          onClick={() => onPluginWorkflow('uninstall')}
                          className="btn btn-outline"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Uninstall Plugin
                        </button>
                      </div>
                    </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => {
          const CategoryIcon = getCategoryIcon(workflow.category)
          return (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onWorkflowStart(workflow)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <CategoryIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                    <p className="text-sm text-gray-500">{workflow.category}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(workflow.priority)}`}>
                  {workflow.priority}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {workflow.estimatedSteps} steps
                </span>
                <button className="btn btn-primary btn-sm">
                  Start
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function WorkflowRunner({ 
  workflow, 
  onStepComplete, 
  onComplete, 
  onBack 
}: {
  workflow: Workflow
  onStepComplete: (stepId: string) => void
  onComplete: () => void
  onBack: () => void
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = workflow.steps[currentStepIndex]

  const handleNextStep = () => {
    onStepComplete(currentStep.id)
    
    if (currentStepIndex < workflow.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      onComplete()
    }
  }

  const progress = (currentStepIndex / workflow.steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm mr-4"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{workflow.name}</h2>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <currentStep.icon className="h-12 w-12 text-blue-600 mr-4" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Step {currentStepIndex + 1}: {currentStep.title}
            </h3>
            <p className="text-gray-600">{currentStep.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Step-specific content would go here */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600">
              This is where the step-specific interface would be rendered.
              For now, this is a placeholder for the actual workflow step content.
            </p>
          </div>

          <div className="flex justify-between items-center pt-6">
            <span className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {workflow.steps.length}
            </span>
            <button
              onClick={handleNextStep}
              className="btn btn-primary"
            >
              {currentStepIndex < workflow.steps.length - 1 ? 'Next Step' : 'Complete Workflow'}
            </button>
          </div>
        </div>
      </div>

      {/* Step List */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Workflow Steps</h4>
        <div className="space-y-3">
          {workflow.steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center p-4 rounded-lg border ${
                index === currentStepIndex
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentStepIndex
                  ? 'bg-green-100 text-green-800'
                  : index === currentStepIndex
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {index < currentStepIndex ? '✓' : index + 1}
              </div>
              <div className="ml-4 flex-1">
                <h5 className="font-medium text-gray-900">{step.title}</h5>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              {index < currentStepIndex && (
                <span className="text-green-600 text-sm">Completed</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
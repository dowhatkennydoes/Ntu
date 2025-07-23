'use client'

import { useState } from 'react'
import { PlusIcon, DocumentTextIcon, MicrophoneIcon, VideoCameraIcon, BookOpenIcon, ExclamationTriangleIcon, LinkIcon, CloudArrowUpIcon, AcademicCapIcon, SpeakerWaveIcon, BeakerIcon, ChatBubbleLeftRightIcon, WrenchScrewdriverIcon, UserGroupIcon, DocumentArrowDownIcon, PuzzlePieceIcon, CpuChipIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'
import { WorkflowRunner } from './WorkflowRunner'
import { ErrorDemoWorkflow } from './ErrorDemoWorkflow'
import { MemoryChainWorkflow } from './MemoryChainWorkflow'
import { FileProcessingWorkflow } from './FileProcessingWorkflow'
import { NotebookCreationWorkflow } from './NotebookCreationWorkflow'
import { FlashcardCreationWorkflow } from './FlashcardCreationWorkflow'
import { VoiceNoteWorkflow } from './VoiceNoteWorkflow'
import { KnowledgeUploadWorkflow } from './KnowledgeUploadWorkflow'
import { VoiceTranscriptionWorkflow } from './VoiceTranscriptionWorkflow'
import JunctionSemanticSearchWorkflow from './JunctionSemanticSearchWorkflow'
import { MarathonWorkflowBuilder } from './MarathonWorkflowBuilder'
import TeamCollaborationWorkflow from './TeamCollaborationWorkflow'
import ExportWorkflow from './ExportWorkflow'
import PluginEcosystemWorkflow from './PluginEcosystemWorkflow'
import AdvancedMemoryWorkflow from './AdvancedMemoryWorkflow'
import MeetingIntegrationWorkflow from './MeetingIntegrationWorkflow'
import ComplianceSecurityWorkflow from './ComplianceSecurityWorkflow'
import VoiceIntelligenceWorkflow from './VoiceIntelligenceWorkflow'
import JunctionAIWritingWorkflow from './JunctionAIWritingWorkflow'
import MereAIAssistantWorkflow from './MereAIAssistantWorkflow'
import MarathonFlowBuilderWorkflow from './MarathonFlowBuilderWorkflow'
import MemoryIntelligenceWorkflow from './MemoryIntelligenceWorkflow'
import PunctualTaskManagerWorkflow from './PunctualTaskManagerWorkflow'

interface WorkflowCard {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  steps: Array<{
    id: string
    title: string
    description: string
    component?: React.ReactNode
    aiAssisted?: boolean
  }>
}

export function WorkflowDashboard() {
  const { startWorkflow, currentWorkflow } = useWorkflow()
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

  const workflows: WorkflowCard[] = [
    {
      id: 'memory-creation',
      title: 'Create Memory',
      description: 'Build memory from transcription + summarization in one flow',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      steps: [
        {
          id: 'input',
          title: 'Capture Content',
          description: 'Add your content via text or voice',
        },
        {
          id: 'transcription',
          title: 'Process Audio',
          description: 'Converting audio to text',
          aiAssisted: true,
        },
        {
          id: 'summarization',
          title: 'Generate Summary',
          description: 'AI-powered content summarization',
          aiAssisted: true,
        },
        {
          id: 'tagging',
          title: 'Add Tags',
          description: 'Organize with smart tags',
        },
      ],
    },
    {
      id: 'notebook-creation',
      title: 'Create Notebook',
      description: 'Organize notes and memories into structured notebooks',
      icon: BookOpenIcon,
      color: 'bg-green-500',
      steps: [
        {
          id: 'notebook-creation',
          title: 'Create Notebook',
          description: 'Set up your new notebook with templates and organization',
          component: <NotebookCreationWorkflow />,
        },
      ],
    },
    {
      id: 'voice-note',
      title: 'Voice Note',
      description: 'Record and transcribe voice notes instantly',
      icon: MicrophoneIcon,
      color: 'bg-purple-500',
      steps: [
        {
          id: 'voice-workflow',
          title: 'Voice Note Creation',
          description: 'Record, transcribe and enhance voice notes instantly',
          component: <VoiceNoteWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'voice-transcription',
      title: 'Real-time Voice Transcription',
      description: 'Advanced live transcription with Whisper, speaker detection, and export',
      icon: SpeakerWaveIcon,
      color: 'bg-green-500',
      steps: [
        {
          id: 'transcription-workflow',
          title: 'Voice Transcription',
          description: 'Real-time transcription with AI speaker identification',
          component: <VoiceTranscriptionWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'file-processing',
      title: 'File Processing',
      description: 'Upload and auto-parse files into memories (PDF, Word, audio, video)',
      icon: CloudArrowUpIcon,
      color: 'bg-orange-500',
      steps: [
        {
          id: 'upload',
          title: 'Upload Files',
          description: 'Drag and drop or select files to upload',
          component: <FileProcessingWorkflow />,
        },
      ],
    },
    {
      id: 'flashcard-creation',
      title: 'Create Flashcards',
      description: 'Convert notes to flashcards and study materials in ≤3 steps',
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      steps: [
        {
          id: 'flashcard-workflow',
          title: 'Create Study Set',
          description: 'Build flashcards from content or create manually',
          component: <FlashcardCreationWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'knowledge-upload',
      title: 'Knowledge Upload',
      description: 'Upload PDFs, docs, and notes as searchable knowledge sources',
      icon: BookOpenIcon,
      color: 'bg-indigo-500',
      steps: [
        {
          id: 'knowledge-workflow',
          title: 'Upload Knowledge Sources',
          description: 'Create searchable knowledge base from documents',
          component: <KnowledgeUploadWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'semantic-research',
      title: 'Semantic Research & Q&A',
      description: 'NotebookLM-style research with multi-file Q&A, citations, and AI analysis',
      icon: BeakerIcon,
      color: 'bg-purple-500',
      steps: [
        {
          id: 'junction-workflow',
          title: 'Semantic Research Session',
          description: 'Upload documents and ask AI questions with precise citations',
          component: <JunctionSemanticSearchWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'error-demo',
      title: 'Error Handling Demo',
      description: 'Showcase error recovery with retry, rollback, and exit options',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      steps: [
        {
          id: 'demo',
          title: 'Error Demo',
          description: 'Simulate different error scenarios',
          component: <ErrorDemoWorkflow />,
        },
        {
          id: 'recovery',
          title: 'Recovery Success',
          description: 'Workflow completed successfully',
        },
      ],
    },
    {
      id: 'mere-assistant',
      title: 'Mere AI Assistant',
      description: 'Chat with your intelligent AI assistant with memory awareness and app integration',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500',
      steps: [
        {
          id: 'mere-chat',
          title: 'AI Chat Session',
          description: 'Intelligent conversation with memory context and workflow integration',
          component: <MereAIAssistantWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'memory-chain',
      title: 'Memory Chain Generation',
      description: 'Create reasoning flows in ≤ 4 actions with AI assistance',
      icon: LinkIcon,
      color: 'bg-indigo-500',
      steps: [
        {
          id: 'chain-builder',
          title: 'Build Memory Chain',
          description: 'Connect memories to create reasoning flows',
          component: <MemoryChainWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'marathon-builder',
      title: 'Marathon Workflow Builder',
      description: 'Visual automation platform with drag-and-drop nodes, triggers, and execution',
      icon: WrenchScrewdriverIcon,
      color: 'bg-indigo-500',
      steps: [
        {
          id: 'workflow-builder',
          title: 'Visual Workflow Builder',
          description: 'Create automation flows with drag-and-drop interface',
          component: <MarathonWorkflowBuilder />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'team-collaboration',
      title: 'Team Collaboration',
      description: 'Real-time collaboration, approval workflows, and team memory sharing',
      icon: UserGroupIcon,
      color: 'bg-green-500',
      steps: [
        {
          id: 'team-workflow',
          title: 'Team Collaboration Platform',
          description: 'Collaborate in real-time with approval workflows and team digests',
          component: <TeamCollaborationWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'export-workflow',
      title: 'Export & Compliance',
      description: 'Export content with privacy controls, compliance features, and multiple formats',
      icon: DocumentArrowDownIcon,
      color: 'bg-purple-500',
      steps: [
        {
          id: 'export-workflow',
          title: 'Export Platform',
          description: 'Export with redaction, compliance, and multiple format support',
          component: <ExportWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'plugin-ecosystem',
      title: 'Plugin Ecosystem',
      description: 'Extend Ntu with powerful plugins, integrations, and custom workflows',
      icon: PuzzlePieceIcon,
      color: 'bg-indigo-500',
      steps: [
        {
          id: 'plugin-workflow',
          title: 'Plugin Management',
          description: 'Browse, install, configure, and manage plugins',
          component: <PluginEcosystemWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'advanced-memory',
      title: 'Advanced Memory Management',
      description: 'Manage memory decay, forking, merging, and semantic linking',
      icon: CpuChipIcon,
      color: 'bg-purple-500',
      steps: [
        {
          id: 'memory-workflow',
          title: 'Memory Operations',
          description: 'Advanced memory management with decay, forking, and merging',
          component: <AdvancedMemoryWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'meeting-integration',
      title: 'Meeting Integration',
      description: 'Zoom/Google Meet integration, calendar sync, and auto-transcription',
      icon: VideoCameraIcon,
      color: 'bg-blue-500',
      steps: [
        {
          id: 'meeting-workflow',
          title: 'Meeting Management',
          description: 'Integrate with Zoom, Google Meet, and calendar systems',
          component: <MeetingIntegrationWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'compliance-security',
      title: 'Compliance & Security',
      description: 'Enterprise security, audit logging, and compliance monitoring',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      steps: [
        {
          id: 'security-workflow',
          title: 'Security & Compliance',
          description: 'Enterprise security features and compliance monitoring',
          component: <ComplianceSecurityWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'voice-intelligence',
      title: 'Voice Intelligence',
      description: 'Advanced voice processing with Whisper models and real-time analytics',
      icon: SpeakerWaveIcon,
      color: 'bg-purple-500',
      steps: [
        {
          id: 'voice-workflow',
          title: 'Voice Intelligence Platform',
          description: 'Advanced voice processing with AI insights and analytics',
          component: <VoiceIntelligenceWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'junction-ai-writing',
      title: 'Junction AI Writing',
      description: 'AI-powered document creation, co-writing, and collaboration',
      icon: DocumentTextIcon,
      color: 'bg-indigo-500',
      steps: [
        {
          id: 'junction-workflow',
          title: 'AI Writing Platform',
          description: 'AI co-writing, document Q&A, and collaboration features',
          component: <JunctionAIWritingWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'mere-ai-assistant',
      title: 'Mere AI Assistant',
      description: 'Intelligent AI assistant with memory awareness and app integration',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500',
      steps: [
        {
          id: 'mere-workflow',
          title: 'AI Assistant Platform',
          description: 'Memory-aware AI chat with app integration and permissions',
          component: <MereAIAssistantWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'marathon-flow-builder',
      title: 'Marathon Flow Builder',
      description: 'Advanced workflow automation with version control and audit trails',
      icon: WrenchScrewdriverIcon,
      color: 'bg-indigo-500',
      steps: [
        {
          id: 'marathon-workflow',
          title: 'Flow Builder Platform',
          description: 'Visual workflow automation with compliance and audit features',
          component: <MarathonFlowBuilderWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'memory-intelligence',
      title: 'Memory Intelligence',
      description: 'Advanced memory management with AI analysis and health monitoring',
      icon: CpuChipIcon,
      color: 'bg-purple-500',
      steps: [
        {
          id: 'memory-workflow',
          title: 'Memory Intelligence Platform',
          description: 'AI-powered memory analysis, health monitoring, and semantic linking',
          component: <MemoryIntelligenceWorkflow />,
          aiAssisted: true,
        },
      ],
    },
    {
      id: 'punctual-task-manager',
      title: 'Punctual Task Manager',
      description: 'Advanced task management with time tracking and productivity analytics',
      icon: ClockIcon,
      color: 'bg-orange-500',
      steps: [
        {
          id: 'punctual-workflow',
          title: 'Task Management Platform',
          description: 'Time tracking, productivity analytics, and smart scheduling',
          component: <PunctualTaskManagerWorkflow />,
          aiAssisted: true,
        },
      ],
    },
  ];

  const handleStartWorkflow = (workflow: WorkflowCard) => {
    startWorkflow(workflow.id, workflow.title, workflow.steps)
  }

  if (currentWorkflow) {
    return (
      <div className="min-h-screen overflow-y-auto p-6">
        <WorkflowRunner />
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ntu Workflows</h1>
        <p className="mt-2 text-gray-600">
          AI-powered workflows for seamless productivity and memory management
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Quick Start</h2>
        <p className="mb-4 opacity-90">
          Complete any common task in ≤ 3 steps with auto-save progress and AI assistance
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleStartWorkflow(workflows[0])}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            Create Memory
          </button>
          <button
            onClick={() => handleStartWorkflow(workflows[2])}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            Voice Note
          </button>
        </div>
      </div>

      {/* Workflow Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStartWorkflow(workflow)}
            >
              <div className="flex items-start gap-4">
                <div className={`${workflow.color} p-3 rounded-lg`}>
                  <workflow.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{workflow.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-2">
                  {workflow.steps.length} steps • {workflow.steps.filter(s => s.aiAssisted).length} AI-assisted
                </div>
                <div className="space-y-1">
                  {workflow.steps.slice(0, 3).map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <span className="text-gray-600">{step.title}</span>
                      {step.aiAssisted && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">AI</span>
                      )}
                    </div>
                  ))}
                  {workflow.steps.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{workflow.steps.length - 3} more steps
                    </div>
                  )}
                </div>
              </div>
              
              <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Start Workflow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Workflow Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-semibold">3</span>
            </div>
            <h4 className="font-medium text-gray-900">3-Step Completion</h4>
            <p className="text-sm text-gray-600">Complete any common task in 3 steps or less</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-semibold">💾</span>
            </div>
            <h4 className="font-medium text-gray-900">Auto-Save</h4>
            <p className="text-sm text-gray-600">Progress automatically saved at each step</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-semibold">🤖</span>
            </div>
            <h4 className="font-medium text-gray-900">AI Assistance</h4>
            <p className="text-sm text-gray-600">Mere helps with complex processing steps</p>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DocumentTextIcon, 
  PlusIcon, 
  CogIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  TagIcon,
  UserGroupIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface NotebookStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress: number
}

interface NotebookWorkflowProps {
  onComplete: (notebook: any) => void
  onCancel: () => void
  workflowType: 'create' | 'merge' | 'convert' | 'publish' | 'import'
}

export default function NotebookWorkflow({ onComplete, onCancel, workflowType }: NotebookWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notebook, setNotebook] = useState<any>({})
  const [steps, setSteps] = useState<NotebookStep[]>(getWorkflowSteps(workflowType))
  const fileInputRef = useRef<HTMLInputElement>(null)

  function getWorkflowSteps(type: string): NotebookStep[] {
    switch (type) {
      case 'create':
        return [
          { id: 'input', title: 'Note Content', description: 'Start writing or paste content', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'title', title: 'Generate Title', description: 'AI suggests semantic title', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'tags', title: 'Add Tags', description: 'Organize with tags', icon: TagIcon, status: 'pending', progress: 0 }
        ]
      case 'merge':
        return [
          { id: 'select', title: 'Select Notes', description: 'Choose notes to merge', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'preview', title: 'Preview Changes', description: 'Review merge differences', icon: EyeIcon, status: 'pending', progress: 0 },
          { id: 'confirm', title: 'Confirm Merge', description: 'Approve the merge', icon: CheckIcon, status: 'pending', progress: 0 }
        ]
      case 'convert':
        return [
          { id: 'select', title: 'Select Note', description: 'Choose note to convert', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'format', title: 'Choose Format', description: 'Flashcard, study guide, or quiz', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'generate', title: 'Generate Content', description: 'AI creates study materials', icon: CogIcon, status: 'pending', progress: 0 }
        ]
      case 'publish':
        return [
          { id: 'format', title: 'Choose Format', description: 'eBook, PDF, or HTML', icon: DocumentArrowDownIcon, status: 'pending', progress: 0 },
          { id: 'preview', title: 'Preview', description: 'Review the output', icon: EyeIcon, status: 'pending', progress: 0 },
          { id: 'metadata', title: 'Add Metadata', description: 'Title, author, description', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'export', title: 'Export', description: 'Generate final file', icon: DocumentArrowDownIcon, status: 'pending', progress: 0 }
        ]
      case 'import':
        return [
          { id: 'upload', title: 'Upload File', description: 'DOCX, PDF, or other formats', icon: DocumentArrowDownIcon, status: 'pending', progress: 0 },
          { id: 'convert', title: 'Convert & Clean', description: 'AI processes content', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'organize', title: 'Organize', description: 'Add tags and structure', icon: TagIcon, status: 'pending', progress: 0 }
        ]
      default:
        return []
    }
  }

  const simulateProcessing = async (stepIndex: number, duration: number) => {
    setIsProcessing(true)
    setSteps(prev => {
      const newSteps = [...prev]
      newSteps[stepIndex] = { ...newSteps[stepIndex], status: 'in-progress', progress: 0 }
      return newSteps
    })

    const interval = setInterval(() => {
      setSteps(prev => {
        const newSteps = [...prev]
        const currentProgress = newSteps[stepIndex].progress
        if (currentProgress < 90) {
          newSteps[stepIndex] = { ...newSteps[stepIndex], progress: currentProgress + 10 }
        }
        return newSteps
      })
    }, duration / 10)

    setTimeout(() => {
      clearInterval(interval)
      setSteps(prev => {
        const newSteps = [...prev]
        newSteps[stepIndex] = { ...newSteps[stepIndex], status: 'completed', progress: 100 }
        return newSteps
      })
      setIsProcessing(false)
      if (stepIndex < steps.length - 1) {
        setCurrentStep(stepIndex + 1)
      } else {
        handleWorkflowComplete()
      }
    }, duration)
  }

  const handleStartWorkflow = () => {
    simulateProcessing(0, 2000)
  }

  const handleWorkflowComplete = () => {
    const completedNotebook = {
      id: `notebook-${Date.now()}`,
      title: notebook.title || 'Untitled Notebook',
      content: notebook.content || '',
      tags: notebook.tags || [],
      type: workflowType,
      createdAt: new Date(),
      status: 'completed'
    }
    onComplete(completedNotebook)
  }

  const getStepContent = () => {
    const step = steps[currentStep]
    
    switch (workflowType) {
      case 'create':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Content
              </label>
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Start writing your note here..."
                value={notebook.content || ''}
                onChange={(e) => setNotebook((prev: any) => ({ ...prev, content: e.target.value }))}
              />
            </div>
            {currentStep === 1 && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">AI Title Suggestions</h4>
                <div className="space-y-2">
                  {['Meeting Notes: Project Planning Session', 'Technical Documentation: API Integration', 'Research Summary: AI Trends 2024'].map((title, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-2 hover:bg-blue-100 rounded text-blue-800"
                      onClick={() => setNotebook((prev: any) => ({ ...prev, title }))}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['meeting', 'project', 'research', 'technical', 'planning'].map((tag) => (
                    <button
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                      onClick={() => {
                        const currentTags = notebook.tags || []
                        if (!currentTags.includes(tag)) {
                          setNotebook((prev: any) => ({ ...prev, tags: [...currentTags, tag] }))
                        }
                      }}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(notebook.tags || []).map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                      {tag}
                      <button
                        onClick={() => {
                          const currentTags = notebook.tags || []
                          setNotebook((prev: any) => ({ ...prev, tags: currentTags.filter((t: string) => t !== tag) }))
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'merge':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Select Notes to Merge</h4>
                <div className="space-y-3">
                  {[
                    { id: 1, title: 'Meeting Notes - Monday', content: 'Project planning session...' },
                    { id: 2, title: 'Meeting Notes - Wednesday', content: 'Follow-up discussion...' },
                    { id: 3, title: 'Action Items', content: 'Tasks and next steps...' }
                  ].map((note) => (
                    <label key={note.id} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{note.title}</div>
                        <div className="text-sm text-gray-500">{note.content.substring(0, 50)}...</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Merge Preview</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="space-y-2">
                    <div className="text-green-600">+ Added: New action items from Wednesday meeting</div>
                    <div className="text-blue-600">~ Modified: Updated project timeline</div>
                    <div className="text-gray-600">= Unchanged: Monday meeting notes</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'convert':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Select Note to Convert</h4>
                <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  <option>Meeting Notes - Project Planning</option>
                  <option>Technical Documentation</option>
                  <option>Research Summary</option>
                </select>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Choose Format</h4>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'flashcards', title: 'Flashcards', description: 'Create study cards from key points' },
                    { id: 'quiz', title: 'Quiz', description: 'Generate questions and answers' },
                    { id: 'summary', title: 'Study Guide', description: 'Organized summary with highlights' }
                  ].map((format) => (
                    <button
                      key={format.id}
                      className="p-4 border border-gray-200 rounded-md text-left hover:bg-gray-50"
                      onClick={() => setNotebook((prev: any) => ({ ...prev, format: format.id }))}
                    >
                      <div className="font-medium text-gray-900">{format.title}</div>
                      <div className="text-sm text-gray-500">{format.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'publish':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Choose Export Format</h4>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'pdf', title: 'PDF Document', description: 'Professional document format' },
                    { id: 'epub', title: 'eBook (EPUB)', description: 'E-reader compatible format' },
                    { id: 'html', title: 'Web Page (HTML)', description: 'Web-ready format' }
                  ].map((format) => (
                    <button
                      key={format.id}
                      className="p-4 border border-gray-200 rounded-md text-left hover:bg-gray-50"
                      onClick={() => setNotebook((prev: any) => ({ ...prev, exportFormat: format.id }))}
                    >
                      <div className="font-medium text-gray-900">{format.title}</div>
                      <div className="text-sm text-gray-500">{format.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Preview</h4>
                <div className="bg-gray-50 p-4 rounded-md h-64 overflow-y-auto">
                  <h1 className="text-xl font-bold mb-4">Sample Document Preview</h1>
                  <p className="text-gray-700 mb-4">This is how your document will look when exported...</p>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter document title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter author name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter document description"
                  />
                </div>
              </div>
            )}
          </div>
        )

      case 'import':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Upload File</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".docx,.pdf,.txt"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Supports DOCX, PDF, and TXT files
                  </p>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Processing Content</h4>
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <CogIcon className="h-5 w-5 text-blue-600 animate-spin" />
                    <span className="text-blue-800">AI is analyzing and cleaning your content...</span>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Organize Content</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Suggested Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {['imported', 'documentation', 'research', 'meeting'].map((tag) => (
                        <button
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return <div>Unknown workflow type</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {workflowType.charAt(0).toUpperCase() + workflowType.slice(1)} Notebook
            </h1>
            <p className="text-gray-600 mt-2">
              Complete this workflow in {steps.length} steps or less
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                step.status === 'in-progress' ? 'bg-blue-500 border-blue-500 text-white' :
                'bg-white border-gray-300 text-gray-400'
              }`}>
                {step.status === 'completed' ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div key={step.id} className="text-center">
              <div className="text-sm font-medium text-gray-900">{step.title}</div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isProcessing}
              >
                Previous
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => simulateProcessing(currentStep, 2000)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Next'}
              </button>
            ) : (
              <button
                onClick={handleWorkflowComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
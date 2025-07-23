'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AcademicCapIcon, 
  ClockIcon, 
  CogIcon,
  EyeIcon,
  MicrophoneIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface LearningStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress: number
}

interface LearningWorkflowProps {
  onComplete: (learning: any) => void
  onCancel: () => void
  workflowType: 'flashcard' | 'quiz' | 'timeline' | 'audio' | 'course' | 'interview' | 'journal'
}

export default function LearningWorkflow({ onComplete, onCancel, workflowType }: LearningWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [learning, setLearning] = useState<any>({})
  const [steps, setSteps] = useState<LearningStep[]>(getWorkflowSteps(workflowType))
  const [currentMode, setCurrentMode] = useState<'timeline' | 'quiz' | 'notebook'>('timeline')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function getWorkflowSteps(type: string): LearningStep[] {
    switch (type) {
      case 'flashcard':
        return [
          { id: 'select', title: 'Select Source', description: 'Choose content for flashcards', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'generate', title: 'Auto-Generate', description: 'AI creates flashcards', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'edit', title: 'Edit Cards', description: 'Review and modify cards', icon: PencilIcon, status: 'pending', progress: 0 },
          { id: 'quiz', title: 'Start Quiz', description: 'Begin flashcard session', icon: QuestionMarkCircleIcon, status: 'pending', progress: 0 }
        ]
      case 'quiz':
        return [
          { id: 'select', title: 'Select Content', description: 'Choose material for quiz', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'difficulty', title: 'Set Difficulty', description: 'Configure difficulty levels', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'generate', title: 'Generate Quiz', description: 'AI creates questions', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'start', title: 'Begin Quiz', description: 'Start the quiz session', icon: PlayIcon, status: 'pending', progress: 0 }
        ]
      case 'timeline':
        return [
          { id: 'plan', title: 'Study Plan', description: 'Create learning timeline', icon: CalendarIcon, status: 'pending', progress: 0 },
          { id: 'schedule', title: 'Schedule', description: 'Set milestones and deadlines', icon: ClockIcon, status: 'pending', progress: 0 },
          { id: 'alerts', title: 'Set Alerts', description: 'Configure milestone notifications', icon: EyeIcon, status: 'pending', progress: 0 }
        ]
      case 'audio':
        return [
          { id: 'upload', title: 'Upload Audio', description: 'Upload lecture or meeting audio', icon: MicrophoneIcon, status: 'pending', progress: 0 },
          { id: 'process', title: 'Process Audio', description: 'AI transcribes and analyzes', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'create', title: 'Create Study Deck', description: 'Generate study materials', icon: AcademicCapIcon, status: 'pending', progress: 0 }
        ]
      case 'course':
        return [
          { id: 'select', title: 'Select Memories', description: 'Choose memories for course', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'breakdown', title: 'Module Breakdown', description: 'AI organizes into modules', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'titles', title: 'Auto-Titles', description: 'Generate module titles', icon: CogIcon, status: 'pending', progress: 0 }
        ]
      case 'interview':
        return [
          { id: 'warmup', title: 'Warm-up', description: 'Easy questions to start', icon: ChatBubbleLeftRightIcon, status: 'pending', progress: 0 },
          { id: 'mock', title: 'Mock Interview', description: 'Simulated interview session', icon: QuestionMarkCircleIcon, status: 'pending', progress: 0 },
          { id: 'feedback', title: 'Feedback', description: 'AI provides detailed feedback', icon: EyeIcon, status: 'pending', progress: 0 },
          { id: 'retry', title: 'Retry', description: 'Practice again with improvements', icon: ArrowPathIcon, status: 'pending', progress: 0 }
        ]
      case 'journal':
        return [
          { id: 'write', title: 'Write', description: 'Start journaling', icon: PencilIcon, status: 'pending', progress: 0 },
          { id: 'tag', title: 'Tag as You Type', description: 'Auto-suggest tags', icon: TagIcon, status: 'pending', progress: 0 },
          { id: 'reflect', title: 'Reflect', description: 'AI-powered reflection prompts', icon: ChatBubbleLeftRightIcon, status: 'pending', progress: 0 }
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

  const handleWorkflowComplete = () => {
    const completedLearning = {
      id: `learning-${Date.now()}`,
      title: learning.title || `${workflowType} Session`,
      type: workflowType,
      content: learning.content || {},
      createdAt: new Date(),
      status: 'completed'
    }
    onComplete(completedLearning)
  }

  const getStepContent = () => {
    const step = steps[currentStep]
    
    switch (workflowType) {
      case 'flashcard':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Select Source Content</h4>
                <div className="space-y-3">
                  {[
                    { id: 1, title: 'Meeting Notes - Project Planning', content: 'Project planning session...' },
                    { id: 2, title: 'Technical Documentation', content: 'API integration guide...' },
                    { id: 3, title: 'Research Summary', content: 'AI trends analysis...' }
                  ].map((source) => (
                    <label key={source.id} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                      <input
                        type="radio"
                        name="source"
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        onChange={() => setLearning((prev: any) => ({ ...prev, source }))}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{source.title}</div>
                        <div className="text-sm text-gray-500">{source.content.substring(0, 50)}...</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Generating Flashcards</h4>
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <CogIcon className="h-5 w-5 text-blue-600 animate-spin" />
                    <span className="text-blue-800">AI is creating flashcards from your content...</span>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Review Flashcards</h4>
                <div className="space-y-4">
                  {[
                    { front: 'What is the main goal of the project?', back: 'To create an AI-powered workflow platform' },
                    { front: 'How many steps should common tasks take?', back: '3 steps or less' },
                    { front: 'What is the AI assistant called?', back: 'Mere' }
                  ].map((card, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Front</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={card.front}
                            onChange={(e) => {
                              // Handle card editing
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Back</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={card.back}
                            onChange={(e) => {
                              // Handle card editing
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'quiz':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Select Quiz Content</h4>
                <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  <option>Meeting Notes - Project Planning</option>
                  <option>Technical Documentation</option>
                  <option>Research Summary</option>
                </select>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Set Difficulty Levels</h4>
                <div className="space-y-4">
                  {[
                    { section: 'Project Overview', difficulty: 'easy' },
                    { section: 'Technical Requirements', difficulty: 'medium' },
                    { section: 'Implementation Details', difficulty: 'hard' }
                  ].map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <span className="font-medium text-gray-900">{section.section}</span>
                      <select className="p-2 border border-gray-300 rounded-md">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Quiz Preview</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Questions:</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Easy Questions:</span>
                      <span className="font-medium">4</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Medium Questions:</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Hard Questions:</span>
                      <span className="font-medium">3</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'timeline':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Create Study Plan</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject/Topic</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Machine Learning Fundamentals"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Study Duration</label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>1 week</option>
                      <option>2 weeks</option>
                      <option>1 month</option>
                      <option>3 months</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Schedule Milestones</h4>
                <div className="space-y-4">
                  {[
                    { milestone: 'Complete Chapter 1', date: '2024-01-15' },
                    { milestone: 'Practice Exercises', date: '2024-01-18' },
                    { milestone: 'Take Quiz 1', date: '2024-01-20' },
                    { milestone: 'Review & Revise', date: '2024-01-22' }
                  ].map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-md">
                      <input
                        type="date"
                        className="p-2 border border-gray-300 rounded-md"
                        value={milestone.date}
                      />
                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        value={milestone.milestone}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Set Alert Preferences</h4>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" defaultChecked />
                    <span>Email reminders</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" defaultChecked />
                    <span>Push notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
                    <span>SMS alerts</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Upload Audio File</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <MicrophoneIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Choose Audio File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="audio/*"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Supports MP3, WAV, M4A files
                  </p>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Processing Audio</h4>
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <CogIcon className="h-5 w-5 text-blue-600 animate-spin" />
                    <span className="text-blue-800">AI is transcribing and analyzing your audio...</span>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Study Materials Generated</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h5 className="font-medium text-gray-900 mb-2">📝 Transcript</h5>
                    <p className="text-sm text-gray-600">Complete text transcription of the audio</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h5 className="font-medium text-gray-900 mb-2">🎯 Key Points</h5>
                    <p className="text-sm text-gray-600">Main topics and important concepts</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h5 className="font-medium text-gray-900 mb-2">❓ Quiz Questions</h5>
                    <p className="text-sm text-gray-600">Generated questions for testing knowledge</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'interview':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Warm-up Questions</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <h5 className="font-medium text-green-900 mb-2">Question 1</h5>
                    <p className="text-green-800">Tell me about yourself and your background.</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <h5 className="font-medium text-green-900 mb-2">Question 2</h5>
                    <p className="text-green-800">What interests you about this role?</p>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Mock Interview Session</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h5 className="font-medium text-blue-900 mb-2">Technical Question</h5>
                    <p className="text-blue-800">Explain the difference between REST and GraphQL APIs.</p>
                  </div>
                  <div className="flex space-x-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Start Answer
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      Skip Question
                    </button>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">AI Feedback</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h5 className="font-medium text-yellow-900 mb-2">Strengths</h5>
                    <ul className="text-yellow-800 text-sm space-y-1">
                      <li>• Good technical knowledge</li>
                      <li>• Clear communication</li>
                      <li>• Relevant examples provided</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <h5 className="font-medium text-red-900 mb-2">Areas for Improvement</h5>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• Could provide more specific examples</li>
                      <li>• Consider mentioning recent trends</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'journal':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Start Journaling</h4>
                <textarea
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your thoughts, experiences, or reflections here..."
                  value={learning.content || ''}
                  onChange={(e) => setLearning((prev: any) => ({ ...prev, content: e.target.value }))}
                />
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Suggested Tags</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['reflection', 'learning', 'personal', 'work', 'goals'].map((tag) => (
                    <button
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(learning.tags || []).map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                      {tag}
                      <button className="ml-2 text-blue-600 hover:text-blue-800">
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Reflection Prompts</h4>
                <div className="space-y-3">
                  {[
                    'What did you learn today?',
                    'What challenges did you face?',
                    'How did you overcome obstacles?',
                    'What would you do differently?'
                  ].map((prompt, index) => (
                    <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-gray-700">{prompt}</p>
                    </div>
                  ))}
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
              {workflowType.charAt(0).toUpperCase() + workflowType.slice(1)} Learning
            </h1>
            <p className="text-gray-600 mt-2">
              Complete this learning workflow in {steps.length} steps or less
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
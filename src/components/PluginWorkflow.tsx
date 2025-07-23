'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PuzzlePieceIcon, 
  CogIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline'

interface PluginStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress: number
}

interface PluginWorkflowProps {
  onComplete: (plugin: any) => void
  onCancel: () => void
  workflowType: 'install' | 'configure' | 'test' | 'uninstall' | 'integrate' | 'automate'
}

export default function PluginWorkflow({ onComplete, onCancel, workflowType }: PluginWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [plugin, setPlugin] = useState<any>({})
  const [steps, setSteps] = useState<PluginStep[]>(getWorkflowSteps(workflowType))
  const [testResults, setTestResults] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function getWorkflowSteps(type: string): PluginStep[] {
    switch (type) {
      case 'install':
        return [
          { id: 'preview', title: 'Preview Plugin', description: 'Review plugin details and capabilities', icon: EyeIcon, status: 'pending', progress: 0 },
          { id: 'permissions', title: 'Permissions', description: 'Review and approve permissions', icon: ShieldCheckIcon, status: 'pending', progress: 0 },
          { id: 'test', title: 'Test Plugin', description: 'Verify functionality', icon: PlayIcon, status: 'pending', progress: 0 },
          { id: 'finish', title: 'Finish Installation', description: 'Complete setup and integration', icon: CheckIcon, status: 'pending', progress: 0 }
        ]
      case 'configure':
        return [
          { id: 'select', title: 'Select Plugin', description: 'Choose plugin to configure', icon: PuzzlePieceIcon, status: 'pending', progress: 0 },
          { id: 'settings', title: 'Configure Settings', description: 'Adjust plugin parameters', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'validate', title: 'Validate Config', description: 'Test configuration', icon: CheckIcon, status: 'pending', progress: 0 }
        ]
      case 'test':
        return [
          { id: 'setup', title: 'Test Setup', description: 'Prepare test environment', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'run', title: 'Run Tests', description: 'Execute test scenarios', icon: PlayIcon, status: 'pending', progress: 0 },
          { id: 'results', title: 'Review Results', description: 'Analyze test outcomes', icon: EyeIcon, status: 'pending', progress: 0 }
        ]
      case 'uninstall':
        return [
          { id: 'check', title: 'Check Dependencies', description: 'Verify no conflicts', icon: ExclamationTriangleIcon, status: 'pending', progress: 0 },
          { id: 'backup', title: 'Backup Data', description: 'Save plugin data', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'remove', title: 'Remove Plugin', description: 'Uninstall safely', icon: XMarkIcon, status: 'pending', progress: 0 }
        ]
      case 'integrate':
        return [
          { id: 'select', title: 'Select Integration', description: 'Choose workflow integration', icon: PuzzlePieceIcon, status: 'pending', progress: 0 },
          { id: 'configure', title: 'Configure Integration', description: 'Set up workflow steps', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'test', title: 'Test Integration', description: 'Verify workflow works', icon: PlayIcon, status: 'pending', progress: 0 }
        ]
      case 'automate':
        return [
          { id: 'setup', title: 'Setup Automation', description: 'Configure automated tasks', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'schedule', title: 'Schedule Tasks', description: 'Set execution timing', icon: ClockIcon, status: 'pending', progress: 0 },
          { id: 'monitor', title: 'Monitor Execution', description: 'Track automation status', icon: EyeIcon, status: 'pending', progress: 0 }
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
    const completedPlugin = {
      id: `plugin-${Date.now()}`,
      name: plugin.name || `${workflowType} Plugin`,
      type: workflowType,
      status: 'completed',
      createdAt: new Date(),
      config: plugin.config || {},
      testResults: testResults
    }
    onComplete(completedPlugin)
  }

  const getStepContent = () => {
    const step = steps[currentStep]
    
    switch (workflowType) {
      case 'install':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Plugin Preview</h4>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <PuzzlePieceIcon className="h-12 w-12 text-blue-600" />
                    <div>
                      <h5 className="text-lg font-medium text-gray-900">AI Content Generator</h5>
                      <p className="text-sm text-gray-500">Version 2.1.0 • By Ntu Labs</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h6 className="font-medium text-gray-900">Description</h6>
                      <p className="text-sm text-gray-600">
                        Automatically generate high-quality content from your memories and notes. 
                        Supports multiple formats including articles, summaries, and creative writing.
                      </p>
                    </div>
                    <div>
                      <h6 className="font-medium text-gray-900">Capabilities</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Content generation from memory context</li>
                        <li>• Multiple output formats (article, summary, creative)</li>
                        <li>• Style and tone customization</li>
                        <li>• Integration with existing workflows</li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-medium text-gray-900">Rating</h6>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-yellow-400">★</span>
                        ))}
                        <span className="text-sm text-gray-500 ml-2">4.8/5 (127 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Required Permissions</h4>
                <div className="space-y-4">
                  {[
                    { permission: 'Read Memories', description: 'Access to read your memory content', required: true },
                    { permission: 'Write Content', description: 'Create new content files', required: true },
                    { permission: 'Access Workflows', description: 'Integrate with existing workflows', required: false },
                    { permission: 'Network Access', description: 'Connect to external APIs', required: false }
                  ].map((perm, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <div className="font-medium text-gray-900">{perm.permission}</div>
                        <div className="text-sm text-gray-500">{perm.description}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {perm.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                        )}
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            defaultChecked={perm.required}
                            disabled={perm.required}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Testing Plugin</h4>
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <div className="flex items-center space-x-2">
                    <PlayIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-800">Running test scenarios...</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                    <span className="text-green-800">✓ Memory access test passed</span>
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                    <span className="text-green-800">✓ Content generation test passed</span>
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                    <span className="text-green-800">✓ Workflow integration test passed</span>
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'configure':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Select Plugin to Configure</h4>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setPlugin((prev: any) => ({ ...prev, selectedPlugin: e.target.value }))}
                >
                  <option value="">Choose a plugin...</option>
                  <option value="ai-content-generator">AI Content Generator</option>
                  <option value="memory-analyzer">Memory Analyzer</option>
                  <option value="workflow-automator">Workflow Automator</option>
                  <option value="data-exporter">Data Exporter</option>
                </select>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Plugin Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Style
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>Professional</option>
                      <option>Casual</option>
                      <option>Academic</option>
                      <option>Creative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output Length
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input type="radio" name="length" className="mr-2" defaultChecked />
                        <span>Short (100-200 words)</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="length" className="mr-2" />
                        <span>Medium (300-500 words)</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="length" className="mr-2" />
                        <span>Long (500+ words)</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Memory Context Window
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      defaultValue="5"
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>1 memory</span>
                      <span>5 memories</span>
                      <span>10 memories</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Configuration Validation</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                    <span className="text-green-800">✓ Style configuration valid</span>
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                    <span className="text-green-800">✓ Length settings compatible</span>
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                    <span className="text-green-800">✓ Memory context optimized</span>
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'test':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Test Environment Setup</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <CogIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800">Preparing test environment...</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Test memory data loaded</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Plugin dependencies verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Test scenarios prepared</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Running Test Scenarios</h4>
                <div className="space-y-4">
                  {[
                    { name: 'Basic Functionality', status: 'completed', result: 'PASS' },
                    { name: 'Memory Integration', status: 'completed', result: 'PASS' },
                    { name: 'Workflow Compatibility', status: 'in-progress', result: 'RUNNING' },
                    { name: 'Performance Test', status: 'pending', result: 'PENDING' },
                    { name: 'Error Handling', status: 'pending', result: 'PENDING' }
                  ].map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        {test.status === 'completed' && <CheckIcon className="h-4 w-4 text-green-600" />}
                        {test.status === 'in-progress' && <PlayIcon className="h-4 w-4 text-blue-600 animate-spin" />}
                        {test.status === 'pending' && <ClockIcon className="h-4 w-4 text-gray-400" />}
                        <span className="font-medium text-gray-900">{test.name}</span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded ${
                        test.result === 'PASS' ? 'bg-green-100 text-green-800' :
                        test.result === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {test.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Test Results Summary</h4>
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">5</div>
                      <div className="text-sm text-gray-600">Passed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">0</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">100%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <h6 className="font-medium text-green-900 mb-1">Performance</h6>
                    <p className="text-sm text-green-800">All tests completed within acceptable time limits</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <h6 className="font-medium text-green-900 mb-1">Compatibility</h6>
                    <p className="text-sm text-green-800">Plugin integrates seamlessly with existing workflows</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <h6 className="font-medium text-green-900 mb-1">Reliability</h6>
                    <p className="text-sm text-green-800">Error handling and edge cases properly managed</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'uninstall':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Dependency Check</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Dependencies Found</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      This plugin is used by 2 workflows. Removing it may affect their functionality.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">Content Generation Workflow</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Will be affected</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">Memory Analysis Workflow</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Will be affected</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Backup Plugin Data</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800">Creating backup...</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Configuration files</span>
                      <span className="text-sm text-gray-900">✓ Backed up</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Generated content</span>
                      <span className="text-sm text-gray-900">✓ Backed up</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Usage statistics</span>
                      <span className="text-sm text-gray-900">✓ Backed up</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      Backup completed successfully. Data saved to: <code className="bg-green-100 px-1 rounded">/backups/ai-content-generator-2024-01-15.zip</code>
                    </p>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Confirm Uninstallation</h4>
                <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">Final Warning</span>
                  </div>
                  <p className="text-sm text-red-800">
                    This action cannot be undone. The plugin and all its data will be permanently removed.
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                    <span className="text-sm text-gray-700">I understand this action is irreversible</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                    <span className="text-sm text-gray-700">I have reviewed the affected workflows</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                    <span className="text-sm text-gray-700">I confirm the backup was created successfully</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )

      case 'integrate':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Select Workflow Integration</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Memory Creation', description: 'Add AI content generation to memory creation' },
                    { name: 'Note Publishing', description: 'Integrate content optimization for publishing' },
                    { name: 'Study Material Generation', description: 'Auto-generate study materials from notes' },
                    { name: 'Report Generation', description: 'Create automated reports from memory data' }
                  ].map((integration, index) => (
                    <label key={index} className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50">
                      <input
                        type="radio"
                        name="integration"
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        onChange={() => setPlugin((prev: any) => ({ ...prev, selectedIntegration: integration.name }))}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{integration.name}</div>
                        <div className="text-sm text-gray-500">{integration.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Configure Integration Steps</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trigger Condition
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>After memory creation</option>
                      <option>Before publishing</option>
                      <option>On manual request</option>
                      <option>On schedule</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" defaultChecked />
                        <span>Summary generation</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
                        <span>Key insights extraction</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
                        <span>Related content suggestions</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Integration Test</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <PlayIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800">Testing integration workflow...</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <span className="text-green-800">✓ Trigger condition works</span>
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <span className="text-green-800">✓ Content generation successful</span>
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <span className="text-green-800">✓ Integration seamless</span>
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'automate':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Setup Automation</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Automation Type
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>Content generation</option>
                      <option>Memory analysis</option>
                      <option>Report creation</option>
                      <option>Data cleanup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Input Source
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="source" className="mr-3" defaultChecked />
                        <span>All memories</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="source" className="mr-3" />
                        <span>Tagged memories only</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="source" className="mr-3" />
                        <span>Recent memories (last 7 days)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Schedule Automation</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      defaultValue="09:00"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>UTC</option>
                      <option>EST</option>
                      <option>PST</option>
                      <option>GMT</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Monitor Execution</h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h6 className="font-medium text-gray-900 mb-2">Last Execution</h6>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className="text-green-600 font-medium">Completed</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time:</span>
                        <span className="text-gray-900">2024-01-15 09:00 UTC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="text-gray-900">2m 34s</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items processed:</span>
                        <span className="text-gray-900">47 memories</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <span className="text-green-800">✓ Automation active</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600">Running</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <span className="text-blue-800">Next execution: 2024-01-16 09:00 UTC</span>
                      <ClockIcon className="h-4 w-4 text-blue-600" />
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
              {workflowType.charAt(0).toUpperCase() + workflowType.slice(1)} Plugin
            </h1>
            <p className="text-gray-600 mt-2">
              Complete this plugin workflow in {steps.length} steps or less
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
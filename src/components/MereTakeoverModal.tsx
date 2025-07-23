'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  XMarkIcon,
  SparklesIcon,
  PlayIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface WorkflowSummary {
  currentStep: string
  completedSteps: string[]
  remainingSteps: string[]
  workflowData: Record<string, any>
  estimatedTimeRemaining: string
  suggestedActions: string[]
}

interface MereTakeoverModalProps {
  isOpen: boolean
  workflowTitle: string
  workflowSummary: WorkflowSummary
  onTakeover: () => void
  onSummarize: () => void
  onClose: () => void
}

export function MereTakeoverModal({
  isOpen,
  workflowTitle,
  workflowSummary,
  onTakeover,
  onSummarize,
  onClose
}: MereTakeoverModalProps) {
  const [selectedAction, setSelectedAction] = useState<'takeover' | 'summarize' | null>(null)

  const handleAction = () => {
    if (selectedAction === 'takeover') {
      onTakeover()
    } else if (selectedAction === 'summarize') {
      onSummarize()
    }
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Mere AI Assistant
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Help with "{workflowTitle}" workflow
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Workflow Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Workflow Summary</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Current Step</p>
                      <p className="text-sm text-gray-600">{workflowSummary.currentStep}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Estimated Time Remaining</p>
                      <p className="text-sm text-gray-600">{workflowSummary.estimatedTimeRemaining}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Completed ({workflowSummary.completedSteps.length})</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {workflowSummary.completedSteps.map((step, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Remaining ({workflowSummary.remainingSteps.length})</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {workflowSummary.remainingSteps.map((step, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                {workflowSummary.suggestedActions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-900 mb-2">AI Suggestions</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {workflowSummary.suggestedActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-4 h-4 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium text-blue-700 mt-0.5">
                            {index + 1}
                          </span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Selection */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">How can Mere help?</h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setSelectedAction('takeover')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedAction === 'takeover'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <PlayIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Complete Workflow</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Let Mere take over and complete the remaining steps automatically using your existing data and preferences.
                          </p>
                          <p className="text-xs text-blue-600 mt-2">
                            Estimated completion: {workflowSummary.estimatedTimeRemaining}
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedAction('summarize')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedAction === 'summarize'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <DocumentTextIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Summarize Progress</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Generate a detailed summary of your progress and provide recommendations for next steps.
                          </p>
                          <p className="text-xs text-green-600 mt-2">
                            You retain full control • Continue manually when ready
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                  <div className="flex items-start gap-2">
                    <EyeIcon className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-xs text-yellow-800">
                      <p className="font-medium">Privacy Notice</p>
                      <p>
                        Mere will only access data you've already provided in this workflow. 
                        No external data will be accessed without explicit permission.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    disabled={!selectedAction}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    {selectedAction === 'takeover' ? 'Let Mere Complete' : 
                     selectedAction === 'summarize' ? 'Generate Summary' : 
                     'Select Action'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
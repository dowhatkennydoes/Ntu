'use client'

import { useState, useEffect } from 'react'
import { ExclamationTriangleIcon, WifiIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'

export function ErrorDemoWorkflow() {
  const { updateWorkflowData, nextStep, handleAsyncOperation } = useWorkflow()
  const [selectedErrorType, setSelectedErrorType] = useState<string>('')

  const errorTypes = [
    {
      id: 'network',
      name: 'Network Error',
      description: 'Simulate a network connection failure',
      icon: WifiIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'permission',
      name: 'Permission Error',
      description: 'Simulate insufficient permissions',
      icon: ShieldExclamationIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'validation',
      name: 'Validation Error',
      description: 'Simulate invalid input data',
      icon: ExclamationTriangleIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'success',
      name: 'Success Path',
      description: 'Complete the step successfully',
      icon: ExclamationTriangleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  const handleSubmit = async () => {
    if (!selectedErrorType) return

    updateWorkflowData({ errorDemo: selectedErrorType })

    if (selectedErrorType === 'success') {
      // Success path
      const result = await handleAsyncOperation(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 1000))
          return { success: true }
        },
        'Demo Step',
        { errorType: selectedErrorType }
      )

      if (result.success) {
        nextStep()
      }
    } else {
      // Error simulation
      await handleAsyncOperation(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          switch (selectedErrorType) {
            case 'network':
              throw new Error('Network request failed: Unable to connect to server')
            case 'permission':
              throw new Error('Permission denied: Insufficient access rights')
            case 'validation':
              throw new Error('Validation failed: Invalid input data format')
            default:
              throw new Error('Unknown error occurred')
          }
        },
        'Demo Step',
        { errorType: selectedErrorType }
      )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Error Handling Demo</h3>
        <p className="text-sm text-gray-600 mb-6">
          Select an error type to see how the workflow handles different failure scenarios.
          Each error type demonstrates different recovery options.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {errorTypes.map((errorType) => (
          <button
            key={errorType.id}
            onClick={() => setSelectedErrorType(errorType.id)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              selectedErrorType === errorType.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${errorType.bgColor} flex items-center justify-center`}>
                <errorType.icon className={`h-5 w-5 ${errorType.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{errorType.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{errorType.description}</p>
                
                {errorType.id === 'network' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Retryable • Max 3 attempts • Rollback available
                  </p>
                )}
                
                {errorType.id === 'permission' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Non-retryable • Rollback only • Exit available
                  </p>
                )}
                
                {errorType.id === 'validation' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Retryable • Max 1 attempt • No skip option
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How Error Recovery Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Retry:</strong> Attempts the failed operation again (if retryable)</li>
          <li>• <strong>Rollback:</strong> Returns to the previous step</li>
          <li>• <strong>Skip:</strong> Continues without completing the step (when available)</li>
          <li>• <strong>Exit:</strong> Cancels the entire workflow</li>
        </ul>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedErrorType}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedErrorType === 'success' ? 'Continue Successfully' : 'Trigger Error'}
      </button>
    </div>
  )
}
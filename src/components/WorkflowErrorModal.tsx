'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ForwardIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { WorkflowError } from '@/hooks/use-workflow-error-handling'

interface WorkflowErrorModalProps {
  isOpen: boolean
  error: WorkflowError | null
  isRecovering: boolean
  onRetry: () => Promise<void>
  onRollback: () => void
  onSkip?: () => void
  onExit: () => void
  onClose: () => void
}

export function WorkflowErrorModal({
  isOpen,
  error,
  isRecovering,
  onRetry,
  onRollback,
  onSkip,
  onExit,
  onClose
}: WorkflowErrorModalProps) {
  if (!error) return null

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
        </div>
      case 'permission':
        return <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
      default:
        return <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
        </div>
    }
  }

  const getErrorTitle = () => {
    switch (error.type) {
      case 'network':
        return 'Network Error'
      case 'permission':
        return 'Permission Error'
      case 'validation':
        return 'Validation Error'
      case 'processing':
        return 'Processing Error'
      case 'timeout':
        return 'Timeout Error'
      default:
        return 'Unexpected Error'
    }
  }

  const canRetry = error.recoverable && error.retryCount < error.maxRetries

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  {getErrorIcon()}
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {getErrorTitle()}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Error occurred in: <span className="font-medium">{error.step}</span>
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        {error.message}
                      </p>
                      
                      {error.retryCount > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Retry attempts: {error.retryCount}/{error.maxRetries}
                        </p>
                      )}
                      
                      {error.context && (
                        <details className="mt-3">
                          <summary className="text-xs text-gray-500 cursor-pointer">
                            Technical details
                          </summary>
                          <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-auto">
                            {JSON.stringify(error.context, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  {/* Primary action - Retry if available */}
                  {canRetry && (
                    <button
                      onClick={async () => {
                        await onRetry()
                        onClose()
                      }}
                      disabled={isRecovering}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRecovering ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowPathIcon className="h-4 w-4" />
                      )}
                      Retry ({error.retryCount}/{error.maxRetries})
                    </button>
                  )}

                  {/* Secondary actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onRollback()
                        onClose()
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <ArrowUturnLeftIcon className="h-4 w-4" />
                      Go Back
                    </button>

                    {onSkip && error.type !== 'validation' && (
                      <button
                        onClick={() => {
                          onSkip()
                          onClose()
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                      >
                        <ForwardIcon className="h-4 w-4" />
                        Skip Step
                      </button>
                    )}
                  </div>

                  {/* Exit action */}
                  <button
                    onClick={() => {
                      onExit()
                      onClose()
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Exit Workflow
                  </button>
                </div>

                {/* Error prevention tips */}
                {error.type === 'network' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Tip:</strong> Check your internet connection and try again.
                    </p>
                  </div>
                )}

                {error.type === 'validation' && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      <strong>Tip:</strong> Please check your input and correct any errors before proceeding.
                    </p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
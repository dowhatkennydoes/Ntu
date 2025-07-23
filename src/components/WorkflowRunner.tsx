'use client'

import { useEffect, useState } from 'react'
import { CheckIcon, ClockIcon, CogIcon, ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useWorkflow } from './WorkflowProvider'
import { WorkflowErrorModal } from './WorkflowErrorModal'
import { MereTakeoverModal } from './MereTakeoverModal'
import { toast } from 'react-hot-toast'

interface WorkflowRunnerProps {
  className?: string
}

export function WorkflowRunner({ className }: WorkflowRunnerProps) {
  const { 
    currentWorkflow, 
    currentStep, 
    totalSteps, 
    steps, 
    workflowData,
    isLoading,
    nextStep,
    previousStep,
    finishWorkflow,
    cancelWorkflow,
    errors,
    isRecovering,
    getErrorSummary,
    handleAsyncOperation
  } = useWorkflow()

  const [showErrorModal, setShowErrorModal] = useState(false)
  const [currentError, setCurrentError] = useState<any>(null)
  const [showMereModal, setShowMereModal] = useState(false)

  const errorSummary = getErrorSummary()

  // Generate workflow summary for Mere
  const getWorkflowSummary = () => {
    const completedSteps = steps.slice(0, currentStep).map(step => step.title)
    const remainingSteps = steps.slice(currentStep + 1).map(step => step.title)
    
    return {
      currentStep: steps[currentStep]?.title || 'Unknown',
      completedSteps,
      remainingSteps,
      workflowData: workflowData,
      estimatedTimeRemaining: `${remainingSteps.length * 2} minutes`,
      suggestedActions: [
        'Complete remaining steps with smart defaults',
        'Auto-fill forms based on previous inputs',
        'Skip optional steps to speed up completion',
        'Generate summary and next action recommendations'
      ]
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentWorkflow || showErrorModal) return

      if (e.key === 'ArrowRight' && currentStep < totalSteps - 1 && errorSummary.canProceed) {
        nextStep()
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        previousStep()
      } else if (e.key === 'Escape') {
        cancelWorkflow()
      } else if (e.key === 'm' || e.key === 'M') {
        setShowMereModal(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentWorkflow, currentStep, totalSteps, nextStep, previousStep, cancelWorkflow, showErrorModal, errorSummary])

  // Show error modal when new errors occur
  useEffect(() => {
    if (errors.length > 0 && !showErrorModal) {
      const latestError = errors[errors.length - 1]
      setCurrentError(latestError)
      setShowErrorModal(true)
    }
  }, [errors, showErrorModal])

  const handleRetry = async () => {
    if (!currentError) return
    
    // Simulate retry operation for the current step
    await handleAsyncOperation(
      async () => {
        // Mock retry operation
        await new Promise(resolve => setTimeout(resolve, 1000))
        return true
      },
      currentError.step
    )
  }

  const handleSkip = () => {
    if (currentStep < totalSteps - 1) {
      nextStep()
    }
  }

  const handleMereTakeover = async () => {
    const remainingSteps = totalSteps - currentStep - 1
    toast.success('Mere is taking over the workflow...')
    
    // Simulate Mere completing the workflow
    for (let i = 0; i < remainingSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      if (currentStep < totalSteps - 1) {
        nextStep()
        toast.success(`Mere completed: ${steps[currentStep + i]?.title}`)
      }
    }
    
    toast.success('Workflow completed by Mere!')
    setTimeout(() => finishWorkflow(), 1000)
  }

  const handleMereSummarize = () => {
    const summary = getWorkflowSummary()
    const summaryText = `
Workflow Summary: ${currentWorkflow}

Progress: ${summary.completedSteps.length}/${steps.length} steps completed

✅ Completed:
${summary.completedSteps.map(step => `• ${step}`).join('\n')}

⏳ Remaining:
${summary.remainingSteps.map(step => `• ${step}`).join('\n')}

🤖 AI Recommendations:
${summary.suggestedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

Estimated completion time: ${summary.estimatedTimeRemaining}
    `.trim()

    navigator.clipboard.writeText(summaryText)
    toast.success('Workflow summary copied to clipboard!')
  }

  if (!currentWorkflow) {
    return null
  }

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className={cn('bg-white border rounded-lg shadow-sm', className)}>
      {/* Progress Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{currentStepData?.title}</h3>
          <div className="flex items-center gap-2">
            {errorSummary.hasErrors && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>{errorSummary.total} error{errorSummary.total !== 1 ? 's' : ''}</span>
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {totalSteps}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              errorSummary.hasErrors && !errorSummary.canProceed 
                ? "bg-red-500" 
                : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            {/* AI Assistance Indicator */}
            {currentStepData?.aiAssisted && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <CogIcon className="h-4 w-4 animate-spin" />
                <span>Mere is assisting</span>
              </div>
            )}

            {/* Error Summary */}
            {errorSummary.hasErrors && (
              <div className="flex items-center gap-2 text-sm">
                {errorSummary.retryable > 0 && (
                  <span className="text-yellow-600">{errorSummary.retryable} retryable</span>
                )}
                {errorSummary.critical > 0 && (
                  <span className="text-red-600">{errorSummary.critical} critical</span>
                )}
              </div>
            )}
          </div>

          {/* Recovery Status & Mere Button */}
          <div className="flex items-center gap-3">
            {isRecovering && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <ClockIcon className="h-4 w-4 animate-spin" />
                <span>Recovering...</span>
              </div>
            )}
            
            {/* Mere Assistance Button */}
            <button
              onClick={() => setShowMereModal(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              title="Press M to open Mere assistant"
            >
              <SparklesIcon className="h-4 w-4" />
              Ask Mere
            </button>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4">
        {currentStepData?.description && (
          <p className="text-muted-foreground mb-4">{currentStepData.description}</p>
        )}
        
        {currentStepData?.component}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClockIcon className="h-4 w-4" />
            <span>Processing...</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t bg-gray-50">
        <button
          onClick={previousStep}
          disabled={currentStep === 0 || isRecovering}
          className="px-3 py-2 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full',
                index < currentStep ? 'bg-green-500' : 
                index === currentStep ? (
                  errorSummary.hasErrors && !errorSummary.canProceed 
                    ? 'bg-red-500' 
                    : 'bg-primary'
                ) : 'bg-gray-300'
              )}
            />
          ))}
        </div>

        {currentStep === totalSteps - 1 ? (
          <button
            onClick={finishWorkflow}
            disabled={!errorSummary.canProceed || isRecovering}
            className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="h-4 w-4" />
            Complete
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!errorSummary.canProceed || isRecovering}
            className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        )}
      </div>

      {/* Auto-save Indicator */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-t">
        Progress auto-saved • Use ← → arrows to navigate • Press Esc to cancel • Press M for Mere
        {errorSummary.hasErrors && (
          <span className="text-red-600"> • Resolve errors to continue</span>
        )}
      </div>

      {/* Error Modal */}
      <WorkflowErrorModal
        isOpen={showErrorModal}
        error={currentError}
        isRecovering={isRecovering}
        onRetry={handleRetry}
        onRollback={previousStep}
        onSkip={handleSkip}
        onExit={cancelWorkflow}
        onClose={() => {
          setShowErrorModal(false)
          setCurrentError(null)
        }}
      />

      {/* Mere Takeover Modal */}
      <MereTakeoverModal
        isOpen={showMereModal}
        workflowTitle={currentWorkflow || 'Unknown Workflow'}
        workflowSummary={getWorkflowSummary()}
        onTakeover={handleMereTakeover}
        onSummarize={handleMereSummarize}
        onClose={() => setShowMereModal(false)}
      />
    </div>
  )
}
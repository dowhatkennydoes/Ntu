'use client'

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

export interface WorkflowError {
  id: string
  type: 'network' | 'validation' | 'processing' | 'permission' | 'timeout' | 'unknown'
  message: string
  step: string
  timestamp: string
  recoverable: boolean
  retryCount: number
  maxRetries: number
  context?: Record<string, any>
}

interface ErrorAction {
  type: 'retry' | 'rollback' | 'skip' | 'exit'
  label: string
  description: string
  handler: () => void
  primary?: boolean
}

export function useWorkflowErrorHandling() {
  const [errors, setErrors] = useState<WorkflowError[]>([])
  const [isRecovering, setIsRecovering] = useState(false)

  const createError = useCallback((
    type: WorkflowError['type'],
    message: string,
    step: string,
    context?: Record<string, any>
  ): WorkflowError => {
    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      step,
      timestamp: new Date().toISOString(),
      recoverable: type !== 'permission',
      retryCount: 0,
      maxRetries: type === 'network' ? 3 : type === 'processing' ? 2 : 1,
      context
    }
  }, [])

  const addError = useCallback((error: WorkflowError) => {
    setErrors(prev => [...prev, error])
    
    // Show toast notification
    toast.error(`Error in ${error.step}: ${error.message}`, {
      duration: 5000,
      id: error.id
    })
  }, [])

  const removeError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId))
    toast.dismiss(errorId)
  }, [])

  const retryError = useCallback(async (
    errorId: string,
    retryHandler: () => Promise<void>
  ) => {
    const error = errors.find(e => e.id === errorId)
    if (!error || error.retryCount >= error.maxRetries) return false

    setIsRecovering(true)
    
    try {
      // Update retry count
      setErrors(prev => prev.map(e => 
        e.id === errorId 
          ? { ...e, retryCount: e.retryCount + 1 }
          : e
      ))

      await retryHandler()
      
      // Remove error on success
      removeError(errorId)
      toast.success(`Retry successful for ${error.step}`)
      return true
    } catch (retryError) {
      const updatedError = {
        ...error,
        retryCount: error.retryCount + 1,
        message: retryError instanceof Error ? retryError.message : 'Retry failed'
      }
      
      setErrors(prev => prev.map(e => 
        e.id === errorId ? updatedError : e
      ))
      
      if (updatedError.retryCount >= updatedError.maxRetries) {
        toast.error(`Max retries reached for ${error.step}`)
      }
      
      return false
    } finally {
      setIsRecovering(false)
    }
  }, [errors, removeError])

  const getErrorActions = useCallback((
    error: WorkflowError,
    onRetry: () => Promise<void>,
    onRollback: () => void,
    onSkip?: () => void,
    onExit?: () => void
  ): ErrorAction[] => {
    const actions: ErrorAction[] = []

    // Retry action
    if (error.recoverable && error.retryCount < error.maxRetries) {
      actions.push({
        type: 'retry',
        label: `Retry (${error.retryCount}/${error.maxRetries})`,
        description: 'Try the failed step again',
        handler: () => retryError(error.id, onRetry),
        primary: true
      })
    }

    // Rollback action
    actions.push({
      type: 'rollback',
      label: 'Go Back',
      description: 'Return to the previous step',
      handler: onRollback
    })

    // Skip action (if provided)
    if (onSkip && error.type !== 'validation') {
      actions.push({
        type: 'skip',
        label: 'Skip Step',
        description: 'Continue without completing this step',
        handler: () => {
          removeError(error.id)
          onSkip()
        }
      })
    }

    // Exit action
    actions.push({
      type: 'exit',
      label: 'Exit Workflow',
      description: 'Cancel and return to dashboard',
      handler: () => {
        if (onExit) {
          onExit()
        }
        removeError(error.id)
      }
    })

    return actions
  }, [retryError, removeError])

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    step: string,
    context?: Record<string, any>
  ): Promise<{ success: boolean; data?: T; error?: WorkflowError }> => {
    try {
      const data = await operation()
      return { success: true, data }
    } catch (error) {
      let errorType: WorkflowError['type'] = 'unknown'
      let message = 'An unexpected error occurred'

      if (error instanceof Error) {
        message = error.message
        
        // Classify error types
        if (message.includes('network') || message.includes('fetch')) {
          errorType = 'network'
        } else if (message.includes('timeout')) {
          errorType = 'timeout'
        } else if (message.includes('permission') || message.includes('unauthorized')) {
          errorType = 'permission'
        } else if (message.includes('validation') || message.includes('invalid')) {
          errorType = 'validation'
        } else {
          errorType = 'processing'
        }
      }

      const workflowError = createError(errorType, message, step, context)
      addError(workflowError)
      
      return { success: false, error: workflowError }
    }
  }, [createError, addError])

  const clearAllErrors = useCallback(() => {
    errors.forEach(error => toast.dismiss(error.id))
    setErrors([])
  }, [errors])

  const getErrorSummary = useCallback(() => {
    const errorCount = errors.length
    const criticalCount = errors.filter(e => !e.recoverable || e.retryCount >= e.maxRetries).length
    const retryableCount = errors.filter(e => e.recoverable && e.retryCount < e.maxRetries).length
    
    return {
      total: errorCount,
      critical: criticalCount,
      retryable: retryableCount,
      hasErrors: errorCount > 0,
      canProceed: criticalCount === 0
    }
  }, [errors])

  return {
    errors,
    isRecovering,
    addError,
    removeError,
    retryError,
    getErrorActions,
    handleAsyncOperation,
    clearAllErrors,
    getErrorSummary,
    createError
  }
}
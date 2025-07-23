'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useWorkflowAutosave, WorkflowState } from '@/hooks/use-workflow-autosave'
import { useWorkflowErrorHandling, WorkflowError } from '@/hooks/use-workflow-error-handling'

interface WorkflowStep {
  id: string
  title: string
  description?: string
  component?: ReactNode
  aiAssisted?: boolean
  required?: boolean
}

interface WorkflowContextType {
  currentWorkflow: string | null
  currentStep: number
  totalSteps: number
  workflowData: Record<string, any>
  isLoading: boolean
  startWorkflow: (workflowId: string, workflowType: string, steps: WorkflowStep[]) => void
  nextStep: () => void
  previousStep: () => void
  updateWorkflowData: (data: Record<string, any>) => void
  finishWorkflow: () => void
  cancelWorkflow: () => void
  resumeWorkflow: (state: WorkflowState) => void
  steps: WorkflowStep[]
  // Error handling
  errors: WorkflowError[]
  isRecovering: boolean
  handleAsyncOperation: <T>(operation: () => Promise<T>, step: string, context?: Record<string, any>) => Promise<{ success: boolean; data?: T; error?: WorkflowError }>
  addError: (error: WorkflowError) => void
  removeError: (errorId: string) => void
  clearAllErrors: () => void
  getErrorSummary: () => { total: number; critical: number; retryable: number; hasErrors: boolean; canProceed: boolean }
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

interface WorkflowProviderProps {
  children: ReactNode
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [currentWorkflow, setCurrentWorkflow] = useState<string | null>(null)
  const [workflowType, setWorkflowType] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [workflowData, setWorkflowData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [steps, setSteps] = useState<WorkflowStep[]>([])

  const { saveWorkflowState, clearWorkflowState, loadWorkflowState } = useWorkflowAutosave({
    workflowId: currentWorkflow || '',
    workflowType,
    currentStep,
    totalSteps,
    data: workflowData,
  })

  const errorHandling = useWorkflowErrorHandling()

  const startWorkflow = useCallback((workflowId: string, type: string, workflowSteps: WorkflowStep[]) => {
    setCurrentWorkflow(workflowId)
    setWorkflowType(type)
    setSteps(workflowSteps)
    setTotalSteps(workflowSteps.length)
    setCurrentStep(0)
    setWorkflowData({})
    setIsLoading(false)
    errorHandling.clearAllErrors()
  }, [errorHandling])

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, totalSteps])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const updateWorkflowData = useCallback((data: Record<string, any>) => {
    setWorkflowData(prev => ({ ...prev, ...data }))
  }, [])

  const finishWorkflow = useCallback(() => {
    if (currentWorkflow) {
      clearWorkflowState()
    }
    setCurrentWorkflow(null)
    setWorkflowType('')
    setCurrentStep(0)
    setTotalSteps(0)
    setWorkflowData({})
    setSteps([])
    setIsLoading(false)
    errorHandling.clearAllErrors()
  }, [currentWorkflow, clearWorkflowState, errorHandling])

  const cancelWorkflow = useCallback(() => {
    finishWorkflow()
  }, [finishWorkflow])

  const resumeWorkflow = useCallback((state: WorkflowState) => {
    setCurrentWorkflow(state.id)
    setWorkflowType(state.type)
    setCurrentStep(state.currentStep)
    setTotalSteps(state.totalSteps)
    setWorkflowData(state.data)
  }, [])

  const value: WorkflowContextType = {
    currentWorkflow,
    currentStep,
    totalSteps,
    workflowData,
    isLoading,
    startWorkflow,
    nextStep,
    previousStep,
    updateWorkflowData,
    finishWorkflow,
    cancelWorkflow,
    resumeWorkflow,
    steps,
    // Error handling
    errors: errorHandling.errors,
    isRecovering: errorHandling.isRecovering,
    handleAsyncOperation: errorHandling.handleAsyncOperation,
    addError: errorHandling.addError,
    removeError: errorHandling.removeError,
    clearAllErrors: errorHandling.clearAllErrors,
    getErrorSummary: errorHandling.getErrorSummary,
  }

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider')
  }
  return context
}
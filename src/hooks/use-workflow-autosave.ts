'use client'

import { useEffect, useRef, useCallback } from 'react'
import { toast } from 'react-hot-toast'

export interface WorkflowState {
  id: string
  type: string
  currentStep: number
  totalSteps: number
  data: Record<string, any>
  lastSaved: string
}

interface UseWorkflowAutosaveProps {
  workflowId: string
  workflowType: string
  currentStep: number
  totalSteps: number
  data: Record<string, any>
  autoSaveInterval?: number
}

export function useWorkflowAutosave({
  workflowId,
  workflowType,
  currentStep,
  totalSteps,
  data,
  autoSaveInterval = 3000, // 3 seconds
}: UseWorkflowAutosaveProps) {
  const lastSavedData = useRef<string>('')
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  const saveWorkflowState = useCallback(async (state: WorkflowState) => {
    try {
      const existingState = localStorage.getItem('ntu-workflow-state')
      const allStates = existingState ? JSON.parse(existingState) : {}
      
      allStates[workflowId] = state
      localStorage.setItem('ntu-workflow-state', JSON.stringify(allStates))
      
      console.log(`Auto-saved workflow ${workflowId} at step ${state.currentStep}`)
    } catch (error) {
      console.error('Failed to auto-save workflow:', error)
      toast.error('Failed to auto-save progress')
    }
  }, [workflowId])

  const clearWorkflowState = useCallback(() => {
    try {
      const existingState = localStorage.getItem('ntu-workflow-state')
      if (existingState) {
        const allStates = JSON.parse(existingState)
        delete allStates[workflowId]
        localStorage.setItem('ntu-workflow-state', JSON.stringify(allStates))
      }
    } catch (error) {
      console.error('Failed to clear workflow state:', error)
    }
  }, [workflowId])

  const loadWorkflowState = useCallback((): WorkflowState | null => {
    try {
      const existingState = localStorage.getItem('ntu-workflow-state')
      if (existingState) {
        const allStates = JSON.parse(existingState)
        return allStates[workflowId] || null
      }
    } catch (error) {
      console.error('Failed to load workflow state:', error)
    }
    return null
  }, [workflowId])

  useEffect(() => {
    const currentData = JSON.stringify({ currentStep, data })
    
    if (currentData !== lastSavedData.current) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        const state: WorkflowState = {
          id: workflowId,
          type: workflowType,
          currentStep,
          totalSteps,
          data,
          lastSaved: new Date().toISOString(),
        }

        saveWorkflowState(state)
        lastSavedData.current = currentData
      }, autoSaveInterval)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [workflowId, workflowType, currentStep, totalSteps, data, autoSaveInterval, saveWorkflowState])

  return {
    saveWorkflowState,
    clearWorkflowState,
    loadWorkflowState,
  }
}